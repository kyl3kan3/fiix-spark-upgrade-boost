# Freezer Coil Inspection System

## What you'll get

A workflow where you can:
1. Add each freezer unit as an asset (with quick bulk-add).
2. Build a "Freezer Coil Inspection" checklist (ice build-up, belt, valves, etc.) and link it to the freezer assets you choose.
3. Open one page that shows every linked unit in a grid with checkboxes for each inspection point — submit all units in one go.
4. Choose how often it's prompted: twice daily, daily, weekly, biweekly, monthly, quarterly, or annually.
5. See a "Due today" banner on the dashboard when an inspection is due, with a one-click link to fill it out.

## How it fits the current app

You already have:
- An **Assets** module (perfect for storing each freezer unit).
- A **Checklists** module with create/edit/submit and frequency support (daily/weekly/monthly/quarterly/annually).
- A **Submissions** history page.

We'll extend this rather than build something parallel.

## Plan

### 1. Database changes
- New table `checklist_assets` linking a checklist to multiple assets (so one checklist covers many freezer units).
- New table `checklist_schedules` (optional next-due timestamp per checklist) so we know when to prompt.
- Extend `checklist_submission_items` with an `asset_id` column so each row records which unit was checked.
- Add `twice-daily` and `biweekly` to the frequency options used in the UI.
- All tables get RLS scoped to `company_id` (matching your existing pattern).

### 2. Assets — quick bulk add
- On the Assets page, add a "Bulk add" dialog: paste/enter a list of names ("Freezer 1, Freezer 2, …") and they're created as assets in one click.
- Each unit can still be opened/edited individually using your existing flow.

### 3. Checklist builder — link assets
- In the Create/Edit Checklist form, add an "Applies to assets" multi-select (searchable).
- Frequency dropdown gains "Twice daily" and "Biweekly".

### 4. New "Multi-asset submission" page
- When a checklist has linked assets, the Fill Out page shows a table:
  - Rows = each freezer unit (Freezer 1, Freezer 2, …).
  - Columns = each checklist item (Ice build-up OK, Belt OK, Valve OK, …).
  - One checkbox per cell + an optional notes field per row.
- Submit once → creates a single submission with one item row per (asset × checklist item).
- If a checklist has no linked assets, it falls back to your existing single-form layout.

### 5. Daily prompts
- A small "Inspections due" widget on the Dashboard listing checklists whose next-due time is now or past, with a "Start inspection" button.
- For "twice daily", due windows are AM (before noon) and PM (after noon).
- After a successful submission, the next-due timestamp is rolled forward by the frequency.
- (Push/email notifications are out of scope for v1 — this is an in-app prompt. We can add real notifications as a follow-up using your existing `send-push` / `send-email` edge functions.)

### 6. Submissions history
- The existing Submissions page gets an asset column so you can see, e.g., "Freezer 3 — failed belt check on Apr 28".

## Technical notes

- New tables and an RLS migration via the migration tool; no edits to `types.ts` (regenerated).
- New components: `BulkAddAssetsDialog`, `ChecklistAssetsSelector`, `MultiAssetSubmissionForm`, `DueInspectionsWidget`.
- Updates: `ChecklistForm`, `ChecklistsPage` (frequency badges), `ChecklistSubmitPage` (route to multi-asset form when assets are linked), `Dashboard`, `types/checklists.ts`, `checklistService.ts`.
- Frequency rollover handled client-side on submit via a small `nextDueAt(frequency, from)` util, then persisted to `checklist_schedules`.

## Open questions

A couple of decisions worth confirming before I build — I'll ask in a follow-up if you'd like, otherwise I'll go with sensible defaults:
1. For each inspection point, do you want a simple Pass/Fail checkbox, or three states (Pass / Fail / N/A)? Default: Pass/Fail with optional notes.
2. Should a "Fail" automatically create a Work Order against that asset? Default: no for v1, but easy to add.
3. Twice-daily windows — fixed AM/PM, or configurable times per checklist? Default: fixed AM (before 12:00) and PM (after 12:00).