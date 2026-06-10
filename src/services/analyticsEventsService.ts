import { supabase } from "@/integrations/supabase/client";

/** Insert payload for a row in the marketing_page_events analytics table. */
export interface MarketingPageEventInsert {
  event_type: string;
  page_slug: string;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Record an analytics event in the marketing_page_events table.
 *
 * Throws on insert failure — callers in analytics code paths are expected to
 * swallow the error, since analytics must never break the page.
 */
export async function insertMarketingPageEvent(event: MarketingPageEventInsert): Promise<void> {
  const { error } = await supabase.from("marketing_page_events").insert({
    ...event,
    metadata: event.metadata as never,
  });

  if (error) throw error;
}
