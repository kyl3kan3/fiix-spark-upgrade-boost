# MaintenEase SEO edge routing

Verified: August 22, 2026

## Why this layer exists

The previous host served the homepage shell with HTTP 200 for unknown paths and did not execute `functions/_middleware.ts`. Client-side routing, a React `NotFound` component, a robots meta tag, and a static `404.html` cannot correct an already-issued HTTP status or add an HTTP response header.

`vercel.json` is therefore the deployment authority for document routing on Vercel. It preserves the known legacy redirects, serves private application deep links through the app shell with `X-Robots-Tag: noindex, nofollow`, lets real generated files pass through, and returns the built `404.html` with HTTP 404 and the same noindex header for every other document path.

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

All unrelated DNS records, including MX, SPF, DKIM, DMARC, verification records, service subdomains, and Lovable verification TXT records, remain at the DNS provider. Vercel reports both apex and `www` as valid configurations, and both hostnames have valid TLS.

Post-deployment verification:

1. Run `npx vercel domains verify maintenease.com` until it reports a valid configuration.
2. Run `npx vercel domains verify www.maintenease.com` and confirm the project-specific CNAME.
3. Run `npm run check:seo:http -- https://maintenease.com`.
4. Crawl every URL in `https://maintenease.com/sitemap.xml` and confirm HTTP 200, a self-canonical, and indexable metadata.
5. Submit the sitemap and request validation/indexing in the verified Google Search Console property only after the live HTTP checks pass.

## Rollback

If a future Vercel deployment fails its HTTP regression, roll back the deployment in Vercel first. The prior hosting records were apex A `185.158.133.1` and `www` A `185.158.133.1`; restoring them would also restore the old host's known soft-404 behavior, so DNS rollback is an availability-only last resort rather than an SEO-complete state.
