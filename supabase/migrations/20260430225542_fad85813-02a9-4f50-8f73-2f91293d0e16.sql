-- Add image_url columns
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS image_url text;

-- Create public storage bucket for asset/location images
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-images', 'asset-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies on storage.objects scoped to this bucket
CREATE POLICY "Asset images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

CREATE POLICY "Authenticated users can upload asset images to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own asset images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own asset images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);