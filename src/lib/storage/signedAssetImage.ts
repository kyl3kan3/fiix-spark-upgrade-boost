import { useEffect, useState } from "react";
import { createSignedUrl } from "@/services/storageService";
import { logger } from "@/lib/logger";

const BUCKET = "asset-images";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;
const SIGN_TTL = 60 * 60; // 1 hour

/** Accept bare object paths and legacy URLs only from this Supabase project. */
function extractPath(input: string): string | null {
  // eslint-disable-next-line no-control-regex -- Explicitly reject URL control characters and spreadsheet formula escapes.
 if (!input || /[\\\u0000-\u0020]/.test(input)) return null;
 if (/^[a-z][a-z0-9+.-]*:/i.test(input) || input.startsWith("//")) {
   try {
     const url = new URL(input);
     if (url.origin !== new URL(import.meta.env.VITE_SUPABASE_URL).origin || !url.pathname.startsWith(PUBLIC_PREFIX)) return null;
     return decodeURIComponent(url.pathname.slice(PUBLIC_PREFIX.length));
   } catch { return null; }
 }
 return input.startsWith("/") || input.split("/").some(part => part === "..") ? null : input;
}

/** Resolve a stored value to a viewable URL. Rejects non asset-images URLs. */
export async function getSignedAssetImageUrl(input: string | null | undefined): Promise<string | null> {
 if (!input) return null;
 const path = extractPath(input);
 if (!path) return null;
 let signedUrl: string;
 try {
 signedUrl = await createSignedUrl(BUCKET, path, SIGN_TTL);
 } catch (error) {
 logger.warn("Failed to sign asset image url", error);
 return null;
 }
 return signedUrl;
}

/** React hook returning a viewable URL for a stored asset-images value. */
export function useSignedAssetImageUrl(input: string | null | undefined): string | null {
 const [url, setUrl] = useState<{ input: string; url: string | null } | null>(null);
 useEffect(() => {
 let cancelled = false;
 if (!input) { setUrl(null); return; }
 getSignedAssetImageUrl(input).then((u) => { if (!cancelled) setUrl({ input, url: u }); });
 return () => { cancelled = true; };
 }, [input]);
 return url && url.input === input ? url.url : null;
}
