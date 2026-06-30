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
  companyId: string;
  type: PublicRequestType;
  title: string;
  description: string;
  location_text: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  photos: string[];
  user_agent: string | null;
  turnstileToken: string;
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
 * Best-effort upload of public request photos (unauthenticated). Failed
 * uploads are logged and skipped; returns the public URLs that succeeded.
 */
export async function uploadPublicRequestPhotos(
  companyId: string,
  photos: File[]
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  if (photos.length === 0) return uploadedUrls;
  const folder = `${companyId}/${crypto.randomUUID()}`;
  for (const file of photos) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("public-request-photos")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      console.error("photo upload failed", upErr);
      continue;
    }
    const { data: pub } = supabase.storage.from("public-request-photos").getPublicUrl(path);
    if (pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
  }
  return uploadedUrls;
}

/**
 * Submits a public maintenance request via the submit-public-request edge
 * function (unauthenticated). Throws on failure.
 */
export async function submitPublicRequest(input: SubmitPublicRequestInput): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-public-request", { body: input });
  if (error) throw error;
}
