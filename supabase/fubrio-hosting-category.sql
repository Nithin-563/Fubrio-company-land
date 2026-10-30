-- Run this migration if the main schema has already been applied.
-- It creates the editable Fubrio Hosting service category.

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
