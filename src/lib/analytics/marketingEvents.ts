import { supabase } from "@/integrations/supabase/client";

const TRACKED_SLUGS = new Set(["asset-tracking-software", "asset-management-software"]);

export const isTrackedMarketingSlug = (slug: string) => TRACKED_SLUGS.has(slug);

const seenPageViews = new Set<string>();

interface TrackOptions {
  eventType: string;
  pageSlug: string;
  metadata?: Record<string, unknown>;
  /** When true, only fire once per page-view key for the lifetime of the tab. */
  dedupeKey?: string;
}

export async function trackMarketingEvent({
  eventType,
  pageSlug,
  metadata,
  dedupeKey,
}: TrackOptions): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isTrackedMarketingSlug(pageSlug)) return;

  if (dedupeKey) {
    if (seenPageViews.has(dedupeKey)) return;
    seenPageViews.add(dedupeKey);
  }

  // Forward to any Plausible-compatible script if one is loaded.
  const plausible = (window as unknown as { plausible?: (event: string, opts?: Record<string, unknown>) => void }).plausible;
  if (typeof plausible === "function") {
    try {
      plausible(eventType, { props: { page_slug: pageSlug, ...(metadata ?? {}) } });
    } catch {
      // Swallow — analytics must never break the page.
    }
  }

  try {
    await supabase.from("marketing_page_events").insert({
      event_type: eventType,
      page_slug: pageSlug,
      page_url: window.location.href.slice(0, 2048),
      referrer: document.referrer ? document.referrer.slice(0, 2048) : null,
      user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 1024) : null,
      metadata: (metadata ?? {}) as never,
    });
  } catch {
    // Never let analytics failures surface to the user.
  }
}