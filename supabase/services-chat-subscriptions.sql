-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Service requests, customer chat, rate limit usage, subscriptions
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

-- Add contact_method (other contact: Discord, Telegram, etc.) to shop_requests
alter table shop_requests add column if not exists contact_method text;

-- Service requests (parallel to shop_requests, for the Services section)
create table if not exists service_requests (
  id             text primary key default gen_random_uuid()::text,
  service_id     text references services(id) on delete set null,
  service_title  text not null,
  buyer_email    text not null,
  buyer_phone    text,
  contact_method text,
  message        text,
  status         text not null default 'NEW',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
GRANT ALL ON service_requests TO anon, authenticated;
alter table service_requests enable row level security;
drop policy if exists "srq_all" on service_requests;
create policy "srq_all" on service_requests for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_service_requests_updated on service_requests;
create trigger trg_service_requests_updated before update on service_requests for each row execute function update_updated_at();

-- Customer chat (customer ↔ support team messaging)
create table if not exists customer_chats (
  id                    text primary key default gen_random_uuid()::text,
  source_type           text not null,
  source_id             text,
  customer_email        text not null,
  customer_name         text,
  customer_phone        text,
  customer_contact_method text,
  visitor_id           text,
  status                text not null default 'OPEN',
  assigned_to           text,
  subject               text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
GRANT ALL ON customer_chats TO anon, authenticated;
alter table customer_chats enable row level security;
drop policy if exists "cchat_all" on customer_chats;
create policy "cchat_all" on customer_chats for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_customer_chats_updated on customer_chats;
create trigger trg_customer_chats_updated before update on customer_chats for each row execute function update_updated_at();

create table if not exists customer_chat_messages (
  id           text primary key default gen_random_uuid()::text,
  chat_id      text not null references customer_chats(id) on delete cascade,
  sender_type  text not null,
  sender_id    text,
  sender_name  text,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists customer_chat_messages_chat_id_idx on customer_chat_messages(chat_id);
GRANT ALL ON customer_chat_messages TO anon, authenticated;
alter table customer_chat_messages enable row level security;
drop policy if exists "cmsg_all" on customer_chat_messages;
create policy "cmsg_all" on customer_chat_messages for all to anon, authenticated using (true) with check (true);

-- API key usage tracking (rate limit buckets)
create table if not exists api_key_usage (
  id            text primary key default gen_random_uuid()::text,
  api_key_id    text not null references api_keys(id) on delete cascade,
  bucket_type   text not null,
  bucket_key    text not null,
  count         integer not null default 0,
  updated_at    timestamptz not null default now()
);
create unique index if not exists api_key_usage_uniq on api_key_usage(api_key_id, bucket_type, bucket_key);
GRANT ALL ON api_key_usage TO anon, authenticated;
alter table api_key_usage enable row level security;
drop policy if exists "aku_all" on api_key_usage;
create policy "aku_all" on api_key_usage for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_api_key_usage_updated on api_key_usage;
create trigger trg_api_key_usage_updated before update on api_key_usage for each row execute function update_updated_at();

-- Subscription plans (admin-managed, prices in INR)
create table if not exists subscription_plans (
  id                       text primary key default gen_random_uuid()::text,
  name                     text not null,
  description              text,
  price_inr                numeric not null,
  period                   text not null default 'monthly',
  price_type               text not null default 'subscription',
  ai_credits_per_day       integer not null default 25,
  ads_requests_per_day     integer not null default 1000,
  features                 jsonb not null default '[]'::jsonb,
  active                   boolean not null default true,
  "order"                  integer not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
GRANT ALL ON subscription_plans TO anon, authenticated;
alter table subscription_plans enable row level security;
drop policy if exists "sp_all" on subscription_plans;
create policy "sp_all" on subscription_plans for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_subscription_plans_updated on subscription_plans;
create trigger trg_subscription_plans_updated before update on subscription_plans for each row execute function update_updated_at();

-- User subscriptions (after Instamojo payment success)
create table if not exists user_subscriptions (
  id                              text primary key default gen_random_uuid()::text,
  user_email                      text not null,
  user_id                         text,
  plan_id                         text references subscription_plans(id) on delete set null,
  plan_name                       text,
  price_inr                       numeric not null,
  period                          text,
  instamojo_payment_request_id    text,
  instamojo_payment_id            text,
  payment_status                  text not null default 'pending',
  status                          text not null default 'INACTIVE',
  started_at                      timestamptz,
  expires_at                      timestamptz,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);
create index if not exists user_subscriptions_user_email_idx on user_subscriptions(user_email);
GRANT ALL ON user_subscriptions TO anon, authenticated;
alter table user_subscriptions enable row level security;
drop policy if exists "us_all" on user_subscriptions;
create policy "us_all" on user_subscriptions for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_user_subscriptions_updated on user_subscriptions;
create trigger trg_user_subscriptions_updated before update on user_subscriptions for each row execute function update_updated_at();

-- Subscription price change requests
create table if not exists subscription_change_requests (
  id                    text primary key default gen_random_uuid()::text,
  user_email            text not null,
  plan_id               text not null references subscription_plans(id) on delete cascade,
  plan_name             text,
  original_price_inr    numeric not null,
  requested_price_inr   numeric not null,
  reason                text,
  status                text not null default 'PENDING',
  admin_response        text,
  chat_id               text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
GRANT ALL ON subscription_change_requests TO anon, authenticated;
alter table subscription_change_requests enable row level security;
drop policy if exists "scr_all" on subscription_change_requests;
create policy "scr_all" on subscription_change_requests for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_subscription_change_requests_updated on subscription_change_requests;
create trigger trg_subscription_change_requests_updated before update on subscription_change_requests for each row execute function update_updated_at();
