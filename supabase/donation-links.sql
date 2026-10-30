-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Bugfix: add updated_at column + Donation links table
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

-- ─── Bugfix: add missing updated_at columns ───
-- The trigger trg_<table>_updated calls update_updated_at() which does
-- new.updated_at = now(). But these tables don't have an updated_at column,
-- causing "record new has no field updated_at" on UPDATE.
alter table site_settings add column if not exists updated_at timestamptz not null default now();
alter table footer_columns add column if not exists updated_at timestamptz not null default now();
alter table audit_logs add column if not exists updated_at timestamptz not null default now();
alter table short_links add column if not exists updated_at timestamptz not null default now();
alter table verification_tokens add column if not exists updated_at timestamptz not null default now();
-- verification_tokens has no `id` primary key column — the trigger would also fail
-- on missing id, but Postgres triggers only access columns explicitly named in
-- the trigger function. Since update_updated_at() only touches updated_at, we just
-- need that one column to exist.

-- ─── Donation links table ───
create table if not exists donation_links (
  id           text primary key default gen_random_uuid()::text,
  label        text not null,
  url          text not null,
  icon         text,
  description  text,
  "order"      integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

GRANT ALL ON donation_links TO anon, authenticated;
alter table donation_links enable row level security;
drop policy if exists "don_all" on donation_links;
create policy "don_all" on donation_links for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_donation_links_updated on donation_links;
create trigger trg_donation_links_updated before update on donation_links for each row execute function update_updated_at();
