
-- Make asset-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'asset-images';

-- Ensure a SELECT policy exists for authenticated users
DROP POLICY IF EXISTS "asset-images authenticated read" ON storage.objects;
CREATE POLICY "asset-images authenticated read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'asset-images');
