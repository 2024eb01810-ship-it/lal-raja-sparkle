-- =============================================================
-- Storage bucket + policies for the new project
-- Run AFTER 001_schema.sql
-- =============================================================

BEGIN;

-- Create the public 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public read for everything in the 'media' bucket
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Staff (admin/editor) can upload, update, delete media
DROP POLICY IF EXISTS "Staff upload media" ON storage.objects;
CREATE POLICY "Staff upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update media" ON storage.objects;
CREATE POLICY "Staff update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff delete media" ON storage.objects;
CREATE POLICY "Staff delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

COMMIT;

-- =============================================================
-- NOTE: existing files in the old project's 'media' bucket are
-- NOT copied by SQL. To copy them, either:
--   (a) re-upload via the admin UI after migration, or
--   (b) run a small Node script with both projects' service-role
--       keys to download from old → upload to new.
-- =============================================================
