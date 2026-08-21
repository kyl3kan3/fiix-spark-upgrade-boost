# MaintenEase SEO edge routing

Verified: August 21, 2026

## Why this layer exists

The previous host served the homepage shell with HTTP 200 for unknown paths and did not execute `functions/_middleware.ts`. Client-side routing, a React `NotFound` component, a robots meta tag, and a static `404.html` cannot correct an already-issued HTTP status or add an HTTP response header.

`vercel.json` is therefore the deployment authority for document routing on Vercel. It preserves the known legacy redirects, serves private application deep links through the app shell with `X-Robots-Tag: noindex, nofollow`, lets real generated files pass through, and returns the built `404.html` with HTTP 404 and the same noindex header for every other document path.

The public-route allowlist is generated from `src/data/sitemapEntries.ts`. Public build-time HTML is emitted as real content in the ordinary document body, not only in `noscript`.

## Deployment

- Vercel project: `maintenease-seo-edge`
- Vercel scope: `kyl3kan3-6147s-projects`
- Production candidate: <https://maintenease-seo-edge.vercel.app>
- Deploy: `npx vercel deploy --prod --yes`
- HTTP regression: `npm run check:seo:http -- https://maintenease-seo-edge.vercel.app`

The regression command creates a new random path on every run, then verifies real 404/noindex behavior, private-route noindex headers, representative public pages, ordinary raw HTML, canonicals, and legacy redirect status codes.

## Custom-domain cutover

The Vercel project has ownership of and is attached to `maintenease.com`, but the apex DNS record still points to the previous host at `185.158.133.1`. As of the verification date, Vercel reports the domain as `invalid-configuration`.

At the current third-party DNS provider, replace the apex record with Vercel's current preferred apex pair:

```text
Type: A
Name: @
Value: 216.150.1.1

Type: A
Name: @
Value: 216.150.16.1
```

The Vercel project inspector also accepts the legacy anycast target `76.76.21.21`. Use the exact preferred records shown in the project's Domains settings at cutover if those instructions change. Do not leave the old `185.158.133.1` apex record in place alongside the Vercel targets.

After DNS propagation:

1. Run `npx vercel domains verify maintenease.com` until it reports a valid configuration.
2. Run `npm run check:seo:http -- https://maintenease.com`.
3. Crawl every URL in `https://maintenease.com/sitemap.xml` and confirm HTTP 200, a self-canonical, and indexable metadata.
4. Submit the sitemap and request validation/indexing in the verified Google Search Console property only after the live HTTP checks pass.

## Rollback

If the Vercel deployment fails its HTTP regression after cutover, restore the prior apex record `185.158.133.1` at the DNS provider while the defect is corrected. That rollback restores the old host and its known soft-404 behavior, so it is an availability rollback rather than an SEO-complete state.
