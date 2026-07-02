/**
 * Lazy Sentry facade.
 *
 * The Sentry SDK (core + browser + session replay) was the single largest
 * piece of the entry bundle, loading before first paint on every page. This
 * module keeps `@sentry/react` out of the initial chunk entirely: initSentry()
 * schedules a dynamic import after the window load event (on idle), buffers
 * any errors that fire before the SDK arrives, and replays them once it's up.
 * All helpers no-op until the SDK is loaded and queue behind the load promise
 * afterwards, so call sites don't need to know about the deferral.
 */

type SentryModule = typeof import("@sentry/react");

let sentry: SentryModule | null = null;
let sentryLoad: Promise<SentryModule | null> | null = null;

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

const DEFAULT_DSN =
  "https://5f17b84d2162eb3cb462f3e83a63bc98@o4510413979451392.ingest.us.sentry.io/4511444115193856";

/** Errors that fire before the SDK loads, replayed after init. */
const preInitErrors: unknown[] = [];
const bufferError = (event: ErrorEvent) => {
  preInitErrors.push(event.error ?? event.message);
};
const bufferRejection = (event: PromiseRejectionEvent) => {
  preInitErrors.push(event.reason);
};

function scheduleAfterLoadIdle(task: () => void) {
  const onIdle = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(task, { timeout: 3000 });
    } else {
      window.setTimeout(task, 1500);
    }
  };
  if (document.readyState === "complete") {
    onIdle();
  } else {
    window.addEventListener("load", onIdle, { once: true });
  }
}

export function initSentry() {
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || DEFAULT_DSN;
  if (!dsn || import.meta.env.DEV || sentryLoad) return;

  window.addEventListener("error", bufferError);
  window.addEventListener("unhandledrejection", bufferRejection);

  let resolveLoad: (mod: SentryModule | null) => void;
  sentryLoad = new Promise((resolve) => {
    resolveLoad = resolve;
  });

  scheduleAfterLoadIdle(() => {
    import("@sentry/react")
      .then((Sentry) => {
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
          // Strip noisy/expected errors before they ship.
          ignoreErrors: [
            "ResizeObserver loop limit exceeded",
            "ResizeObserver loop completed with undelivered notifications.",
            "Non-Error promise rejection captured",
            // Auth/session expiry — handled by app, no need to alert.
            "JWT expired",
            "Auth session missing",
            // Stale chunks after deploy — handled by lazyWithRetry which
            // hard-reloads the page. The error fires once before the reload.
            "Failed to fetch dynamically imported module",
            "Importing a module script failed",
            "error loading dynamically imported module",
            // Browser-extension / translation DOM races we cannot fix.
            "Failed to execute 'removeChild' on 'Node'",
            "The node to be removed is not a child of this node",
            // Third-party (Lovable badge / flock.js analytics) errors.
            "e.replaceAll is not a function",
            "Cannot read properties of undefined (reading 'outerHTML')",
            // Lovable badge analytics (flock.js) — third-party 5xx noise we can't fix.
            "HTTP Client Error with status code: 500",
            // Facebook in-app browser (Android WebView) fires this on beforeunload
            // when the user navigates away. Not actionable from our code.
            "Java object is gone",
          ],
          denyUrls: [
            // Lovable badge / flock.js analytics script.
            /\/~flock\.js/i,
            /\/~api\/analytics/i,
          ],
        });

        Sentry.setTag("session_id", SESSION_ID);

        window.removeEventListener("error", bufferError);
        window.removeEventListener("unhandledrejection", bufferRejection);
        for (const error of preInitErrors.splice(0)) {
          Sentry.captureException(error, { tags: { source: "pre_init_buffer" } });
        }

        sentry = Sentry;
        resolveLoad(Sentry);
      })
      .catch(() => {
        // SDK failed to load (offline, blocked) — monitoring is best-effort.
        window.removeEventListener("error", bufferError);
        window.removeEventListener("unhandledrejection", bufferRejection);
        resolveLoad(null);
      });
  });
}

/** Run a task now if the SDK is up, or as soon as it loads. No-op in dev. */
function withSentry(task: (mod: SentryModule) => void) {
  if (sentry) {
    task(sentry);
    return;
  }
  void sentryLoad?.then((mod) => mod && task(mod));
}

/** Attach the current user to all subsequent Sentry events. */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  withSentry((Sentry) => {
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
  });
}

/** Tag the current route on the Sentry scope so every event includes it. */
export function setSentryRoute(pathname: string) {
  withSentry((Sentry) => {
    Sentry.setTag("route", pathname);
    Sentry.addBreadcrumb({
      category: "navigation",
      message: pathname,
      level: "info",
    });
  });
}

/**
 * Capture a React error-boundary exception. Resolves with the Sentry event id
 * once the (possibly still-loading) SDK has captured it, or null when
 * monitoring is disabled/unavailable.
 */
export async function captureBoundaryError(
  error: unknown,
  componentStack: string | null | undefined,
): Promise<string | null> {
  const mod = sentry ?? (sentryLoad ? await sentryLoad : null);
  if (!mod) return null;
  return mod.captureException(error, {
    contexts: { react: { componentStack } },
    tags: { source: "react_error_boundary" },
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
  withSentry((Sentry) => {
    Sentry.captureException(error, {
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
