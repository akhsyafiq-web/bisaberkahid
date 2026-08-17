# BisaBerkah

> Kelola uang, temukan berkah.

Mobile-first family-finance app for Indonesian households — income, expenses,
per-category wallet budgeting, savings goals, and debt tracking, with zakat &
sadaqah treated as first-class money flows.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Tailwind CSS v4** — tokens from the BisaBerkah Design System (jade `#07835A`,
  Plus Jakarta Sans, gold reserved for zakat/sadaqah)
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **TanStack Query** + **Zustand** for data & state
- **react-hook-form** + **Zod** for forms
- **Recharts**, **SheetJS (xlsx)**, **Sonner**, **lucide-react**

## Getting started

```bash
# 1. Configure environment
cp .env.example .env.local        # fill in your Supabase URL + anon key

# 2. Set up the database
#    Paste database/schema.sql into the Supabase SQL Editor and run it.

# 3. Run
npm run dev                       # http://localhost:3000
```

## Project layout

```
app/(auth)/      login, register
app/(app)/       authenticated shell (bottom nav + FAB): beranda, wallets,
                 transactions, reports
components/      ui/ primitives · layout/ chrome · dashboard/ · brand/
lib/             supabase/ (clients + queries) · utils · constants
hooks/  stores/  types/   database/schema.sql
```

## Build status

This repo is being built by following `BisaBerkah_Claude_VSCode_Prompts.md`.
**Done:** foundation (Prompts 1–11) — project setup, design tokens, types,
Supabase + query layer, auth, layout shell. **Next:** dashboard, wallets,
transactions, debts, reports, categories, import/export, deploy (Prompts 12–32).
The design source of truth is `BisaBerkah Design System/`.
# bisaberkahid
