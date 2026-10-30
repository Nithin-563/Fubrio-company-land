-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Employees + Czer access codes + per-section granular permissions
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Idempotent — safe to run multiple times (uses `if not exists` + `drop policy`).
-- ────────────────────────────────────────────────────────────────────────────

-- ─── Employees ───
-- An "employee" is a real human with a Gmail (or any) address that the admin
-- has granted admin-dashboard access to via a Czer entry code + per-section
-- permissions. Employees do NOT have a password — they authenticate only via
-- their Czer code (the czer-XXXXXX form on /#czer).
create table if not exists employees (
  id              text primary key default gen_random_uuid()::text,
  email           text not null,
  name            text,
  avatar          text,
  czer_code       text not null,                       -- 6-digit code, e.g. '448817'
  role            text not null default 'EMPLOYEE',    -- always EMPLOYEE
  status          text not null default 'ACTIVE',      -- ACTIVE | SUSPENDED | REVOKED
  expires_at      timestamptz,                          -- NULL = no expiry
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Unique emails & codes — two employees cannot share the same email or code
create unique index if not exists employees_email_uniq on employees(lower(email));
create unique index if not exists employees_czer_code_uniq on employees(czer_code);

-- ─── Employee permissions (per-section + per-action) ───
-- One row per (employee_id, section). `actions` is a JSON array of strings:
--   ["view", "create", "update", "delete", "reorder"]
-- If a row doesn't exist for a section → employee has NO access to that section.
-- If a row exists with actions == [] → employee can VIEW the section but can't act.
create table if not exists employee_permissions (
  id            text primary key default gen_random_uuid()::text,
  employee_id   text not null references employees(id) on delete cascade,
  section       text not null,                          -- e.g. 'shop', 'blog', 'users'
  actions       jsonb not null default '[]'::jsonb,    -- ["view","create","update","delete","reorder"]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if exists employee_permissions_emp_section_uniq
  on employee_permissions(employee_id, section);
-- The above CREATE UNIQUE INDEX IF NOT EXISTS doesn't work on all Supabase versions,
-- so do it the safe way:
do $$
begin
  if not exists (
    select 1 from pg_indexes where indexname = 'employee_permissions_emp_section_uniq'
  ) then
    create unique index employee_permissions_emp_section_uniq
      on employee_permissions(employee_id, section);
  end if;
end $$;

-- ─── Privileges + RLS ───
GRANT ALL ON employees TO anon, authenticated;
GRANT ALL ON employee_permissions TO anon, authenticated;

alter table employees enable row level security;
drop policy if exists "emp_all" on employees;
create policy "emp_all" on employees for all to anon, authenticated using (true) with check (true);

alter table employee_permissions enable row level security;
drop policy if exists "empperm_all" on employee_permissions;
create policy "empperm_all" on employee_permissions for all to anon, authenticated using (true) with check (true);

-- ─── Triggers for updated_at ───
drop trigger if exists trg_employees_updated on employees;
create trigger trg_employees_updated before update on employees for each row execute function update_updated_at();

drop trigger if exists trg_employee_permissions_updated on employee_permissions;
create trigger trg_employee_permissions_updated before update on employee_permissions for each row execute function update_updated_at();
