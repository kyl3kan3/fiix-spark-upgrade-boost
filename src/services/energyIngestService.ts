import { supabase } from "@/integrations/supabase/client";

/** Public endpoint a utility/IoT feed POSTs energy readings to. */
export const ingestEndpointUrl = (): string => {
  const base = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/functions/v1/ingest-energy`;
};

/** Get (creating if needed) the current company's energy ingest token. */
export const getOrCreateIngestToken = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("get_or_create_energy_ingest_token");
  if (error) throw error;
  return data as string;
};

export interface IngestTokenInfo {
  token: string;
  /** When the endpoint last received a reading on this token, or null if never. */
  lastUsedAt: string | null;
}

/** Token plus its last-used timestamp, so the UI can show whether a feed is live. */
export const getIngestTokenInfo = async (): Promise<IngestTokenInfo> => {
  // Ensure a token row exists first, then read back its observability fields.
  const token = await getOrCreateIngestToken();
  const { data, error } = await supabase
    .from("energy_ingest_tokens")
    .select("token, last_used_at")
    .maybeSingle();
  if (error) throw error;
  return { token: data?.token ?? token, lastUsedAt: data?.last_used_at ?? null };
};

/** Rotate the company's ingest token and return the new value. */
export const regenerateIngestToken = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("regenerate_energy_ingest_token");
  if (error) throw error;
  return data as string;
};
