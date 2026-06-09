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
- `VITE_SENTRY_DSN` — per-environment Sentry project (a default DSN is hard-coded)
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

Client errors are reported to Sentry from `src/lib/sentry.ts`. Reporting is
disabled in development and active in any non-dev build.

Every event is tagged with:

- `route` — current pathname (kept in sync by `SentryContextSync`)
- `session_id` — stable per-tab id (survives navigation, resets on reload)
- `user.id` / `user.email` — when authenticated, `anon:<sessionId>` otherwise
- `release` — from `VITE_APP_VERSION` (CI sets this to the commit SHA)

Network failures (5xx / fetch errors) carry the request URL, method, status,
and response headers via `httpClientIntegration`. For thrown errors inside
service code, prefer:

```ts
import { captureApiError } from "@/lib/sentry";

try {
  // ...fetch / supabase call
} catch (err) {
  captureApiError(err, { method: "POST", url, status, body, response });
  throw err;
}
```

### Releases & alerting

CI sets `VITE_APP_VERSION=${{ github.sha }}` on every build, so each deploy
shows up as a distinct release in Sentry → Releases with crash-free session
and user metrics.

To get notified about production error spikes, create these alerts in the
Sentry UI (Alerts → Create Alert → Issues):

1. **New issue in production** — `event.type:error environment:production`,
   trigger: a new issue is created, action: email / Slack.
2. **Error spike** — Metric alert on `event.count`, filter
   `environment:production level:error`, threshold: `> 20 events in 5m`.
3. **Regression** — trigger: an issue changes state to `regressed`.

The default DSN is hard-coded; override per environment with
`VITE_SENTRY_DSN` if you need a separate Sentry project.

## Deployment

Open the [Lovable project](https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b)
and click Share → Publish. Custom domains: Project → Settings → Domains
([docs](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)).
