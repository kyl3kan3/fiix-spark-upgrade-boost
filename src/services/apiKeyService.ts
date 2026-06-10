import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";

export interface ApiKeySummary {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/[+/=]/g, "")
    .slice(0, 40);
  return `mke_live_${b64}`;
}

/** Lists the company's API keys, newest first. Throws on query failure. */
export async function listApiKeys(): Promise<ApiKeySummary[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Generates and stores a new API key for the current user's company.
 * Returns the full plaintext key — the only time it is ever available.
 */
export async function createApiKey(name: string): Promise<string> {
  const { userId, companyId } = await requireUserCompany();

  const fullKey = generateKey();
  const key_hash = await sha256(fullKey);
  const key_prefix = fullKey.slice(0, 16);

  const { error } = await supabase.from("api_keys").insert({
    company_id: companyId,
    created_by: userId,
    name,
    key_hash,
    key_prefix,
  });
  if (error) throw error;
  return fullKey;
}

/** Marks an API key as revoked. Throws on failure. */
export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Permanently deletes an API key. Throws on failure. */
export async function deleteApiKey(id: string): Promise<void> {
  const { error } = await supabase.from("api_keys").delete().eq("id", id);
  if (error) throw error;
}
