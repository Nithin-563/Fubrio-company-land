-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Service purchase/contact fields, category images, ad impressions
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

-- Add purchase_url + contact_enabled to services (so services can have a Buy
-- button OR a Contact CTA, mirroring the shop's behavior)
alter table services add column if not exists purchase_url text;
alter table services add column if not exists contact_enabled boolean not null default false;
alter table services add column if not exists contact_email text;

-- Add image column to categories
alter table categories add column if not exists image text;

-- Ad impressions — track impressions + clicks for ads-type API keys
create table if not exists ad_impressions (
  id               text primary key default gen_random_uuid()::text,
  api_key_id       text references api_keys(id) on delete set null,
  impression_token text not null unique,
  ad_format        text not null default 'banner',
  ad_unit          text,
  ip               text,
  user_agent       text,
  referrer         text,
  clicked          boolean not null default false,
  clicked_at       timestamptz,
  payout_usd       numeric not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists ad_impressions_api_key_id_idx on ad_impressions(api_key_id);
create index if not exists ad_impressions_impression_token_idx on ad_impressions(impression_token);
create index if not exists ad_impressions_created_at_idx on ad_impressions(created_at);

GRANT ALL ON ad_impressions TO anon, authenticated;
alter table ad_impressions enable row level security;
drop policy if exists "adim_all" on ad_impressions;
create policy "adim_all" on ad_impressions for all to anon, authenticated using (true) with check (true);
