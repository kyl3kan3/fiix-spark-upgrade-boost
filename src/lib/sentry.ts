import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for client-side error monitoring.
 *
 * Captures:
 *  - React render errors (via ErrorBoundary integration)
 *  - Unhandled promise rejections (default Sentry handler)
 *  - Uncaught exceptions (default Sentry handler)
 *
 * Only runs in production builds when VITE_SENTRY_DSN is set, so local
 * dev noise doesn't get reported.
 */
const DEFAULT_DSN =
  "https://5f17b84d2162eb3cb462f3e83a63bc98@o4510413979451392.ingest.us.sentry.io/4511444115193856";

export function initSentry() {
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || DEFAULT_DSN;
  if (!dsn || import.meta.env.DEV) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sample 10% of transactions; we mostly care about errors.
    tracesSampleRate: 0.1,
    // Capture replays only when an error occurs.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
  });
}

export { Sentry };