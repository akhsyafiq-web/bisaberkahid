# Catatan Perubahan — 12 Oktober 2026

Ringkasan semua perubahan BisaBerkah yang dikerjakan hari ini, setelah app live
di Vercel. Semuanya sudah ada di branch `main`.

## Yang harus dijalankan di Supabase

Dua fitur di bawah butuh migrasi SQL. Jalankan lewat **Supabase → SQL Editor**.
Keduanya aman dijalankan ulang dan urutannya bebas.

| File | Dibutuhkan untuk | Kalau belum dijalankan |
|---|---|---|
| `database/wallet_delete.sql` | Hapus dompet sambil memindahkan sisa saldo ke Dompet Besar | Opsi "Pindahkan ke Dompet Besar" menampilkan pesan belum aktif; dompet tidak terhapus |
| `database/wallet_transfer.sql` | Pindah saldo antar dompet dan riwayatnya | Tombol "Pindahkan saldo" menampilkan pesan belum aktif |

Migrasi lama `database/categories_toggle.sql` (toggle kategori) juga masih
perlu dijalankan kalau belum.

## Perubahan

### 1. Saldo setelah transaksi terlihat sebelum disimpan
Commit `b9a8cf3`

Setiap baris dompet sekarang menampilkan efek transaksinya saat nominal diisi:

- **Distribusi dompet** (form pemasukan): "→ Saldo jadi Rp X"
- **Sumber dompet** (form pengeluaran): "→ Sisa saldo Rp X", merah kalau saldo kurang
- **Bayar hutang**: "→ Sisa saldo Rp X"

### 2. Alert saldo tidak cukup di form pengeluaran
Commit `492615c`

Kalau nominal pengeluaran melebihi total saldo semua dompet, muncul kotak
informasi kuning berisi total saldo, jumlah kekurangannya, dan tautan
**Catat pemasukan →**. Alert hilang sendiri begitu saldo mencukupi.

Catatan: menekan tautan itu berpindah halaman, jadi nominal pengeluaran yang
sudah diketik hilang.

### 3. Hutang baru bisa dicatat sebagai pemasukan
Commit `d53e9eb`, `48a5de5`

Form **Hutang baru** punya checkbox "Catat juga sebagai pemasukan" (default
tercentang). Kalau aktif:

- Nominal hutang bisa dibagi ke beberapa dompet bulanan/goals.
- Sisa yang tidak dibagikan otomatis masuk ke Dompet Besar.
- Pembagian yang melebihi nominal hutang diblokir.
- Pemasukannya masuk ke kategori **"Pinjaman" 🤝**, yang dibuat otomatis saat
  pertama dipakai, dengan catatan "Hutang dari [nama pemberi]".

Catatan:
- Pemasukan "Pinjaman" ikut terhitung di laporan pemasukan.
- Menghapus hutang tidak menghapus transaksi pemasukannya; hapus manual dari
  riwayat transaksi.
- Kalau pencatatan pemasukan gagal, hutang tetap tersimpan dan user diminta
  mencatat pemasukannya manual.

### 4. Pilihan sisa saldo saat menghapus dompet
Commit `d265e87`, `a933715` · butuh `wallet_delete.sql`

Kalau dompet yang dihapus masih punya saldo, dialog konfirmasi menawarkan:

- **Pindahkan ke Dompet Besar** (default): total saldo tidak berubah, dan
  riwayat Dompet Besar mencatat 🔁 "Pindahan dari [nama dompet]".
- **Hapus bersama dompetnya**: total saldo berkurang sebesar saldo dompet itu.

Kalau saldo dompet nol atau minus, dialognya tetap konfirmasi biasa.

Catatan: saldo yang ikut terhapus tidak tercatat sebagai pengeluaran, jadi
total saldo turun tanpa jejak di laporan.

### 5. Anggaran tiap dompet di Distribusi dompet
Commit `e5db1e4`

Di bawah "Saldo saat ini", baris dompet menampilkan:

- Dompet bulanan: "Anggaran Rp X/bulan"
- Dompet goals: "Target Rp X · Rp Y/bulan"

Daftar "Bagi ke dompet" di form Hutang baru belum menampilkan baris ini.

### 6. Pindah saldo antar dompet
Commit `fc87c39` · butuh `wallet_transfer.sql`

Halaman detail setiap dompet (termasuk Dompet Besar) punya tombol
**"Pindahkan saldo ke dompet lain"**. User mengisi nominal dan memilih satu
dompet tujuan; sisa saldo asal dan saldo baru tujuan terlihat sebelum disimpan.

- Nominal yang melebihi saldo dompet asal ditolak.
- Pindahan tercatat di riwayat kedua dompet: "Pindahan dari …" di tujuan,
  "Pindah ke …" di asal.
- Sekali pindah hanya ke satu dompet tujuan.

## Cara pindahan saldo disimpan

Pindahan saldo (poin 4 dan 6) disimpan di tabel baru `wallet_transfers`, bukan
sebagai pemasukan/pengeluaran, supaya tidak menggelembungkan angka di laporan.
Akibatnya baris pindahan hanya tampil di riwayat pada halaman detail dompet,
tidak di halaman Transaksi maupun "Transaksi terbaru" di beranda.

## Status pengujian

Semua perubahan lolos build produksi, typecheck, dan lint (0 error). Belum ada
yang diuji langsung di browser, dan kedua file SQL baru belum pernah
dieksekusi di Supabase.

## Belum dikerjakan

- **Celah keamanan `adjust_wallet_balance`** (dari `schema.sql`): fungsi ini
  tidak memeriksa pemilik dompet, sehingga user yang login bisa mengubah saldo
  dompet user lain kalau tahu ID-nya. App tidak memakainya; perlu migrasi untuk
  menghapusnya.
- Alert saldo tidak cukup di sheet Bayar hutang.
- Menghapus hutang sekaligus menghapus pemasukan "Pinjaman"-nya.
- Menampilkan pindahan saldo di halaman Transaksi dan beranda.
- Mencatat saldo yang ikut terhapus bersama dompet sebagai transaksi.
