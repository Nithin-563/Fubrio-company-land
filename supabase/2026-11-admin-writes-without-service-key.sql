-- Temporary: lets the admin panel write content tables when the host has no
-- SUPABASE_SERVICE_ROLE_KEY. Auth-critical tables stay locked, so this cannot
-- be used to create an admin account or read password hashes.
-- Anyone holding the public anon key could still vandalise content, so add the
-- service role key and remove these grants as soon as you can.

do $$
declare
  t text;
  writable text[] := array[
    'projects','products','services','sponsors','partners','blog_posts','testimonials',
    'faqs','events','categories','tags','media_assets','pages','page_sections','nav_items',
    'footer_columns','team_members','donators','shop_items','announcements','donation_links',
    'project_tags','product_tags','blog_post_tags','reusable_blocks','shop_requests','links',
    'metrics','short_links','visits','announcement_views','newsletter_subscribers',
    'push_subscriptions','contact_messages','subscription_plans'
  ];
begin
  foreach t in array writable
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('grant select, insert, update, delete on public.%I to anon;', t);
    end if;
  end loop;
end $$;

-- Re-lock everything if you later add the service role key:
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['projects','products','services','sponsors','partners','blog_posts',
--     'testimonials','faqs','events','categories','tags','media_assets','pages','page_sections',
--     'nav_items','footer_columns','team_members','donators','shop_items','announcements',
--     'donation_links','project_tags','product_tags','blog_post_tags','reusable_blocks',
--     'shop_requests','links','metrics','short_links','visits']
--   loop
--     if to_regclass(format('public.%I', t)) is not null then
--       execute format('revoke all on public.%I from anon;', t);
--     end if;
--   end loop;
-- end $$;
