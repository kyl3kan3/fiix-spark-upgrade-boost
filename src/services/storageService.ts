import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a time-limited signed URL for a private storage object.
 * Throws when signing fails or no URL is returned.
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error(`No signed URL returned for ${bucket}/${path}`);
  }
  return data.signedUrl;
}
