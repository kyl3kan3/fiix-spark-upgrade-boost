/**
 * Restrict browser CORS to MaintenEase production, Lovable preview hosts, and local dev.
 * Server-to-server callers (webhooks, cron) typically send no Origin; responses omit ACAO.
 */

const EXACT_ORIGINS = new Set([
  "https://maintenease.com",
  "https://www.maintenease.com",
  "https://maintenease.lovable.app",
]);

/** Host suffixes used by Lovable / preview surfaces (see src/integrations/supabase/previewAuthStorage.ts). */
const HOST_SUFFIXES = [
  "lovable.app",
  "lovableproject.com",
  "lovableproject-dev.com",
  "gpt-eng.com",
  "gptengineer.run",
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (EXACT_ORIGINS.has(origin)) return true;

    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return url.protocol === "http:";
    }
    return HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
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
  return new Response("ok", { status: 204, headers: corsHeadersForRequest(req, extraHeaders) });
}