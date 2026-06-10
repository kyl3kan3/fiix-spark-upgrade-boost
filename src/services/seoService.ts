import { supabase } from "@/integrations/supabase/client";

export interface SeoIndexInspectResult {
  url: string;
  coverageState?: string;
  indexingState?: string;
  verdict?: string;
  lastCrawlTime?: string | null;
  pageFetchState?: string;
  robotsTxtState?: string;
  googleCanonical?: string | null;
  userCanonical?: string | null;
  inspectionResultLink?: string;
  error?: string;
}

/**
 * Queries the seo-index-status edge function (Google Search Console URL
 * inspection) for the given URLs. Throws on invoke failure.
 */
export async function fetchSeoIndexStatus(urls: string[]): Promise<SeoIndexInspectResult[]> {
  const { data, error } = await supabase.functions.invoke<{
    results?: SeoIndexInspectResult[];
  }>("seo-index-status", { body: { urls } });
  if (error) throw error;
  return data?.results ?? [];
}
