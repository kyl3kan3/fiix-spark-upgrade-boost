# Demo Environment Build Plan (Execution Playbook)

This document turns the demo strategy into concrete build work inside the product.

## Goal

Create a repeatable, production-safe demo system that uses realistic seeded data and supports:

- Website self-guided tours.
- Recorded sales/marketing walkthroughs.
- Live sales demos without exposing customer production data.

## Locked decisions (confirmed)

- Target verticals: **Manufacturing + Facilities Management**.
- Primary channel for v1: **Homepage embedded interactive tour**.
- Primary CTA: **Start Free Trial** only (remove Book a Demo for now).
- Demo data realism: **Anonymized but realistic**.
- Environment scope: **Dedicated demo tenant only**.
- Weekly refresh owner: **Product** (storyline + dataset quality).

## Phase 1 — Demo tenant and safety rails

### Build tasks

1. Create a dedicated demo tenant/company (isolated from real customers).
2. Add a reset workflow that can restore demo data to a known baseline.
3. Ensure demo tenant cannot trigger live customer-facing side effects:
   - outbound notifications to real users
   - external billing mutations
   - third-party webhook sends

### Done criteria

- Demo tenant exists and login is validated.
- One-click reset runbook is documented.
- Side effects are verified disabled/sandboxed for demo tenant.

## Phase 2 — Realistic demo seed data

### Build tasks

1. Seed 20–30 assets with vertical-specific naming.
2. Seed a backlog of open/in-progress/completed work orders.
3. Seed technician assignments and due dates across multiple urgency levels.
4. Seed inventory/reorder scenarios for auto-deduct + low-stock narratives.
5. Seed enough historical data to avoid empty analytics states.

### Done criteria

- Dashboard has no empty states.
- Work order board has active, realistic backlog.
- Inventory includes at least 3 low-stock situations for demo storytelling.

## Phase 3 — Script-ready scenario states

### Build tasks

1. Preconfigure URLs/screens for the 2-minute demo path:
   - Analytics → Work Orders → Asset Detail → PM Scheduler → CTA
2. Ensure each screen has data required by voiceover claims.
3. Add a "pre-demo checklist" for reps before recording/live calls.

### Done criteria

- Team can run a full 2-minute walkthrough without improvising data.
- Every scripted claim is visible in UI at demo time.

## Phase 4 — Delivery channel packaging

### Build tasks

1. Website: capture interactive tour states (Navattic/Arcade).
2. Video: capture polished recording (Screen Studio/Loom).
3. Live demo: configure safe variable overrides (Demostory/Walnut).

### Done criteria

- One self-serve tour published.
- One 2-minute video cut finalized.
- One live call flow tested end-to-end.

## Immediate next implementation tasks

1. Build a demo seed pack aligned to manufacturing + facilities:
   - 20–30 assets with recognizable equipment/location naming.
   - 40+ work orders distributed across open / in-progress / completed.
   - realistic due-date spread and technician assignments.
2. Add dedicated demo-tenant reset tooling to restore baseline data quickly. ✅
3. Prepare homepage-tour-friendly route states so the product walkthrough always opens with populated dashboards and active workflows. ✅
4. Keep CTA paths singular and consistent with current strategy:
   - `Start Free Trial` only.

## Implemented foundation (in repo)

- Demo seeding script: `scripts/seed-demo-tenant.ts`.
- Demo reset script: `scripts/reset-demo-tenant.ts`.
- Demo verification script: `scripts/verify-demo-tenant.ts`.
- npm command: `npm run seed:demo`.
- npm command: `npm run reset:demo`.
- npm command: `npm run verify:demo`.
- Script seeds:
  - dedicated demo company (`Demo Ops - Manufacturing & Facilities`)
  - 24 realistic manufacturing/facilities assets
  - 48 work orders with varied status/priority and due-date spread
- Required environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DEMO_CREATED_BY_USER_ID`
- Optional environment variable:
  - `DEMO_ASSIGNED_TO_USER_ID`

## Homepage demo-run checklist (for Product owner)

Use this before publishing or recording homepage demos:

1. Run `npm run reset:demo` (with required env vars exported).
2. Confirm dashboard/work order pages show non-empty states.
3. Confirm low-stock scenarios are visible in inventory-related flows.
4. Confirm homepage CTA is only **Start Free Trial**.
5. Confirm demo tenant contains anonymized-but-realistic names only.
6. Follow `docs/homepage-demo-tour-runbook.md` for the canonical route flow.
