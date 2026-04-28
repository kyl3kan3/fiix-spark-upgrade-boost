# Full Simplicity Pass — Flows + Required Connections

## What this app actually does

MaintenEase is a **maintenance management app for non-technical workers** (janitors, building maintenance, facility techs). The core jobs-to-be-done are tiny:

1. **Report a problem** (something broke) → creates a Job
2. **Do my jobs today** (see assigned work, mark done)
3. **Run a check-up** (walk-through / safety inspection from a checklist)
4. **Schedule recurring upkeep** (preventive maintenance)
5. **Know what equipment & places I'm responsible for**
6. **Get notified** when something needs me (push / SMS / email)

Everything else (Vendors, Reports, Team, Locations hierarchy, Calendar logs, Checklists vs Inspections distinction, Maintenance Preventive/Unplanned tabs) is secondary — and right now it competes with the core flow and confuses the worker.

---

## Biggest problems found in this pass

### 1. Two near-identical concepts: "Check-Ups" and "Checklists"
- `/inspections` and `/checklists` are separate top-level menu items with separate pages, separate forms, separate submissions.
- For a maintenance worker these are the same thing: *"a list of things to walk through and tick off."*
- Result: the worker doesn't know which one to open.

### 2. Two near-identical concepts: "My Jobs" and "Repairs"
- `/work-orders` (My Jobs) and `/maintenance` (Repairs, with Preventive/Unplanned tabs) overlap heavily.
- A work order *is* a repair. The Maintenance page is really just "scheduled vs. ad-hoc work orders."
- This duplicates the menu and the mental model.

### 3. The "New Job" form is intimidating
- 7 fields shown at once: Title, Description, Priority, Status, Due date, Asset, Assignee.
- A worker reporting a leaky tap shouldn't have to pick a Status ("pending/in_progress/completed/cancelled"), assign themselves, or know what an "asset" is.
- "urgent / high / medium / low" + "in_progress" wording is technical.

### 4. Inconsistent page shells (still!)
Pages still using the old `BackToDashboard` + raw `<h1>` pattern instead of `PageHeader`:
- Calendar, AssetFormPage, NewInspectionPage, LocationsPage, ProfilePage, SetupPage, Settings, VendorsPage, VendorImportPage, Team, WorkOrderFormPage.
- Reports still has `code="RPT · 001"` and "Throughput, downtime, and crew utilization" — pure jargon.
- Maintenance still has `code="MNT · 001"`.

### 5. The `New Inspection` form is fake
`NewInspectionForm.tsx` → on submit only does `toast.success` and navigates. It never saves. A worker filling that out will lose their data.

### 6. Notifications won't actually reach the worker
The app *calls* `send-email`, `send-sms`, `send-push` edge functions but:
- `send-email` needs a **Resend** connection (`RESEND_API_KEY`) — not connected.
- `send-sms` needs **Twilio** — not connected.
- `send-push` needs **VAPID keys / FCM** — not connected.
The whole point of "you'll get notified when a job comes in" silently fails today.

