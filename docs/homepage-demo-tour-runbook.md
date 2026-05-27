# Homepage Demo Tour Runbook

This runbook standardizes the exact path for the homepage interactive tour and recorded walkthroughs.

## Before every run

1. Run `npm run reset:demo`.
2. Run `npm run verify:demo`.
3. Sign in as demo user and confirm CTA path is **Start Free Trial** only.

## Canonical 2-minute route flow

1. `/dashboard` — open analytics overview with populated KPI charts.
2. `/work-orders` — show active backlog and assignment workflow.
3. `/assets` then open one asset detail page — show history/docs context.
4. `/maintenance` — show preventive maintenance scheduler state.
5. `/` — return to homepage and end on **Get started free** CTA.

## Recording checks

- No customer-identifiable names/emails.
- No empty states in dashboard/work-order scenes.
- Inventory/low-stock narrative present in work-order flow.
- Browser chrome hidden (full-screen capture).
