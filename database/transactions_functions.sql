-- ============================================================================
-- BisaBerkah — atomic transaction RPCs (Fase 6 / Prompt 16)
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- All money mutations happen inside a single function call = one transaction,
-- so wallet balances can never drift on partial failure. SECURITY INVOKER keeps
-- RLS in force (every write is scoped to auth.uid()).
-- ============================================================================

-- ---------------------------------------------------------------- INCOME ----

create or replace function public.create_income(
  p_category_id uuid,
  p_amount numeric,
  p_date date,
  p_notes text,
  p_distributions jsonb,
  p_auto_remainder boolean default true
) returns uuid
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_income_id uuid;
  v_sum numeric := 0;
  v_remainder numeric;
  v_default uuid;
  rec record;
begin
  if v_uid is null then raise exception 'Tidak terautentikasi'; end if;

  insert into public.incomes(user_id, category_id, amount, date, notes)
  values (v_uid, p_category_id, p_amount, p_date, nullif(p_notes, ''))
  returning id into v_income_id;

  for rec in
    select * from jsonb_to_recordset(coalesce(p_distributions, '[]'::jsonb))
      as x(wallet_id uuid, amount numeric)
  loop
    if rec.amount is null or rec.amount <= 0 then continue; end if;
    insert into public.income_distributions(income_id, wallet_id, amount)
    values (v_income_id, rec.wallet_id, rec.amount);
    update public.wallets set current_balance = current_balance + rec.amount
      where id = rec.wallet_id and user_id = v_uid;
    v_sum := v_sum + rec.amount;
  end loop;

  if v_sum > p_amount + 0.001 then
    raise exception 'Total distribusi melebihi nominal pemasukan';
  end if;

  v_remainder := p_amount - v_sum;
  if v_remainder > 0 and p_auto_remainder then
    select id into v_default from public.wallets
      where user_id = v_uid and type = 'default' limit 1;
    if v_default is not null then
      insert into public.income_distributions(income_id, wallet_id, amount)
      values (v_income_id, v_default, v_remainder);
      update public.wallets set current_balance = current_balance + v_remainder
        where id = v_default;
    end if;
  end if;

  return v_income_id;
end; $$;

create or replace function public.delete_income(p_income_id uuid)
returns void language plpgsql security invoker as $$
declare v_uid uuid := auth.uid(); rec record;
begin
  if not exists (select 1 from public.incomes where id = p_income_id and user_id = v_uid) then
    raise exception 'Pemasukan tidak ditemukan';
  end if;
  for rec in select wallet_id, amount from public.income_distributions where income_id = p_income_id loop
    update public.wallets set current_balance = current_balance - rec.amount
      where id = rec.wallet_id and user_id = v_uid;
  end loop;
  delete from public.incomes where id = p_income_id; -- cascades distributions
end; $$;

create or replace function public.update_income(
  p_income_id uuid,
  p_category_id uuid,
  p_amount numeric,
  p_date date,
  p_notes text,
  p_distributions jsonb,
  p_auto_remainder boolean default true
) returns void
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_sum numeric := 0;
  v_remainder numeric;
  v_default uuid;
  rec record;
begin
  if not exists (select 1 from public.incomes where id = p_income_id and user_id = v_uid) then
    raise exception 'Pemasukan tidak ditemukan';
  end if;

  -- rollback old distributions
  for rec in select wallet_id, amount from public.income_distributions where income_id = p_income_id loop
    update public.wallets set current_balance = current_balance - rec.amount
      where id = rec.wallet_id and user_id = v_uid;
  end loop;
  delete from public.income_distributions where income_id = p_income_id;

  update public.incomes
    set category_id = p_category_id, amount = p_amount, date = p_date, notes = nullif(p_notes, '')
    where id = p_income_id;

  for rec in
    select * from jsonb_to_recordset(coalesce(p_distributions, '[]'::jsonb))
      as x(wallet_id uuid, amount numeric)
  loop
    if rec.amount is null or rec.amount <= 0 then continue; end if;
    insert into public.income_distributions(income_id, wallet_id, amount)
    values (p_income_id, rec.wallet_id, rec.amount);
    update public.wallets set current_balance = current_balance + rec.amount
      where id = rec.wallet_id and user_id = v_uid;
    v_sum := v_sum + rec.amount;
  end loop;

  if v_sum > p_amount + 0.001 then
    raise exception 'Total distribusi melebihi nominal pemasukan';
  end if;

  v_remainder := p_amount - v_sum;
  if v_remainder > 0 and p_auto_remainder then
    select id into v_default from public.wallets
      where user_id = v_uid and type = 'default' limit 1;
    if v_default is not null then
      insert into public.income_distributions(income_id, wallet_id, amount)
      values (p_income_id, v_default, v_remainder);
      update public.wallets set current_balance = current_balance + v_remainder
        where id = v_default;
    end if;
  end if;
