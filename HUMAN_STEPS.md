# 🙋 Langkah yang Harus Kamu Jalankan Sendiri

Selama AI membangun Fase 7–11 secara otonom, semua langkah yang butuh kamu
(SQL di Supabase, konfigurasi Vercel) dikumpulkan di sini. Jalankan saat kamu
kembali, lalu app siap dites live.

---

## 1. Migrations Supabase (SQL Editor → Run)

Jalankan berurutan. Yang sudah kamu jalankan ditandai ✅.

- [x] `database/schema.sql` — tabel, RLS, trigger, seed defaults ✅
- [x] `database/transactions_functions.sql` — RPC transaksi atomik ✅
- [ ] `database/categories_toggle.sql` — kolom `is_active` untuk kategori (Fase 9)

> Fase 7 (Hutang) **tidak butuh SQL baru** — pembayaran hutang memakai
> `create_expense` + trigger `sync_debt_paid_amount` yang sudah ada.
> Fase 8/10/11 juga tidak menambah SQL (kecuali dicatat di atas).

---

## 2. Deploy Vercel

- [ ] Import repo `akhsyafiq-web/bisaberkahid` di vercel.com (Add New → Project)
- [ ] Set Environment Variables (Production + Preview + Development):
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://bfcvjssvvofldmtrnbhg.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (dari `.env.local`)
  - `CRON_SECRET` = string acak bebas
- [ ] Deploy. Selanjutnya tiap `git push` ke `main` auto-deploy.

---

## 3. (Fase 11) Vercel Cron — carry-over dompet bulanan
- [ ] Cron sudah didefinisikan di `vercel.json` (akan ditambahkan di Fase 11).
- [ ] Pastikan `CRON_SECRET` di Vercel sama; cron memanggil
  `/api/cron/carry-over` tiap awal bulan.

---

_Diperbarui otomatis oleh AI selama pembangunan berjalan._
