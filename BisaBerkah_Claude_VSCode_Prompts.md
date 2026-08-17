# 🧭 BisaBerkah — Panduan Prompt Claude di VSCode
**Step-by-Step Development Guide: From Zero to Deployed**
_Untuk digunakan bersama Claude AI (claude.ai atau Claude Extension di VSCode)_
_Versi 1.0 · Juni 2026_

---

## ℹ️ Cara Menggunakan Panduan Ini

Dokumen ini berisi **prompt siap pakai** yang disusun berurutan untuk membangun BisaBerkah dari nol hingga bisa diujicobakan.

**Konvensi:**
- `📋 PROMPT` → Blok teks yang bisa langsung di-copy-paste ke Claude
- `✅ EXPECTED OUTPUT` → Apa yang kamu harapkan dari Claude
- `⚠️ CATATAN` → Hal yang perlu diperhatikan sebelum/sesudah prompt
- `🔧 MANUAL ACTION` → Langkah yang harus kamu lakukan sendiri (bukan Claude)

**Tools yang dibutuhkan:**
- VSCode + Claude Extension (atau claude.ai chat)
- Node.js >= 18
- Git
- Akun Supabase (free)
- Akun Vercel (free)
- Terminal (bash/zsh)

---

## 📁 Struktur Fase Development

```
FASE 0 — Persiapan & Konteks (1x setup)
FASE 1 — Project Setup & Konfigurasi (Prompt 1–3)
FASE 2 — Database & Supabase (Prompt 4–6)
FASE 3 — Design System & Theme (Prompt 7–8)
FASE 4 — Auth & Layout Shell (Prompt 9–11)
FASE 5 — Dashboard & Dompet (Prompt 12–15)
FASE 6 — Transaksi: Pemasukan & Pengeluaran (Prompt 16–20)
FASE 7 — Hutang (Prompt 21–22)
FASE 8 — Laporan & Grafik (Prompt 23–25)
FASE 9 — Kategori Custom (Prompt 26)
FASE 10 — Import/Export Excel (Prompt 27–28)
FASE 11 — Polish & QA (Prompt 29–31)
FASE 12 — Deployment ke Vercel (Prompt 32)
```

---

---

# FASE 0 — MASTER CONTEXT PROMPT

> **Simpan prompt ini.** Paste di awal setiap sesi baru Claude agar Claude selalu tahu konteks penuh proyek BisaBerkah.

---

```
📋 MASTER CONTEXT — Paste ini di awal setiap sesi baru Claude
```

```
Aku sedang membangun aplikasi bernama BisaBerkah menggunakan VSCode.

## Tentang BisaBerkah
BisaBerkah adalah mobile web app pencatatan keuangan keluarga yang mindful. Membantu keluarga Indonesia mencatat pemasukan, pengeluaran, budgeting dompet per kategori, tracking hutang, dan mendorong kebiasaan sedekah & tabungan tujuan.

Tagline: "Kelola uang, temukan berkah."

## Tech Stack
- Frontend: Next.js 14 (App Router)
- UI: shadcn/ui + Tailwind CSS
- State: React Query (TanStack Query) + Zustand
- Backend/DB: Supabase (PostgreSQL + Auth + Storage)
- Excel: SheetJS (xlsx)
- Deploy: Vercel (region: sin1 / Singapore)

## Design System
- Base: shadcn/ui (nova style)
- Warna primary: HIJAU EMERALD (#10B981) — bukan hitam default shadcn
  - Primary dipakai HANYA di: Button (variant default), Badge (variant default), 
    progress bar, active state navigation, link text
  - Komponen lain tetap ikut token shadcn standar (background, card, dll)
- Mobile-first: viewport utama 375px–428px
- Font: Inter
- Icon: Lucide React

## Struktur Folder (yang akan kita bangun)
```
bisaberkah/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← shell dengan bottom nav
│   │   ├── page.tsx            ← dashboard/beranda
│   │   ├── wallets/
│   │   ├── transactions/
│   │   ├── debts/
│   │   ├── reports/
│   │   ├── categories/
│   │   └── settings/
│   ├── api/
│   │   └── cron/carry-over/
│   └── layout.tsx
├── components/
│   ├── ui/                     ← shadcn components
│   ├── layout/                 ← BottomNav, AppHeader, FAB
│   ├── wallets/                ← WalletCard, WalletForm
│   ├── transactions/           ← TransactionItem, TransactionForm
│   ├── debts/                  ← DebtCard, DebtPaymentForm
│   └── reports/                ← Charts, SummaryCards
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/                      ← custom React hooks
├── stores/                     ← Zustand stores
└── types/                      ← TypeScript types
```

## Aturan Coding yang HARUS diikuti
1. Semua komponen mobile-first, max-width 480px di tengah layar
2. Gunakan shadcn/ui components (bukan custom HTML mentah untuk UI)
3. Semua data fetching pakai TanStack Query (useQuery, useMutation)
4. Semua warna pakai semantic tokens shadcn (bg-primary, text-muted-foreground, dll)
5. KECUALI primary color: ganti CSS variable --primary menjadi emerald green
6. Gunakan TypeScript strict mode
7. Error handling selalu ada (loading state, error state, empty state)
8. Toast notifications pakai Sonner
9. Form validation pakai Zod + react-hook-form

Selalu ingat konteks ini dalam setiap response yang kamu berikan.
```

---

---

# FASE 1 — PROJECT SETUP & KONFIGURASI

---

## Prompt 1 — Inisialisasi Project Next.js + shadcn

```
📋 PROMPT 1: Project Init
```

```
Bantu aku setup project BisaBerkah dari nol.

Jalankan langkah berikut dan berikan perintah terminal yang harus aku jalankan secara berurutan:

1. Buat project Next.js 14 dengan nama "bisaberkah" menggunakan:
   - TypeScript
   - Tailwind CSS
   - App Router
   - src/ directory: TIDAK (langsung di root)
   - Import alias: @/*

2. Setelah project dibuat, inisialisasi shadcn/ui dengan:
   - Style: nova
   - Base color: emerald (kita akan kustomisasi setelah init)
   - Tambahkan komponen awal: button, card, input, label, badge, 
     dialog, sheet, drawer, tabs, toast, sonner, skeleton, 
     separator, avatar, progress, select, textarea

3. Install semua dependencies tambahan:
   - @supabase/supabase-js
   - @supabase/ssr
   - @tanstack/react-query
   - @tanstack/react-query-devtools
   - zustand
   - react-hook-form
   - @hookform/resolvers
   - zod
   - xlsx
   - date-fns
   - lucide-react (sudah included di shadcn tapi pastikan)
   - recharts (untuk grafik laporan)
   - sonner (toast)

4. Setup struktur folder sesuai struktur yang aku sudah definisikan:
   app/(auth)/, app/(app)/, components/ui/, components/layout/, 
   components/wallets/, components/transactions/, components/debts/, 
   components/reports/, lib/supabase/, hooks/, stores/, types/

Berikan semua perintah terminal yang perlu aku jalankan, dan file apa saja yang perlu dibuat/diedit setelah init.
```

✅ **Expected:** Daftar perintah terminal lengkap + struktur folder siap dibuat

---

## Prompt 2 — Konfigurasi TypeScript Types

```
📋 PROMPT 2: TypeScript Types
```

```
Buat file types/index.ts yang mendefinisikan semua TypeScript types untuk BisaBerkah 
berdasarkan database schema berikut:

Database tables:
- profiles (id, name, email, created_at, updated_at)
- income_categories (id, user_id, name, icon, is_default, is_active, created_at)
- expense_categories (id, user_id, name, icon, is_default, is_active, created_at)
- wallets (id, user_id, name, type: 'monthly'|'goals'|'default', current_balance, 
  monthly_budget, budget_month, goal_target, goal_duration_months, 
  goal_monthly_target, goal_start_date, goal_end_date, is_active, created_at, updated_at)
- incomes (id, user_id, category_id, amount, date, notes, created_at, updated_at)
- income_distributions (id, income_id, wallet_id, amount, created_at)
- expenses (id, user_id, category_id, amount, date, notes, debt_id, created_at, updated_at)
- expense_wallet_sources (id, expense_id, wallet_id, amount, created_at)
- debts (id, user_id, creditor_name, total_amount, paid_amount, remaining_amount, 
  due_date, notes, status: 'active'|'paid', created_at, updated_at)

Buat juga types tambahan:
- WalletWithStats (wallet + persentase penggunaan budget)
- IncomeWithDistributions (income + distributions + category)
- ExpenseWithSources (expense + wallet_sources + category)
- DebtWithPayments (debt + list expenses yang terkait)
- TransactionSummary (total income, total expense, net, per periode)
- CategorySummary (category_id, name, icon, total_amount, percentage)

Gunakan TypeScript strict, semua field optional yang memang optional di DB.
```

✅ **Expected:** File `types/index.ts` lengkap dengan semua type definitions

---

## Prompt 3 — Konfigurasi Constants & Utils

```
📋 PROMPT 3: Constants & Utils
```

```
Buat dua file berikut untuk BisaBerkah:

### 1. lib/constants.ts
Isi dengan:
- DEFAULT_INCOME_CATEGORIES: array objek {name, icon, is_default: true} untuk:
  Gaji (💼), Bisnis (🏪), Freelance (💻), Investasi (📈), Hadiah (🎁), Lain-lain (📦)
  
- DEFAULT_EXPENSE_CATEGORIES: array objek {name, icon, is_default: true} untuk:
  Makan & Minum (🍽️), Transportasi (🚗), Kesehatan (🏥), Pendidikan (📚),
  Belanja (🛒), Tagihan & Utilitas (💡), Hiburan (🎬), Sedekah & Zakat (🤲),
  Cicilan & Hutang (💳), Lain-lain (📦)

- WALLET_TYPES: enum/object untuk 'monthly' | 'goals' | 'default'
- DATE_FORMATS: konstanta format tanggal yang dipakai
- CURRENCY: konfigurasi format Rupiah Indonesia (Rp, locale: id-ID)

### 2. lib/utils.ts
Tambahkan ke utils.ts yang sudah ada dari shadcn, tambahkan fungsi:
- formatCurrency(amount: number): string → format ke "Rp 1.500.000"
- formatDate(date: string | Date, format?: string): string → format tanggal Indonesia
- calculateGoalProgress(current: number, target: number): number → return persentase
- calculateGoalMonthlyTarget(total: number, months: number): number
- getDaysUntilEndOfMonth(): number
- getStartOfMonth(date?: Date): Date
- getEndOfMonth(date?: Date): Date
- getDateRange(period: 'today'|'week'|'month'|'year'): {from: Date, to: Date}
- truncateText(text: string, maxLength: number): string

Semua fungsi harus di-export dan menggunakan TypeScript.
```

