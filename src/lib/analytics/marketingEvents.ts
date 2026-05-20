import { supabase } from "@/integrations/supabase/client";

const TRACKED_SLUGS = new Set(["asset-tracking-software", "asset-management-software"]);

export const isTrackedMarketingSlug = (slug: string) => TRACKED_SLUGS.has(slug);

const seenDedupeKeys = new Set<string>();

export type DedupeStrategy = "session" | "day" | "none";

/** Configurable dedupe strategy for page_view events. Override via `setPageViewDedupeStrategy`. */
let pageViewDedupeStrategy: DedupeStrategy = "session";

export const setPageViewDedupeStrategy = (strategy: DedupeStrategy) => {
 pageViewDedupeStrategy = strategy;
};

export const getPageViewDedupeStrategy = (): DedupeStrategy => pageViewDedupeStrategy;

const DAY_STORAGE_PREFIX = "mkt_pv_day:";

const todayKey = () => {
 const d = new Date();
 return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

/** Build a dedupe key for page_view based on the current strategy. Returns null when no dedupe. */
export const buildPageViewDedupeKey = (pageSlug: string): string | null => {
 if (pageViewDedupeStrategy === "none") return null;
 if (pageViewDedupeStrategy === "day") return `page_view:${pageSlug}:day:${todayKey()}`;
 return `page_view:${pageSlug}:session`;
};

/** Check + record a dedupe key, honouring per-day persistence via localStorage. */
const shouldSkipForDedupe = (dedupeKey: string): boolean => {
 if (dedupeKey.includes(":day:")) {
 try {
 const storageKey = `${DAY_STORAGE_PREFIX}${dedupeKey}`;
 if (typeof localStorage !== "undefined" && localStorage.getItem(storageKey)) return true;
 localStorage?.setItem(storageKey, "1");
 return false;
 } catch {
 // Fall through to in-memory dedupe if storage is unavailable.
 }
 }
 if (seenDedupeKeys.has(dedupeKey)) return true;
 seenDedupeKeys.add(dedupeKey);
 return false;
};

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
 if (shouldSkipForDedupe(dedupeKey)) return;
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

/** Extract UTM params + referrer from the current window for lead attribution. */
export const getAttributionMetadata = (): Record<string, string | null> => {
 if (typeof window === "undefined") return {};
 const params = new URLSearchParams(window.location.search);
 const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
 const out: Record<string, string | null> = {};
 for (const k of utmKeys) {
 const v = params.get(k);
 if (v) out[k] = v.slice(0, 200);
 }
 out.referrer = typeof document !== "undefined" && document.referrer ? document.referrer.slice(0, 500) : null;
 out.landing_path = window.location.pathname + window.location.search;
 return out;
};