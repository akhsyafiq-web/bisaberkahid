-- ============================================================================
-- BisaBerkah — fitur hutang: tanggal hutang, edit, dan tautan ke pemasukan
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang.
-- Prasyarat: schema.sql, transactions_functions.sql.
-- ============================================================================

-- 1. Kolom baru --------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'debts' and column_name = 'debt_date'
  ) then
    alter table public.debts add column debt_date date not null default current_date;
    -- Hutang lama: pakai tanggal pencatatannya.
    update public.debts set debt_date = created_at::date;
  end if;
end $$;

-- Pemasukan "Pinjaman" yang dibuat bersama hutang ini (kalau ada).
alter table public.debts
  add column if not exists income_id uuid references public.incomes (id) on delete set null;

-- 2. Status & batas pembayaran dijaga database --------------------------------
create or replace function public.debts_guard()
returns trigger language plpgsql as $$
begin
  if new.total_amount <= 0 then
    raise exception 'Total hutang harus lebih dari Rp0';
  end if;
  if new.paid_amount > new.total_amount then
    raise exception 'Jumlah terbayar tidak boleh melebihi total hutang';
  end if;
  new.status := case when new.paid_amount >= new.total_amount then 'paid' else 'active' end;
  return new;
end; $$;

drop trigger if exists trg_debts_guard on public.debts;
create trigger trg_debts_guard before insert or update on public.debts
  for each row execute function public.debts_guard();

-- 3. Buat hutang (+ opsional pemasukan) dalam satu transaksi ------------------
create or replace function public.create_debt(
  p_creditor_name text,
  p_total_amount numeric,
  p_debt_date date,
  p_due_date date,
  p_notes text,
  p_record_income boolean default false,
  p_distributions jsonb default '[]'::jsonb
) returns uuid
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_date date := coalesce(p_debt_date, current_date);
  v_debt uuid;
  v_cat uuid;
  v_income uuid;
begin
  if v_uid is null then raise exception 'Tidak terautentikasi'; end if;

  insert into public.debts
    (user_id, creditor_name, total_amount, paid_amount, debt_date, due_date, notes, status)
  values
    (v_uid, p_creditor_name, p_total_amount, 0, v_date, p_due_date, nullif(p_notes, ''), 'active')
  returning id into v_debt;

  if p_record_income then
    select id into v_cat from public.income_categories
     where user_id = v_uid and name = 'Pinjaman' order by created_at limit 1;
    if v_cat is null then
      insert into public.income_categories (user_id, name, icon, is_default)
      values (v_uid, 'Pinjaman', '🤝', false)
      returning id into v_cat;
    end if;

    v_income := public.create_income(
      v_cat, p_total_amount, v_date, 'Hutang dari ' || p_creditor_name,
      coalesce(p_distributions, '[]'::jsonb), true
    );
    update public.debts set income_id = v_income where id = v_debt;
  end if;

  return v_debt;
end; $$;

-- 4. Hapus hutang (+ opsional pemasukannya) dalam satu transaksi --------------
create or replace function public.delete_debt(
  p_debt_id uuid,
  p_delete_income boolean default false
) returns void
language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_paid numeric;
  v_income uuid;
begin
  select paid_amount, income_id into v_paid, v_income
    from public.debts where id = p_debt_id and user_id = v_uid;
  if not found then raise exception 'Hutang tidak ditemukan'; end if;
  if v_paid > 0 then
    raise exception 'Hutang yang sudah dibayar sebagian tidak bisa dihapus';
  end if;

  if p_delete_income and v_income is not null then
    perform public.delete_income(v_income);
  end if;

  delete from public.debts where id = p_debt_id;
end; $$;
