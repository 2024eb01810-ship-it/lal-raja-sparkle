-- Public media bucket for admin-uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on media bucket
CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Staff (admin/editor) can upload
CREATE POLICY "Staff upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));

-- Staff can replace
CREATE POLICY "Staff update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

-- Staff can delete
CREATE POLICY "Staff delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));