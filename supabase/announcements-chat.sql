-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Announcements + Chat tables
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

-- ─── Announcements ───
create table if not exists announcements (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  body         text,
  image        text,
  status       text not null default 'DRAFT',
  pinned       boolean not null default false,
  views_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

GRANT ALL ON announcements TO anon, authenticated;
alter table announcements enable row level security;
drop policy if exists "ann_all" on announcements;
create policy "ann_all" on announcements for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_announcements_updated on announcements;
create trigger trg_announcements_updated before update on announcements for each row execute function update_updated_at();

create table if not exists announcement_views (
  id              text primary key default gen_random_uuid()::text,
  announcement_id text not null references announcements(id) on delete cascade,
  visitor_id      text not null,
  created_at       timestamptz not null default now()
);
create unique index if not exists announcement_views_uniq on announcement_views(announcement_id, visitor_id);
GRANT ALL ON announcement_views TO anon, authenticated;
alter table announcement_views enable row level security;
drop policy if exists "annv_all" on announcement_views;
create policy "annv_all" on announcement_views for all to anon, authenticated using (true) with check (true);

create table if not exists announcement_subscriptions (
  id         text primary key default gen_random_uuid()::text,
  endpoint   text not null unique,
  p256dh     text,
  auth       text,
  visitor_id text not null,
  created_at timestamptz not null default now()
);
GRANT ALL ON announcement_subscriptions TO anon, authenticated;
alter table announcement_subscriptions enable row level security;
drop policy if exists "anns_all" on announcement_subscriptions;
create policy "anns_all" on announcement_subscriptions for all to anon, authenticated using (true) with check (true);

-- ─── Chat ───
create table if not exists chat_conversations (
  id         text primary key default gen_random_uuid()::text,
  type       text not null default 'direct',
  name       text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT ALL ON chat_conversations TO anon, authenticated;
alter table chat_conversations enable row level security;
drop policy if exists "chc_all" on chat_conversations;
create policy "chc_all" on chat_conversations for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_chat_conversations_updated on chat_conversations;
create trigger trg_chat_conversations_updated before update on chat_conversations for each row execute function update_updated_at();

create table if not exists chat_participants (
  id              text primary key default gen_random_uuid()::text,
  conversation_id text not null references chat_conversations(id) on delete cascade,
  user_id         text not null,
  user_email      text not null,
  user_name       text,
  user_avatar     text,
  added_at        timestamptz not null default now()
);
create unique index if not exists chat_participants_uniq on chat_participants(conversation_id, user_id);
GRANT ALL ON chat_participants TO anon, authenticated;
alter table chat_participants enable row level security;
drop policy if exists "chp_all" on chat_participants;
create policy "chp_all" on chat_participants for all to anon, authenticated using (true) with check (true);

create table if not exists chat_messages (
  id              text primary key default gen_random_uuid()::text,
  conversation_id text not null references chat_conversations(id) on delete cascade,
  sender_id       text not null,
  sender_email    text not null,
  sender_name     text,
  type            text not null default 'text',
  body            text,
  file_url        text,
  file_name       text,
  file_size       integer,
  file_mime       text,
  call_status     text,
  call_duration   integer,
  created_at       timestamptz not null default now()
);
GRANT ALL ON chat_messages TO anon, authenticated;
alter table chat_messages enable row level security;
drop policy if exists "chm_all" on chat_messages;
create policy "chm_all" on chat_messages for all to anon, authenticated using (true) with check (true);

create table if not exists chat_read_receipts (
  id              text primary key default gen_random_uuid()::text,
  conversation_id text not null references chat_conversations(id) on delete cascade,
  message_id      text not null references chat_messages(id) on delete cascade,
  user_id         text not null,
  read_at         timestamptz not null default now()
);
create unique index if not exists chat_read_uniq on chat_read_receipts(message_id, user_id);
GRANT ALL ON chat_read_receipts TO anon, authenticated;
alter table chat_read_receipts enable row level security;
drop policy if exists "chr_all" on chat_read_receipts;
create policy "chr_all" on chat_read_receipts for all to anon, authenticated using (true) with check (true);

-- ─── Enable Supabase Realtime on chat_messages ───
-- (Required for instant message delivery — without this, the Chat admin
--  uses polling fallback instead of push.)
alter publication supabase_realtime add table chat_messages;
