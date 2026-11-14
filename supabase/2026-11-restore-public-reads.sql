-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — restore public READ access only (run this if the site shows
-- "permission denied for table ..." after the security lock)
-- ────────────────────────────────────────────────────────────────────────────
-- The lock revoked anon entirely. That is correct for writes, but the server
-- still needs to read public content. Two ways to satisfy it:
--
--   A. SERVICE KEY (preferred): set SUPABASE_SERVICE_ROLE_KEY in the hosting
--      environment and redeploy. The server then bypasses RLS and nothing in
--      this file is needed.
--   B. THIS FILE: if the service key is not set yet, re-grant SELECT on the
--      public content tables so pages render. Writes stay blocked, and private
--      tables stay unreadable by the anon key.
--
-- Requires supabase/2026-11-security-lock.sql to have been applied.
-- ────────────────────────────────────────────────────────────────────────────

grant select on all tables in schema public to anon;

do $$
declare
  t text;
  private_tables text[] := array[
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'employees',
    'employee_permissions',
    'api_keys',
    'api_key_events',
    'audit_logs',
    'notifications',
    'inquiries',
    'newsletter_subscribers',
    'bug_reports',
    'customer_chats',
    'customer_chat_messages',
    'push_subscriptions',
    'subscriptions',
    'subscription_plans',
    'subscription_change_requests',
    'shop_requests',
    'bot_guilds',
    'email_log',
    'email_sends'
  ];
begin
  foreach t in array private_tables
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('revoke all on public.%I from anon;', t);
    end if;
  end loop;
end $$;

-- Writes stay closed for anon on every table.
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('revoke insert, update, delete, truncate on public.%I from anon;', t);
  end loop;
end $$;

-- Verify: false for writes, true for content reads.
select has_table_privilege('anon', 'public.site_settings', 'insert');  -- false
select has_table_privilege('anon', 'public.users', 'select');          -- false
select has_table_privilege('anon', 'public.projects', 'select');       -- true
