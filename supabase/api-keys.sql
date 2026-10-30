-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — API Keys tables (for announcements webhooks + Wisee AI 1.0)
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists api_keys (
  id                 text primary key default gen_random_uuid()::text,
  user_id            text,
  user_email         text not null,
  user_name          text,
  user_avatar        text,
  auth_provider      text not null default 'google',
  type               text not null,
  name               text not null,
  key_hash           text not null unique,
  key_prefix         text not null,
  key_suffix         text not null,
  webhook_url        text,
  scopes             jsonb not null default '[]'::jsonb,
  status             text not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  expires_at         timestamptz,
  last_used_at       timestamptz,
  daily_count        integer not null default 0,
  daily_count_reset_at timestamptz
);
create index if not exists api_keys_user_id_idx on api_keys(user_id);
create index if not exists api_keys_type_idx on api_keys(type);
create index if not exists api_keys_key_hash_idx on api_keys(key_hash);

GRANT ALL ON api_keys TO anon, authenticated;
alter table api_keys enable row level security;
drop policy if exists "apk_all" on api_keys;
create policy "apk_all" on api_keys for all to anon, authenticated using (true) with check (true);

create table if not exists api_key_logs (
  id              text primary key default gen_random_uuid()::text,
  api_key_id      text references api_keys(id) on delete set null,
  type            text not null,
  status          text not null,
  request_data   jsonb,
  response_data  jsonb,
  ip              text,
  user_agent      text,
  error_message   text,
  created_at      timestamptz not null default now()
);
create index if not exists api_key_logs_api_key_id_idx on api_key_logs(api_key_id);

GRANT ALL ON api_key_logs TO anon, authenticated;
alter table api_key_logs enable row level security;
drop policy if exists "apkl_all" on api_key_logs;
create policy "apkl_all" on api_key_logs for all to anon, authenticated using (true) with check (true);
