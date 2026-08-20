-- ============================================================================
-- BisaBerkah — kolom is_active untuk kategori (Fase 9 / Prompt 26)
-- Jalankan di Supabase SQL Editor setelah schema.sql.
-- Memungkinkan user menonaktifkan kategori (default & custom) tanpa menghapus.
-- ============================================================================

alter table public.income_categories
  add column if not exists is_active boolean not null default true;

alter table public.expense_categories
  add column if not exists is_active boolean not null default true;
