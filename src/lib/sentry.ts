import * as Sentry from "@sentry/react";

/** Per-tab session id — survives route changes, resets on reload. */
const SESSION_ID = (() => {
  try {
    const key = "app.sessionId";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return "unknown";
  }
})();

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
      // Attach url / method / status / request + response headers to fetch
      // and XHR breadcrumbs and to errors that originate from a network
      // call. Crucial for debugging failed API requests.
      Sentry.httpClientIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    // Opt-in for httpClientIntegration to actually capture network errors.
    sendDefaultPii: true,
    // Treat 5xx / 429 responses as failed requests Sentry should report.
    // (httpClientIntegration default is 500-599; include 429 for rate limits.)
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

  Sentry.setTag("session_id", SESSION_ID);
}

/** Attach the current user to all subsequent Sentry events. */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (!user) {
    // Keep the per-tab session id even after sign-out so we can correlate
    // pre- and post-logout errors from the same browser session.
    Sentry.setUser({ id: `anon:${SESSION_ID}` });
    return;
  }
  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    session_id: SESSION_ID,
  });
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

/**
 * Capture a thrown error from an API call with structured request metadata
 * (method, url, status, response body excerpt). Use from data layers /
 * service functions where a fetch or supabase call fails.
 */
export function captureApiError(
  error: unknown,
  request: {
    method?: string;
    url?: string;
    status?: number;
    body?: unknown;
    response?: unknown;
  },
) {
  return Sentry.captureException(error, {
    tags: {
      source: "api",
      http_method: request.method ?? "unknown",
      http_status: request.status?.toString() ?? "unknown",
    },
    contexts: {
      api_request: {
        url: request.url,
        method: request.method,
        status: request.status,
        body: safeStringify(request.body),
        response: safeStringify(request.response),
      },
    },
  });
}

function safeStringify(value: unknown): string | undefined {
  if (value == null) return undefined;
  try {
    const s = typeof value === "string" ? value : JSON.stringify(value);
    return s.length > 2000 ? `${s.slice(0, 2000)}…[truncated]` : s;
  } catch {
    return "[unserializable]";
  }
}

/** Expose the per-tab session id for logs / support tickets. */
export function getSessionId() {
  return SESSION_ID;
}

export { Sentry };