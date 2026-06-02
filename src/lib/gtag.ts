// Google Ads / GA helper. The tags themselves are loaded in index.html.
// We only push events from the SPA here.
import { logger } from "@/lib/logger";

const GOOGLE_ADS_ID = "AW-18190364490";
const PURCHASE_CONVERSION = "AW-18190364490/CLjYCLDM3LMcEMre6-FD";

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { gtag?: Gtag }).gtag ?? null;
}

/** Fire a page_view for the current path. Call on route change. */
export function trackPageView(path: string): void {
  const g = gtag();
  if (!g) return;
  try {
    g("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GOOGLE_ADS_ID,
    });
  } catch (e) {
    logger.warn("gtag page_view failed", e);
  }
}

/**
 * Identify the user to Google Ads (for remarketing audiences + enhanced conv).
 * Pass null on sign-out to clear.
 */
export function setUserData(opts: { userId?: string | null; email?: string | null } | null): void {
  const g = gtag();
  if (!g) return;
  try {
    if (!opts) {
      g("config", GOOGLE_ADS_ID, { user_id: undefined });
      return;
    }
    const payload: Record<string, unknown> = {};
    if (opts.userId) payload.user_id = opts.userId;
    g("config", GOOGLE_ADS_ID, payload);

    // user_data is hashed automatically by gtag.js when allow_enhanced_conversions is on.
    if (opts.email) {
      g("set", "user_data", { email: opts.email.trim().toLowerCase() });
    }
  } catch (e) {
    logger.warn("gtag setUserData failed", e);
  }
}

/** Fire the purchase conversion with enhanced-conversion email + transaction_id dedupe. */
export function trackPurchaseConversion(opts: {
  transactionId?: string;
  email?: string | null;
  value?: number;
  currency?: string;
}): void {
  const g = gtag();
  if (!g) return;
  try {
    if (opts.email) {
      g("set", "user_data", { email: opts.email.trim().toLowerCase() });
    }
    g("event", "conversion", {
      send_to: PURCHASE_CONVERSION,
      transaction_id: opts.transactionId ?? "",
      value: opts.value,
      currency: opts.currency ?? (opts.value != null ? "USD" : undefined),
    });
  } catch (e) {
    logger.warn("gtag conversion failed", e);
  }
}
