-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Bug reports + Admin notifications
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────────────────────

-- Bug reports / feature suggestions
create table if not exists bug_reports (
  id           text primary key default gen_random_uuid()::text,
  type         text not null,                  -- 'bug' | 'suggestion'
  project_name text not null,
  project_id   text,
  body         text not null,
  email        text not null,
  user_agent   text,
  page_url     text,
  status       text not null default 'NEW',
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists bug_reports_status_idx on bug_reports(status);
create index if not exists bug_reports_type_idx on bug_reports(type);
create index if not exists bug_reports_created_at_idx on bug_reports(created_at desc);
GRANT ALL ON bug_reports TO anon, authenticated;
alter table bug_reports enable row level security;
drop policy if exists "br_all" on bug_reports;
create policy "br_all" on bug_reports for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_bug_reports_updated on bug_reports;
create trigger trg_bug_reports_updated before update on bug_reports for each row execute function update_updated_at();

-- Admin notifications (auto-created on key events)
create table if not exists notifications (
  id           text primary key default gen_random_uuid()::text,
  user_id      text,
  type         text not null,
  title        text not null,
  body         text,
  link         text,
  source_id    text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_read_at_idx on notifications(read_at);
create index if not exists notifications_created_at_idx on notifications(created_at desc);
GRANT ALL ON notifications TO anon, authenticated;
alter table notifications enable row level security;
drop policy if exists "n_all" on notifications;
create policy "n_all" on notifications for all to anon, authenticated using (true) with check (true);
