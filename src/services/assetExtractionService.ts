import { supabase } from "@/integrations/supabase/client";
import { normalizeAssetProposals } from "@/lib/assetExtraction";
import type { AssetImportRow } from "@/lib/csvImport";

interface RawResponse {
  assets?: unknown[];
  error?: string;
}

/** Ask the extractor edge function to read a document and propose assets. */
export const extractAssetsFromDocument = async (doc: {
  id: string;
  storage_path: string;
  mime_type: string | null;
}): Promise<AssetImportRow[]> => {
  const { data, error } = await supabase.functions.invoke<RawResponse>("extract-assets", {
    body: { storage_path: doc.storage_path, mime_type: doc.mime_type ?? "", document_id: doc.id },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return normalizeAssetProposals((data?.assets ?? []) as Parameters<typeof normalizeAssetProposals>[0]);
};

/** Document mime types we can usefully extract from. */
export const canExtract = (mime: string | null): boolean => {
  if (!mime) return false;
  return (
    mime.startsWith("text/") ||
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime.includes("csv")
  );
};
