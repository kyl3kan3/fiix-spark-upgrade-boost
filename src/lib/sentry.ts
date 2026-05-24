import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for client-side error monitoring.
 *
 * Captures:
 *  - React render errors (via ErrorBoundary integration)
 *  - Unhandled promise rejections (default Sentry handler)
 *  - Uncaught exceptions (default Sentry handler)
 *  - Fetch/XHR breadcrumbs (default integrations) — gives API request
 *    metadata (url, method, status) on every captured error.
 *
 * Only runs in production builds so local dev noise doesn't get reported.
 *
 * Release tagging: set VITE_APP_VERSION at build time (e.g. the commit
 * SHA) to group errors by release in Sentry. Without it, errors are
 * still captured but won't be associated with a specific release.
 */
const DEFAULT_DSN =
  "https://5f17b84d2162eb3cb462f3e83a63bc98@o4510413979451392.ingest.us.sentry.io/4511444115193856";

export function initSentry() {
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || DEFAULT_DSN;
  if (!dsn || import.meta.env.DEV) return;

  const release = (import.meta.env.VITE_APP_VERSION as string | undefined) || undefined;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release,
    // Send default PII (IP address, user-agent, etc.) — needed for accurate
    // user counts on release-health metrics.
    sendDefaultPii: true,
    // Auto session tracking is on by default in the browser SDK; combined
    // with `release` above, this powers crash-free-session/user stats on
    // the Releases dashboard.
    // Sample 10% of transactions; we mostly care about errors.
    tracesSampleRate: 0.1,
    // Capture replays only when an error occurs.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    // Strip noisy/expected errors before they ship.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications.",
      "Non-Error promise rejection captured",
      // Auth/session expiry — handled by app, no need to alert.
      "JWT expired",
      "Auth session missing",
    ],
  });
}

/** Attach the current user to all subsequent Sentry events. */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });
}

/** Tag the current route on the Sentry scope so every event includes it. */
export function setSentryRoute(pathname: string) {
  Sentry.setTag("route", pathname);
  Sentry.addBreadcrumb({
    category: "navigation",
    message: pathname,
    level: "info",
  });
}

export { Sentry };