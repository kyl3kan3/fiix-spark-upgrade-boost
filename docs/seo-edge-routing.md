# MaintenEase SEO edge routing

Verified: August 28, 2026

## Why this layer exists

The previous host served the homepage shell with HTTP 200 for unknown paths and did not execute `functions/_middleware.ts`. Client-side routing, a React `NotFound` component, a robots meta tag, and a static `404.html` cannot correct an already-issued HTTP status or add an HTTP response header.

`vercel.json` is therefore the deployment authority for document routing on Vercel. It preserves the known legacy redirects, serves private application deep links through the HTML-suffixed app shell with `X-Robots-Tag: noindex, nofollow`, lets real generated files pass through, and returns the built `404.html` with HTTP 404 and the same noindex header for every other document path. The `.html` suffix is deliberate: it gives Vercel an unambiguous HTML artifact and prevents protected routes such as `/auth` from being served as `application/octet-stream`.

Fingerprinted build assets live under `/static/*` (see `vite.config.ts` `build.assetsDir`). Long-lived `Cache-Control` for `/static/*`, `/favicon.png`, `/favicon.ico`, and `/og-image.png` is set in **both** the top-level `headers` array and matching `routes` entries with `"continue": true` before `{ "handle": "filesystem" }`. Vercel does not reliably apply top-level `headers` to files served through legacy `routes` + filesystem, so the route-level rules are required for production.

HTML document responses (marketing pages, homepage, app shell, and `404.html`) ship baseline security headers from `src/lib/htmlSecurityHeaders.ts`, applied via a catch-all `routes` entry with `"continue": true`, duplicated on the app-shell and 404 terminal routes, root `middleware.ts`, `functions/_middleware.ts` (Cloudflare fallback), and `public/_headers`. The CSP allowlist matches live third parties: GTM/Google Ads, DataFast, Google Fonts, Supabase, Paddle checkout, and Sentry ingest.

The root `middleware.ts` is the Vercel Routing Middleware authority for representation discovery. It advertises the public AI surfaces through response `Link` headers, negotiates `text/markdown` only when explicitly requested, assigns correct media types to extensionless `.well-known` documents, and records coarse crawler labels without logging raw user agents or IP addresses. `functions/_middleware.ts` retains equivalent behavior for Cloudflare preview/fallback deployments.

The public-route allowlist is generated from `src/data/sitemapEntries.ts`. Public build-time HTML is emitted as real content in the ordinary document body, not only in `noscript`.

## Deployment

- Vercel project: `maintenease-seo-edge`
- Vercel scope: `kyl3kan3-6147s-projects`
- Production domain: <https://maintenease.com>
- Vercel alias: <https://maintenease-seo-edge.vercel.app>
- Deploy: `npx vercel deploy --prod --yes`
- HTTP regression: `npm run check:seo:http -- https://maintenease.com`

The regression command creates a new random path on every run, then verifies real 404/noindex behavior, private-route noindex headers, representative public pages, ordinary raw HTML, canonicals, and legacy redirect status codes.

## Custom-domain routing

The production cutover completed on August 22, 2026. Lovable remains the authoring and preview environment, while Vercel serves the public custom domain and applies the HTTP routing in this repository.

The apex uses the project-recommended Vercel records:

```text
Type: A
Name: @
Value: 216.150.1.1

Type: A
Name: @
Value: 216.150.16.1
```

`www.maintenease.com` uses the project-specific CNAME `a676d9c257b95208.vercel-dns-016.com`. Vercel's domain-level configuration returns a permanent 308 redirect to the apex while preserving the path and query string. The regression suite checks that redirect directly; it is intentionally not duplicated in `vercel.json`.

### www two-hop redirect (dashboard playbook)

Verified live (September 2026):

```text
http://www.maintenease.com/  → 308 → https://www.maintenease.com/
https://www.maintenease.com/ → 308 → https://maintenease.com/
```

Vercel always upgrades HTTP to HTTPS on the **requested hostname** before applying the www→apex redirect. There is no safe `vercel.json` rewrite that can collapse those into one hop without breaking TLS on `www`.

**Project:** `maintenease-seo-edge` (team `kyl3kan3-6147s-projects`)

**Confirm current domain wiring (Vercel dashboard):**

1. Open [Vercel → maintenease-seo-edge → Settings → Domains](https://vercel.com/kyl3kan3-6147s-projects/maintenease-seo-edge/settings/domains).
2. `maintenease.com` must be the **primary** production domain (Valid Configuration).
3. `www.maintenease.com` must be present with action **Redirect to maintenease.com** (308), not “serve on www”.
4. DNS for `www` stays the project CNAME `a676d9c257b95208.vercel-dns-016.com` (do not point `www` at the apex A records).

**Optional single-hop from `http://www` (DNS provider only):**

If the DNS provider supports an HTTP redirect record (sometimes called “URL redirect”, “forwarding”, or “web redirect”), point `http://www.maintenease.com` directly to `https://maintenease.com` **outside** Vercel. Keep the Vercel CNAME for `https://www` so the second hop still works for clients that request HTTPS on `www`. Many registrars cannot do this while also terminating TLS on Vercel; when in doubt, keep the two-hop chain — it is permanent (308) and SEO-safe.

**Post-change verification:**

```bash
curl -sI http://www.maintenease.com/ | sed -n '1,5p'
curl -sI https://www.maintenease.com/ | sed -n '1,5p'
npm run check:seo:http -- https://maintenease.com
```

Expected after dashboard review: `https://www` still 308 → `https://maintenease.com` with path/query preserved; apex HTML responses include `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.

All unrelated DNS records, including MX, SPF, DKIM, DMARC, verification records, service subdomains, and Lovable verification TXT records, remain at the DNS provider. Vercel reports both apex and `www` as valid configurations, and both hostnames have valid TLS.

Post-deployment verification:

1. Run `npx vercel domains verify maintenease.com` until it reports a valid configuration.
2. Run `npx vercel domains verify www.maintenease.com` and confirm the project-specific CNAME.
3. Run `npm run check:seo:http -- https://maintenease.com`.
4. Crawl every URL in `https://maintenease.com/sitemap.xml` and confirm HTTP 200, a self-canonical, and indexable metadata.
5. Submit the sitemap and request validation/indexing in the verified Google Search Console property only after the live HTTP checks pass.

## Rollback

If a future Vercel deployment fails its HTTP regression, roll back the deployment in Vercel first. The prior hosting records were apex A `185.158.133.1` and `www` A `185.158.133.1`; restoring them would also restore the old host's known soft-404 behavior, so DNS rollback is an availability-only last resort rather than an SEO-complete state.
