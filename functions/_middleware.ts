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
import { classifySeoPath, redirectForPath } from "../src/lib/seoRouting";

// Same websiteId as the browser script in index.html.
const WEBSITE_ID = "dfid_4BRVKzjIQLv5Psqg0AK9u";

// RFC 8288 Link headers advertising agent-discovery resources.
const AGENT_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</api/ai.json>; rel="service-desc"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json"',
  '</auth.md>; rel="author"; type="text/markdown"',
].join(", ");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function onRequest(context: any) {
  const requestUrl = new URL(context.request.url);
  // Fire-and-forget: never await, so the response is never delayed.
  // Cloudflare's context.waitUntil is used internally by the package.
  try {
    trackAICrawlerRequest(context.request, context, {
      websiteId: WEBSITE_ID,
    });
  } catch {
    // Tracking must never break the response.
  }

  const isDocumentRequest = context.request.method === "GET" || context.request.method === "HEAD";
  const redirect = redirectForPath(requestUrl.pathname);
  if (redirect && isDocumentRequest) {
    return Response.redirect(new URL(redirect.location, requestUrl.origin), redirect.status);
  }

  const routeKind = classifySeoPath(requestUrl.pathname);
  const useAppShell = routeKind === "noindex" && requestUrl.pathname !== "/auth" && isDocumentRequest;
  const appShellRequest = useAppShell
    ? new Request(new URL("/app-shell", requestUrl.origin), context.request)
    : undefined;
  const response = await context.next(appShellRequest);

  try {
    const headers = new Headers(response.headers);
    let changed = false;

    // Advertise agent-discovery resources on HTML documents.
    if ((headers.get("content-type") ?? "").includes("text/html")) {
      headers.append("Link", AGENT_LINKS);
      const isNotFound = routeKind === "not-found" || response.status >= 400;
      if (routeKind === "noindex" || isNotFound) {
        headers.set("X-Robots-Tag", "noindex, nofollow");
      }
      changed = true;

      if (isNotFound && response.status < 400) {
        return new Response(response.body, {
          status: 404,
          statusText: "Not Found",
          headers,
        });
      }
    }

    if (changed) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  } catch {
    // Header tagging must never break the response.
  }

  return response;
}