end; $$;

-- --------------------------------------------------------------- EXPENSE ----

create or replace function public.create_expense(
  p_category_id uuid,
  p_amount numeric,
  p_date date,
  p_notes text,
  p_debt_id uuid,
  p_sources jsonb
) returns uuid
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_expense_id uuid;
  v_sum numeric := 0;
  rec record;
begin
  if v_uid is null then raise exception 'Tidak terautentikasi'; end if;

  insert into public.expenses(user_id, category_id, amount, date, notes, debt_id)
  values (v_uid, p_category_id, p_amount, p_date, nullif(p_notes, ''), p_debt_id)
  returning id into v_expense_id;

  for rec in
    select * from jsonb_to_recordset(coalesce(p_sources, '[]'::jsonb))
      as x(wallet_id uuid, amount numeric)
  loop
    if rec.amount is null or rec.amount <= 0 then continue; end if;
    insert into public.expense_wallet_sources(expense_id, wallet_id, amount)
    values (v_expense_id, rec.wallet_id, rec.amount);
    update public.wallets set current_balance = current_balance - rec.amount
      where id = rec.wallet_id and user_id = v_uid;
    v_sum := v_sum + rec.amount;
  end loop;

  if abs(v_sum - p_amount) > 0.001 then
    raise exception 'Total sumber dompet harus sama dengan nominal pengeluaran';
  end if;

  return v_expense_id;
end; $$;

create or replace function public.delete_expense(p_expense_id uuid)
returns void language plpgsql security invoker as $$
declare v_uid uuid := auth.uid(); rec record;
begin
  if not exists (select 1 from public.expenses where id = p_expense_id and user_id = v_uid) then
    raise exception 'Pengeluaran tidak ditemukan';
  end if;
  for rec in select wallet_id, amount from public.expense_wallet_sources where expense_id = p_expense_id loop
    update public.wallets set current_balance = current_balance + rec.amount
      where id = rec.wallet_id and user_id = v_uid;
  end loop;
  delete from public.expenses where id = p_expense_id; -- cascades sources; debt trigger recalcs
end; $$;

create or replace function public.update_expense(
  p_expense_id uuid,
  p_category_id uuid,
  p_amount numeric,
  p_date date,
  p_notes text,
  p_debt_id uuid,
  p_sources jsonb
) returns void
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_sum numeric := 0;
  rec record;
begin
  if not exists (select 1 from public.expenses where id = p_expense_id and user_id = v_uid) then
    raise exception 'Pengeluaran tidak ditemukan';
  end if;

  for rec in select wallet_id, amount from public.expense_wallet_sources where expense_id = p_expense_id loop
    update public.wallets set current_balance = current_balance + rec.amount
      where id = rec.wallet_id and user_id = v_uid;
  end loop;
  delete from public.expense_wallet_sources where expense_id = p_expense_id;

  update public.expenses
    set category_id = p_category_id, amount = p_amount, date = p_date,
        notes = nullif(p_notes, ''), debt_id = p_debt_id
    where id = p_expense_id;

  for rec in
    select * from jsonb_to_recordset(coalesce(p_sources, '[]'::jsonb))
      as x(wallet_id uuid, amount numeric)
  loop
    if rec.amount is null or rec.amount <= 0 then continue; end if;
    insert into public.expense_wallet_sources(expense_id, wallet_id, amount)
    values (p_expense_id, rec.wallet_id, rec.amount);
    update public.wallets set current_balance = current_balance - rec.amount
      where id = rec.wallet_id and user_id = v_uid;
    v_sum := v_sum + rec.amount;
  end loop;

  if abs(v_sum - p_amount) > 0.001 then
    raise exception 'Total sumber dompet harus sama dengan nominal pengeluaran';
  end if;
end; $$;
