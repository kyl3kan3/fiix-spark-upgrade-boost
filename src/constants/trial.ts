/**
 * Single source of truth for trial duration. Used by the in-app countdown
 * banner, marketing copy helpers, analytics events, and the checkout call.
 *
 * Keep in sync with the `trial_period` on every Paddle price (sandbox + live).
 * When changing this value, also update copy referring to "day N+1" cancel
 * deadlines (e.g. "cancel before day 8").
 */
export const TRIAL_DAYS = 7;
export const TRIAL_CANCEL_BY_DAY = TRIAL_DAYS + 1;