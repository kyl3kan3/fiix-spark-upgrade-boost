import { supabase } from "@/integrations/supabase/client";
import { tryGetUserCompany } from "@/services/supabaseHelpers";

export type PublicRequestType = "standard" | "urgent";
export type PublicRequestStatus = "new" | "in_progress" | "resolved";

export interface PublicRequest {
  id: string;
  type: PublicRequestType;
  title: string;
  description: string;
  location_text: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: PublicRequestStatus;
  created_at: string;
  photos: string[] | null;
}

export interface RequestInboxCompany {
  id: string;
  name: string;
  public_slug: string | null;
}

/** Company shape returned by the public get_public_company_by_slug RPC. */
export interface PublicPortalCompany {
  id: string;
  name: string;
  logo: string | null;
  public_slug: string;
}

export interface ResolvePublicRequestResult {
  emailSent?: boolean;
  reason?: string | null;
}

export interface SubmitPublicRequestInput {
  authorizationId: string;
  type: PublicRequestType;
  title: string;
  description: string;
  location_text: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  photoPaths: string[];
  user_agent: string | null;
}

export interface AuthorizedPublicRequestUpload {
  path: string;
  token: string;
}

export interface PublicRequestAuthorization {
  authorizationId: string;
  uploads: AuthorizedPublicRequestUpload[];
  expiresAt: string;
}

/**
 * Best-effort lookup of the current user's company for the request inbox.
 * Returns null when the user has no company (or the lookup fails).
 */
export async function getRequestInboxCompany(): Promise<RequestInboxCompany | null> {
  const { companyId } = await tryGetUserCompany();
  if (!companyId) return null;
  const { data } = await supabase
    .from("companies")
    .select("id, name, public_slug")
    .eq("id", companyId)
    .single();
  return data;
}

/** Lists public requests, newest first, optionally filtered by type. Throws on failure. */
export async function listPublicRequests(
  filter: "all" | PublicRequestType
): Promise<PublicRequest[]> {
  let q = supabase.from("public_requests").select("*").order("created_at", { ascending: false });
  if (filter !== "all") q = q.eq("type", filter);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as PublicRequest[];
}

/**
 * Resolves a public request via the resolve-public-request edge function
 * (which also notifies the submitter). Throws on failure.
 */
export async function resolvePublicRequest(
  requestId: string
): Promise<ResolvePublicRequestResult | null> {
  const { data, error } = await supabase.functions.invoke<ResolvePublicRequestResult | null>(
    "resolve-public-request",
    { body: { requestId } }
  );
  if (error) throw error;
  return data ?? null;
}

/** Updates a public request's status directly. Throws on failure. */
export async function updatePublicRequestStatus(
  id: string,
  status: PublicRequestStatus
): Promise<void> {
  const { error } = await supabase.from("public_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

/**
 * Public (unauthenticated) lookup of a company by its request-portal slug.
 * Returns null when no company matches; throws on RPC failure.
 */
export async function getPublicCompanyBySlug(slug: string): Promise<PublicPortalCompany | null> {
  const { data, error } = await supabase.rpc("get_public_company_by_slug", { _slug: slug });
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0] as PublicPortalCompany;
}

/**
 * Verifies Turnstile server-side and creates single-use request authorization
 * plus signed upload targets scoped to that request.
 */
export async function authorizePublicRequest(
  companyId: string,
  photos: File[],
  turnstileToken: string,
): Promise<PublicRequestAuthorization> {
  const { data, error } = await supabase.functions.invoke<
    PublicRequestAuthorization & { error?: string }
  >("authorize-public-request", {
    body: {
      companyId,
      turnstileToken,
      files: photos.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.authorizationId || !Array.isArray(data.uploads)) {
    throw new Error("Could not authorize request submission");
  }
  return data;
}

/** Uploads every photo to its corresponding server-signed target. */
export async function uploadPublicRequestPhotos(
  photos: File[],
  uploads: AuthorizedPublicRequestUpload[],
): Promise<string[]> {
  if (photos.length !== uploads.length) {
    throw new Error("Upload authorization did not match the selected photos");
  }

  return Promise.all(photos.map(async (file, index) => {
    const upload = uploads[index];
    const { error } = await supabase.storage
      .from("public-request-photos")
      .uploadToSignedUrl(upload.path, upload.token, file, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;
    return upload.path;
  }));
}

/**
 * Submits a public maintenance request via the submit-public-request edge
 * function (unauthenticated). Throws on failure.
 */
export async function submitPublicRequest(input: SubmitPublicRequestInput): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-public-request", { body: input });
  if (error) throw error;
}
