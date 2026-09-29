# 🚀 Deploy Checklist — BisaBerkah (Fase 12)

## Pra-deploy (Supabase)
- [x] `database/schema.sql` dijalankan
- [x] `database/transactions_functions.sql` dijalankan
- [ ] `database/categories_toggle.sql` dijalankan (untuk toggle kategori)
- [x] RLS aktif di semua tabel (dari schema.sql)
- [ ] Auth → "Confirm email" = OFF (untuk MVP)

## Vercel
- [ ] Import repo `akhsyafiq-web/bisaberkahid` (Add New → Project)
- [ ] Framework: Next.js (auto), Root Directory: `./` (default)
- [ ] Environment Variables (Production + Preview + Development):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://bfcvjssvvofldmtrnbhg.supabase.co`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (dari `.env.local`)
  - [ ] `CRON_SECRET` = string acak
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` = (opsional, untuk cron)
- [ ] Deploy pertama sukses (cek Build Logs hijau)

## Post-deploy (uji di URL live, mobile viewport)
- [ ] Register akun baru → masuk ke beranda (kategori default & Dompet Besar terbuat)
- [ ] Buat dompet bulanan + goals
- [ ] Catat pemasukan dengan distribusi dompet
- [ ] Catat pengeluaran dari beberapa dompet
- [ ] Lihat beranda (saldo & ringkasan) + laporan (grafik)
- [ ] Catat hutang → bayar → status lunas
- [ ] Kategori: tambah / toggle nonaktif
- [ ] Download template Excel + test import
- [ ] Logout dari Pengaturan

## Custom domain (opsional)
- [ ] Vercel → Project → Settings → Domains → tambah domain
