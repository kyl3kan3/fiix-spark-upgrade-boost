# Duplicate-content audit: the reported 48-URL group

Date: 2026-07-30
Status: staged for human review; no production deployment performed

## Evidence available in the project

The committed `public/sitemap.xml` at `HEAD` contains exactly 48 URLs. The live
`https://maintenease.com/sitemap.xml` also returned the same 48 URLs during this
review. No Google Search Console export, crawl log, or duplicate-content report
was present in the repository, so this sitemap is the only project-owned source
available for reconstructing the affected set.

The site is a Vite/React SPA using `react-router-dom`; it does not use a CMS.
`src/router/appRoutes.tsx` maps the public routes. File-backed content comes from
`src/data/solutions.ts`, `src/data/glossary.ts`, and
`src/data/comparisons.ts`; blog content is fetched from the existing blog data
source. `scripts/prerender.ts` writes route-specific crawler HTML to
`dist/<route>/index.html` after the Vite build.

An unknown path returned HTTP 200 with the exact homepage HTML during diagnosis.
That proves the static host's SPA fallback can create homepage duplicates for
unrecognized URLs. It does not describe the current output of the 48 sitemap
URLs: a GET crawl on 2026-07-30 found 48 self-referencing canonicals and 48
distinct normalized crawler-body hashes.

## Intent decision

No content URL in the 48-URL set should redirect to the homepage or another
content page. Each serves a distinct product, solution, glossary, comparison, or
article intent. `/auth` is a functional sign-in route rather than an organic
search landing page; the pending working-tree change marks it
`noindex,follow` and removes it from the generated sitemap.

| Routes | Count | Decision |
| --- | ---: | --- |
| Core and index pages | 10 | Keep self-canonical and distinct |
| `/auth` | 1 | Keep functional route; `noindex,follow`; omit from sitemap |
| Legal and compliance pages | 4 | Keep self-canonical and distinct |
| Solution detail pages | 7 | Keep; each targets a separate maintenance use case |
| Learn/glossary detail pages | 17 | Keep; each defines a separate term or metric |
| Competitor comparison detail pages | 5 | Keep; each targets a separate vendor comparison |
| Blog detail pages | 4 | Keep; each is a separate article |
| **Total** | **48** | |

The MaintainX comparison is not a placeholder and should not be consolidated.
Its project data and prerendered output contain MaintainX-specific pricing-model,
fit, procedure-workflow, migration, and FAQ content. The live crawler body had
1,214 normalized words at audit time, a self-canonical, and a body hash distinct
from the homepage and the other 46 content/search pages.

## The 48 URLs

### Core and index pages (10)

- `https://maintenease.com/`
- `https://maintenease.com/landing`
- `https://maintenease.com/maintenance-simplified`
- `https://maintenease.com/pricing`
- `https://maintenease.com/features`
- `https://maintenease.com/solutions`
- `https://maintenease.com/learn`
- `https://maintenease.com/blog`
- `https://maintenease.com/compare`
- `https://maintenease.com/cmms-cost-calculator`

### Functional route (1)

- `https://maintenease.com/auth`

### Legal and compliance pages (4)

- `https://maintenease.com/privacy`
- `https://maintenease.com/terms`
- `https://maintenease.com/refund-policy`
- `https://maintenease.com/sms-opt-in`

### Solution detail pages (7)

- `https://maintenease.com/solutions/work-order-software`
- `https://maintenease.com/solutions/preventive-maintenance-software`
- `https://maintenease.com/solutions/facility-maintenance-software`
- `https://maintenease.com/solutions/fleet-maintenance-software`
- `https://maintenease.com/solutions/maintenance-request-portal`
- `https://maintenease.com/solutions/asset-tracking-software`
- `https://maintenease.com/solutions/asset-management-software`

### Learn and glossary pages (17)

- `https://maintenease.com/learn/cmms`
- `https://maintenease.com/learn/preventive-maintenance`
- `https://maintenease.com/learn/work-order`
- `https://maintenease.com/learn/facility-maintenance`
- `https://maintenease.com/learn/fleet-maintenance`
- `https://maintenease.com/learn/mro`
- `https://maintenease.com/learn/building-maintenance`
- `https://maintenease.com/learn/property-maintenance`
- `https://maintenease.com/learn/reactive-maintenance`
- `https://maintenease.com/learn/predictive-maintenance`
- `https://maintenease.com/learn/corrective-maintenance`
- `https://maintenease.com/learn/condition-based-maintenance`
- `https://maintenease.com/learn/mtbf`
- `https://maintenease.com/learn/mttr`
- `https://maintenease.com/learn/cmms-benchmarks-2026`
- `https://maintenease.com/learn/cmms-roi`
- `https://maintenease.com/learn/root-cause-analysis`

### Comparison detail pages (5)

- `https://maintenease.com/compare/maintenease-vs-upkeep`
- `https://maintenease.com/compare/maintenease-vs-fiix`
- `https://maintenease.com/compare/maintenease-vs-maintainx`
- `https://maintenease.com/compare/maintenease-vs-limble`
- `https://maintenease.com/compare/maintenease-vs-emaint`

### Blog detail pages (4)

- `https://maintenease.com/blog/fixed-price-maintenance-software-ending-the-per-user-tax-in-2026`
- `https://maintenease.com/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026`
- `https://maintenease.com/blog/industrial-maintenance-optimization-the-2026-guide-to-maximum-uptime`
- `https://maintenease.com/blog/the-ultimate-guide-to-modern-work-order-management-in-2026`

## Verification contract

`scripts/audit-duplicate-content.mjs` now fails when any sitemap URL:

- lacks a built crawler document, title, description, H1, body, or canonical;
- does not return HTTP 200 in live mode;
- points its canonical at a different URL; or
- exposes crawler-facing body content identical to another sitemap URL.

It can audit the built output with `npm run check:duplicates` and perform the
equivalent GET re-crawl with `npm run check:duplicates -- --live`.