✅ **Expected:** `lib/constants.ts` dan update `lib/utils.ts`

---

---

# FASE 2 — DATABASE & SUPABASE SETUP

---

## Prompt 4 — SQL Schema Setup

```
📋 PROMPT 4: Database Schema SQL
```

```
Buat file database/schema.sql yang berisi LENGKAP semua SQL untuk setup database 
Supabase BisaBerkah. Ini akan aku jalankan di Supabase SQL Editor.

Yang harus ada di file ini:

1. ENABLE EXTENSIONS
   - uuid-ossp
   - pgcrypto

2. TABLES — buat semua tabel ini dengan urutan yang benar (referential integrity):
   - profiles
   - income_categories  (sertakan kolom is_active boolean not null default true)
   - expense_categories (sertakan kolom is_active boolean not null default true)
   - wallets
   - incomes
   - income_distributions
   - expenses (dengan foreign key ke debts, tapi debts belum ada — perlu handle circular)
   - expense_wallet_sources
   - debts

3. COMPUTED COLUMNS & TRIGGERS
   - remaining_amount di debts sebagai GENERATED COLUMN
   - Trigger: update debts.paid_amount otomatis saat expense dengan debt_id ditambah/dihapus
   - Trigger: update wallet.updated_at saat ada perubahan
   - Trigger: auto-create profile saat user baru register di auth.users

4. ROW LEVEL SECURITY (RLS)
   - Enable RLS di semua tabel
   - Policy: user hanya bisa CRUD data milik sendiri
   - Untuk income_distributions & expense_wallet_sources: policy via JOIN ke parent table

5. INDEXES
   - expenses (user_id, date DESC)
   - incomes (user_id, date DESC)
   - wallets (user_id)
   - debts (user_id, status)

6. STORED PROCEDURE / FUNCTION
   - Buat function: initialize_user_defaults(user_id UUID)
     → Insert kategori default (income & expense)
     → Buat 1 wallet 'default' (Dompet Besar)
   - Panggil function ini dari trigger after insert on auth.users

7. FUNCTION: monthly_wallet_carry_over()
   - Untuk semua wallet type='monthly' yang aktif:
     - Jika current bulan belum diupdate: tambahkan monthly_budget ke current_balance
     - Update budget_month ke bulan saat ini
   - Return jumlah wallet yang diproses

Buat SQL yang clean, ada komentar per section, dan bisa dijalankan sekaligus (idempotent dengan IF NOT EXISTS).
```

✅ **Expected:** File `database/schema.sql` yang siap di-paste ke Supabase SQL Editor

🔧 **MANUAL ACTION:**
1. Buka Supabase dashboard → SQL Editor
2. Paste dan jalankan schema.sql
3. Verifikasi semua tabel terbuat di Table Editor

---

## Prompt 5 — Supabase Client Setup

```
📋 PROMPT 5: Supabase Client Configuration
```

```
Setup Supabase client untuk BisaBerkah di Next.js 14 App Router.
Buat file-file berikut:

### 1. lib/supabase/client.ts
Client-side Supabase client menggunakan @supabase/ssr createBrowserClient.
Export: createClient() function

### 2. lib/supabase/server.ts
Server-side Supabase client menggunakan @supabase/ssr createServerClient.
Export: createClient() function (async, untuk Server Components dan Route Handlers)
Harus read cookies dari Next.js headers()

### 3. lib/supabase/middleware.ts
Middleware untuk refresh session Supabase.
Export: updateSession(request: NextRequest) function

### 4. middleware.ts (di root project)
Next.js middleware yang:
- Memanggil updateSession untuk semua request
- Redirect ke /login jika user belum login dan mencoba akses /app/*
- Redirect ke /app jika user sudah login dan mencoba akses /login atau /register
- Matcher: semua route kecuali static files dan _next

### 5. lib/supabase/queries/
Buat folder ini dengan file-file query terorganisir per domain:
- wallets.ts → fungsi query untuk wallets
- transactions.ts → fungsi query untuk incomes dan expenses
- debts.ts → fungsi query untuk debts
- categories.ts → fungsi query untuk income_categories dan expense_categories
- reports.ts → fungsi query untuk laporan dan aggregasi

Untuk setiap file queries, buat skeleton fungsinya dulu (dengan TypeScript types) — 
implementasi detail akan kita isi nanti per fase.

Contoh struktur queries/wallets.ts:
- getWallets(supabase, userId)
- getWalletById(supabase, walletId)
- createWallet(supabase, data)
- updateWallet(supabase, walletId, data)
- deleteWallet(supabase, walletId)
- updateWalletBalance(supabase, walletId, amount, operation: 'add'|'subtract')

Gunakan environment variables:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

✅ **Expected:** Semua file Supabase client + struktur queries terbentuk

---

## Prompt 6 — React Query Setup & Providers

```
📋 PROMPT 6: React Query Provider & Global State
```

```
Setup global providers dan state management untuk BisaBerkah:

### 1. app/layout.tsx — Root Layout
Buat root layout yang:
- Import Inter font dari next/font/google
- Setup metadata (title: "BisaBerkah", description: "Kelola uang, temukan berkah")
- Wrap dengan Providers component
- Tambahkan viewport meta untuk mobile: 
  width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no

### 2. components/providers.tsx
Client component yang wrap:
- QueryClientProvider (TanStack Query) dengan konfigurasi:
  - staleTime: 1000 * 60 (1 menit)
  - gcTime: 1000 * 60 * 5 (5 menit)
  - retry: 1
- Sonner Toaster (dengan posisi "bottom-center", theme sesuai sistem)
- ReactQueryDevtools (hanya di development)

### 3. stores/auth.store.ts
Zustand store untuk auth state:
- State: user (User | null), isLoading (boolean)
- Actions: setUser, setLoading, clearUser
- Persist ke sessionStorage (bukan localStorage untuk keamanan)

### 4. stores/ui.store.ts
Zustand store untuk UI state:
- State: isBottomSheetOpen, activeBottomSheet ('income'|'expense'|null), selectedTransactionId
- Actions: openBottomSheet, closeBottomSheet, setActiveBottomSheet

### 5. hooks/use-auth.ts
Custom hook yang:
- Subscribe ke Supabase auth state changes
- Update auth.store saat user login/logout
- Return: { user, isLoading, isAuthenticated }

### 6. hooks/use-toast.ts
Wrapper hook untuk sonner toast dengan helper functions:
- toast.success(message)
- toast.error(message)
- toast.loading(message)
- toast.promise(promise, {loading, success, error})
- Format pesan dalam Bahasa Indonesia

