# MaintenEase organic content consolidation map

Prepared: 2026-08-16
Market: United States

## Canonical hubs

| Search intent | Canonical URL | Role | Supporting paths |
|---|---|---|---|
| Preventive maintenance | `/learn/preventive-maintenance` | Definitive guide, implementation playbook, scheduling methods, examples, calculator, and template gateway | `/templates/preventive-maintenance-checklist`, `/solutions/preventive-maintenance-software`, `/learn/predictive-maintenance` |
| Total productive maintenance | `/learn/total-productive-maintenance` | TPM pillar, eight pillars, 30/60/90 plan, calculations, audit worksheet, and comparison framework | `/learn/preventive-maintenance`, `/learn/mtbf`, `/learn/mttr`, `/learn/work-order` |
| Facility management | `/facility-management` | Navigational hub for facilities operations, maintenance, compliance, space, vendors, KPIs, and software selection | `/learn/facility-maintenance`, `/learn/asset-management`, `/learn/work-order`, `/learn/cmms` |
| Maintenance management systems | `/learn/cmms` | CMMS category and buyer's guide aligned to the broader phrase “maintenance management systems” | `/cmms`, `/cmms-pricing`, `/compare`, `/solutions` |
| Work order template Word | `/templates/work-order-template` | Download landing page for DOCX, PDF, XLSX, and CSV formats | `/learn/work-order`, `/learn/work-order-management`, `/learn/work-order-software` |
| UpKeep pricing and comparison | `/compare/maintenease-vs-upkeep` | Dated commercial comparison with verified plan structure, limits, and migration considerations | `/compare`, `/cmms-pricing` |

## Consolidation decisions

- The existing `/learn/preventive-maintenance` URL remains canonical and was substantially upgraded. No second definition page was created.
- `/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026` now redirects permanently to the canonical preventive-maintenance guide and is excluded from generated sitemap and prerender output.
- `/learn/cmms` owns informational and category intent for “maintenance management systems.” Product, pricing, and comparison pages support it without repeating a second generic definition.
- The facility-management page is a route map, not a long glossary entry. Its cards and task-oriented sections lead to narrower operational resources.
- TPM is a distinct pillar because its organizational model, eight-pillar framework, and OEE-driven implementation intent are materially different from preventive maintenance.

## Cannibalization guardrails

1. Keep one indexable definition/pillar page per primary keyword above.
2. Give supporting pages narrower titles and introductions; link back to the owning hub with descriptive anchor text.
3. Redirect retired overlaps before removing them from sitemap and prerender feeds.
4. Review Google Search Console query-to-page pairs monthly. Investigate when two MaintenEase URLs each receive meaningful impressions for the same non-branded query over four consecutive weeks.
5. Consolidate the weaker page when its intent is substantially identical. Preserve a separate page only when it satisfies a distinct task such as downloading a template, evaluating software, or implementing a specific maintenance method.

## Measurement contract

| Outcome | Signal | Recommended reporting dimension |
|---|---|---|
| Non-branded discovery | Search Console clicks and impressions | Canonical hub, query cluster, device |
| Template demand | `lead_submit` and `template_download` events | `page_slug`, `template_slug`, `format` |
| Calculator use | `calculator_complete` | `page_slug=preventive-maintenance`, PM load band |
| Product interest | Demo CTA clicks and demo starts | Source hub, CTA location, returning/new visitor |
| Assisted conversion | CRM opportunity or paid conversion with content touch | First content touch, last content touch, days to conversion |

Use the page slug as the stable join key across analytics, Search Console exports, and CRM attribution. Report major hubs separately from support pages so growth is not hidden by aggregate learn-library traffic.
