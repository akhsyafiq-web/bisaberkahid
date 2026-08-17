-- ============================================================================
-- BisaBerkah — Supabase schema
-- Run this in the Supabase SQL Editor. Idempotent where practical.
-- Brand model: wallets (monthly/goals/default) + incomes/expenses with
-- multi-wallet distribution/sourcing + debts. RLS scopes everything per user.
-- ============================================================================

-- 1. EXTENSIONS -------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TABLES -----------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.income_categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  icon        text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  icon        text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.wallets (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  name                  text not null,
  type                  text not null check (type in ('monthly','goals','default')),
  current_balance       numeric(15,2) not null default 0,
  monthly_budget        numeric(15,2),
  budget_month          date,
  goal_target           numeric(15,2),
  goal_duration_months  integer,
  goal_monthly_target   numeric(15,2),
  goal_start_date       date,
  goal_end_date         date,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- debts before expenses (expenses references debts)
create table if not exists public.debts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  creditor_name     text not null,
  total_amount      numeric(15,2) not null,
  paid_amount       numeric(15,2) not null default 0,
  remaining_amount  numeric(15,2) generated always as (total_amount - paid_amount) stored,
  due_date          date,
  notes             text,
  status            text not null default 'active' check (status in ('active','paid')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.incomes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.income_categories (id) on delete set null,
  amount      numeric(15,2) not null check (amount > 0),
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.income_distributions (
  id          uuid primary key default uuid_generate_v4(),
  income_id   uuid not null references public.incomes (id) on delete cascade,
  wallet_id   uuid not null references public.wallets (id) on delete cascade,
  amount      numeric(15,2) not null check (amount >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.expense_categories (id) on delete set null,
  amount      numeric(15,2) not null check (amount > 0),
  date        date not null default current_date,
  notes       text,
  debt_id     uuid references public.debts (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.expense_wallet_sources (
  id          uuid primary key default uuid_generate_v4(),
  expense_id  uuid not null references public.expenses (id) on delete cascade,
  wallet_id   uuid not null references public.wallets (id) on delete cascade,
  amount      numeric(15,2) not null check (amount >= 0),
  created_at  timestamptz not null default now()
);

-- 3. TRIGGERS & FUNCTIONS ---------------------------------------------------

-- touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_wallets_updated on public.wallets;
create trigger trg_wallets_updated before update on public.wallets
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_debts_updated on public.debts;
create trigger trg_debts_updated before update on public.debts
  for each row execute function public.touch_updated_at();

-- keep debts.paid_amount in sync with expenses that reference them
create or replace function public.sync_debt_paid_amount()
returns trigger language plpgsql as $$
declare
  target uuid := coalesce(new.debt_id, old.debt_id);
begin
  if target is null then
    return coalesce(new, old);
  end if;
  update public.debts d
     set paid_amount = coalesce((
           select sum(e.amount) from public.expenses e where e.debt_id = d.id
         ), 0),
         status = case
           when coalesce((select sum(e.amount) from public.expenses e where e.debt_id = d.id), 0) >= d.total_amount
           then 'paid' else 'active' end
   where d.id = target;
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_expense_debt_sync on public.expenses;
create trigger trg_expense_debt_sync
  after insert or update or delete on public.expenses
  for each row execute function public.sync_debt_paid_amount();

-- adjust a wallet balance by a signed delta (used by the query layer)
create or replace function public.adjust_wallet_balance(p_wallet_id uuid, p_delta numeric)
returns void language plpgsql security definer as $$
begin
  update public.wallets
     set current_balance = current_balance + p_delta
   where id = p_wallet_id;
end; $$;

-- seed a new user's default categories + big wallet
create or replace function public.initialize_user_defaults(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.income_categories (user_id, name, icon, is_default) values
    (p_user_id, 'Gaji', '💼', true),
    (p_user_id, 'Bisnis', '🏪', true),
    (p_user_id, 'Freelance', '💻', true),
    (p_user_id, 'Investasi', '📈', true),
    (p_user_id, 'Hadiah', '🎁', true),
    (p_user_id, 'Lain-lain', '📦', true);

  insert into public.expense_categories (user_id, name, icon, is_default) values
    (p_user_id, 'Makan & Minum', '🍽️', true),
    (p_user_id, 'Transportasi', '🚗', true),
    (p_user_id, 'Kesehatan', '🏥', true),
    (p_user_id, 'Pendidikan', '📚', true),
    (p_user_id, 'Belanja', '🛒', true),
    (p_user_id, 'Tagihan & Utilitas', '💡', true),
    (p_user_id, 'Hiburan', '🎬', true),
    (p_user_id, 'Sedekah & Zakat', '🤲', true),
    (p_user_id, 'Cicilan & Hutang', '💳', true),
    (p_user_id, 'Lain-lain', '📦', true);

  insert into public.wallets (user_id, name, type, current_balance, is_active)
  values (p_user_id, 'Dompet Besar', 'default', 0, true);
end; $$;

-- auto-create profile + defaults when a new auth user is inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data ->> 'name', new.email)
  on conflict (id) do nothing;

  perform public.initialize_user_defaults(new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- monthly carry-over: top up active monthly wallets at the start of a new month
create or replace function public.monthly_wallet_carry_over()
returns integer language plpgsql security definer as $$
declare
  affected integer := 0;
  cur_month date := date_trunc('month', current_date)::date;
begin
  update public.wallets
     set current_balance = current_balance + coalesce(monthly_budget, 0),
         budget_month = cur_month
   where type = 'monthly'
     and is_active = true
     and (budget_month is null or budget_month < cur_month);
  get diagnostics affected = row_count;
  return affected;
end; $$;

-- 4. INDEXES ----------------------------------------------------------------
create index if not exists idx_expenses_user_date on public.expenses (user_id, date desc);
create index if not exists idx_incomes_user_date on public.incomes (user_id, date desc);
create index if not exists idx_wallets_user on public.wallets (user_id);
create index if not exists idx_debts_user_status on public.debts (user_id, status);
create index if not exists idx_income_dist_income on public.income_distributions (income_id);
create index if not exists idx_expense_src_expense on public.expense_wallet_sources (expense_id);
create index if not exists idx_expenses_debt on public.expenses (debt_id);

-- 5. ROW LEVEL SECURITY -----------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.income_categories   enable row level security;
alter table public.expense_categories  enable row level security;
alter table public.wallets             enable row level security;
alter table public.incomes             enable row level security;
alter table public.income_distributions enable row level security;
alter table public.expenses            enable row level security;
alter table public.expense_wallet_sources enable row level security;
alter table public.debts               enable row level security;

-- profiles: own row
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- helper macro pattern: own rows by user_id
do $$
declare t text;
begin
  foreach t in array array[
    'income_categories','expense_categories','wallets','incomes','expenses','debts'
  ] loop
    execute format('drop policy if exists "%1$s_owner" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_owner" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- income_distributions: via parent income ownership
drop policy if exists "income_dist_owner" on public.income_distributions;
create policy "income_dist_owner" on public.income_distributions
  for all using (
    exists (select 1 from public.incomes i where i.id = income_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.incomes i where i.id = income_id and i.user_id = auth.uid())
  );

-- expense_wallet_sources: via parent expense ownership
drop policy if exists "expense_src_owner" on public.expense_wallet_sources;
create policy "expense_src_owner" on public.expense_wallet_sources
  for all using (
    exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
  );
