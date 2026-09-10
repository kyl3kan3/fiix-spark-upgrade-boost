/**
 * HTTP security headers for HTML document responses on maintenease.com.
 *
 * Inventory (verified against the live homepage and app shell, March 2026):
 * - Inline + module scripts from self (Vite bundle, gtag bootstrap)
 * - www.googletagmanager.com / Google Ads conversion tags
 * - datafa.st analytics
 * - fonts.googleapis.com / fonts.gstatic.com
 * - wwgljhpuulhljumrhscg.supabase.co (API + realtime)
 * - cdn.paddle.com / checkout.paddle.com (billing checkout iframe)
 * - *.ingest.us.sentry.io (bundled SDK error reporting)
 *
 * Keep vercel.json route headers and public/_headers in sync — see
 * src/lib/__tests__/htmlSecurityHeaders.test.ts.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://datafa.st https://cdn.paddle.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  [
    "connect-src 'self'",
    "https://wwgljhpuulhljumrhscg.supabase.co",
    "wss://wwgljhpuulhljumrhscg.supabase.co",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://googleads.g.doubleclick.net",
    "https://www.googleadservices.com",
    "https://datafa.st",
    "https://*.ingest.us.sentry.io",
    "https://*.ingest.sentry.io",
    "https://cdn.paddle.com",
    "https://checkout.paddle.com",
    "https://buy.paddle.com",
    "https://api.paddle.com",
    "https://sandbox-api.paddle.com",
  ].join(" "),
  "frame-src 'self' https://cdn.paddle.com https://checkout.paddle.com https://buy.paddle.com",
].join("; ");

export const HTML_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export function applyHtmlSecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(HTML_SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}
