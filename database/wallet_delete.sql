-- ============================================================================
-- BisaBerkah — hapus dompet sambil memindahkan sisa saldo ke Dompet Besar
-- Jalankan di Supabase SQL Editor setelah schema.sql. Aman dijalankan ulang.
-- Satu fungsi = satu transaksi, jadi saldo tidak bisa hilang/terduplikasi
-- kalau salah satu langkah gagal. SECURITY INVOKER: RLS tetap berlaku.
-- ============================================================================

-- Log perpindahan saldo antar dompet. Sengaja terpisah dari incomes supaya
-- pindahan saldo tidak terhitung sebagai pemasukan di laporan.
create table if not exists public.wallet_transfers (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  to_wallet_id     uuid not null references public.wallets (id) on delete cascade,
  from_wallet_name text not null,
  amount           numeric(15,2) not null,
  date             date not null default current_date,
  created_at       timestamptz not null default now()
);

create index if not exists idx_wallet_transfers_to on public.wallet_transfers (to_wallet_id);

alter table public.wallet_transfers enable row level security;

drop policy if exists "wallet_transfers_owner" on public.wallet_transfers;
create policy "wallet_transfers_owner" on public.wallet_transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.delete_wallet_move_balance(p_wallet_id uuid)
returns void language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_type text;
  v_name text;
  v_default uuid;
begin
  select current_balance, type, name into v_balance, v_type, v_name
    from public.wallets
   where id = p_wallet_id and user_id = v_uid
     for update;
  if not found then raise exception 'Dompet tidak ditemukan'; end if;
  if v_type = 'default' then raise exception 'Dompet Besar tidak bisa dihapus'; end if;

  select id into v_default from public.wallets
   where user_id = v_uid and type = 'default' limit 1;
  if v_default is null then raise exception 'Dompet Besar tidak ditemukan'; end if;

  update public.wallets
     set current_balance = current_balance + v_balance
   where id = v_default;

  if v_balance <> 0 then
    insert into public.wallet_transfers (user_id, to_wallet_id, from_wallet_name, amount)
    values (v_uid, v_default, v_name, v_balance);
  end if;

  delete from public.wallets where id = p_wallet_id;
end; $$;
