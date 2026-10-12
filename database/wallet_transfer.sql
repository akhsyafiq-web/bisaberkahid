-- ============================================================================
-- BisaBerkah — pindah saldo antar dompet
-- Jalankan di Supabase SQL Editor setelah schema.sql. Aman dijalankan ulang,
-- dan boleh dijalankan sebelum/sesudah wallet_delete.sql.
-- ============================================================================

create table if not exists public.wallet_transfers (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  to_wallet_id     uuid not null references public.wallets (id) on delete cascade,
  from_wallet_name text not null,
  amount           numeric(15,2) not null,
  date             date not null default current_date,
  created_at       timestamptz not null default now()
);

-- Kolom tambahan agar pindahan juga tampil di riwayat dompet asal.
alter table public.wallet_transfers
  add column if not exists from_wallet_id uuid references public.wallets (id) on delete set null;
alter table public.wallet_transfers
  add column if not exists to_wallet_name text;

create index if not exists idx_wallet_transfers_to on public.wallet_transfers (to_wallet_id);
create index if not exists idx_wallet_transfers_from on public.wallet_transfers (from_wallet_id);

alter table public.wallet_transfers enable row level security;

drop policy if exists "wallet_transfers_owner" on public.wallet_transfers;
create policy "wallet_transfers_owner" on public.wallet_transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pindahkan saldo dari satu dompet ke dompet lain milik user yang sama.
-- Satu fungsi = satu transaksi; SECURITY INVOKER sehingga RLS tetap berlaku.
create or replace function public.transfer_wallet_balance(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount numeric
) returns void language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_from_balance numeric;
  v_from_name text;
  v_to_name text;
begin
  if v_uid is null then raise exception 'Tidak terautentikasi'; end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Nominal harus lebih dari Rp0';
  end if;
  if p_from_wallet_id = p_to_wallet_id then
    raise exception 'Dompet asal dan tujuan tidak boleh sama';
  end if;

  -- Kunci kedua baris dengan urutan tetap untuk menghindari deadlock.
  perform 1 from public.wallets
   where id in (p_from_wallet_id, p_to_wallet_id) and user_id = v_uid
   order by id for update;

  select current_balance, name into v_from_balance, v_from_name
    from public.wallets where id = p_from_wallet_id and user_id = v_uid;
  if not found then raise exception 'Dompet asal tidak ditemukan'; end if;

  select name into v_to_name
    from public.wallets where id = p_to_wallet_id and user_id = v_uid;
  if not found then raise exception 'Dompet tujuan tidak ditemukan'; end if;

  if v_from_balance < p_amount then
    raise exception 'Saldo dompet tidak mencukupi';
  end if;

  update public.wallets set current_balance = current_balance - p_amount
   where id = p_from_wallet_id;
  update public.wallets set current_balance = current_balance + p_amount
   where id = p_to_wallet_id;

  insert into public.wallet_transfers
    (user_id, from_wallet_id, from_wallet_name, to_wallet_id, to_wallet_name, amount)
  values
    (v_uid, p_from_wallet_id, v_from_name, p_to_wallet_id, v_to_name, p_amount);
end; $$;
