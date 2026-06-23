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

/** Rotate the company's ingest token and return the new value. */
export const regenerateIngestToken = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("regenerate_energy_ingest_token");
  if (error) throw error;
  return data as string;
};
