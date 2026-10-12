-- ============================================================================
-- BisaBerkah — perbaikan hasil QA 12 Okt 2026
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang.
-- Prasyarat: schema.sql, wallet_delete.sql, wallet_transfer.sql.
-- ============================================================================

-- 1. Tutup fungsi SECURITY DEFINER yang bisa dipanggil siapa pun -------------

-- Tidak dipakai app, dan tidak memeriksa pemilik dompet.
drop function if exists public.adjust_wallet_balance(uuid, numeric);

-- Hanya boleh dipanggil dari trigger pendaftaran (berjalan sebagai pemilik).
revoke execute on function public.initialize_user_defaults(uuid)
  from public, anon, authenticated;

-- Hanya boleh dipanggil server (service role), bukan dari browser.
revoke execute on function public.monthly_wallet_carry_over()
  from public, anon, authenticated;
grant execute on function public.monthly_wallet_carry_over() to service_role;

-- 2. Maksimal satu Dompet Besar per user ------------------------------------
do $$
begin
  if exists (
    select 1 from public.wallets where type = 'default'
    group by user_id having count(*) > 1
  ) then
    raise notice 'Ada user dengan lebih dari satu Dompet Besar; unique index dilewati. Hapus duplikatnya lalu jalankan ulang file ini.';
  else
    create unique index if not exists uniq_default_wallet_per_user
      on public.wallets (user_id) where type = 'default';
  end if;
end $$;

-- 3. Hapus dompet = arsipkan, supaya riwayat transaksinya tidak ikut hilang --
create or replace function public.delete_wallet_move_balance(p_wallet_id uuid)
returns void language plpgsql security invoker as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_type text;
  v_name text;
  v_default uuid;
  v_default_name text;
begin
  select current_balance, type, name into v_balance, v_type, v_name
    from public.wallets
   where id = p_wallet_id and user_id = v_uid
     for update;
  if not found then raise exception 'Dompet tidak ditemukan'; end if;
  if v_type = 'default' then raise exception 'Dompet Besar tidak bisa dihapus'; end if;

  select id, name into v_default, v_default_name from public.wallets
   where user_id = v_uid and type = 'default' order by created_at limit 1;
  if v_default is null then raise exception 'Dompet Besar tidak ditemukan'; end if;

  update public.wallets
     set current_balance = current_balance + v_balance
   where id = v_default;

  if v_balance <> 0 then
    insert into public.wallet_transfers
      (user_id, from_wallet_id, from_wallet_name, to_wallet_id, to_wallet_name, amount)
    values
      (v_uid, p_wallet_id, v_name, v_default, v_default_name, v_balance);
  end if;

  update public.wallets
     set is_active = false, current_balance = 0
   where id = p_wallet_id;
end; $$;
