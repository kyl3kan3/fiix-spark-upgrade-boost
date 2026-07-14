// Cloudflare Pages middleware — runs at the edge for every non-static request.
// Reports bot/crawler hits to DataFast (server-side; the browser tag only sees humans).
//
// Setup (one-time):
// 1. Point maintenease.com DNS through Cloudflare (proxied / orange cloud) and
//    connect the domain to a Cloudflare Pages project that proxies to the
//    Lovable origin, OR deploy the built `dist/` directly to Cloudflare Pages.
// 2. Cloudflare Pages auto-detects this `functions/` directory and bundles it.
// 3. `public/_routes.json` (already in this repo) tells Pages to skip static
//    assets so this Function only fires for HTML / crawler-facing files.
import { trackAICrawlerRequest } from "@datafast/ai-crawl";

// Same websiteId as the browser script in index.html.
const WEBSITE_ID = "dfid_4BRVKzjIQLv5Psqg0AK9u";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function onRequest(context: any) {
  // Fire-and-forget: never await, so the response is never delayed.
  // Cloudflare's context.waitUntil is used internally by the package.
  try {
    trackAICrawlerRequest(context.request, context, {
      websiteId: WEBSITE_ID,
    });
  } catch {
    // Tracking must never break the response.
  }

  return context.next();
}