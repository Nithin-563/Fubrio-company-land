-- AI provider key hygiene.
--
-- site_settings is world-readable (RLS policy anon_all using (true) plus GRANT
-- ALL to anon), so a provider key must never live there: anyone holding the
-- public anon key could select it. The AI key is read from the server
-- environment instead (AI_API_KEY, or the legacy WISEE_AI_UPSTREAM_KEY).
--
-- This removes any key left over from earlier admin saves. Provider, base URL,
-- model, assistant name and system prompt are not secrets and stay in
-- site_settings.

delete from site_settings
where key like 'ai.%'
  and (key ilike '%key%' or key ilike '%secret%' or key ilike '%token%' or key ilike '%password%');

-- Optional hardening: keep site_settings readable (the site's server client uses
-- the anon key) but stop anonymous clients from writing to it. Admin writes go
-- through the server with a signed-in session, so this is safe to apply there.
--
-- drop policy if exists "anon_all" on site_settings;
-- create policy "settings_read" on site_settings for select to anon, authenticated using (true);
-- create policy "settings_write" on site_settings for all to authenticated using (true) with check (true);
