import { privateErrorEvent } from "./telemetryPrivacy";
type SentryModule = typeof import("@sentry/react");
let sentryLoad: Promise<SentryModule | null> | null = null;
const sessionId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "local";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || import.meta.env.DEV || sentryLoad) return;
  sentryLoad = import("@sentry/react").then(Sentry => {
    Sentry.init({
      dsn, environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION as string | undefined,
      sendDefaultPii: false,
      defaultIntegrations: false,
      integrations: [Sentry.globalHandlersIntegration()],
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeBreadcrumb: () => null,
      beforeSend: event => privateErrorEvent(event),
    });
    return Sentry;
  }).catch(() => null);
}

// Identity and raw routes are deliberately excluded from remote error telemetry.
export function setSentryUser(_user: { id: string; email?: string | null } | null) {}
export function setSentryRoute(_pathname: string) {}
export async function captureBoundaryError(error: unknown, _componentStack: string | null | undefined): Promise<string | null> {
  const sentry = await sentryLoad;
  return sentry ? sentry.captureException(error) : null;
}
export function captureApiError(error: unknown, _request: { method?: string; url?: string; status?: number; body?: unknown; response?: unknown }) {
  void sentryLoad?.then(sentry => sentry?.captureException(error));
}
export function getSessionId() { return sessionId; }
