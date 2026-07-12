import { supabase } from "@/integrations/supabase/client";

export async function getTurnstileSiteKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{
    siteKey?: string;
  }>("get-turnstile-config");

  if (error) throw error;
  if (!data?.siteKey) throw new Error("Turnstile site key is unavailable");
  return data.siteKey;
}
