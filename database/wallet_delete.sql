-- ============================================================================
-- BisaBerkah — hapus dompet sambil memindahkan sisa saldo ke Dompet Besar
-- Jalankan di Supabase SQL Editor setelah schema.sql.
-- Satu fungsi = satu transaksi, jadi saldo tidak bisa hilang/terduplikasi
-- kalau salah satu langkah gagal. SECURITY INVOKER: RLS tetap berlaku.
-- ============================================================================

create or replace function public.delete_wallet_move_balance(p_wallet_id uuid)
returns void language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_type text;
  v_default uuid;
begin
  select current_balance, type into v_balance, v_type
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

  delete from public.wallets where id = p_wallet_id;
end; $$;
