# Google Search Console baseline — August 21, 2026

Property: `sc-domain:maintenease.com`

This snapshot was read directly from the verified Google Search Console property. It is the pre-cutover baseline for the SEO edge deployment documented in `docs/seo-edge-routing.md`.

## Submission state

- Submitted sitemap: `https://maintenease.com/sitemap.xml`
- Submitted: August 16, 2026
- Last read: August 16, 2026
- Status: Success
- Discovered pages: 64
- Current custom-domain sitemap at capture time: 68 URLs
- Intended post-cutover sitemap: 70 URLs

The sitemap was not resubmitted during this capture. The custom domain still resolved to the previous host, whose live sitemap contained 68 URLs and whose unknown/private/redirect HTTP behavior failed the SEO routing regression. Submitting before the DNS cutover would ask Google to refresh the obsolete deployment.

## Page indexing

Report last updated: August 16, 2026

- Indexed: 60
- Not indexed: 19 across five reasons

| Reason | Pages | Interpretation at capture time |
|---|---:|---|
| Page with redirect | 6 | Expected protocol, `www`, signup, SMS, and application-route variants. Do not validate as an error while the redirects are intentional. |
| Alternate page with proper canonical tag | 4 | Expected tracking-query and signup-query variants. |
| Excluded by `noindex` | 2 | Expected private routes: `/settings/notifications` and `/auth`. |
| Crawled — currently not indexed | 2 | Report examples were `/support` and `/landing`; direct URL Inspection now says `/support` is indexed. `/landing` intentionally consolidates to the homepage canonical. |
| Discovered — currently not indexed | 5 | Report examples were the 2026 work-order blog post, `/facility-management`, `/learn/deferred-maintenance`, `/maintenance-simplified`, and `/solutions/preventive-maintenance-software`. Direct URL Inspection now says `/facility-management` is indexed, showing that the report is lagging. |

Direct URL Inspection observations:

- `/learn/preventive-maintenance`: on Google, indexed, HTTPS, one valid breadcrumb item.
- `/facility-management`: on Google and indexed.
- `/support`: on Google and indexed.
- `/about`: unknown to Google, no referring sitemap detected. This is expected until the 70-URL deployment is live on the custom domain.

## Web search performance

Date range: May 23 through August 20, 2026

| Segment | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| All web search | 14 | 22,907 | 0.1% | 70.2 |
| Branded regex: `maintenease|maintenance ease|mainten ease` | 1 | 13 | 7.7% | 20.9 |
| Non-branded, calculated from totals | 13 | 22,894 | about 0.06% | Not derivable by subtraction |

Top visible non-branded query rows by impressions included `fleet maintenance` (796), `condition based maintenance` (736), `corrective maintenance` (480), `cmms` (433), `facility maintenance` (427), `work order management software` (385), and `work order software` (371).

Top visible page rows included:

| Page | Clicks | Impressions |
|---|---:|---:|
| `/templates/maintenance-log-template` | 3 | 61 |
| `/templates` | 3 | 18 |
| `/compare/maintenease-vs-maintainx` | 2 | 514 |
| `/` | 2 | 199 |
| `/learn/condition-based-maintenance` | 1 | 1,648 |
| `/learn/fleet-maintenance` | 1 | 1,179 |
| `/solutions/work-order-software` | 0 | 4,652 |
| `/learn/cmms` | 0 | 2,646 |

The high-impression, zero/low-click pages are measurement priorities after the hosting cutover. This baseline does not establish that content changes caused later movement.

## Experience and enforcement

- Core Web Vitals source: Chrome UX Report.
- Mobile: not enough usage data in the prior 90 days.
- Desktop: not enough usage data in the prior 90 days.
- Manual actions: no issues detected.
- Security issues: no issues detected.

## Post-cutover Search Console receipt — August 22, 2026

These actions were taken only after the custom domain passed the live HTTP regression and all 70 sitemap URLs returned HTTP 200 with self-canonicals, indexable headers, meaningful ordinary HTML, and valid structured data.

### Sitemap

- A first attempt using the relative value `sitemap.xml` returned Google's `Invalid sitemap address` response and did not submit anything.
- Submitting the full URL `https://maintenease.com/sitemap.xml` returned `Sitemap submitted successfully`.
- The Search Console table then showed `Submitted: Aug 22, 2026` and `Status: Success`.
- `Last read: Aug 16, 2026` and `Discovered pages: 64` remained the prior processing result immediately after submission. The live file contained 70 URLs; Google had not yet reprocessed it, so 70 discovered pages must not be claimed yet.

### Priority URL Inspection and recrawl requests

| URL | Google index snapshot before request | Google's request response |
|---|---|---|
| `https://maintenease.com/about` | `URL is not on Google`; `Discovered - currently not indexed`; sitemap recognized; last crawl `N/A` | `Indexing requested`; URL added to a priority crawl queue. |
| `https://maintenease.com/editorial-policy` | `URL is not on Google`; `Discovered - currently not indexed`; sitemap recognized; last crawl `N/A` | `Indexing requested`; URL added to a priority crawl queue. |
| `https://maintenease.com/learn/preventive-maintenance` | `URL is on Google`; page indexed; HTTPS valid; one valid breadcrumb item | `Indexing requested`; URL added to a priority crawl queue. |
| `https://maintenease.com/learn/total-productive-maintenance` | `URL is on Google`; page indexed; HTTPS valid; two valid breadcrumb items | `Indexing requested`; URL added to a priority crawl queue. |
| `https://maintenease.com/facility-management` | `URL is on Google`; page indexed; HTTPS valid | `Indexing requested`; URL added to a priority crawl queue. |

Google's confirmation also states that submitting a page multiple times does not change its queue position or priority. No duplicate requests were sent, and no unchanged URLs were submitted.

### Follow-up

1. Recheck sitemap last-read time and discovered-page count after Google processes the August 22 submission.
2. Recheck `/about` and `/editorial-policy` after Google crawls them; a queue confirmation is not an indexing guarantee.
3. Inspect remaining legitimate public examples from the discovered-not-indexed report only when a material page change or new live evidence justifies it.
4. Do not start validation for intentional redirects, private `noindex` routes, or tracking-query canonical variants.
5. Compare page indexing, branded/non-branded performance, and query/page overlap against this baseline after recrawl. Do not infer ranking gains from the submission itself.
