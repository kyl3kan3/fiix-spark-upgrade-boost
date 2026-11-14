# MaintenEase

A CMMS (computerized maintenance management system) for small teams: work
orders, assets, locations, preventive-maintenance scheduling, checklists,
inspections, vendors, and team management — backed by Supabase with a
React/Vite front end.

Live site: https://maintenease.com
Lovable project: https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b
(changes made via Lovable are committed to this repo automatically).

## Stack

- **Vite + React 18 + TypeScript** — SPA with route-level code splitting
- **Supabase** — Postgres, auth, storage, edge functions (`supabase/`)
- **TanStack Query** — server state; components consume domain services via hooks
- **shadcn/ui + Tailwind CSS** — UI components and styling
- **Vitest + Testing Library** — unit/component tests
- **Sentry** — client error monitoring (see below)

## Getting started

```sh
npm install        # Node 20+; installs deps (xlsx comes from cdn.sheetjs.com)
npm run dev        # start the dev server (regenerates public/sitemap.xml first)
```

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Production build (also regenerates the sitemap) |
| `npm run typecheck` | `tsc --noEmit` against `tsconfig.app.json` |
| `npm run lint` | ESLint over the repo (warnings allowed, errors fail CI) |
| `npm test` | Vitest run |
| `npm run seed:demo` / `reset:demo` / `verify:demo` | Manage the demo tenant (see `docs/demo-environment-playbook.md`) |
| `npm run check:og` / `check:social` / `snapshot:meta` | Social-preview / metadata checks used by CI |

### Environment variables

The Supabase URL/publishable key are committed defaults in
`src/integrations/supabase/`. Optional overrides:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- `VITE_SENTRY_DSN` — per-environment Sentry project (optional; reporting is disabled when omitted)
- `VITE_APP_VERSION` — release tag for Sentry; CI sets this to the commit SHA
- `VITE_PAYMENTS_CLIENT_TOKEN` — payments/billing client token

## Code organization

```
src/
  pages/            # route components (see src/router/routeManifest.ts)
  components/       # feature UIs (workOrders, assets, calendar, team, …)
  services/         # ALL Supabase access lives here (enforced by lint rule)
  hooks/            # react-query hooks and shared logic
  integrations/     # supabase client + generated types
supabase/
  functions/        # edge functions
  migrations/       # SQL migrations (RLS policies included)
scripts/            # sitemap, demo tenant, and metadata-check scripts
```

Two conventions are enforced by ESLint:

1. Import the Supabase client only inside `src/services/**` or
   `src/integrations/**` — components/hooks/pages go through a domain
   service consumed via a react-query hook.
2. Resolve the current user/company through
   `src/services/supabaseHelpers.ts` (`requireUserCompany`, `getCurrentUser`,
   …) instead of calling `supabase.auth.getUser()` directly.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, tests, and the production
build on every PR. `meta-tests-pr.yml` runs metadata/OG regression tests and
posts a report comment; `social-preview-check.yml` validates social-card
images. All jobs install with `npm ci`, so keep `package-lock.json` in sync
with `package.json` when changing dependencies.

## Error monitoring (Sentry)

Client error reporting is opt-in through `VITE_SENTRY_DSN` and disabled in development.
The privacy filter retains standard error types and local asset stack positions only.
It discards error text, user identity, routes, request/response data, headers, breadcrumbs,
and other application context. Replay, tracing, automatic network collection, and
third-party marketing scripts are disabled. HTTP 500 exceptions are still reported.

## Deployment

Open the [Lovable project](https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b)
and click Share → Publish. Custom domains: Project → Settings → Domains
([docs](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)).
