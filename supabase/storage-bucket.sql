-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — Storage bucket setup for chat files + admin image uploads
-- ────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run.
-- Creates the "uploads" bucket (public) and grants RLS policies so the anon
-- key can read/write objects in it. Required for chat file uploads + admin
-- image-upload component. Without this, file uploads fall back to base64
-- data URLs (limited to 500 KB).
-- ────────────────────────────────────────────────────────────────────────────

-- 1. Create the bucket if it doesn't exist
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'uploads') then
    insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
  end if;
end $$;

-- 2. Allow anon + authenticated to read all objects in the uploads bucket
drop policy if exists "uploads_read" on storage.objects;
create policy "uploads_read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'uploads');

-- 3. Allow anon + authenticated to upload (insert) to the uploads bucket
drop policy if exists "uploads_insert" on storage.objects;
create policy "uploads_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'uploads');

-- 4. Allow updates to objects in the uploads bucket
drop policy if exists "uploads_update" on storage.objects;
create policy "uploads_update" on storage.objects for update to anon, authenticated
  using (bucket_id = 'uploads');

-- 5. Allow deletes from the uploads bucket
drop policy if exists "uploads_delete" on storage.objects;
create policy "uploads_delete" on storage.objects for delete to anon, authenticated
  using (bucket_id = 'uploads');
