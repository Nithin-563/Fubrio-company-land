create table if not exists emails (
  id            text primary key default gen_random_uuid()::text,
  from_address  text not null,
  to_address    text not null,
  subject       text not null,
  body          text not null,
  status        text not null default 'SENT',
  reply_to_id   text,
  created_at    timestamptz not null default now()
);

create index if not exists emails_created_at_idx on emails(created_at);

GRANT ALL ON emails TO anon, authenticated;
alter table emails enable row level security;
drop policy if exists "anon_all" on emails;
create policy "anon_all" on emails for all to anon, authenticated using (true) with check (true);
