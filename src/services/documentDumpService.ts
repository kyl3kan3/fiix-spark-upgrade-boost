import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import {
  buildStoragePath,
  inferDocKind,
  MAX_UPLOAD_BYTES,
  type DocKind,
} from "@/lib/documentDump";

const BUCKET = "onboarding-docs";

export interface OnboardingDocument {
  id: string;
  company_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  doc_kind: DocKind;
  status: "uploaded" | "processing" | "processed" | "failed";
  notes: string | null;
  created_at: string;
}

const COLUMNS =
  "id, company_id, file_name, storage_path, mime_type, size_bytes, doc_kind, status, notes, created_at";

/** List the company's uploaded onboarding documents (RLS-scoped), newest first. */
export const fetchOnboardingDocuments = async (): Promise<OnboardingDocument[]> => {
  const { data, error } = await supabase
    .from("onboarding_documents")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => ({
    ...d,
    doc_kind: d.doc_kind as DocKind,
    status: d.status as OnboardingDocument["status"],
  }));
};

/** Upload one file to storage and record it in the catalog. Returns the catalog row. */
export const uploadOnboardingDocument = async (
  file: File,
  docKind?: DocKind,
): Promise<OnboardingDocument> => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is too large (max 25 MB).`);
  }
  const { companyId } = await requireUserCompany();
  const path = buildStoragePath(companyId, file.name, crypto.randomUUID());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("onboarding_documents")
    .insert([
      {
        company_id: companyId,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        doc_kind: docKind ?? inferDocKind(file.name),
      },
    ])
    .select(COLUMNS)
    .single();

  if (error) {
    // Roll back the orphaned object so storage and catalog stay consistent.
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }

  return { ...data, doc_kind: data.doc_kind as DocKind, status: data.status as OnboardingDocument["status"] };
};

/** Remove a document from both the catalog and storage. */
export const deleteOnboardingDocument = async (doc: OnboardingDocument): Promise<void> => {
  try {
    const { error } = await supabase.from("onboarding_documents").delete().eq("id", doc.id);
    if (error) throw error;
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
    toast.success("Document removed");
  } catch (error) {
    console.error("Error deleting onboarding document:", error);
    toast.error("Failed to remove document");
    throw error;
  }
};

/** Short-lived signed URL for previewing/downloading a private document. */
export const getOnboardingDocumentUrl = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
};
