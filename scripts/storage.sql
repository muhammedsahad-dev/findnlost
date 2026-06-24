-- ============================================================
-- Campus Lost & Found Portal — Storage Setup
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Create the item-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,  -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS ───────────────────────────────────────────────
-- Public read
CREATE POLICY "Public read item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

-- Authenticated upload
CREATE POLICY "Auth upload item images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'item-images'
    AND auth.uid() IS NOT NULL
  );

-- Owner can delete their own uploads
CREATE POLICY "Owner delete item images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
