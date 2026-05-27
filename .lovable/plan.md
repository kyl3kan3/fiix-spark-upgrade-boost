## Mobile Responsiveness Fixes

Three parallel fixes to address mobile audit findings.

### 1. Wrap tables in horizontal scroll

Wrap each `<table>` in a `<div className="overflow-x-auto">` so dense tables can't overflow viewport on phones:

- `src/components/admin/GoogleAdsPanel.tsx`
- `src/components/team/RolePermissionsOverview.tsx`
- `src/pages/AdminAnalyticsPage.tsx`
- `src/pages/AdminSeoIndexPage.tsx`

(`AssetManagementContent` and `ImportDataPreview` already have wrappers — verify and skip if so.)

### 2. Mobile search trigger in top bar

Edit `src/components/dashboard/header/SearchBar.tsx`:

- Keep desktop inline search (`hidden md:flex`)
- On mobile (`md:hidden`), render a `Search` icon `Button` that opens a shadcn `Sheet` (top side) containing the same search input, auto-focused on open
- Wire `Esc` / overlay click to close (sheet handles this)

No changes to header layout — `SearchBar` already sits in `DashboardHeader`.

### 3. Redesign WeekView for phones

Edit `src/components/calendar/WeekView.tsx`:

- Below `sm:` (≤640px): render a day selector (Mon–Fri pill tabs) plus a vertical list of that day's time slots and events — no table, no horizontal scroll
- At `sm:` and above: keep the existing 5-day table inside the current `overflow-x-auto` wrapper

Uses mock data already in the file; no data-layer changes.

### Out of scope

- No business-logic changes
- No backend/migration changes
- Admin-only screens already lower priority; only the listed tables get wrappers
