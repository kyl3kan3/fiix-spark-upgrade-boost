# Public Request Portal + Urgent Lane

Give every company a branded public URL (e.g. `maintenease.com/r/acme-facilities`) they can link from their own website footer. Two submission types: **Standard request** and **Urgent — needs fixing now**. Drives backlinks (the original goal) and gives customers a real product surface.

## What gets built

### 1. Database — `public_requests` table
- Fields: `company_id`, `type` (`'standard' | 'urgent'`), `title`, `description`, `location_text`, `contact_name`, `contact_email`, `contact_phone`, `status` (`'new' | 'in_progress' | 'resolved'`), `submitter_ip`, `user_agent`
- Add `public_slug` (text, unique) to `companies` so each tenant has a stable, brandable URL. Auto-generate from name on first publish.
- RLS:
  - `anon + authenticated` can **INSERT** (rate-limited via edge function, not direct table grant — actually allow direct insert with a CHECK that required fields are non-empty and length-capped; rate limit handled via IP tracking + later cleanup if abused)
  - Company members can **SELECT / UPDATE** rows where `company_id = get_user_company(auth.uid())`
  - Admins can **DELETE**
- Index on `(company_id, status, created_at desc)` and `(company_id, type)` for the urgent filter.

### 2. Public submission page — `/r/:slug`
- Resolves slug → company; 404 if not found.
- Branded header: company logo + name (pulled from `companies` row).
- Two big buttons at top: **Submit a request** / **Urgent — needs fixing now** (red, prominent).
- Form fields: title, description, location (free text), your name, email, phone (optional). Zod-validated client + length caps.
- On submit → insert into `public_requests` with chosen `type`. Success state: "Thanks — the team has been notified."
- If `type === 'urgent'`, edge function fires a notification (email + push to admins/managers of that company) via existing `notify-event` infra.
- SEO: unique title/description per company, `noindex` (these are tenant portals, not search-targets), canonical to the company's own URL.

### 3. In-app inbox — `/requests`
- New sidebar entry under work management.
- List view: filter by `type` (all / urgent / standard) and `status`. Urgent rows badged red.
- Row actions: convert to work order (prefills WO form with request data), mark resolved, delete.
- Empty state explains the public URL and how to share it.

### 4. Marketing surface
- **Landing page (`/`):** new section "Give your customers a way to report problems" — screenshot of the portal, highlight the urgent lane, CTA "Get your branded portal".
- **Solutions/Work Order page:** add the portal as a listed feature.
- **New `/solutions/maintenance-request-portal` page** (data row in `src/data/solutions.ts`) — targets "maintenance request software" / "public maintenance request form" keywords.
- Footer link under Product → "Request portal".
- Settings page gets a "Public request portal" card showing the live URL with copy button + embed-link snippet for customers' own sites.

## Technical details

```text
public route:           /r/:slug                  → PublicRequestPortal.tsx
in-app inbox:           /requests                 → RequestsInboxPage.tsx
marketing landing:      / (new section)           → Hero or new component
new solution page:      /solutions/maintenance-request-portal
settings card:          existing Settings page
```

- New table `public_requests` + `companies.public_slug` column via migration.
- Slug generation: lowercase, hyphenated, with random 4-char suffix on collision.
- Anonymous insert RLS: `WITH CHECK (company_id IS NOT NULL AND length(title) BETWEEN 1 AND 200 AND length(description) <= 5000)`.
- Urgent notification: reuse `notify-event` edge function with new `event_type = 'urgent_public_request'`; admins/managers receive email + push.
- Sitemap: add `/solutions/maintenance-request-portal`; do NOT add `/r/*` (tenant pages, noindex).

## Not in scope

- Captcha / abuse protection beyond simple length caps and IP logging (can add hCaptcha later if spam hits).
- Customer-facing status tracking page ("see where my request is").
- Multi-language portal.

Approve and I'll ship it.
