-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — security lock (run once, after deploying with the service key set)
-- ────────────────────────────────────────────────────────────────────────────
-- Order matters:
--   1. Add SUPABASE_SERVICE_ROLE_KEY to the server environment and redeploy.
--   2. Then run this file in Supabase → SQL Editor.
--
-- Why: the schema granted anon full table access, so the public anon key could
-- insert an employees row (and its permissions), a users row with a known
-- password hash, or rewrite site_settings — a direct admin bypass. All table
-- writes now go through server routes using the service role key, which
-- bypasses RLS, so the anon role can be locked down completely.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Remove any provider key stored by the old settings form. site_settings is
--    readable with the anon key until step 2 runs, so this cannot wait.
delete from site_settings
where key like 'ai.%'
  and (key ilike '%key%' or key ilike '%secret%' or key ilike '%token%' or key ilike '%password%');

-- 2) Strip every privilege the public anon key had on application tables.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- 3) Remove the permissive "anon_all" policies so a future GRANT cannot quietly
--    reopen the same hole, and keep RLS on.
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "anon_all" on public.%I;', t);
    execute format('drop policy if exists "anon_read" on public.%I;', t);
  end loop;
end $$;

-- 4) Signed-in Supabase users (not used by the app's NextAuth sessions) keep
--    read-only access. All writes are service-role only.
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('drop policy if exists "authenticated_read" on public.%I;', t);
    execute format(
      'create policy "authenticated_read" on public.%I for select to authenticated using (true);', t
    );
  end loop;
end $$;

-- 5) Verify. Both should return false.
-- select has_table_privilege('anon', 'public.site_settings', 'insert');
-- select has_table_privilege('anon', 'public.users', 'update');

-- Note: storage.objects still allows anon uploads to the "uploads" bucket
-- because the media uploader runs client-side. If you move uploads to a server
-- route, also drop the anon insert/update/delete policies in
-- supabase/storage-bucket.sql.