Semua stores harus menggunakan TypeScript dengan types yang proper.
```

✅ **Expected:** Provider setup lengkap, Zustand stores, dan custom hooks

---

---

# FASE 3 — DESIGN SYSTEM & THEME

---

## Prompt 7 — Custom Theme Emerald Green

```
📋 PROMPT 7: Kustomisasi Warna Primary ke Emerald Green
```

```
Kustomisasi design system BisaBerkah agar warna primary berubah dari hitam (default shadcn nova) 
menjadi HIJAU EMERALD seperti Supabase UI (#10B981 / emerald-500).

ATURAN PENTING:
- Warna primary (emerald) HANYA digunakan di:
  ✅ Button (variant="default") 
  ✅ Badge (variant="default")
  ✅ Progress bar fill
  ✅ Active indicator di bottom navigation
  ✅ Link/anchor text color
  ✅ Focus ring
  ✅ Switch saat aktif
  ✅ Checkbox saat checked
- Komponen lain TETAP menggunakan token standar shadcn:
  ❌ JANGAN hijau di: Card, Background, Input border (normal), Header, dll

### 1. Edit globals.css (atau app/globals.css)
Override CSS variables untuk light mode dan dark mode:

Light mode — ubah nilai:
--primary: oklch value untuk emerald-500 (#10B981)
--primary-foreground: oklch value untuk white (teks di atas primary)
--ring: sama dengan --primary (focus ring)

Dark mode — ubah nilai yang sama dengan shade yang tepat.

Tambahkan juga CSS variables custom BisaBerkah:
--income-color: oklch untuk hijau (pemasukan)
--expense-color: oklch untuk merah (pengeluaran)
--wallet-monthly: oklch untuk biru muda (dompet bulanan)
--wallet-goals: oklch untuk ungu muda (dompet goals)
--wallet-default: oklch untuk abu (dompet besar)

Cara dapat nilai oklch yang tepat: gunakan oklch(0.696 0.17 162.48) untuk emerald-500.

### 2. Buat komponen custom: components/ui/currency-display.tsx
Komponen untuk menampilkan nominal uang Rupiah:
- Props: amount (number), variant ('income'|'expense'|'neutral'), size ('sm'|'md'|'lg')
- Format: "Rp 1.500.000" dengan warna:
  - income: text-emerald-600
  - expense: text-red-500  
  - neutral: text-foreground

### 3. Buat komponen: components/ui/amount-badge.tsx
Badge kecil untuk tampilkan +/- nominal di list transaksi:
- Props: amount, type ('income'|'expense')
- Style: pill shape, warna berbeda per type

### 4. Verifikasi dengan membuat komponen preview: components/design-preview.tsx
Tampilkan semua komponen UI yang sudah dikustomisasi dalam satu halaman untuk verifikasi visual.
Halaman ini bisa diakses di /design-preview (hanya di development).

Berikan semua kode yang perlu diedit/dibuat.
```

✅ **Expected:** globals.css ter-update + komponen custom + halaman preview

---

## Prompt 8 — Layout Shell & Bottom Navigation

```
📋 PROMPT 8: App Shell & Mobile Bottom Navigation
```

```
Buat layout shell mobile untuk BisaBerkah. Semua halaman di dalam /app/(app)/ 
akan menggunakan layout ini.

### 1. app/(app)/layout.tsx
Layout wrapper yang:
- Cek auth (redirect ke /login jika belum login) menggunakan server component
- Max width 480px, di tengah layar (untuk desktop yang buka di browser)
- Background abu sangat muda untuk area luar 480px
- Memiliki slot untuk: header (opsional), konten utama, dan bottom navigation

### 2. components/layout/bottom-nav.tsx
Bottom navigation bar dengan 4 tab:
- Beranda (icon: Home) → /app
- Dompet (icon: Wallet) → /app/wallets
- Transaksi (icon: ArrowLeftRight) → /app/transactions
- Laporan (icon: BarChart2) → /app/reports

Spesifikasi:
- Fixed di bottom, full width (max 480px)
- Height: 64px + safe area bottom (env(safe-area-inset-bottom))
- Background: bg-background dengan top border
- Active tab: icon + label berwarna primary (emerald), inactive: muted-foreground
- Label teks: 10px, icon: 22px
- Active indicator: titik kecil atau underline di bawah icon yang aktif
- Gunakan next/navigation usePathname() untuk deteksi halaman aktif
- Hapus tab yang sedang aktif dari navigasi (tidak bisa klik diri sendiri)

### 3. components/layout/app-header.tsx
Header reusable untuk halaman-halaman:
- Props: title, showBack (boolean), rightAction (ReactNode opsional)
- Height: 56px
- Back button menggunakan router.back() dari next/navigation
- Judul di tengah atau kiri
- Sticky di atas

### 4. components/layout/fab.tsx
Floating Action Button untuk tambah transaksi:
- Posisi: fixed bottom-right, tapi di atas bottom nav (bottom: 80px, right: 16px)
- Icon: Plus
- Warna: bg-primary (emerald) dengan teks putih
- Saat di-tap: buka BottomSheet pilihan (Pemasukan / Pengeluaran)
- Animasi: scale saat hover/press

### 5. components/layout/transaction-type-sheet.tsx
Bottom Sheet yang muncul saat FAB di-tap:
- Dua pilihan besar: "Catat Pemasukan" dan "Catat Pengeluaran"
- Setiap pilihan punya icon, label, dan deskripsi singkat
- Masing-masing navigasi ke halaman form yang sesuai
- Gunakan Drawer component dari shadcn

Semua komponen harus:
- Mobile-first, touch-friendly (min 44px touch target)
- Menggunakan TypeScript
- 'use client' di mana perlu
```

✅ **Expected:** Layout shell lengkap dengan bottom nav yang berfungsi

---

---

# FASE 4 — AUTH PAGES

---

## Prompt 9 — Halaman Login

```
📋 PROMPT 9: Halaman Login
```

```
Buat halaman login untuk BisaBerkah di app/(auth)/login/page.tsx

Spesifikasi UI (mobile-first, max-width 480px):
- Layout: centered vertical, padding 24px
- Atas: Logo/icon BisaBerkah + Tagline "Kelola uang, temukan berkah."
- Form fields:
  - Email (type=email, placeholder: "email@kamu.com")
  - Password (type=password, dengan toggle show/hide password)
- Button: "Masuk" (full width, variant=default/primary/emerald)
- Link: "Belum punya akun? Daftar sekarang"
- Di bawah: teks kecil "Data keuangan kamu aman & terenkripsi 🔒"

Logic:
- Gunakan react-hook-form + Zod untuk validasi:
  - email: required, format email valid
  - password: required, min 8 karakter
- Saat submit: panggil supabase.auth.signInWithPassword()
- Loading state: button disabled + spinner
- Error state: tampilkan pesan error di bawah form (dari Supabase)
  - "Email atau password salah" untuk invalid credentials
  - Error lain: tampilkan pesan asli dari Supabase
- Sukses: redirect ke /app (dashboard)
- Jika sudah login: redirect ke /app

Pesan error dalam Bahasa Indonesia yang friendly (bukan error teknis).
Gunakan komponen shadcn: Input, Label, Button, dan custom form components.
```

✅ **Expected:** Halaman login fungsional dengan validasi dan auth logic

---

## Prompt 10 — Halaman Register

```
📋 PROMPT 10: Halaman Register
```

```
Buat halaman register untuk BisaBerkah di app/(auth)/register/page.tsx

Spesifikasi UI (mobile-first):
- Layout: sama dengan login page
- Atas: Logo + "Buat Akun Baru"
- Form fields:
  - Nama Lengkap (required, min 2 karakter)
  - Email (required, format email)
  - Password (required, min 8 karakter, dengan strength indicator)
  - Konfirmasi Password (required, harus sama dengan password)
- Button: "Daftar Sekarang" (full width, emerald)
- Link: "Sudah punya akun? Masuk"

Password Strength Indicator:
- Progress bar di bawah field password
- Level: Lemah (merah), Sedang (kuning), Kuat (hijau)
- Kriteria: panjang, huruf besar, angka, karakter khusus

Logic:
- Validasi dengan react-hook-form + Zod
- Saat submit: 
  1. panggil supabase.auth.signUp({ email, password, options: { data: { name } } })
  2. Supabase trigger otomatis akan: buat profile + kategori default + dompet besar
  3. Redirect ke /app setelah sukses
- Error handling: email sudah terdaftar, dll (dalam Bahasa Indonesia)
- Loading state selama proses

Tambahkan di bawah form: 
"Dengan mendaftar, kamu setuju dengan cara BisaBerkah menyimpan data keuanganmu secara aman."
```

✅ **Expected:** Halaman register fungsional dengan validasi lengkap

---

## Prompt 11 — Auth Hook & Protected Route

```
📋 PROMPT 11: Auth State Management
```

```
Implementasikan auth state management yang sudah di-skeleton sebelumnya:

### 1. Implementasi hooks/use-auth.ts
Hook yang:
- Saat mount: cek session yang ada via supabase.auth.getSession()
- Subscribe ke supabase.auth.onAuthStateChange()
- Update Zustand auth store saat state berubah
- Unsubscribe saat unmount (cleanup)
- Return: { user, profile, isLoading, isAuthenticated, signOut }
- signOut: panggil supabase.auth.signOut() lalu redirect ke /login

### 2. hooks/use-profile.ts
Hook untuk fetch profile pengguna:
- useQuery untuk fetch dari tabel profiles
- Return: { profile, isLoading, updateProfile }
- updateProfile: useMutation untuk update nama di profiles

### 3. Tambahkan auth guard ke app/(app)/layout.tsx
Server component yang:
- Fetch session dari Supabase (server-side)
- Jika tidak ada session: redirect('/login')
- Jika ada session: render children

### 4. Halaman app/(auth)/layout.tsx
Layout untuk halaman auth:
- Centered, background lembut
- Jika sudah login: redirect ke /app

Pastikan tidak ada flash of unauthenticated content (FOUC) di semua halaman protected.
```

✅ **Expected:** Auth flow yang smooth tanpa FOUC

---

---

# FASE 5 — DASHBOARD & DOMPET

---

## Prompt 12 — Dashboard / Beranda

```
📋 PROMPT 12: Halaman Dashboard (Beranda)
```

```
Buat halaman dashboard BisaBerkah di app/(app)/page.tsx

## Layout Dashboard (scroll vertikal, mobile):

### Section 1 — Header Beranda
- Greeting: "Assalamu'alaikum, [nama user]! 👋" 
- Tanggal hari ini (format: "Minggu, 7 Juni 2026")
- Icon notifikasi (untuk v2, sekarang placeholder)

### Section 2 — Summary Card Bulan Ini
Card besar (rounded, shadow tipis) dengan:
- Label: "Ringkasan [Nama Bulan Tahun]" (misal: "Ringkasan Juni 2026")
- Total Pemasukan: Rp X.XXX.XXX (teks hijau)
- Total Pengeluaran: Rp X.XXX.XXX (teks merah)
- Selisih/Saldo Bersih: Rp X.XXX.XXX (hijau jika positif, merah jika negatif)

### Section 3 — Kondisi Dompet (Horizontal Scroll)
- Label section: "Dompet Kamu" + link "Lihat Semua"
- Scrollable horizontal, snap ke card
- Setiap WalletCard (compact): nama, saldo, progress bar (untuk goals)
- WalletCard goals: tampilkan persentase progress
- WalletCard monthly: tampilkan saldo vs budget (misal: "Rp 500rb / Rp 2jt")
- WalletCard default (Dompet Besar): tampilkan saldo total

### Section 4 — Transaksi Terbaru
- Label: "Transaksi Terbaru" + link "Lihat Semua"
- List 5 transaksi terbaru (income + expense digabung, sort by date desc)
- Setiap item: icon kategori, nama kategori, catatan (jika ada), tanggal, nominal (+/-)

### Section 5 — Quick Actions
- 2 tombol: "Catat Pengeluaran" dan "Catat Pemasukan"
- Styling: outlined button, icon + label

## Data Fetching:
- Gunakan TanStack Query
- Query: getSummaryCurrentMonth(userId) → total income, expense, net
- Query: getWallets(userId) → daftar dompet
- Query: getRecentTransactions(userId, limit: 5) → 5 transaksi terbaru
- Semua query parallel (useQueries atau Promise.all)
- Loading: tampilkan Skeleton component untuk setiap section
- Error: tampilkan pesan error yang friendly

Buat juga komponen:
- components/dashboard/summary-card.tsx
- components/dashboard/wallet-scroll.tsx
- components/dashboard/recent-transactions.tsx
```

✅ **Expected:** Dashboard lengkap dengan data fetching dan loading states

---

## Prompt 13 — Halaman Dompet (List)

```
📋 PROMPT 13: Halaman Dompet - List & Detail
```

```
Buat halaman dompet di app/(app)/wallets/page.tsx dan komponen terkait.

## Halaman Daftar Dompet

### Layout:
- Header: "Dompet Kamu" + button "+ Dompet Baru"
- Card ringkasan: Total saldo semua dompet gabungan
- Filter tab: "Semua" | "Bulanan" | "Goals"
- List dompet sesuai filter

### WalletCard (components/wallets/wallet-card.tsx):
Untuk dompet BULANAN:
- Nama dompet (bold)
- Badge: "Bulanan" (abu, kecil)
- Saldo saat ini: "Rp 1.500.000"
- Budget bulan ini: "/ Rp 2.000.000"
- Progress bar: penggunaan (spent/budget * 100)
  - Hijau jika < 75%, Kuning jika 75–90%, Merah jika > 90%
- Persentase penggunaan
- Sisa hari di bulan ini

Untuk dompet GOALS:
- Nama dompet + tujuan
- Badge: "Goals" (ungu, kecil)
- Nominal terkumpul: "Rp 30.000.000"
- Target: "/ Rp 120.000.000 (Umroh)"
- Progress bar: persentase terkumpul
- Perkiraan selesai: "Selesai: Des 2026"
- Target per bulan: "Target/bln: Rp 10.000.000"

Untuk dompet DEFAULT (Dompet Besar):
- Label: "💰 Dompet Besar"
- Badge: "Tidak Dianggarkan" 
- Saldo: nominal saat ini
- Deskripsi kecil: "Uang yang belum dialokasikan ke dompet manapun"

### Actions per WalletCard:
- Tap card → navigasi ke detail dompet (/app/wallets/[id])
- Long press atau swipe → opsi Edit / Hapus
- Dompet default: tidak bisa dihapus

## Data Fetching:
- useQuery: getWallets(userId) dengan filter type
- useMutation: deleteWallet (dengan konfirmasi dialog)
- Optimistic update saat delete

Implementasikan juga lib/supabase/queries/wallets.ts secara penuh.
```

✅ **Expected:** Halaman dompet dengan berbagai tipe wallet card yang informatif

---

## Prompt 14 — Form Buat/Edit Dompet

```
📋 PROMPT 14: Form Create & Edit Dompet
```

```
Buat form untuk membuat dan mengedit dompet di BisaBerkah.

### Halaman: app/(app)/wallets/new/page.tsx
### Halaman: app/(app)/wallets/[id]/edit/page.tsx (sama, mode edit)

## Step 1 — Pilih Tipe Dompet (khusus create, bukan edit):
Tampilkan 2 pilihan besar:
- 📅 Dompet Bulanan
  - "Untuk pengeluaran rutin bulanan"
  - Contoh: Makan, Listrik, Transportasi
- 🎯 Dompet Goals (Tabungan)
  - "Untuk menabung dengan tujuan tertentu"
  - Contoh: Umroh, Dana Darurat, Liburan

## Form Dompet BULANAN:
Fields:
- Nama Dompet (required, max 50 char, contoh: "Makan", "Listrik")
- Alokasi per Bulan (required, number, format currency)
- Icon/Emoji (opsional, emoji picker sederhana atau input manual)
Button: "Buat Dompet"

Preview real-time di bawah form:
"Dompet [Nama] akan mendapatkan Rp [X] setiap awal bulan."

## Form Dompet GOALS:
Fields:
- Nama Tujuan (required, contoh: "Umroh", "Beli Motor")
- Target Nominal Total (required, format currency)
- Durasi (required, number, satuan: bulan, min 1 max 360)
- Icon/Emoji (opsional)

Preview real-time:
"Target per bulan: Rp [X]"
"Estimasi selesai: [Bulan Tahun]"

## Validasi (Zod):
- nama: required, 2-50 karakter
- monthly_budget: required jika bulanan, > 0
- goal_target: required jika goals, > 0
- goal_duration_months: required jika goals, 1-360

## Logic:
- Create: useMutation → createWallet() → redirect ke /app/wallets dengan toast sukses
- Edit: pre-fill form dengan data existing, useMutation → updateWallet()
- Error: tampilkan di bawah field yang bermasalah

Gunakan react-hook-form + Zod. Semua field punya label + placeholder + error message dalam Bahasa Indonesia.
```

✅ **Expected:** Form create/edit dompet yang lengkap dengan validasi dan preview

---

## Prompt 15 — Detail Dompet

```
📋 PROMPT 15: Halaman Detail Dompet
```

```
Buat halaman detail dompet di app/(app)/wallets/[id]/page.tsx

## Layout:
- AppHeader: nama dompet + back button + edit button (atas kanan)
- Card stats dompet (sesuai tipe: monthly/goals/default)
- Tab: "Transaksi" | (untuk goals: + "Progress Bulanan")
- List transaksi yang terkait dengan dompet ini
  (expense yang menggunakan dompet ini sebagai sumber, 
   income yang didistribusikan ke dompet ini)

## Untuk Dompet GOALS, tambahkan:
- Progress visual yang menarik (circular progress atau bar besar)
- Milestone: berapa bulan sudah berjalan dari total durasi
- Proyeksi: "Dengan tabungan saat ini, selesai di [bulan tahun]"
- Tab "Progress Bulanan": tabel/list kontribusi per bulan

## Filter Transaksi:
- Filter bulan (dropdown atau chip): "Semua" | "Bulan ini" | "3 Bulan" | custom
- Sort: terbaru | terlama

## Data Fetching:
- getWalletById(walletId)
- getTransactionsByWallet(walletId, filters)

Implementasikan query getTransactionsByWallet di lib/supabase/queries/wallets.ts:
- Gabungkan income_distributions (untuk pemasukan) dan expense_wallet_sources (untuk pengeluaran)
- Kembalikan sebagai unified TransactionItem[]
- Sort by date DESC
```

✅ **Expected:** Halaman detail dompet yang informatif dengan history transaksi

---

---

# FASE 6 — TRANSAKSI: PEMASUKAN & PENGELUARAN

---

## Prompt 16 — Query Layer Transaksi

```
📋 PROMPT 16: Query Layer - Transactions
```

```
Implementasikan SEMUA fungsi query di lib/supabase/queries/transactions.ts
dan lib/supabase/queries/reports.ts secara lengkap (bukan skeleton).

### transactions.ts — Implementasi penuh:

#### INCOME QUERIES:
- getIncomes(supabase, userId, filters: {from?, to?, categoryId?, limit?})
  → Return: IncomeWithDistributions[]
  → JOIN dengan income_categories dan income_distributions + wallets
  
- getIncomeById(supabase, incomeId)
  → Return: IncomeWithDistributions | null

- createIncome(supabase, data: CreateIncomeInput)
  → Insert ke incomes
  → Insert ke income_distributions (array distribusi)
  → Update wallet current_balance untuk setiap distribusi
  → Sisa yang tidak terdistribusi → update default wallet
  → Return: Income

- updateIncome(supabase, incomeId, data: UpdateIncomeInput)
  → Rollback saldo dompet lama (reverse distribution)
  → Update income record
  → Apply distribusi baru
  → Return: Income

- deleteIncome(supabase, incomeId)
  → Rollback saldo dompet (reverse income_distributions)
  → Delete income_distributions
  → Delete income

#### EXPENSE QUERIES:
- getExpenses(supabase, userId, filters: {from?, to?, categoryId?, walletId?, limit?})
  → Return: ExpenseWithSources[]
  → JOIN dengan expense_categories dan expense_wallet_sources + wallets

- getExpenseById(supabase, expenseId)

- createExpense(supabase, data: CreateExpenseInput)
  → Insert ke expenses
  → Insert ke expense_wallet_sources (array sumber dompet)
  → Debit setiap wallet yang dipakai (update current_balance - amount)
  → Return: Expense

- updateExpense(supabase, expenseId, data: UpdateExpenseInput)
  → Rollback saldo dompet (credit balik)
  → Update expense
  → Apply sumber dompet baru (debit)

- deleteExpense(supabase, expenseId)
  → Credit balik semua wallet sumber
  → Delete expense_wallet_sources
  → Delete expense

#### UNIFIED FEED:
- getTransactionFeed(supabase, userId, filters)
  → Gabungkan incomes + expenses, sort by date DESC
  → Return: (Income | Expense)[] dengan type discriminator

### reports.ts — Implementasi penuh:
- getMonthSummary(supabase, userId, month: Date)
  → Return: { totalIncome, totalExpense, netBalance }

- getCategoryBreakdown(supabase, userId, type: 'income'|'expense', from: Date, to: Date)
  → Return: CategorySummary[]

- getMonthlyTrend(supabase, userId, months: number)
  → Return: { month: string, income: number, expense: number }[]

Semua query harus:
- Menggunakan TypeScript types dari types/index.ts
- Return data yang sudah di-transform (bukan raw Supabase response)
- Handle error dengan proper (throw atau return {data, error})
```

✅ **Expected:** Query layer yang lengkap dan type-safe

---

## Prompt 17 — Form Catat Pemasukan

```
📋 PROMPT 17: Form Input Pemasukan
```

```
Buat halaman form catat pemasukan di app/(app)/transactions/new/income/page.tsx

## Layout Step-by-Step (multi-step form, 2 langkah):

### LANGKAH 1 — Detail Pemasukan:
Fields:
- Nominal (required): Large number input di atas, format otomatis ke Rupiah saat typing
  - Input angka saja (keyboard numerik)
  - Display: "Rp 5.000.000" saat focus keluar
- Kategori (required): Dropdown/Select 
  - Tampilkan icon + nama kategori
  - Opsi di bawah: "+ Tambah Kategori Baru" (navigasi ke /categories)
- Tanggal (required): Date picker, default: hari ini
- Catatan (opsional): Textarea, max 255 karakter, placeholder "Tambah keterangan..."
Button: "Lanjut → Distribusi Dompet"

Validasi step 1:
- nominal > 0
- kategori harus dipilih
- tanggal harus valid

### LANGKAH 2 — Distribusi ke Dompet:
Header: Tampilkan nominal yang diinput di langkah 1

Layout distribusi:
- Card counter di atas: 
  "Belum dialokasikan: Rp X.XXX.XXX" (real-time update)
  - Warna: merah jika masih ada sisa, hijau jika sudah terdistribusi semua
  
- List semua dompet user (kecuali dompet default):
  Setiap item:
  - Nama dompet + saldo saat ini
  - Input nominal alokasi (number input, default: 0)
  - Warna input border jika nominal > 0
  
- Checkbox/toggle: "Sisa otomatis ke Dompet Besar"
  - Default: checked
  - Jika unchecked dan masih ada sisa: tampilkan warning

- Info box: "Sisa Rp X.XXX.XXX akan masuk ke Dompet Besar"

Button: "Simpan Pemasukan"

### Logika Distribusi:
- Total distribusi tidak boleh > nominal pemasukan
- Sisa = nominal - sum(semua alokasi)
- Jika sisa > 0 dan checkbox aktif: sisa masuk ke default wallet otomatis
- Validasi: jika unchecked dan sisa > 0 → error "Alokasikan semua pemasukan"

### Setelah Submit:
- Loading state (disable tombol)
- Sukses: toast "Pemasukan berhasil dicatat! 🎉" → redirect ke /app atau /app/transactions
- Error: toast merah + tidak redirect

Gunakan react-hook-form, tapi karena step 2 dinamis (dompet tidak tetap), 
gunakan local state untuk distribusi dompet.
```

✅ **Expected:** Form pemasukan 2-step yang intuitif dengan distribusi real-time

---

## Prompt 18 — Form Catat Pengeluaran

```
📋 PROMPT 18: Form Input Pengeluaran dengan Multi-Dompet Logic
```

```
Buat halaman form catat pengeluaran di app/(app)/transactions/new/expense/page.tsx

Ini adalah fitur paling kritis di BisaBerkah — implementasikan dengan sangat teliti.

## Layout:

### Fields Utama:
- Nominal (required): Large number input, format Rupiah
- Kategori (required): Select dengan icon kategori
- Tanggal (required): Date picker, default hari ini
- Catatan (opsional): Textarea

### Pilih Sumber Dompet (KRITIS):
UI: List dompet dengan checkbox + input nominal

Algorithm yang HARUS diimplementasikan:
```
STATE:
- totalAmount (dari input nominal)
- remainingAmount = totalAmount - sum(selectedSources)
- selectedSources = [{walletId, walletName, balance, amountTaken}]

FLOW:
1. User pilih dompet → check saldo dompet tersebut
2. Jika saldo dompet >= remainingAmount:
   → Auto-fill input dompet tsb dengan remainingAmount
   → remainingAmount = 0 → SELESAI
3. Jika saldo dompet < remainingAmount:
   → Auto-fill input dengan SELURUH saldo dompet tsb
   → remainingAmount = totalAmount - sum(selectedSources) [masih > 0]
   → Tampilkan warning: "Masih kurang Rp X.XXX.XXX. Pilih dompet lain."
   → User harus pilih dompet lain untuk menutupi sisa
4. Ulangi sampai remainingAmount = 0
```

UI Details:
- Counter besar: "Belum terpenuhi: Rp X.XXX.XXX" di atas list
  - Jika 0: ubah jadi "✅ Semua terpenuhi" dengan background hijau muda
  - Jika > 0: background kuning/merah dengan teks warning
- Setiap dompet item:
  - Nama dompet
  - Saldo tersedia: "Tersedia: Rp X.XXX.XXX"
  - Input nominal: disabled jika dompet tidak dipilih
  - Jika saldo tidak cukup: badge merah "Tidak cukup"
  - Checkbox untuk pilih/hapus dompet dari sumber

- Tombol "Simpan Pengeluaran":
  - Disabled jika remainingAmount > 0
  - Label ganti: "Pilih sumber dompet terlebih dahulu" jika masih ada sisa

### Validasi Submit:
- nominal > 0
- kategori dipilih
- sum(selectedSources) === totalAmount (harus persis sama)

### Mode Edit:
- Parameter ?edit=expenseId di URL
- Pre-fill semua field termasuk sumber dompet
- Saat save: jalankan rollback + re-apply

Setelah sukses: toast + redirect ke /app/transactions
```

✅ **Expected:** Form pengeluaran dengan multi-wallet logic yang berfungsi sempurna

---

## Prompt 19 — Halaman Riwayat Transaksi

```
📋 PROMPT 19: Halaman Riwayat Transaksi
```

```
Buat halaman riwayat transaksi di app/(app)/transactions/page.tsx

## Layout:

### Header:
- Judul: "Transaksi"
- Filter button (icon filter)

### Filter Bar (collapsible):
- Filter tanggal: chip/tab "Hari ini" | "Minggu ini" | "Bulan ini" | "Custom"
- Filter tipe: "Semua" | "Pemasukan" | "Pengeluaran"
- Filter kategori: Select dropdown (opsional)

### Summary Strip:
Saat filter aktif, tampilkan:
- Total Pemasukan periode: Rp X hijau
- Total Pengeluaran periode: Rp X merah

### List Transaksi:
- Grouped by date (header tanggal, contoh: "Hari ini", "Kemarin", "5 Jun 2026")
- Setiap TransactionItem (components/transactions/transaction-item.tsx):
  - Icon kategori (emoji dalam circle)
  - Nama kategori (bold)
  - Catatan (muted, truncated 1 baris)
  - Nama dompet sumber (untuk expense: dompet pertama + "..." jika multi)
  - Tanggal & waktu
  - Nominal (+ hijau untuk income, - merah untuk expense)
- Swipe kanan: Edit
- Swipe kiri: Hapus (dengan konfirmasi dialog)
- Infinite scroll atau pagination (load 20 per page)

### Empty State:
- Ilustrasi sederhana + teks "Belum ada transaksi"
- Tombol "Catat Pertama Kali"

### Loading State:
- Skeleton items

## Edit/Hapus Transaksi:
- Tap transaksi → navigasi ke detail (/app/transactions/[id])
- Detail page: tampilkan semua info + tombol Edit dan Hapus
- Edit: navigasi ke form edit (/app/transactions/new/income?edit=id atau /expense?edit=id)
- Hapus: konfirmasi dialog → delete + rollback saldo dompet → toast sukses

Implementasikan TransactionItem component yang bisa digunakan di dashboard juga.
```

✅ **Expected:** Halaman transaksi dengan filter, grouping, dan swipe actions

---

## Prompt 20 — Detail & Edit Transaksi

```
📋 PROMPT 20: Detail Transaksi & Delete Flow
```

```
Buat halaman detail transaksi di app/(app)/transactions/[id]/page.tsx

## Layout Detail Transaksi:
- AppHeader: "Detail Transaksi" + back + edit icon (kanan)
- Card utama:
  - Icon kategori (besar, 48px)
  - Nama kategori
  - Nominal (besar, hijau/merah sesuai tipe)
  - Tanggal lengkap: "Minggu, 7 Juni 2026"
  - Catatan (jika ada)
- Section "Sumber/Distribusi":
  - Untuk expense: "Diambil dari:" + list dompet + nominal per dompet
  - Untuk income: "Didistribusikan ke:" + list dompet + nominal per dompet
- Footer: tombol "Edit" dan "Hapus" (merah, outlined)

## Delete Flow:
Saat "Hapus" di-tap:
1. Tampilkan AlertDialog konfirmasi:
   - Judul: "Hapus Transaksi?"
   - Body: "Ini akan mengembalikan saldo dompet seperti semula. Tindakan ini tidak bisa dibatalkan."
   - Tombol: "Batal" (outlined) | "Ya, Hapus" (merah)
2. Saat konfirmasi: 
   - Loading state
   - Jalankan deleteIncome atau deleteExpense (dengan rollback saldo)
   - Toast sukses: "Transaksi berhasil dihapus"
   - Redirect ke /app/transactions

## Edit Flow:
- Redirect ke form yang sesuai dengan ?edit=[id]
- Form pre-filled dengan data existing
- Saat save: jalankan update (rollback + reapply saldo)

Pastikan query invalidation TanStack Query setelah mutation:
- Invalidate: wallets, transactions, dashboard summary
```

✅ **Expected:** Detail transaksi dengan delete/edit flow yang aman

---

---

# FASE 7 — HUTANG

---

## Prompt 21 — Manajemen Hutang

```
📋 PROMPT 21: Halaman & Form Hutang
```

```
Buat fitur manajemen hutang BisaBerkah.

### Halaman: app/(app)/debts/page.tsx

## Layout:
- Header: "Hutang" + "+ Hutang Baru"
- Summary Card:
  - Total Hutang: Rp X (semua hutang aktif)
  - Sudah Dibayar: Rp X
  - Sisa Hutang: Rp X (bold, merah)
- Tab: "Aktif" | "Lunas"
- List DebtCard

### DebtCard (components/debts/debt-card.tsx):
- Nama pemberi hutang
- Nominal total vs sudah dibayar
- Progress bar: persentase lunas
- Sisa hutang (bold, merah atau hijau jika lunas)
- Tanggal jatuh tempo (jika ada) + countdown "X hari lagi"
- Badge status: "Aktif" (kuning) | "Lunas" (hijau)
- Tombol "Bayar" (jika aktif) → buka bottom sheet bayar hutang

### Form Hutang Baru: app/(app)/debts/new/page.tsx
Fields:
- Nama Pemberi Hutang (required)
- Total Nominal Hutang (required, format currency)
- Tanggal Hutang (required, default hari ini)
- Jatuh Tempo (opsional, date picker)
- Catatan (opsional)
Button: "Simpan Hutang"

### Bottom Sheet: Bayar Hutang (components/debts/debt-payment-sheet.tsx)
Trigger: Tap "Bayar" di DebtCard
Content:
- Info hutang: nama pemberi + sisa hutang
- Input: Nominal Pembayaran (max: remaining_amount)
- Pilih Dompet Sumber (pilih dari dompet user)
- Tombol: "Konfirmasi Pembayaran"

Logic Bayar Hutang:
1. Buat expense baru dengan:
   - category: "Cicilan & Hutang"
   - debt_id: id hutang ini
   - amount: nominal bayar
   - wallet sources: sesuai pilihan
2. Update debts: paid_amount += nominal bayar
3. Jika paid_amount >= total_amount: set status = 'paid'
4. Toast sukses + close sheet + refresh data

### Implementasi: lib/supabase/queries/debts.ts
- getDebts(supabase, userId, status?: 'active'|'paid')
- getDebtById(supabase, debtId)  
- createDebt(supabase, data)
- payDebt(supabase, debtId, amount, walletSources) — transaction: expense + update debt
- deleteDebt(supabase, debtId) — hanya jika paid_amount = 0
```

✅ **Expected:** Fitur hutang lengkap dengan payment flow

---

## Prompt 22 — Detail Hutang & History Pembayaran

```
📋 PROMPT 22: Detail Hutang
```

```
Buat halaman detail hutang di app/(app)/debts/[id]/page.tsx

## Layout:
- Header: nama pemberi hutang + back + edit
- Card Stats:
  - Total Hutang: Rp X
  - Terbayar: Rp X (hijau)
  - Sisa: Rp X (merah)
  - Progress bar tebal
  - Status badge + jatuh tempo
  
- Section "History Pembayaran":
  - List expense yang terkait hutang ini (debt_id = id)
  - Setiap item: tanggal, nominal, dompet sumber
  - Sorted newest first

- Tombol sticky bottom: "Bayar Hutang" (jika aktif) | "Hutang Lunas ✅" (jika paid)

- Menu opsi (titik tiga / ⋮):
  - Edit hutang
  - Hapus hutang (hanya jika paid_amount = 0, dengan konfirmasi)
```

✅ **Expected:** Detail hutang dengan history pembayaran yang jelas

---

---

# FASE 8 — LAPORAN & GRAFIK

---

## Prompt 23 — Halaman Laporan

```
📋 PROMPT 23: Halaman Laporan & Grafik
```

```
Buat halaman laporan di app/(app)/reports/page.tsx menggunakan Recharts.

## Layout:

### Filter Periode (sticky di atas):
Chip selector: "Hari ini" | "Minggu" | "Bulan ini" | "Tahun ini" | "Custom"
Jika "Custom": tampilkan date range picker (from - to)
Tampilkan label periode aktif: "Juni 2026"

### Card 1 — Ringkasan Periode:
- Total Pemasukan (hijau)
- Total Pengeluaran (merah)
- Selisih / Net (hijau atau merah)

### Card 2 — Grafik Donut: Distribusi Pengeluaran
Menggunakan Recharts PieChart:
- Donut chart (innerRadius=60)
- Setiap slice = kategori pengeluaran
- Warna per kategori (generate dari palette)
- Legend di bawah chart (nama kategori + persentase)
- Center text: "Total Pengeluaran" + nominal
- Hanya tampilkan top 6 kategori, sisanya "Lainnya"

### Card 3 — Tabel Rincian per Kategori:
- Kolom: Icon | Kategori | Jumlah Transaksi | Total | Persentase
- Sort: total DESC
- Toggle: Pengeluaran / Pemasukan

### Card 4 — Grafik Trend (jika filter Tahun):
Recharts BarChart:
- X axis: nama bulan (Jan-Des)
- Bar hijau: pemasukan
- Bar merah: pengeluaran
- Tooltip: detail saat hover

### Card 5 — Kondisi Dompet:
- List semua dompet dengan saldo saat ini
- Progress bar setiap dompet monthly
- Goals dengan progress terkumpul

## Tips Recharts Mobile:
- responsive: gunakan ResponsiveContainer width="100%" 
- chart height: 220px untuk donut, 200px untuk bar
- fontSize label: 11px agar tidak overlap
- Disable animations saat filter berubah (untuk performa)

## Data:
Fetch parallel menggunakan useQueries:
- getMonthSummary
- getCategoryBreakdown(type='expense')
- getCategoryBreakdown(type='income')
- getMonthlyTrend(months=12) — hanya jika filter tahun
```

✅ **Expected:** Laporan dengan grafik yang informatif dan responsive

---

## Prompt 24 — Komponen Chart Reusable

```
📋 PROMPT 24: Chart Components
```

```
Buat komponen chart yang reusable untuk BisaBerkah:

### 1. components/reports/donut-chart.tsx
Props:
- data: { name: string, value: number, color: string }[]
- title: string
- totalLabel: string
- totalValue: number

Features:
- Recharts PieChart dengan innerRadius
- Center text (custom label)
- Legend sederhana di bawah (horizontal scroll jika banyak)
- Empty state jika data kosong
- Loading skeleton

### 2. components/reports/bar-chart.tsx
Props:
- data: { month: string, income: number, expense: number }[]
- title: string

Features:
- Recharts BarChart
- Grouped bars (income & expense per bulan)
- Custom tooltip dengan format Rupiah
- Responsive container

### 3. components/reports/category-table.tsx
Props:
- data: CategorySummary[]
- type: 'income' | 'expense'
- total: number

Features:
- Tabel sederhana
- Progress bar mini per kategori
- Sort by amount

### 4. utils/chart-colors.ts
Fungsi generateCategoryColors(categories: string[]): { [category]: string }
- Return objek mapping nama kategori ke warna hex
- Gunakan palette yang konsisten dan aksesibel
- Kategori "Sedekah & Zakat" selalu dapat warna emerald
- Kategori "Hutang" selalu dapat warna merah

Semua komponen harus handle: loading (skeleton), empty (ilustrasi + teks), dan error state.
```

✅ **Expected:** Chart components yang reusable dan polished

---

## Prompt 25 — Filter & Export Laporan

```
📋 PROMPT 25: Filter Laporan & Export
```

```
Tambahkan fitur filter lengkap dan export ke halaman laporan.

### Filter Component: components/reports/report-filter.tsx
State yang dikelola:
- period: 'today' | 'week' | 'month' | 'year' | 'custom'
- dateFrom: Date
- dateTo: Date
- categoryId: string | null
- transactionType: 'all' | 'income' | 'expense'

UI:
- Chip selector untuk period
- Date range picker jika period='custom' (gunakan shadcn Calendar atau input date)
- Dropdown kategori (opsional filter)
- Reset filter button

Gunakan URL search params untuk persist filter state:
- Saat filter berubah: update URL (?period=month&from=2026-06-01&to=2026-06-30)
- Saat halaman load: baca dari URL params
- Ini memungkinkan share link dan back button bekerja

### Export Transaksi ke Excel (tambahkan ke halaman laporan):
Button "Export Excel" di header laporan.
Saat di-tap:
1. Fetch semua transaksi dalam periode filter yang aktif
2. Generate Excel menggunakan SheetJS:
   - Sheet 1 "Pemasukan": tanggal, kategori, nominal, catatan, distribusi dompet
   - Sheet 2 "Pengeluaran": tanggal, kategori, nominal, catatan, dompet sumber
   - Sheet 3 "Ringkasan": summary periode + kategori breakdown
3. Nama file: BisaBerkah_[periode].xlsx (misal: BisaBerkah_Juni2026.xlsx)
4. Trigger download

Gunakan fungsi yang sudah ada dari Prompt 28 (Import/Export) — jika belum ada, buat helper:
lib/excel/export.ts → exportTransactionsToExcel(incomes, expenses, summary, filename)
```

✅ **Expected:** Filter persistent di URL + export Excel yang berfungsi

---

---

# FASE 9 — KATEGORI CUSTOM

---

## Prompt 26 — Manajemen Kategori

```
📋 PROMPT 26: Halaman & Form Kategori Custom
```

```
Buat fitur manajemen kategori custom di app/(app)/categories/page.tsx

## Layout:
- Header: "Kategori"
- Tab: "Pengeluaran" | "Pemasukan"
- Setiap tab: list kategori (default + custom)

### CategoryItem:
- Icon/emoji kategori
- Nama kategori
- Badge "Default" (jika is_default = true) atau tidak ada badge
- Jumlah transaksi terkait (kecil, muted)
- Switch/toggle Aktif/Nonaktif (untuk SEMUA kategori, default & custom)
- Edit icon (hanya untuk kategori custom)
- Delete icon (hanya untuk custom yang tidak punya transaksi)
- Kategori default: tidak bisa diedit/dihapus (tapi TETAP bisa di-toggle ON/OFF)

### Toggle Aktif/Nonaktif Kategori (berlaku untuk default & custom):
- Setiap kategori punya field `is_active` (boolean, default true).
- User bisa menonaktifkan kategori yang tidak sesuai preferensinya
  (mis. matikan "Investasi" atau "Cicilan & Hutang") tanpa menghapusnya.
- Toggle ON  → `is_active = true`  : kategori muncul di form pilihan transaksi.
- Toggle OFF → `is_active = false` : kategori DISEMBUNYIKAN dari dropdown form
  pemasukan/pengeluaran, TAPI:
  - Data & riwayat transaksi lama yang memakai kategori ini TIDAK berubah
    (tetap tampil normal di laporan dan detail transaksi).
  - Kategori tetap ada di halaman /categories (tampil meredup/abu) agar bisa
    diaktifkan lagi kapan saja.
- Kategori default boleh di-OFF, tapi minimal harus ada 1 kategori aktif per
  tipe (income & expense) — cegah user mematikan semuanya (tampilkan toast
  "Minimal satu kategori harus aktif").
- Toggle bersifat instan (optimistic update) + toast singkat
  "Kategori dinonaktifkan" / "Kategori diaktifkan".

### Bottom Sheet: Tambah/Edit Kategori
Trigger: button "+ Tambah Kategori" atau tap edit icon
Content:
- Emoji Picker sederhana (grid 4x4 emoji yang relevan per tipe)
  - Pengeluaran: 🍽️🚗🏥📚🛒💡🎬🤲💳🏠🎓💊🧴
  - Pemasukan: 💼🏪💻📈🎁🏦🤝💰
  - Plus input manual emoji
- Input nama kategori
- Preview: "Kategori akan tampil sebagai: [emoji] [nama]"
- Tombol: "Simpan Kategori"

### Logic Hapus:
- Sebelum hapus: cek apakah ada transaksi yang pakai kategori ini
- Jika ada: tampilkan pesan "Kategori ini digunakan oleh X transaksi. Tidak bisa dihapus."
- Jika tidak ada: konfirmasi → hapus

### Implementasi: lib/supabase/queries/categories.ts (lengkap)
- getExpenseCategories(supabase, userId) → default + custom milik user
- getIncomeCategories(supabase, userId)
- getActiveCategories(supabase, userId, type) → HANYA is_active = true
  (dipakai oleh dropdown di form pemasukan & pengeluaran)
- createCategory(supabase, data, type)
- updateCategory(supabase, categoryId, data)
- toggleCategoryActive(supabase, categoryId, type, isActive) → set is_active;
  tolak jika mematikan kategori aktif terakhir untuk tipe tsb
- deleteCategory(supabase, categoryId) → cek dulu ada transaksi atau tidak
- getCategoryUsageCount(supabase, categoryId, type) → jumlah transaksi

> Catatan skema: tambahkan kolom `is_active boolean not null default true` di
> tabel `income_categories` dan `expense_categories` (lihat Prompt 4). Form
> transaksi (Prompt 17 & 18) HARUS pakai getActiveCategories, bukan getAll.
```

✅ **Expected:** Manajemen kategori yang aman (tidak bisa hapus yang dipakai) +
toggle aktif/nonaktif untuk semua kategori (default & custom)

---

---

# FASE 10 — IMPORT / EXPORT EXCEL

---

## Prompt 27 — Template & Halaman Import/Export

```
📋 PROMPT 27: Import/Export Excel - UI & Template
```

```
Buat halaman Import/Export di app/(app)/settings/import-export/page.tsx

## Layout:
- Header: "Import & Export Data"

### Section 1 — Export Data:
- Card dengan penjelasan
- Filter periode export (month picker atau year picker)
- Tombol "Export Excel (.xlsx)"
- Keterangan: "File berisi sheet Pemasukan, Pengeluaran, dan Ringkasan"

### Section 2 — Import Data dari Excel:
- Card dengan penjelasan
- Tombol "Download Template BisaBerkah.xlsx"
- Komponen Upload:
  - Drop zone atau button "Pilih File"
  - Hanya accept .xlsx dan .xls
  - Preview file yang dipilih (nama file + ukuran)
  - Tombol "Upload & Proses" → submit

### Section 3 — Panduan Import:
- Accordion/collapsible dengan panduan singkat:
  - Cara download template
  - Cara isi template (format tanggal, nama kategori harus persis)
  - Cara upload
  - Apa yang terjadi jika ada error

## Template Excel Generator: lib/excel/template.ts
Buat fungsi generateBisaBerkahTemplate(categories):
- Input: { incomeCategories: string[], expenseCategories: string[] }
- Output: Blob untuk download
- Struktur file .xlsx:
  
  Sheet "Pemasukan":
  - Header row (bold, green background): Tanggal | Kategori | Nominal | Catatan
  - 3 baris contoh data (dengan warna muted)
  - Dropdown validation di kolom Kategori (list dari incomeCategories)
  - Format tanggal di kolom Tanggal: YYYY-MM-DD
  - Format number di kolom Nominal
  - Lebar kolom yang sesuai

  Sheet "Pengeluaran":
  - Sama seperti Pemasukan tapi dropdown dari expenseCategories

  Sheet "Panduan":
  - Teks instruksi pengisian

Gunakan SheetJS untuk semua operasi Excel.
```

✅ **Expected:** UI import/export + template generator yang profesional

---

## Prompt 28 — Import Processing Logic

```
📋 PROMPT 28: Import Excel - Parsing & Processing
```

```
Implementasikan logika parsing dan import file Excel untuk BisaBerkah.

### lib/excel/import.ts

Buat fungsi:

#### 1. parseExcelFile(file: File, userCategories: {income, expense})
Return: ParseResult {
  incomes: ParsedIncome[],
  expenses: ParsedExpense[],
  errors: ImportError[]
}

Parsing logic:
- Baca sheet "Pemasukan" dan "Pengeluaran"
- Skip header row (row 1)
- Per baris, validasi:
  - Tanggal: apakah format valid YYYY-MM-DD? Cek apakah tanggal masuk akal (tidak lebih dari hari ini + tidak lebih dari 5 tahun lalu)
  - Kategori: apakah match dengan kategori user? (case-insensitive)
    → Jika tidak match: catat di errors, SKIP baris ini
  - Nominal: apakah angka positif?
  - Catatan: opsional, truncate ke 255 char jika terlalu panjang

Return per baris valid:
- ParsedIncome: { date, categoryId, amount, notes }
- ParsedExpense: { date, categoryId, amount, notes }

ImportError: { row: number, sheet: string, field: string, message: string }

#### 2. Komponen Preview Import: components/import/import-preview.tsx
Props: ParseResult

UI:
- Tab: "Pemasukan (X baris)" | "Pengeluaran (X baris)" | "Error (X baris)"
- Tab Pemasukan/Pengeluaran: tabel preview 5 baris pertama
- Tab Error: tabel dengan kolom Baris, Sheet, Field, Masalah
- Summary: "X baris berhasil, Y baris akan dilewati"
- Tombol: "Batalkan" | "Import Sekarang (X transaksi)"

#### 3. processImport(parsedData, userId, defaultWalletId)
- Batch insert incomes → semua masuk ke default wallet (distribusi)
- Batch insert expenses → semua diambil dari default wallet (jika saldo cukup)
- Jika saldo default wallet tidak cukup untuk expense: tetap import tapi tandai sebagai "deficit"
- Return: { imported: number, skipped: number, errors: ImportError[] }

#### 4. Flow di halaman import:
State machine:
1. IDLE: tampilkan upload zone
2. PARSING: loading indicator "Membaca file..."
3. PREVIEW: tampilkan ImportPreview component + confirm button
4. IMPORTING: loading "Mengimpor data..."
5. DONE: tampilkan hasil (X berhasil, Y error) + tombol ke dashboard
6. ERROR: tampilkan error + retry option

Semua berjalan di client-side (tidak perlu API route untuk parsing).
```

✅ **Expected:** Import Excel yang robust dengan validasi dan preview sebelum import

---

---

# FASE 11 — POLISH & QA

---

## Prompt 29 — Error Handling & Loading States Global

```
📋 PROMPT 29: Polish - Error Handling & Empty States
```

```
Audit dan perbaiki semua error handling, loading states, dan empty states di BisaBerkah.

### 1. Error Boundary: components/error-boundary.tsx
- React Error Boundary class component
- Tampilkan UI error yang friendly saat crash
- Tombol "Coba Lagi" yang reload halaman
- Bungkus di app/(app)/layout.tsx

### 2. Global Error Handler: hooks/use-query-error-handler.ts
- Hook yang intercept semua TanStack Query error
- Jika 401/403: redirect ke login
- Jika network error: toast "Koneksi bermasalah, coba lagi"
- Jika 500: toast "Terjadi kesalahan server"
- Set di QueryClient defaultOptions.queries.onError

### 3. Empty States — buat/audit semua halaman:
Setiap halaman harus punya empty state yang proper:
- Dashboard tanpa transaksi: 
  Ilustrasi + "Mulai catat keuanganmu!" + tombol "Catat Transaksi Pertama"
- Dompet kosong (hanya ada Dompet Besar):
  "Buat dompet untuk mulai mengatur budgetmu" + tombol "Buat Dompet"
- Transaksi kosong:
  "Belum ada transaksi" + tombol "Catat Sekarang"
- Hutang kosong:
  "Alhamdulillah, tidak ada hutang 🎉"
- Laporan tanpa data:
  "Belum ada data untuk periode ini"

### 4. Skeleton Loading — audit semua:
Pastikan setiap halaman punya skeleton yang:
- Memiliki layout yang mirip dengan konten asli (bukan generic bars)
- Jumlah skeleton item yang logis (3-5 item, bukan 1)
- Menggunakan Skeleton component dari shadcn

### 5. Toast Messages — standardisasi:
Buat file lib/toast-messages.ts dengan semua pesan toast:
- Semua dalam Bahasa Indonesia yang hangat
- Sukses: "✅ [aksi] berhasil!"
- Error: spesifik per kasus, bukan "Terjadi kesalahan"
- Contoh error yang baik:
  - "Saldo dompet tidak mencukupi"
  - "Kategori ini masih digunakan oleh X transaksi"
  - "Nominal harus lebih dari Rp 0"

### 6. Offline Detection: components/offline-banner.tsx
- Deteksi window.online/offline event
- Tampilkan banner kuning di atas konten: "Tidak ada koneksi internet"
- Auto-hide saat koneksi kembali
```

✅ **Expected:** App yang graceful dalam semua kondisi edge case

---

## Prompt 30 — Mobile UX Polish

```
📋 PROMPT 30: Mobile UX Improvements
```

```
Lakukan polish untuk mobile experience BisaBerkah:

### 1. Pull to Refresh
Tambahkan pull-to-refresh di halaman utama yang punya data:
- Dashboard, Transaksi, Dompet, Hutang
- Gunakan overscroll behavior dan touch events
- Saat pull: invalidate semua TanStack Query yang relevan
- Visual feedback: loading indicator

### 2. Number Input Mobile-Friendly
Buat komponen: components/ui/currency-input.tsx
- Input khusus untuk nominal uang
- inputMode="numeric" (buka keyboard angka di mobile)
- Auto format saat typing: 1500000 → "1.500.000"
- Tampilkan "Rp" prefix di kiri
- Clear button (X) di kanan saat ada nilai
- Validasi hanya angka (block huruf)
- Paste handling (strip non-numeric characters)

### 3. Date Picker Mobile
Buat komponen: components/ui/date-picker.tsx
- Untuk mobile: gunakan native <input type="date"> yang sudah didesain OS
- Styling agar konsisten dengan shadcn
- Default: hari ini
- Max: hari ini (tidak boleh input tanggal masa depan untuk transaksi)

### 4. Bottom Sheet Animations
Pastikan semua bottom sheet/drawer:
- Ada overlay gelap di belakang
- Animasi slide-up smooth
- Bisa di-dismiss dengan swipe down atau tap overlay
- Handle safe area bottom (iPhone)

### 5. Haptic Feedback (Web Vibration API)
Tambahkan subtle haptic saat:
- Tap tombol aksi utama (Simpan, Konfirmasi)
- Swipe delete berhasil
- Toggle switch
- Kode: navigator.vibrate && navigator.vibrate(50)
- Hanya di HTTPS (wajib untuk produksi)

### 6. iOS Safe Area
Pastikan:
- Bottom nav: padding-bottom: env(safe-area-inset-bottom)
- FAB: posisi bottom disesuaikan dengan safe area
- Modal/sheet: padding bottom yang aman

### 7. Scroll Performance
- Semua list panjang: tambahkan will-change: transform
- Gunakan CSS containment di list items
- Cegah overflow: hidden leak di iOS

Buat checklist QA mobile di CHECKLIST.md yang harus dicek sebelum deploy.
```

✅ **Expected:** UX mobile yang terasa native dan smooth

---

## Prompt 31 — Carry-Over Cron & Settings Page

```
📋 PROMPT 31: Cron Job & Halaman Settings
```

```
Implementasikan dua hal yang belum ada:

### 1. Cron Job: Carry-Over Dompet Bulanan
File: app/api/cron/carry-over/route.ts

Logic:
- Endpoint GET yang dipanggil Vercel Cron setiap tanggal 1 pukul 00.01 WIB
- Verifikasi Authorization header dengan CRON_SECRET env var
- Panggil Supabase RPC function monthly_wallet_carry_over()
- Log hasilnya
- Return JSON result

Environment variable: CRON_SECRET (generate random string, simpan di Vercel)

vercel.json tambahkan:
{
  "crons": [{ "path": "/api/cron/carry-over", "schedule": "1 17 L * *" }]
}
// 17:01 UTC = 00:01 WIB tanggal berikutnya

### 2. Halaman Settings: app/(app)/settings/page.tsx
Sections:
- **Profil Saya**
  - Avatar (inisial nama, bukan foto)
  - Nama Lengkap (editable inline)
  - Email (readonly)
  - Tombol "Simpan Perubahan"
  
- **Data & Privasi**
  - Link ke /settings/import-export
  - Keterangan: "Data kamu tersimpan aman di server terenkripsi"
  
- **Tentang Aplikasi**
  - Versi: BisaBerkah v1.0.0
  - Tagline: "Kelola uang, temukan berkah."
  
- **Keluar**
  - Tombol "Keluar dari Akun" (merah, outlined)
  - Konfirmasi dialog sebelum logout

Tambahkan link ke Settings di bottom navigation atau di header dashboard (icon gear/profile).
```

✅ **Expected:** Cron job berfungsi + Settings page yang lengkap

---

---

# FASE 12 — DEPLOYMENT KE VERCEL

---

## Prompt 32 — Production Build & Deploy

```
📋 PROMPT 32: Final Config & Deploy ke Vercel
```

```
Bantu aku menyiapkan semua yang diperlukan untuk deploy BisaBerkah ke Vercel.

### 1. Environment Variables yang diperlukan:
Buat file .env.local untuk development (jangan di-commit ke git):
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CRON_SECRET=

Buat .env.example (untuk dokumentasi):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CRON_SECRET=your_random_secret_string

### 2. vercel.json (root)
```json
{
  "framework": "nextjs",
  "regions": ["sin1"],
  "crons": [{
    "path": "/api/cron/carry-over",
    "schedule": "1 17 L * *"
  }]
}
```

### 3. .gitignore — pastikan ada:
.env.local
.env*.local
node_modules/
.next/

### 4. next.config.ts — production config:
- Images: domain whitespace
- Strict mode: true
- Compress: true
- PoweredByHeader: false

### 5. Checklist Pre-Deploy:
Buatkan DEPLOY_CHECKLIST.md dengan:
□ Schema SQL sudah dijalankan di Supabase
□ RLS sudah aktif di semua tabel
□ Environment variables sudah diset di Vercel dashboard
□ CRON_SECRET sudah sama di Vercel env dan code
□ Supabase Auth email confirmation: disabled (untuk MVP)
□ Supabase connection pooling: aktif
□ Build berhasil: npm run build (tidak ada error)
□ Test auth flow: register → login → logout
□ Test basic CRUD: buat dompet, catat transaksi
□ Test carry-over logic (manual trigger dulu)
□ Mobile test di Chrome DevTools (iPhone SE viewport)

### 6. Perintah Deploy:
Berikan perintah lengkap untuk:
1. Push ke GitHub
2. Connect repo ke Vercel
3. Set environment variables via Vercel CLI atau dashboard
4. Deploy pertama
5. Verify deployment

### 7. Post-Deploy Testing Checklist:
□ Buka di mobile browser (Android Chrome / iOS Safari)
□ Register akun baru → cek kategori default terbuat
□ Buat dompet bulanan dan goals
□ Catat pemasukan dengan distribusi
□ Catat pengeluaran dari beberapa dompet
□ Lihat dashboard ringkasan
□ Lihat laporan dengan grafik
□ Download template Excel
□ Test import Excel

Berikan step-by-step yang jelas, sertakan setiap perintah yang perlu dijalankan.
```

✅ **Expected:** Project siap deploy dan checklist yang bisa di-follow tanpa kebingungan

---

---

# BONUS — PROMPT DEBUGGING & ITERASI

Gunakan prompt-prompt ini saat butuh fix spesifik:

---

## Prompt Debug A — Fix TypeScript Error

```
Aku mendapat TypeScript error berikut di file [nama file]:

[paste error]

Konteks: [jelaskan apa yang kamu coba lakukan]
Code terkait:
[paste code]

Perbaiki error ini dan jelaskan kenapa terjadi.
```

---

## Prompt Debug B — Fix Supabase Query

```
Query Supabase berikut tidak mengembalikan data yang benar:

[paste query/fungsi]

Yang aku harapkan: [jelaskan]
Yang sebenarnya terjadi: [jelaskan/paste error]

Database schema tabel yang relevan:
[paste schema]

Perbaiki query ini.
```

---

## Prompt Debug C — Fix Mobile Layout

```
Komponen berikut terlihat tidak benar di mobile (375px viewport):

[paste komponen]

Masalah yang terlihat: [describe]
Screenshot atau deskripsi: [tambahkan]

Perbaiki agar layout benar di mobile dan desktop (max-width 480px centered).
```

---

## Prompt Debug D — Performance Issue

```
Halaman [nama halaman] terasa lambat di mobile. 
Berikut komponen utamanya:

[paste code]

Dan query yang digunakan:
[paste queries]

Identifikasi bottleneck dan berikan solusi untuk optimasi performa.
```

---

## Prompt Iterasi — Tambah Fitur Baru

```
Aku ingin menambahkan fitur [nama fitur] ke BisaBerkah.
Berikut requirement-nya:
- [requirement 1]
- [requirement 2]

Komponen yang mungkin terpengaruh: [list]
Database changes yang diperlukan (jika ada): [jelaskan]

Buat implementasi lengkap termasuk UI, logic, dan query.
Ikuti pattern dan conventions yang sudah ada di project ini.
```

---

---

# 📋 SUMMARY — URUTAN PENGERJAAN

```
HARI 1-2: FASE 0-2 (Setup + DB)
  □ Prompt 0: Master Context (simpan untuk reference)
  □ Prompt 1: Project Init + Install
  □ Prompt 2: TypeScript Types
  □ Prompt 3: Constants & Utils
  □ Prompt 4: SQL Schema → jalankan di Supabase
  □ Prompt 5: Supabase Client Setup
  □ Prompt 6: React Query + Providers

HARI 3: FASE 3-4 (Design + Auth)
  □ Prompt 7: Theme Emerald Green
  □ Prompt 8: Layout Shell + Bottom Nav
  □ Prompt 9: Halaman Login
  □ Prompt 10: Halaman Register
  □ Prompt 11: Auth Hook + Guard

HARI 4-5: FASE 5 (Dompet)
  □ Prompt 12: Dashboard
  □ Prompt 13: Halaman Dompet List
  □ Prompt 14: Form Create/Edit Dompet
  □ Prompt 15: Detail Dompet

HARI 6-8: FASE 6 (Transaksi)
  □ Prompt 16: Query Layer Transaksi (penting, pondasi)
  □ Prompt 17: Form Pemasukan
  □ Prompt 18: Form Pengeluaran (paling kompleks)
  □ Prompt 19: List Transaksi
  □ Prompt 20: Detail & Delete Transaksi

HARI 9: FASE 7 (Hutang)
  □ Prompt 21: Daftar & Form Hutang
  □ Prompt 22: Detail Hutang

HARI 10-11: FASE 8-9 (Laporan + Kategori)
  □ Prompt 23: Halaman Laporan
  □ Prompt 24: Chart Components
  □ Prompt 25: Filter & Export Laporan
  □ Prompt 26: Manajemen Kategori

HARI 12: FASE 10 (Import/Export)
  □ Prompt 27: UI & Template Excel
  □ Prompt 28: Import Processing

HARI 13-14: FASE 11-12 (Polish + Deploy)
  □ Prompt 29: Error Handling
  □ Prompt 30: Mobile UX Polish
  □ Prompt 31: Cron Job + Settings
  □ Prompt 32: Deploy ke Vercel
```

---

_Dokumen ini adalah panduan hidup. Update sesuai kebutuhan saat development berlangsung._
_BisaBerkah v1.0 — "Kelola uang, temukan berkah."_
