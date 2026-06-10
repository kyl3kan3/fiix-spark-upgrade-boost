import { insertMarketingPageEvent } from "@/services/analyticsEventsService";
import { TRIAL_DAYS } from "@/constants/trial";

/**
 * Lightweight, fire-and-forget analytics for trial activation & conversion.
 *
 * Every event is tagged with `trial_length_days` so 7-day vs 14-day cohorts
 * can be compared in BI without joining against the subscriptions table.
 * Events stream into `marketing_page_events` (the table already used for
 * marketing analytics) and into any Plausible-compatible script on the page.
 *
 * Event names:
 *   - `trial_checkout_started` — user clicked a "Start trial" CTA
 *   - `trial_signup_completed` — onboarding finished, company created
 *   - `trial_activated`        — meaningful in-app action during trial
 *                                (first asset, first work order, etc.)
 *   - `trial_converted`        — moved from `trialing` to `active`
 *   - `trial_expired_unpaid`   — trial ended without conversion
 */

export type TrialEvent =
  | "trial_checkout_started"
  | "trial_signup_completed"
  | "trial_activated"
  | "trial_converted"
  | "trial_expired_unpaid";

interface TrackOptions {
  /** Override the global trial length (e.g. when measuring legacy 14-day cohorts). */
  trialLengthDays?: number;
  /** Stable identifier for the company/user being measured. */
  companyId?: string;
  userId?: string;
  /** Plan tier the user is starting on, when known. */
  tier?: "starter" | "pro" | "business";
  /** Free-form extras — kept small. */
  metadata?: Record<string, unknown>;
  /** Page slug for attribution; defaults to the current path. */
  pageSlug?: string;
}

export async function trackTrialEvent(event: TrialEvent, opts: TrackOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;

  const trialLengthDays = opts.trialLengthDays ?? TRIAL_DAYS;
  const pageSlug = opts.pageSlug ?? window.location.pathname.replace(/^\/+/, "") ?? "unknown";

  const props = {
    trial_length_days: trialLengthDays,
    tier: opts.tier ?? null,
    company_id: opts.companyId ?? null,
    user_id: opts.userId ?? null,
    ...(opts.metadata ?? {}),
  };

  // 1) Plausible (or any compatible analytics shim loaded on the page).
  const plausible = (window as unknown as {
    plausible?: (event: string, opts?: Record<string, unknown>) => void;
  }).plausible;
  if (typeof plausible === "function") {
    try {
      plausible(event, { props });
    } catch {
      // Swallow — analytics must never break the page.
    }
  }

  // 2) Internal marketing_page_events table — same storage as marketing
  //    funnel events so dashboards can compare cohorts side by side.
  try {
    await insertMarketingPageEvent({
      event_type: event,
      page_slug: pageSlug,
      page_url: window.location.href.slice(0, 2048),
      referrer: document.referrer ? document.referrer.slice(0, 2048) : null,
      user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 1024) : null,
      metadata: props,
    });
  } catch {
    // Never let analytics failures surface to the user.
  }
}