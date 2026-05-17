-- Storage setup for RemoteSlides
-- Run this in your Supabase SQL editor AFTER creating the bucket

-- 1. Create the bucket (skip if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentations', 'presentations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS policies (allow anyone to upload/read, own to delete)
DROP POLICY IF EXISTS "storage_select_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_all" ON storage.objects;

CREATE POLICY "storage_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presentations');

CREATE POLICY "storage_insert_all"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'presentations');

CREATE POLICY "storage_update_all"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'presentations');

CREATE POLICY "storage_delete_all"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'presentations');
