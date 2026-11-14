/**
 * Browser CORS for MaintenEase app origins only. Server-to-server callers omit Origin.
 */

/** From README / Lovable project URL — used to match preview hostnames only. */
export const LOVABLE_PROJECT_ID = "8e4b0baf-d26e-4fdc-947e-b3bad90e188b";

const LOVABLE_PROJECT_ID_LC = LOVABLE_PROJECT_ID.toLowerCase();

/** Production site origins (canonical `URL#origin` form). */
const HTTPS_PRODUCTION_ORIGINS = new Set([
  "https://maintenease.com",
  "https://www.maintenease.com",
  "https://maintenease.lovable.app",
]);

/** Preview DNS zones (see previewAuthStorage.ts PREVIEW_ZONES). */
const PREVIEW_ZONES = [
  "lovable.app",
  "lovableproject.com",
  "lovableproject-dev.com",
  "gpt-eng.com",
  "gptengineer.run",
] as const;

/** Full-string preview label patterns (no prefix-only match). */
const ID_PREVIEW_WITH_SLUG = new RegExp(
  `^id-preview-[a-z0-9]+--${LOVABLE_PROJECT_ID_LC}(?:-dev)?$`,
  "i",
);
const LIVE_WITH_THR = new RegExp(
  `^live--${LOVABLE_PROJECT_ID_LC}-thr_[a-z0-9]+$`,
  "i",
);

function isAllowedPreviewLabel(label: string): boolean {
  const l = label.toLowerCase();
  if (l === LOVABLE_PROJECT_ID_LC) return true;
  if (l === `project--${LOVABLE_PROJECT_ID_LC}`) return true;
  if (l === `project--${LOVABLE_PROJECT_ID_LC}-dev`) return true;
  if (l === `id-preview--${LOVABLE_PROJECT_ID_LC}`) return true;
  if (l === `id-preview--${LOVABLE_PROJECT_ID_LC}-dev`) return true;
  if (ID_PREVIEW_WITH_SLUG.test(l)) return true;
  if (l === `live--${LOVABLE_PROJECT_ID_LC}`) return true;
  if (LIVE_WITH_THR.test(l)) return true;
  return false;
}

function hostMatchesLovableProjectPreview(hostname: string): boolean {
  const h = hostname.toLowerCase();
  for (const zone of PREVIEW_ZONES) {
    const suffix = `.${zone}`;
    if (!h.endsWith(suffix)) continue;
    const label = h.slice(0, -suffix.length);
    if (!label || label.includes(".")) return false;
    if (isAllowedPreviewLabel(label)) return true;
  }
  return false;
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return url.protocol === "http:" || url.protocol === "https:";
  }

  if (url.protocol !== "https:") return false;

  if (HTTPS_PRODUCTION_ORIGINS.has(url.origin)) return true;
  return hostMatchesLovableProjectPreview(hostname);
}

const BASE_CORS: Record<string, string> = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notify-secret, x-ingest-token, svix-id, svix-timestamp, svix-signature, paddle-signature",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  Vary: "Origin",
};

export function corsHeadersForRequest(
  req: Request,
  extraHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...BASE_CORS, ...extraHeaders };
  const origin = req.headers.get("Origin");
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin!;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

/** Returns a 204 preflight response when the request is OPTIONS; otherwise null. */
export function handleCorsPreflight(
  req: Request,
  extraHeaders?: Record<string, string>,
): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeadersForRequest(req, extraHeaders),
  });
}