# Decision: expand `/compare/maintenease-vs-maintainx` (do not merge)

Date: 2026-07-25 · Status: staged for review, not published

## How the page is built (verified in the repo)

- Client-rendered SPA: Vite + React 18 + `react-router-dom`. No CMS or SSG.
- Route: `/compare/:slug` → `src/pages/ComparePage.tsx` (registered in `src/router/appRoutes.tsx`).
- Content source: `src/data/comparisons.ts` (one `Comparison` object per competitor).
- No-JS crawler output: `scripts/prerender.ts` writes a static `dist/compare/<slug>/index.html`
  from the same data (head tags + H1 + intro + sections).
- AI/agent mirror: `public/compare/maintenease-vs-maintainx.md`, listed in `public/llms.txt`.
- Discovery: URL present in `public/sitemap.xml`; linked from `/compare` (`src/pages/CompareIndex.tsx`).

## Why the audit saw ~5 words

The rendered page always had a table and short blurbs, but the MaintainX entry was the thinnest of
the five comparisons — a 2-sentence intro plus three generic one-line differentiators, all generated
from shared helpers (`makeRows`, `pricingFaq`, `affiliationFaq`, `migrationFaq`). For a text-only or
no-JS crawler, that is a handful of unique words: near-duplicate of the other four comparison pages.

## Expand, not merge — reasoning

1. **No stronger page covers the intent.** `/compare` is an index (links only), and
   `/cmms-cost-calculator` is a tool, not a MaintainX comparison. Merging would drop the
   query "maintenease vs maintainx" / "maintainx alternative" entirely.
2. **The URL is already established.** It is in the sitemap, `llms.txt`, the `.md` mirror, prerender
   output, and internal links. Redirecting would waste existing crawl equity for no gain.
3. **MaintainX is the highest-intent competitor in the set** (referenced across
   `FlatFeeAdvantage`, `CostCalculatorPage`, `FeaturesPage`, and the Semrush competitor defaults).
4. **The thinness was a content gap, not a structural one.** The renderer and data model already
   supported depth; only unique substance was missing.

Merging was rejected. Rewriting a redirect target would have removed a legitimately distinct,
already-indexed page.

## What changed

- `src/data/comparisons.ts` — added optional `sections`, `competitorTiers`, `bestFit`,
  `migrationSteps` to the `Comparison` type; filled them in for MaintainX only, plus a longer intro,
  four differentiators, and five extra FAQs.
- `src/pages/ComparePage.tsx` — renders the new blocks only when present (other comparisons render
  exactly as before).
- `scripts/prerender.ts` — includes `sections` in the no-JS body so crawlers see the long-form copy.
- `public/compare/maintenease-vs-maintainx.md` — mirror updated to match.

## Sourcing rules applied

- MaintenEase claims come from the project's own pricing/features/solutions content
  ($49/$129/$299 flat, 7-day trial, predictive maintenance, energy tracking, public request portal,
  inspections, AI assistant, MCP/agent API, free import & onboarding).
- MaintainX claims are limited to publicly listed plan names/prices and its publicly advertised
  procedure focus and free requesters, each hedged with "publicly listed as of 2026 — verify with the
  vendor". Nothing about either product is invented, and the page states plainly where MaintainX is
  the better choice.
- No credentials or secrets were read, written, or exposed.
