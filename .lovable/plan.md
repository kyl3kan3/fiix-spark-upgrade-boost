# Make the App Easy for Anyone to Use

## The problem today

Even though we moved to a friendly look, the app still feels like it was made for technical people:

- The dashboard is called **"Operations Console"** with codes like `DSH · TUESDAY, APR 28, 2026`, `WO·TOT`, `SECTION 01 — KEY METRICS`, and ticked dividers — these mean nothing to a regular maintenance worker.
- Page headers everywhere still show technical codes (`WO · INDEX`, `AST · INDEX`, `MNT · 001`, `INS`).
- Buttons say things like **"New WO"**, **"Dispatch"**, **"Triage"**, **"Live Feed"**, **"Recent Activities"**.
- The Inspections page still uses the old layout (gray heading, "Inspections", "Schedule and manage equipment inspections") and ignores the new shell.
- Empty states say "No work orders on file" instead of helpful guidance.
- The dashboard tabs (Overview, Tasks, Analytics, Settings) duplicate things already in the sidebar and overwhelm a first-time user.
- There's no obvious "what should I do right now?" moment when you land on the home screen.

## The fix — one consistent, plain-language experience

### 1. A friendly Home screen (replaces "Operations Console")

The first thing you see after login becomes a clean, welcoming Home:

```text
 ┌────────────────────────────────────────────────┐
 │  Good morning, Sam  👋                          │
 │  Here's what's happening today.                 │
 │                                                 │
 │  [ + Report a Problem ]  [ Start a Check-Up ]   │
 └────────────────────────────────────────────────┘

 ┌─ Today ─────────────┐ ┌─ Needs your attention ──┐
 │  3 jobs due today   │ │  2 jobs overdue         │
 │  1 check-up to do   │ │  1 high-priority repair │
 └─────────────────────┘ └─────────────────────────┘

 My Jobs (next 5)        →  See all
 Recent Activity         →
```

Changes:
- Drop "Operations Console", drop date code, drop "SECTION 01" eyebrows, drop tick-mark dividers.
- Replace the four-tab layout (Overview/Tasks/Analytics/Settings) with a single scrollable Home. Analytics → "Reports" already in sidebar. Settings → already in sidebar.
- KPI cards become **plain sentences** with big numbers: "3 jobs due today", "1 overdue", "5 done this week". No codes like `WO·TOT`.
- Two **giant primary buttons** at the top so a non-technical worker always knows what to do: **Report a Problem** and **Start a Check-Up**.

### 2. Plain-language headers on every page

Replace the codes + jargon with clear titles and a single short sentence:

| Page | Before | After |
|---|---|---|
| Dashboard | "DSH · TUESDAY… — Operations Console" | "Good morning, Sam — Here's your day" |
| Work Orders | "WO · INDEX — Work Orders" | "My Jobs — Things to fix and follow up on" |
| Inspections | "Inspections — Schedule and manage…" | "Check-Ups — Walk-throughs and safety checks" |
| Maintenance | "MNT · 001 — Maintenance" | "Repairs — Planned upkeep & quick fixes" |
| Assets | "AST · INDEX — Assets" | "Equipment — Everything you take care of" |
| Locations | "LOC — Locations" | "Places — Buildings, rooms, and sites" |
| Vendors | "VND — Vendors" | "Suppliers — People who help you" |
| Reports | "RPT — Reports" | "Reports — Simple summaries of your work" |

The technical "code" prop stays in `PageHeader` but is hidden by default; remove it from every page.

### 3. Friendlier buttons & labels (everywhere)

- "New WO" → **"+ New Job"**
- "New Work Order" → **"+ New Job"**
- "Dispatch" / "Triage" → removed
- "Filters" → **"Find / Filter"**
- "Export" → **"Download"**
- "Live Feed" → **"What's happening"**
- "Recent Activities" → **"Recent updates"**
- "Tasks Overview" → **"Things to do"**
- "Inspections" tabs "List / Calendar" → **"List" / "On a calendar"**

### 4. Helpful empty states

When there's nothing on a page, instead of "No work orders on file" we show:

```text
   📋   You don't have any jobs yet.
        Tap "+ New Job" to add the first one.
        [ + New Job ]
```

Same pattern for Equipment, Inspections, Repairs, Places, Suppliers.

### 5. Fix Inspections page (still on old layout)

Rewrite `InspectionsPage.tsx` to match the new shell: use `PageHeader` (no code), friendly title "Check-Ups", new button labels, and the same card style as the other pages.

### 6. Mobile bottom nav refinement

Already in good shape. Just rename one item: keep Home / My Jobs / Check-Ups / Calendar / More, and make the active state larger and obvious.

### 7. Tone everywhere

- Drop ALL CAPS section labels and `▮` markers in dashboard.
- Drop monospace tracking labels (`SECTION 01 — KEY METRICS`).
- Use sentence case ("Things to do today") instead of UPPERCASE EYEBROWS.
- Numbers stay big and bold; surrounding text gets shorter and warmer.

## Files to change

**Pages (header/labels rewrite):**
- `src/pages/Dashboard.tsx` — remove tabs, remove code/date eyebrow, friendlier title + 2 big CTAs
- `src/pages/WorkOrdersPage.tsx`
- `src/pages/AssetsPage.tsx`
- `src/pages/MaintenancePage.tsx`
- `src/pages/InspectionsPage.tsx` — rewrite to match new shell
- `src/pages/LocationsPage.tsx`
- `src/pages/VendorsPage.tsx`
- `src/pages/ReportsPage.tsx`
- `src/pages/Chat.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Help.tsx`
- `src/pages/Settings.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/Team.tsx`

**Dashboard pieces:**
- `src/components/dashboard/tabs/OverviewTab.tsx` — drop `SECTION 0X` eyebrows, replace KPI codes with plain labels, friendlier table headings
- `src/components/dashboard/DashboardQuickActions.tsx` — title becomes "What do you want to do?"
- `src/components/dashboard/DashboardRecentActivities.tsx` — title "Recent updates"
- `src/components/dashboard/DashboardTasksOverview.tsx` — title "Things to do"

**Shell:**
- `src/components/shell/PageHeader.tsx` — make `code` truly optional and visually subtle (or remove rendering by default)
- `src/components/shell/TopBar.tsx` — keep the friendly greeting, remove any remaining mono breadcrumb codes
- `src/components/shell/MobileBottomNav.tsx` — minor active-state polish
- `src/components/shell/navConfig.ts` — already friendly, no change

**Empty-state components (friendlier copy + CTA):**
- `src/components/assets/AssetEmptyState.tsx`
- Add small inline empty state in WO list, Inspections list, etc.

## What stays the same

- Color palette, fonts, spacing, rounded shapes — already friendly.
- Sidebar grouping (Main / Things / Plan / People / More) — already plain English.
- Mobile bottom nav structure.
- All routes, data, and behavior — purely a UX/copy/layout makeover.

## Out of scope

- No new database fields, no backend changes.
- No changes to forms (WO form, Asset form, Inspection form) — only their page wrappers/headers.
- No theme switch or auth changes.
