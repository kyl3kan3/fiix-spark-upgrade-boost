
-- Drop the broad SELECT policy that allows listing all asset-images.
-- Files remain accessible via direct public URLs because the bucket is public.
DROP POLICY IF EXISTS "Asset images are publicly viewable" ON storage.objects;
