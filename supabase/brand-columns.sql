-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Brand column for multi-brand content (Fubrio + Bloom)
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
--
-- When a visitor is on fubrio.in, they see content with brand='fubrio' or 'both'.
-- When a visitor is on bloom.fubrio.in, they see content with brand='bloom' or 'both'.
-- Default is 'fubrio' so existing content stays visible on fubrio.in.
-- ────────────────────────────────────────────────────────────────────────────

alter table projects add column if not exists brand text not null default 'fubrio';
alter table products add column if not exists brand text not null default 'fubrio';
alter table services add column if not exists brand text not null default 'fubrio';
alter table blog_posts add column if not exists brand text not null default 'fubrio';
alter table announcements add column if not exists brand text not null default 'fubrio';
alter table shop_items add column if not exists brand text not null default 'fubrio';
alter table events add column if not exists brand text not null default 'fubrio';
alter table testimonials add column if not exists brand text not null default 'fubrio';
alter table sponsors add column if not exists brand text not null default 'fubrio';
alter table partners add column if not exists brand text not null default 'fubrio';
