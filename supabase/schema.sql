-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Complete Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (Supabase enables this by default, but just in case)
create extension if not exists "pgcrypto";

-- ─── AUTH ───
create table if not exists users (
  id            text primary key default gen_random_uuid()::text,
  email         text unique not null,
  name          text,
  password_hash text,
  image         text,
  role          text not null default 'CONTRIBUTOR',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists accounts (
  id                text primary key default gen_random_uuid()::text,
  user_id           text not null references users(id) on delete cascade,
  type              text,
  provider          text,
  provider_account_id text,
  refresh_token     text,
  access_token      text,
  expires_at        bigint,
  token_type        text,
  scope             text,
  id_token          text,
  session_state     text,
  unique(provider, provider_account_id)
);

create table if not exists sessions (
  id            text primary key default gen_random_uuid()::text,
  session_token text unique not null,
  user_id       text not null references users(id) on delete cascade,
  expires       timestamptz not null
);

create table if not exists verification_tokens (
  identifier text,
  token      text unique,
  expires    timestamptz,
  unique(identifier, token)
);

-- ─── CATEGORIES & TAGS ───
create table if not exists categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text unique not null,
  description text,
  color       text,
  icon        text,
  type        text not null default 'project',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists tags (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  slug      text unique not null,
  created_at timestamptz not null default now()
);

-- ─── PROJECTS ───
create table if not exists projects (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  slug         text unique not null,
  short_desc   text,
  full_desc    text,
  thumbnail    text,
  cover_image  text,
  gallery      jsonb not null default '[]'::jsonb,
  videos       jsonb not null default '[]'::jsonb,
  demo_url     text,
  github_url   text,
  download_url text,
  purchase_url text,
  technologies jsonb not null default '[]'::jsonb,
  status       text not null default 'DRAFT',
  visibility   text not null default 'PUBLIC',
  featured     boolean not null default false,
  launch_date  timestamptz,
  published_at timestamptz,
  author_id    text references users(id),
  contributors jsonb not null default '[]'::jsonb,
  client       text,
  meta         jsonb not null default '{}'::jsonb,
  seo_title    text,
  seo_desc     text,
  og_image     text,
  category_id  text references categories(id),
  "order"      integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists projects_status_idx on projects(status);
create index if not exists projects_slug_idx on projects(slug);
create index if not exists projects_category_idx on projects(category_id);

create table if not exists project_tags (
  project_id text not null references projects(id) on delete cascade,
  tag_id     text not null references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- ─── PRODUCTS ───
create table if not exists products (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  slug          text unique not null,
  short_desc    text,
  full_desc     text,
  thumbnail     text,
  cover_image   text,
  gallery       jsonb not null default '[]'::jsonb,
  features      jsonb not null default '[]'::jsonb,
  demo_url      text,
  documentation text,
  version       text,
  changelog     text,
  requirements  text,
  price         numeric not null default 0,
  currency      text not null default 'USD',
  is_free       boolean not null default false,
  status        text not null default 'DRAFT',
  featured      boolean not null default false,
  technologies  jsonb not null default '[]'::jsonb,
  category_id   text references categories(id),
  published_at  timestamptz,
  "order"       integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_slug_idx on products(slug);

create table if not exists product_tags (
  product_id text not null references products(id) on delete cascade,
  tag_id     text not null references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ─── SERVICES ───
create table if not exists services (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  slug        text unique not null,
  short_desc  text,
  full_desc   text,
  icon        text,
  image       text,
  features    jsonb not null default '[]'::jsonb,
  pricing_type text not null default 'custom',
  price       numeric,
  currency    text not null default 'USD',
  cta_text    text not null default 'Get a quote',
  category_id text references categories(id),
  featured    boolean not null default false,
  status      text not null default 'PUBLISHED',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── SPONSORS & PARTNERS ───
create table if not exists sponsors (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  slug          text unique not null,
  logo          text,
  description   text,
  website       text,
  tier          text not null default 'BRONZE',
  industry      text,
  contact_name  text,
  contact_email text,
  start_date    timestamptz,
  end_date      timestamptz,
  active        boolean not null default true,
  featured      boolean not null default false,
  socials       jsonb not null default '{}'::jsonb,
  "order"       integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists partners (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text unique not null,
  logo        text,
  description text,
  website     text,
  type        text not null default 'TECHNOLOGY',
  socials     jsonb not null default '{}'::jsonb,
  featured    boolean not null default false,
  published   boolean not null default true,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── BLOG ───
create table if not exists blog_posts (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text,
  cover_image  text,
  author_id    text references users(id),
  category_id  text references categories(id),
  status       text not null default 'DRAFT',
  featured     boolean not null default false,
  published_at timestamptz,
  read_time    integer not null default 3,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists blog_posts_slug_idx on blog_posts(slug);

create table if not exists blog_post_tags (
  blog_post_id text not null references blog_posts(id) on delete cascade,
  tag_id       text not null references tags(id) on delete cascade,
  primary key (blog_post_id, tag_id)
);

-- ─── TESTIMONIALS, FAQS, EVENTS, METRICS ───
create table if not exists testimonials (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  role      text,
  company   text,
  avatar    text,
  content   text not null,
  rating    integer not null default 5,
  published boolean not null default true,
  "order"   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id        text primary key default gen_random_uuid()::text,
  question  text not null,
  answer    text not null,
  category  text not null default 'General',
  "order"   integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  date        timestamptz not null,
  end_date    timestamptz,
  location    text,
  url         text,
  type        text not null default 'MEETUP',
  status      text not null default 'UPCOMING',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists metrics (
  id    text primary key default gen_random_uuid()::text,
  key   text unique not null,
  label text not null,
  value text not null,
  unit  text,
  icon  text,
  "order" integer not null default 0
);

-- ─── INQUIRIES ───
create table if not exists inquiries (
  id            text primary key default gen_random_uuid()::text,
  reference     text unique not null,
  name          text not null,
  email         text not null,
  company       text,
  inquiry_type  text not null default 'GENERAL',
  budget        text,
  message       text not null,
  attachment    text,
  status        text not null default 'NEW',
  internal_notes text,
  assigned_to   text references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists inquiries_status_idx on inquiries(status);

-- ─── MEDIA ───
create table if not exists media_assets (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  url       text not null,
  type      text not null,
  mime      text,
  size      integer,
  alt       text,
  caption   text,
  tags      jsonb not null default '[]'::jsonb,
  folder    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── PAGES & SECTIONS ───
create table if not exists pages (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  slug        text unique not null,
  status      text not null default 'DRAFT',
  description text,
  seo_title   text,
  seo_desc    text,
  og_image    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists page_sections (
  id        text primary key default gen_random_uuid()::text,
  page_id   text not null references pages(id) on delete cascade,
  type      text not null,
  content   jsonb not null default '{}'::jsonb,
  config    jsonb not null default '{}'::jsonb,
  visibility text not null default 'PUBLIC',
  "order"   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reusable_blocks (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  slug      text unique not null,
  type      text not null,
  content   jsonb not null default '{}'::jsonb,
  config    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── NAV & FOOTER ───
create table if not exists nav_items (
  id        text primary key default gen_random_uuid()::text,
  label     text not null,
  href      text not null,
  parent_id text references nav_items(id),
  "order"   integer not null default 0,
  visible   boolean not null default true,
  icon      text
);

create table if not exists footer_columns (
  id        text primary key default gen_random_uuid()::text,
  title     text not null,
  "order"   integer not null default 0,
  links     jsonb not null default '[]'::jsonb,
  visible   boolean not null default true
);

-- ─── SETTINGS & AUDIT ───
create table if not exists site_settings (
  id    text primary key default gen_random_uuid()::text,
  key   text unique not null,
  value text not null
);

create table if not exists audit_logs (
  id        text primary key default gen_random_uuid()::text,
  user_id   text references users(id),
  action    text not null,
  entity    text not null,
  entity_id text,
  metadata  jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── SHORT LINKS ───
create table if not exists short_links (
  id           text primary key default gen_random_uuid()::text,
  slug         text unique not null,
  name         text not null,
  description  text,
  type         text not null default 'file',
  target_url   text,
  file_path    text,
  file_name    text,
  file_mime    text,
  file_size    integer,
  text_content text,
  embed_html   text,
  password     text,
  expires_at   timestamptz,
  visits       integer not null default 0,
  created_by   text references users(id),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists short_links_slug_idx on short_links(slug);

-- ─── Updated_at trigger ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users','accounts','sessions','categories','tags','projects','products',
    'services','sponsors','partners','blog_posts','testimonials','faqs','events',
    'inquiries','media_assets','pages','page_sections','reusable_blocks',
    'nav_items','footer_columns','site_settings','audit_logs','short_links'
  ])
  loop
    execute format('drop trigger if exists trg_%I_updated on %I;', t, t);
    execute format('create trigger trg_%I_updated before update on %I for each row execute function update_updated_at();', t, t);
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Row Level Security policies + table privileges
-- ────────────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables and create policies that allow the anon key to
-- read/write. Also GRANT table-level privileges to the anon and authenticated
-- roles — without these, you get "permission denied for table X [code: 42501]"
-- even if RLS policies allow access.

-- First, GRANT table-level privileges (REQUIRED — RLS policies alone are not enough)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users','accounts','sessions','categories','tags','projects','products',
    'services','sponsors','partners','blog_posts','testimonials','faqs','events',
    'inquiries','media_assets','pages','page_sections','reusable_blocks',
    'nav_items','footer_columns','site_settings','audit_logs','short_links',
    'project_tags','product_tags','blog_post_tags','verification_tokens'
  ])
  loop
    -- Enable RLS
    execute format('alter table %I enable row level security;', t);
    -- Drop existing policies if any
    execute format('drop policy if exists "anon_all" on %I;', t);
    -- Allow anon to do everything (for development/demo)
    execute format('create policy "anon_all" on %I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Team members table
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists team_members (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  role        text not null,
  bio         text,
  photo       text,
  email       text,
  linkedin    text,
  twitter     text,
  github      text,
  website     text,
  "order"     integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

GRANT ALL ON team_members TO anon, authenticated;
alter table team_members enable row level security;
drop policy if exists "anon_all" on team_members;
create policy "anon_all" on team_members for all to anon, authenticated using (true) with check (true);

drop trigger if exists trg_team_members_updated on team_members;
create trigger trg_team_members_updated before update on team_members for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Newsletter tables
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id            text primary key default gen_random_uuid()::text,
  email         text unique not null,
  status        text not null default 'ACTIVE',
  name          text,
  source        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists newsletter_campaigns (
  id            text primary key default gen_random_uuid()::text,
  subject       text not null,
  body          text not null,
  status        text not null default 'DRAFT',
  recipient_count integer not null default 0,
  sent_at       timestamptz,
  start_date    timestamptz,
  end_date      timestamptz,
  category      text not null default 'announcement',
  tags          jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Add columns if table already exists (for users who ran older schema)
do $$
begin
  alter table newsletter_campaigns add column if not exists start_date timestamptz;
  alter table newsletter_campaigns add column if not exists end_date timestamptz;
  alter table newsletter_campaigns add column if not exists category text not null default 'announcement';
  alter table newsletter_campaigns add column if not exists tags jsonb not null default '[]'::jsonb;
exception when others then null;
end $$;

GRANT ALL ON newsletter_subscribers TO anon, authenticated;
GRANT ALL ON newsletter_campaigns TO anon, authenticated;
alter table newsletter_subscribers enable row level security;
alter table newsletter_campaigns enable row level security;
drop policy if exists "anon_all" on newsletter_subscribers;
drop policy if exists "anon_all" on newsletter_campaigns;
create policy "anon_all" on newsletter_subscribers for all to anon, authenticated using (true) with check (true);
create policy "anon_all" on newsletter_campaigns for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_newsletter_subscribers_updated on newsletter_subscribers;
create trigger trg_newsletter_subscribers_updated before update on newsletter_subscribers for each row execute function update_updated_at();
drop trigger if exists trg_newsletter_campaigns_updated on newsletter_campaigns;
create trigger trg_newsletter_campaigns_updated before update on newsletter_campaigns for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Done. Tables created + privileges granted + RLS policies in place.
-- ────────────────────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────────────────────
-- Donators table
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists donators (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  amount        numeric not null default 0,
  currency      text not null default 'USD',
  message       text,
  date          timestamptz not null default now(),
  verified      boolean not null default true,
  "order"       integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

GRANT ALL ON donators TO anon, authenticated;
alter table donators enable row level security;
drop policy if exists "anon_all" on donators;
create policy "anon_all" on donators for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_donators_updated on donators;
create trigger trg_donators_updated before update on donators for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Analytics — visitor tracking
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists visits (
  id            text primary key default gen_random_uuid()::text,
  visitor_id    text not null,
  path          text,
  referrer      text,
  user_agent    text,
  country       text,
  is_unique     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists visits_visitor_id_idx on visits(visitor_id);
create index if not exists visits_created_at_idx on visits(created_at);

GRANT ALL ON visits TO anon, authenticated;
alter table visits enable row level security;
drop policy if exists "anon_all" on visits;
create policy "anon_all" on visits for all to anon, authenticated using (true) with check (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Shop items
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists shop_items (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  description   text,
  image         text,
  price         numeric not null default 0,
  currency      text not null default 'USD',
  is_free       boolean not null default false,
  category      text not null default 'app',
  creator       text,
  download_url  text,
  demo_url      text,
  features      jsonb not null default '[]'::jsonb,
  tags          jsonb not null default '[]'::jsonb,
  status        text not null default 'PUBLISHED',
  featured      boolean not null default false,
  "order"       integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

GRANT ALL ON shop_items TO anon, authenticated;
alter table shop_items enable row level security;
drop policy if exists "anon_all" on shop_items;
create policy "anon_all" on shop_items for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_shop_items_updated on shop_items;
create trigger trg_shop_items_updated before update on shop_items for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Shop requests — buy/interest requests submitted by visitors
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists shop_requests (
  id           text primary key default gen_random_uuid()::text,
  shop_item_id text references shop_items(id) on delete set null,
  item_title   text not null,
  item_type    text not null default 'app',
  buyer_email  text not null,
  buyer_phone  text,
  message      text,
  status       text not null default 'NEW',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

GRANT ALL ON shop_requests TO anon, authenticated;
alter table shop_requests enable row level security;
drop policy if exists "anon_insert" on shop_requests;
create policy "anon_insert" on shop_requests for insert to anon, authenticated with check (true);
drop policy if exists "anon_select" on shop_requests;
create policy "anon_select" on shop_requests for select to anon, authenticated using (true);
drop policy if exists "anon_update" on shop_requests;
create policy "anon_update" on shop_requests for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_delete" on shop_requests;
create policy "anon_delete" on shop_requests for delete to anon, authenticated using (true);
drop trigger if exists trg_shop_requests_updated on shop_requests;
create trigger trg_shop_requests_updated before update on shop_requests for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Employees + per-section granular permissions (Czer-entry-code based auth)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists employees (
  id              text primary key default gen_random_uuid()::text,
  email           text not null,
  name            text,
  avatar          text,
  czer_code       text not null,
  role            text not null default 'EMPLOYEE',
  status          text not null default 'ACTIVE',
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists employees_email_uniq on employees(lower(email));
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'employees_czer_code_uniq') then
    create unique index employees_czer_code_uniq on employees(czer_code);
  end if;
end $$;

create table if not exists employee_permissions (
  id            text primary key default gen_random_uuid()::text,
  employee_id   text not null references employees(id) on delete cascade,
  section       text not null,
  actions       jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'employee_permissions_emp_section_uniq') then
    create unique index employee_permissions_emp_section_uniq on employee_permissions(employee_id, section);
  end if;
end $$;

GRANT ALL ON employees TO anon, authenticated;
GRANT ALL ON employee_permissions TO anon, authenticated;

alter table employees enable row level security;
drop policy if exists "emp_all" on employees;
create policy "emp_all" on employees for all to anon, authenticated using (true) with check (true);

alter table employee_permissions enable row level security;
drop policy if exists "empperm_all" on employee_permissions;
create policy "empperm_all" on employee_permissions for all to anon, authenticated using (true) with check (true);

drop trigger if exists trg_employees_updated on employees;
create trigger trg_employees_updated before update on employees for each row execute function update_updated_at();

drop trigger if exists trg_employee_permissions_updated on employee_permissions;
create trigger trg_employee_permissions_updated before update on employee_permissions for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Announcements — public posts with view tracking + push notification subs
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists announcements (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  body         text,
  image        text,
  status       text not null default 'DRAFT',       -- DRAFT | PUBLISHED
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

-- Track unique views per announcement per visitor
create table if not exists announcement_views (
  id              text primary key default gen_random_uuid()::text,
  announcement_id text not null references announcements(id) on delete cascade,
  visitor_id      text not null,
  created_at      timestamptz not null default now()
);
create unique index if not exists announcement_views_uniq on announcement_views(announcement_id, visitor_id);
GRANT ALL ON announcement_views TO anon, authenticated;
alter table announcement_views enable row level security;
drop policy if exists "annv_all" on announcement_views;
create policy "annv_all" on announcement_views for all to anon, authenticated using (true) with check (true);

-- Push subscriptions — endpoint + browser keys + visitor_id
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

-- ────────────────────────────────────────────────────────────────────────────
-- Chat — WhatsApp-like messaging between admin & employees
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists chat_conversations (
  id         text primary key default gen_random_uuid()::text,
  type       text not null default 'direct',   -- direct | group
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
  user_id         text not null,           -- can be user.id or employee.id
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
  type            text not null default 'text',   -- text | image | file | audio | call
  body            text,                            -- message text or call metadata JSON
  file_url        text,
  file_name       text,
  file_size       integer,
  file_mime       text,
  call_status     text,                            -- initiated | accepted | declined | ended
  call_duration   integer,                          -- seconds
  created_at      timestamptz not null default now()
);
GRANT ALL ON chat_messages TO anon, authenticated;
alter table chat_messages enable row level security;
drop policy if exists "chm_all" on chat_messages;
create policy "chm_all" on chat_messages for all to anon, authenticated using (true) with check (true);

create table if not exists chat_read_receipts (
  id              text primary key default gen_random_uuid()::text,
  conversation_id text not null references chat_conversations(id) on delete cascade,
  message_id      text not null references chat_messages(id) on delete cascade,
  user_id        text not null,
  read_at        timestamptz not null default now()
);
create unique index if not exists chat_read_uniq on chat_read_receipts(message_id, user_id);
GRANT ALL ON chat_read_receipts TO anon, authenticated;
alter table chat_read_receipts enable row level security;
drop policy if exists "chr_all" on chat_read_receipts;
create policy "chr_all" on chat_read_receipts for all to anon, authenticated using (true) with check (true);

-- ────────────────────────────────────────────────────────────────────────────
-- API Keys + logs — public API keys for announcements webhooks + Wisee AI 1.0
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists api_keys (
  id                 text primary key default gen_random_uuid()::text,
  user_id            text,                        -- nullable for legacy compat; Google auth makes this required
  user_email         text not null,
  user_name          text,
  user_avatar        text,
  auth_provider      text not null default 'google',  -- google | credentials (only google accepted for new keys)
  type               text not null,                -- 'announcements' | 'ai' | (future: 'cloud', 'storage', ...)
  name               text not null,                -- user-friendly label
  key_hash           text not null unique,         -- bcrypt hash of full key
  key_prefix         text not null,                -- first 8 chars for display
  key_suffix         text not null,                -- last 4 chars for display
  webhook_url        text,                          -- for announcements type
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

-- API call + webhook delivery log — used for analytics + audit
create table if not exists api_key_logs (
  id              text primary key default gen_random_uuid()::text,
  api_key_id      text references api_keys(id) on delete set null,
  type            text not null,                -- 'call' | 'webhook_delivery' | 'creation' | 'revoke'
  status          text not null,                -- 'success' | 'failed'
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

-- ────────────────────────────────────────────────────────────────────────────
-- Storage bucket: "uploads" (for chat files + admin image uploads)
-- ────────────────────────────────────────────────────────────────────────────
-- The bucket itself must be created via the Supabase Dashboard → Storage →
-- New bucket → name: "uploads" → Public bucket: ✓
-- Then run the SQL below to grant the anon role permission to read/write.
--
-- (These statements are safe to run multiple times — they use INSERT ... ON
-- CONFLICT DO NOTHING pattern via DO blocks.)
do $$
begin
  -- Insert the bucket if it doesn't exist
  if not exists (select 1 from storage.buckets where id = 'uploads') then
    insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
  end if;
end $$;

-- Allow anon + authenticated to read all objects in the uploads bucket
drop policy if exists "uploads_read" on storage.objects;
create policy "uploads_read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'uploads');

-- Allow anon + authenticated to upload (insert) to the uploads bucket
drop policy if exists "uploads_insert" on storage.objects;
create policy "uploads_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'uploads');

-- Allow updates to objects in the uploads bucket
drop policy if exists "uploads_update" on storage.objects;
create policy "uploads_update" on storage.objects for update to anon, authenticated
  using (bucket_id = 'uploads');

-- Allow deletes from the uploads bucket
drop policy if exists "uploads_delete" on storage.objects;
create policy "uploads_delete" on storage.objects for delete to anon, authenticated
  using (bucket_id = 'uploads');

-- ────────────────────────────────────────────────────────────────────────────
-- Bugfix: add updated_at column to tables that have the trg_*_updated trigger
-- ────────────────────────────────────────────────────────────────────────────
-- The trigger `trg_<table>_updated` calls `update_updated_at()` which does:
--   new.updated_at = now()
-- But several tables (site_settings, footer_columns, audit_logs, short_links)
-- don't have an `updated_at` column, which causes PostgreSQL to throw:
--   "record 'new' has no field 'updated_at'"
-- whenever you try to UPDATE a row on those tables.
--
-- Fix: add the missing `updated_at` column to all affected tables.

alter table site_settings add column if not exists updated_at timestamptz not null default now();
alter table footer_columns add column if not exists updated_at timestamptz not null default now();
alter table audit_logs add column if not exists updated_at timestamptz not null default now();
alter table short_links add column if not exists updated_at timestamptz not null default now();
alter table verification_tokens add column if not exists updated_at timestamptz not null default now();

-- ────────────────────────────────────────────────────────────────────────────
-- Donation links — admin can add multiple URLs; visitor sees picker dialog
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists donation_links (
  id           text primary key default gen_random_uuid()::text,
  label        text not null,        -- "Buy Me a Coffee", "Patreon", "GitHub Sponsors", etc.
  url          text not null,
  icon         text,                  -- 'coffee' | 'patreon' | 'github' | 'paypal' | 'ko-fi' | 'custom'
  description  text,
  "order"      integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

GRANT ALL ON donation_links TO anon, authenticated;
alter table donation_links enable row level security;
drop policy if exists "don_all" on donation_links;
create policy "don_all" on donation_links for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_donation_links_updated on donation_links;
create trigger trg_donation_links_updated before update on donation_links for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Service purchase + contact fields, category images, ad impressions
-- ────────────────────────────────────────────────────────────────────────────

-- Add purchase_url + contact_enabled to services (so services can have a Buy button
-- OR a Contact CTA, mirroring the shop's behavior)
alter table services add column if not exists purchase_url text;
alter table services add column if not exists contact_enabled boolean not null default false;
alter table services add column if not exists contact_email text;

-- Add image column to categories (so admin can attach an image to each category)
alter table categories add column if not exists image text;

-- ────────────────────────────────────────────────────────────────────────────
-- Ad impressions — track impressions + clicks for ads-type API keys
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists ad_impressions (
  id               text primary key default gen_random_uuid()::text,
  api_key_id       text references api_keys(id) on delete set null,
  impression_token text not null unique,    -- random token, used to track clicks
  ad_format        text not null default 'banner',  -- banner | square | sidebar | inline
  ad_unit          text,                    -- the AdSense ad slot ID used
  ip               text,
  user_agent       text,
  referrer         text,
  clicked          boolean not null default false,
  clicked_at       timestamptz,
  payout_usd       numeric not null default 0,    -- estimated payout (CPM * 0.001)
  created_at       timestamptz not null default now()
);
create index if not exists ad_impressions_api_key_id_idx on ad_impressions(api_key_id);
create index if not exists ad_impressions_impression_token_idx on ad_impressions(impression_token);
create index if not exists ad_impressions_created_at_idx on ad_impressions(created_at);

GRANT ALL ON ad_impressions TO anon, authenticated;
alter table ad_impressions enable row level security;
drop policy if exists "adim_all" on ad_impressions;
create policy "adim_all" on ad_impressions for all to anon, authenticated using (true) with check (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Service requests, customer chat, API rate-limit usage, subscriptions
-- ────────────────────────────────────────────────────────────────────────────

-- Add contact_method (other contact: Discord, Telegram, etc.) to shop_requests
alter table shop_requests add column if not exists contact_method text;

-- ─── Service requests ─── (parallel to shop_requests, for the Services section)
create table if not exists service_requests (
  id             text primary key default gen_random_uuid()::text,
  service_id     text references services(id) on delete set null,
  service_title  text not null,
  buyer_email    text not null,
  buyer_phone    text,
  contact_method text,                   -- other contact method (Discord, Telegram, etc.)
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

-- ─── Customer chat ─── (customer ↔ support team messaging)
create table if not exists customer_chats (
  id                    text primary key default gen_random_uuid()::text,
  source_type           text not null,                -- 'shop' | 'service' | 'subscription' | 'general'
  source_id             text,                          -- FK to shop_requests / service_requests / etc.
  customer_email        text not null,
  customer_name         text,
  customer_phone        text,
  customer_contact_method text,
  visitor_id           text,                            -- for anonymous (localStorage UUID)
  status                text not null default 'OPEN',  -- OPEN | CLOSED
  assigned_to           text,                           -- admin user ID
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
  sender_type  text not null,    -- 'customer' | 'support'
  sender_id    text,             -- user ID if support
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

-- ─── API key usage tracking (rate limit buckets) ───
create table if not exists api_key_usage (
  id            text primary key default gen_random_uuid()::text,
  api_key_id    text not null references api_keys(id) on delete cascade,
  bucket_type   text not null,    -- 'minute' | 'day'
  bucket_key    text not null,    -- '2025-09-17T13:45' (minute) or '2025-09-17' (day)
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

-- ─── Subscription plans (admin-managed, prices in INR) ───
create table if not exists subscription_plans (
  id                       text primary key default gen_random_uuid()::text,
  name                     text not null,
  description              text,
  price_inr                numeric not null,
  period                   text not null default 'monthly',    -- monthly | yearly | lifetime
  price_type               text not null default 'subscription', -- subscription | use | link
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

-- ─── User subscriptions (after Instamojo payment success) ───
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
  payment_status                  text not null default 'pending',  -- pending | paid | failed | refunded
  status                          text not null default 'INACTIVE', -- ACTIVE | INACTIVE | EXPIRED | CANCELLED
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

-- ─── Subscription price change requests (user wants to negotiate price) ───
create table if not exists subscription_change_requests (
  id                    text primary key default gen_random_uuid()::text,
  user_email            text not null,
  plan_id               text not null references subscription_plans(id) on delete cascade,
  plan_name             text,
  original_price_inr    numeric not null,
  requested_price_inr   numeric not null,
  reason                text,
  status                text not null default 'PENDING',  -- PENDING | APPROVED | REJECTED | COUNTERED
  admin_response        text,
  chat_id               text,    -- link to customer_chat for discussion
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
GRANT ALL ON subscription_change_requests TO anon, authenticated;
alter table subscription_change_requests enable row level security;
drop policy if exists "scr_all" on subscription_change_requests;
create policy "scr_all" on subscription_change_requests for all to anon, authenticated using (true) with check (true);
drop trigger if exists trg_subscription_change_requests_updated on subscription_change_requests;
create trigger trg_subscription_change_requests_updated before update on subscription_change_requests for each row execute function update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Bug reports + Admin notifications
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists bug_reports (
  id           text primary key default gen_random_uuid()::text,
  type         text not null,
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

-- ────────────────────────────────────────────────────────────────────────────
-- Brand column — allows content to be tagged as 'fubrio', 'bloom', or 'both'
-- ────────────────────────────────────────────────────────────────────────────
-- When a visitor is on fubrio.in, they see content with brand='fubrio' or 'both'.
-- When a visitor is on bloom.fubrio.in, they see content with brand='bloom' or 'both'.
-- Default is 'fubrio' so existing content stays visible on fubrio.in.
alter table projects add column if not exists brand text not null default 'fubrio';
alter table products add column if not exists brand text not null default 'fubrio';
alter table services add column if not exists brand text not null default 'fubrio';
alter table blog_posts add column if not exists brand text not null default 'fubrio';
alter table announcements add column if not exists brand text not null default 'fubrio';
alter table shop_items add column if not exists brand text not null default 'fubrio';
alter table events add column if not exists brand text not null default 'fubrio';
alter table testimonials add column if not exists brand text not null default 'fubrio';
alter table sponsors add column if not exists brand text not null default 'fubrio';
alter table partners add column if not exists brand text not null default 'fubrio';

-- ────────────────────────────────────────────────────────────────────────────
-- Bloom bot integration — bot_guilds + bot_events
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists bot_guilds (
  id           text primary key,               -- Discord guild ID (string)
  name         text not null,
  icon         text,
  member_count integer not null default 0,
  owner_id     text,
  synced_at    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
GRANT ALL ON bot_guilds TO anon, authenticated;
alter table bot_guilds enable row level security;
drop policy if exists "bg_all" on bot_guilds;
create policy "bg_all" on bot_guilds for all to anon, authenticated using (true) with check (true);

create table if not exists bot_events (
  id           text primary key default gen_random_uuid()::text,
  guild_id     text,
  event_type   text not null,                  -- command_run, member_join, member_leave, etc.
  user_id      text,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists bot_events_guild_id_idx on bot_events(guild_id);
create index if not exists bot_events_created_at_idx on bot_events(created_at desc);
GRANT ALL ON bot_events TO anon, authenticated;
alter table bot_events enable row level security;
drop policy if exists "be_all" on bot_events;
create policy "be_all" on bot_events for all to anon, authenticated using (true) with check (true);

-- Add download_url + purchase_url to products
alter table products add column if not exists download_url text;
alter table products add column if not exists purchase_url text;

-- Add price range + auto-convert to services and products
alter table services add column if not exists price_max numeric;
alter table services add column if not exists auto_convert_currency boolean not null default false;
alter table products add column if not exists price_max numeric;
alter table products add column if not exists auto_convert_currency boolean not null default false;

-- Change default currency to INR for services
alter table services alter column currency set default 'INR';


-- Fubrio Hosting category
insert into categories (name, slug, description, color, icon, type, "order")
values (
  'Fubrio Hosting',
  'fubrio-hosting',
  'Hosting, infrastructure, storage, and deployment services from Fubrio.',
  '#8BCF9B',
  'Cloud',
  'service',
  5
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  color = excluded.color,
  icon = excluded.icon,
  "order" = excluded."order",
  updated_at = now();
