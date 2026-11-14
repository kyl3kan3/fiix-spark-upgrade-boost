/**
 * Browser CORS for MaintenEase app origins only. Server-to-server callers omit Origin.
 */

/** From README / Lovable project URL — used to match preview hostnames only. */
const LOVABLE_PROJECT_ID = "8e4b0baf-d26e-4fdc-947e-b3bad90e188b";

const HTTPS_EXACT_ORIGINS = new Set([
  "https://maintenease.com",
  "https://www.maintenease.com",
  "https://maintenease.lovable.app",
]);

/** Preview DNS zones where this Lovable project may be served (see previewAuthStorage.ts). */
const LOVABLE_PREVIEW_HOST_SUFFIXES = [
  "lovable.app",
  "lovableproject.com",
  "lovableproject-dev.com",
  "gpt-eng.com",
  "gptengineer.run",
];

function hostMatchesLovableProjectPreview(host: string): boolean {
  const h = host.toLowerCase();
  const onZone = LOVABLE_PREVIEW_HOST_SUFFIXES.some(
    (suffix) => h === suffix || h.endsWith(`.${suffix}`),
  );
  if (!onZone) return false;

  const id = LOVABLE_PROJECT_ID;
  const patterns = [
    new RegExp(`^(?:id-preview(?:-[a-z0-9]+)?|project)--${id}(?:-dev)?(?=\\.|$)`, "i"),
    new RegExp(`^live--${id}(?:-thr_[a-z0-9]+)?(?=\\.|$)`, "i"),
    new RegExp(`^${id}(?=[.-])`, "i"),
  ];
  return patterns.some((re) => re.test(h));
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    if (host === "localhost" || host === "127.0.0.1") {
      return url.protocol === "http:" || url.protocol === "https:";
    }

    if (url.protocol !== "https:") return false;
    if (HTTPS_EXACT_ORIGINS.has(origin)) return true;
    return hostMatchesLovableProjectPreview(host);
  } catch {
    return false;
  }
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