### 7. Mobile is the primary device, but quick-actions & forms aren't optimized
- Mobile bottom nav is fine, but the "Report a Problem" path takes 3 taps then a long form. Should be 1 tap → 30-second flow.
- No camera/photo capture for "Report a problem" (the worker's most natural input is a photo of the broken thing).

---

## The fix — flow by flow

### Flow A: "Report a problem" (the #1 flow)

Today: dashboard → big button → 7-field form → save.

Make it a 3-step wizard, mobile-first:

```text
Step 1 of 3                           Step 2 of 3                Step 3 of 3
┌─────────────────────┐               ┌──────────────────┐       ┌──────────────────┐
│ What's wrong?       │               │ Where is it?     │       │ How urgent?      │
│                     │               │                  │       │                  │
│ [ big text box   ]  │   →           │ [ pick a place ] │  →    │ ( ) Whenever     │
│                     │               │ [ pick equipment]│       │ ( ) Soon         │
│ [📷 Add a photo  ]  │               │   (both optional)│       │ ( ) Right away!  │
│                     │               │                  │       │                  │
│      [ Next → ]     │               │   [ Next → ]     │       │   [ Send it ]    │
└─────────────────────┘               └──────────────────┘       └──────────────────┘
```

- Drop "Status" entirely from creation (always starts as "New").
- Drop "Assign to" from creation (a manager assigns later, OR auto-assign by location).
- "Priority" → 3 plain choices: **Whenever / Soon / Right away** (mapped to low / medium / urgent).
- Title = first 60 chars of description if empty.
- Add **photo upload** (camera on mobile) — the most natural input for a worker.

### Flow B: "Do my jobs today"

Today: `/work-orders` shows everything.

Add a default "Today" filter so the worker lands on **just their assigned jobs, sorted by urgency**. One swipe per job: ✓ Done · ⏸ Hold · 💬 Add note. Bulk views go behind a "See all" toggle.

### Flow C: Merge Inspections + Checklists → "Check-Ups"

- One menu item: **Check-Ups**.
- A check-up template = today's "Checklist."
- A check-up run = today's "Inspection" / "Submission."
- One list page showing two tabs: **To do** (assigned runs) and **Templates** (the underlying checklists, only visible to managers/admins).
- Remove `/checklists` from the sidebar.
- Fix the broken `NewInspectionForm` by routing it to the checklist-submission flow instead.

### Flow D: Merge Repairs + My Jobs

- Remove **Repairs** (`/maintenance`) from the sidebar.
- Move "Preventive" (recurring upkeep schedules) into a tab inside **My Jobs** called **"Recurring"**, or into Settings → Recurring schedules. Most workers never need to *create* a schedule, just *do* the resulting jobs.

### Flow E: Simpler menu

Final sidebar (drop from 14 to 8 items):

```
Main
  Home
  My Jobs
  Check-Ups          (was Inspections + Checklists)
  Calendar

Things
  Equipment
  Places

People & More
  Team
  Settings (includes Suppliers, Reports, Help inside)
```

Move **Suppliers**, **Reports**, **Help**, **Messages** into Settings or a "More" sheet — these are admin/occasional, not daily.

### Flow F: Fix every page header

Apply a single header pattern to every remaining page (`PageHeader` with no `code`, plain title, friendly description, one primary action):

| Page | New title | New description |
|------|-----------|-----------------|
| Calendar | "Calendar" | "See what's planned this week." |
| Reports | "Reports" | "Simple summaries of your work." |
| Settings | "Settings" | "Make the app yours." |
| Profile | "My Profile" | "Your name, photo, and contact info." |
| Team | "Team" | "The people you work with." |
| Places | "Places" | "Buildings, floors, and rooms." |
| Suppliers | "Suppliers" | "People who help you." |
| Asset form | "Add equipment" / "Edit equipment" | "Tell us about a tool, machine, or fixture." |
| Job form | "Report a problem" / "Edit job" | (handled by wizard) |

Also remove `code="RPT · 001"` and `code="MNT · 001"`.

### Flow G: Make notifications actually work

Wire the three already-coded edge functions to real providers:

- **Email** → connect **Resend** (the function already imports `npm:resend`). Without this, every assignment / due-date email silently fails.
- **SMS** → connect **Twilio** (most-used CMMS notification channel for field workers).
- **Push** → either use OneSignal or generate VAPID keys for the Web Push protocol used in `send-push`.

Until Resend at least is connected, no email reminder ever leaves the building.

### Flow H: Helpful empty states everywhere

Already done for Equipment & Jobs. Extend to Suppliers, Places, Check-Ups list, Calendar, Reports.

---

## Required connections (you will be asked to approve each)

| Connection | Purpose | Without it… |
|-----------|---------|------------|
| **Resend** | Send job assignment, due-date, and check-up reminder emails | All emails fail silently |
| **Twilio** | SMS alerts for urgent jobs (most workers check texts, not email) | No SMS at all |
| *(Optional)* **OneSignal** | Mobile/web push notifications | Push notifications never fire |

The **AI vision** for "snap a photo of the problem" is already wired to the Lovable AI Gateway via the existing `gpt-vision` function — no new connection needed.

---

## File-level changes (technical detail)

**New / rewritten:**
- `src/components/workOrders/QuickReportWizard.tsx` — 3-step mobile-first wizard for "Report a Problem" (replaces the long form for the create flow; edit flow keeps the full form).
- `src/pages/WorkOrderFormPage.tsx` — render `QuickReportWizard` when no `workOrderId`, full form when editing; switch to `PageHeader`.
- `src/pages/InspectionsPage.tsx` — replace with combined "Check-Ups" page that lists *runs* (To do) and *templates* (admin tab).
- `src/components/inspections/NewInspectionForm.tsx` — make it actually persist (route into `checklistService` submission flow) or remove route entirely.

**Header / shell updates (all switched to `PageHeader`, no codes, friendly copy):**
- `src/pages/Calendar.tsx`
- `src/pages/Reports.tsx`
- `src/pages/MaintenancePage.tsx` (or delete & redirect to `/work-orders?view=recurring`)
- `src/pages/AssetFormPage.tsx`
- `src/pages/NewInspectionPage.tsx`
- `src/pages/LocationsPage.tsx`
- `src/pages/Settings.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/Team.tsx`
- `src/pages/VendorsPage.tsx`, `src/pages/VendorImportPage.tsx`

**Form simplification:**
- `src/components/workOrders/WorkOrderFormSchema.ts` — make `status` and `assigned_to` optional with sane defaults (`pending`, current user's manager, or null).
- `src/components/workOrders/fields/StatusPriorityFields.tsx` — replace priority labels with **Whenever / Soon / Right away** (display only; values stay `low/medium/urgent`).

**Navigation:**
- `src/components/shell/navConfig.ts` — remove `Checklists`, `Repairs` (Maintenance), `Suppliers`, `Reports`, `Help`, `Messages` from the primary list; keep them reachable via Settings or the command palette.
- `src/components/shell/MobileBottomNav.tsx` — already 5-slot, no change.
- Add `src/pages/Settings.tsx` sub-sections for the moved items.

**Notifications wiring:**
- After Resend / Twilio connections are linked, no code change is needed for `send-email` / `send-sms` (they already read `RESEND_API_KEY` / Twilio env vars). The redeploy step is just to pick up the secrets.

---

## What stays the same

- Color palette, fonts, rounded shapes — already friendly.
- Database schema, RLS, multi-tenancy.
- Auth, onboarding, company setup.
- Mobile bottom nav structure (5 items).

## Out of scope

- Building a manager-only "assign jobs" dashboard (separate, future scope).
- Offline mode.
- Native mobile app.
