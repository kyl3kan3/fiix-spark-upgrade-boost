## Goal

Create a true guided setup experience consisting of three connected pieces, with progress persisted per-user in Supabase, available automatically for new users and re-runnable from the Help menu.

## What you'll get

1. **Improved /setup wizard** — same 9 steps, but with helper text, illustrations, validation, "Save & Continue Later", and a sidebar checklist showing where you are.
2. **Post-setup product tour** — a coach-mark overlay walking through Dashboard, Assets, Work Orders, Locations, Vendors, Team, and Reports. Built with `react-joyride`.
3. **Dashboard onboarding checklist** — a dismissible widget on the dashboard showing tasks like "Add your first location", "Add your first asset", "Invite a teammate", "Create your first work order", with live progress and one-click navigation to each.

All three read/write from a single `onboarding_progress` table so they stay in sync.

## Database changes (one migration)

New table `public.onboarding_progress`:

```text
id              uuid pk default gen_random_uuid()
user_id         uuid not null  (one row per user)
company_id      uuid not null
wizard_step     int  default 0
wizard_complete boolean default false
tour_complete   boolean default false
checklist_dismissed boolean default false
tasks_completed jsonb default '{}'  (e.g. {"first_location": true, "first_asset": false, ...})
updated_at      timestamptz default now()
unique (user_id)
```

RLS policies (multi-tenant, per memory rules):
- SELECT/INSERT/UPDATE: `user_id = auth.uid() AND company_id = get_user_company(auth.uid())`
- No DELETE policy.

Trigger to auto-update `updated_at`.

## Frontend additions

**New files**
- `src/hooks/onboarding/useOnboardingProgress.ts` — fetch/update the row, exposes `progress`, `markTask(name)`, `setWizardStep(n)`, `completeTour()`, `dismissChecklist()`.
- `src/components/onboarding/GuidedTour.tsx` — `react-joyride` provider with steps targeting `[data-tour="dashboard-stats"]`, `[data-tour="nav-assets"]`, etc.
- `src/components/onboarding/OnboardingChecklist.tsx` — dashboard widget: 5 tasks with progress bar, dismiss button, "Take the tour" / "Resume setup" links.
- `src/components/onboarding/TourTrigger.tsx` — "Take a tour" menu item used in the Help menu.
- `src/services/onboarding/onboardingService.ts` — typed CRUD for the new table.

**Edited files**
- `src/components/setup/SetupContent.tsx` — load `wizard_step` from DB, save on every nav, add a left sidebar showing all 9 steps (clickable), add "Save & exit" button.
- `src/components/setup/SetupProgress.tsx` — switch to a step-list with check icons + estimated time per step.
- Each `*Setup.tsx` step (CompanyInfo, UserRoles, AssetCategories, Locations, MaintenanceSchedule, Notifications, Integrations, DashboardCustomization) — add a short helper paragraph and an illustration/icon header for guidance.
- `src/pages/Dashboard.tsx` — render `<OnboardingChecklist />` at the top when `wizard_complete && !checklist_dismissed`.
- `src/pages/Dashboard.tsx` + first nav items — add `data-tour` attributes for joyride targets.
- `src/components/help/components/HelpTabs.tsx` (or top-level Help) — add "Re-run setup" and "Take product tour" buttons.
- `src/router/appRoutes.tsx` — mount `<GuidedTour />` once inside the authed layout so it can be triggered from anywhere.
- Auto-trigger tour: when `wizard_complete && !tour_complete && route === /dashboard`, start joyride.

**Task auto-completion**
The checklist watches existing data via React Query:
- `first_location` → `locations` count > 0
- `first_asset` → `assets` count > 0
- `first_vendor` → `vendors` count > 0
- `first_work_order` → `work_orders` count > 0
- `invited_teammate` → `organization_invitations` or 2nd `profiles` row in company

When a count flips to >0, write `tasks_completed[name] = true`.

## Dependency

Add `react-joyride` (~110KB, MIT, well-maintained).

## Out of scope

- No changes to existing auth/onboarding form (`/onboarding`) flow — it stays as the very first step after signup.
- No email reminders for incomplete setup (can be added later).

## Acceptance

- New user signs up → onboarding form → /setup with new sidebar + helper text → progress persists if they refresh → on completion, lands on dashboard with checklist + auto tour → can re-launch tour or wizard from Help.
- Existing users with `wizard_complete = false` (default) see the checklist on next dashboard visit.
- Dismissed checklist stays dismissed across sessions.
