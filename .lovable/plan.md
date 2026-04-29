# Mobile Optimization Audit

## Short answer
**Mostly yes, but not entirely.** The shell (sidebar collapses to bottom nav, top bar adapts, page padding is now consistent) is mobile-ready. But several content areas still break or feel cramped on phones.

## Issues found

### 1. Wide tables overflow on phones
- `VendorTable` uses a raw `<table>` with no horizontal scroll wrapper — columns spill off screen.
- `WorkOrdersTable` has `overflow-x-auto` but rows are dense with no responsive column hiding.
- `InspectionChecklist` forces a 300px column width on small screens.

**Fix:** Wrap `VendorTable` in `overflow-x-auto`, hide non-essential columns under `md` (e.g. dates, assignee), and convert key tables to card-list layout below `sm`.

### 2. Tab bars too wide for narrow phones
TabsLists with 3-4 equal columns and forced `min-w-[300px]` (`Team`, `Calendar`, `locations`, `PerformanceAnalytics`, `DowntimeTracking`, `TeamCollaboration`, `vendors/import`):
- Trigger labels truncate or wrap awkwardly at 360-390px viewports.

**Fix:** Allow horizontal scroll (`overflow-x-auto`) on TabsList and use `whitespace-nowrap` triggers; for 4-col lists, stack to `grid-cols-2 sm:grid-cols-4`.

### 3. Inspections calendar grid is too tight
`grid-cols-7` with `gap-2` on InspectionsCalendarView is unreadable below 400px — day cells become ~40px wide with truncated content.

**Fix:** Reduce padding and font in cells under `sm`, or switch to a list view by default on mobile.

### 4. Multi-column form/info grids don't collapse
`VendorCardFields` uses `grid-cols-3 gap-3` with no mobile breakpoint, and `PerformanceAnalyticsContent` has a `grid-cols-3` stats row — labels squash on mobile.

**Fix:** Change to `grid-cols-1 sm:grid-cols-3` (or `grid-cols-2`).

### 5. Decorative gradient blobs cause horizontal overflow
`GradientBackground` uses fixed `w-[500px] h-[500px]` blurs positioned with `left-1/4` — on 390px screens these can push body width past viewport unless the parent clips.

**Fix:** Wrap in `overflow-hidden` parent (verify) or scale down on mobile.

### 6. Dialogs / modals
`AddTeamMemberDialog` uses `sm:max-w-[425px]` (fine on mobile — full-width below `sm`), but several dialogs throughout the app should be spot-checked for forms that need scroll on short phones (inspection forms, checklist forms).

**Fix:** Ensure dialog content uses `max-h-[90vh] overflow-y-auto` consistently.

### 7. Touch target audit
The base `index.css` already enforces `min-height: 44px` on buttons/links on touch devices — good. But icon-only buttons in dense toolbars (e.g. workOrders row actions) can sit tightly together. Add `gap-1` spacing where icons cluster.

## Plan of changes

1. **Tables**: wrap `VendorTable` in scroll container; add responsive column hiding (`hidden md:table-cell`) on `WorkOrdersTable` and `InspectionChecklist`.
2. **TabsLists**: add `overflow-x-auto` + `whitespace-nowrap` to all multi-tab bars; collapse 4-col lists to 2-col on mobile.
3. **Inspections calendar**: smaller cell padding/text under `sm`.
4. **Form grids**: add mobile breakpoints to `grid-cols-3` blocks in `VendorCardFields` and analytics/feature pages.
5. **GradientBackground**: ensure parent has `overflow-hidden`; reduce blob size under `sm`.
6. **Dialog content**: add `max-h-[90vh] overflow-y-auto` to long-form dialogs.

## Out of scope
- Redesigning data-heavy tables into bespoke mobile cards (large effort) — only adding scroll + column hiding here.
- Changing the existing sidebar/bottom nav shell — already mobile-optimized.

## Technical notes
- All changes are Tailwind-class additions; no logic, no API changes, no new dependencies.
- Semantic tokens preserved — no hardcoded colors introduced.
- Component contracts unchanged.
