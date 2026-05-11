import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "asset-images";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;
const SIGN_TTL = 60 * 60; // 1 hour

const cache = new Map<string, { url: string; expiresAt: number }>();

/** Extract the storage path inside the asset-images bucket from a stored value. */
function extractPath(input: string): string | null {
  if (!input) return null;
  const idx = input.indexOf(PUBLIC_PREFIX);
  if (idx >= 0) return input.slice(idx + PUBLIC_PREFIX.length);
  // Already a bare path (no protocol)?
  if (!/^https?:\/\//i.test(input) && !input.startsWith("data:") && !input.startsWith("blob:")) {
    return input.replace(/^\/+/, "");
  }
  return null;
}

/** Resolve a stored value to a viewable URL. Returns the input unchanged
 *  for non asset-images URLs. */
export async function getSignedAssetImageUrl(input: string | null | undefined): Promise<string | null> {
  if (!input) return null;
  const path = extractPath(input);
  if (!path) return input;
  const now = Date.now();
  const cached = cache.get(path);
  if (cached && cached.expiresAt > now + 30_000) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
  if (error || !data?.signedUrl) {
    console.warn("Failed to sign asset image url", error);
    return null;
  }
  cache.set(path, { url: data.signedUrl, expiresAt: now + SIGN_TTL * 1000 });
  return data.signedUrl;
}

/** React hook returning a viewable URL for a stored asset-images value. */
export function useSignedAssetImageUrl(input: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(input ?? null);
  useEffect(() => {
    let cancelled = false;
    if (!input) { setUrl(null); return undefined; }
    getSignedAssetImageUrl(input).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [input]);
  return url;
}