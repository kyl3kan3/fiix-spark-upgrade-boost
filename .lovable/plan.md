## Problem

Uploading a photo on the Asset form returns "new row violates row-level security policy" and a 400 from `POST /storage/v1/object/asset-images/...`.

Two different uploaders write to the `asset-images` bucket:

- **`ImageUploadField`** (the single "Equipment photo" preview on the form) uses path `{userId}/assets/{uuid}.ext` — matches existing RLS.
- **Gallery uploader** (`useGalleryData.ts`, used by the asset photo gallery on detail pages and through the form area) uses path `{companyId}/{entityType}/{entityId}/{uuid}.ext`.

The current `asset-images: uploader can insert` policy requires:
```
(storage.foldername(name))[1] = auth.uid()::text
```
i.e. the first segment must be the user's UID. The gallery uses the **company id** as the first segment, so every gallery upload is rejected. SELECT/UPDATE/DELETE on those same paths would also be broken because the existing policies only match the user-id-prefixed or same-company-user-prefixed shapes.

## Fix

Add a parallel set of storage RLS policies that accept paths prefixed with the uploader's `company_id`, while keeping the existing user-folder policies intact (so `ImageUploadField` keeps working).

New migration adds these policies on `storage.objects` for `bucket_id = 'asset-images'`:

1. **INSERT** — authenticated user whose `get_user_company(auth.uid())::text = (storage.foldername(name))[1]`.
2. **SELECT** — same condition (company members can read any object under their company folder).
3. **UPDATE** — same as INSERT, plus matching USING clause.
4. **DELETE** — uploader (owner column = auth.uid()) or company administrator, scoped to the same company folder.

The existing `asset-images: uploader can insert / update`, `asset-images: company members can read`, and `asset-images: uploader or same-company admin can delete` policies stay in place so legacy user-prefixed paths still work.

No application code changes are needed — both upload paths will succeed after the migration.

## Verification

- Pick an image in the asset form → upload returns 200, preview renders.
- Open an existing asset's photo gallery → previously-uploaded items still load via signed URL.
- Confirm a second user in the same company can view the same images, and a user from a different company cannot (SELECT policy).
