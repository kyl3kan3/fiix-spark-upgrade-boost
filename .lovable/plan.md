## Design direction: "Industrial Blueprint"

A complete departure from the current teal-on-white SaaS template. This identity is built for a maintenance/CMMS product — it should feel like equipment software, not a marketing landing page.

### Visual language
- **Palette (light)**: warm paper background `#F5F2EC`, ink `#13161B`, blueprint blue `#1E3A5F` as primary, signal amber `#E8843C` as accent, with status semantics in muted industrial tones (rust red, moss green, slate).
- **Palette (dark)**: graphite canvas `#0D0F12`, off-white ink, electric amber accent, subtle blueprint-grid background overlay.
- **Typography**: `Space Grotesk` for display/headings (technical, geometric), `Inter` for body, `JetBrains Mono` for IDs, timestamps, asset codes, status tags. Tabular numerics everywhere. Generous tracking on uppercase labels.
- **Component shapes**: Sharp corners (radius 4px max), 1px hairline borders instead of shadows, ticket-style cards with corner-cut accents, "drafting" dividers (dashed lines with tick marks), monospace metadata strips at the top of every card.
- **Iconography**: Lucide with `stroke-width={1.5}` for a drafted feel, paired with small monospace labels.
- **Motion**: Minimal — only purposeful transitions (200ms, ease-out). No glassmorphism, no blur, no animated gradients.

### Layout language: dual-pane workspace + icon rail
- **Left rail (60px)**: Icon-only navigation, always visible, with a colored active indicator bar. Tooltip labels on hover. Bottom shows user avatar + theme toggle.
- **Top bar (48px, slim)**: Breadcrumb on the left, ⌘K command palette trigger center, notifications + profile right. No big logo, no big search input.
- **Workspace area**:
  - **Dashboard, Reports, Calendar, Settings**: full-width single pane.
  - **List/detail pages (Work Orders, Assets, Vendors, Inspections, Checklists, Team)**: dual-pane — list on the left (~420px), selected item detail on the right. Detail pane is sticky and updates in place; URL syncs to selected item. Mobile collapses to single pane with back navigation.

---

## Implementation plan

### 1. Design system foundation
- Rewrite `src/index.css` tokens for both themes (paper/graphite palette, blueprint blue + amber, industrial semantics, hairline borders, no elegant/glow shadows).
- Update `tailwind.config.ts`: register Space Grotesk + JetBrains Mono via fontFamily, add `border-hairline` utility, blueprint-grid background utility, ticket-card clip-path utility, tighten radius scale (max 4px).
- Add Google Fonts link in `index.html` for Space Grotesk + JetBrains Mono.
- Refactor shadcn primitives that currently rely on rounded-xl/lg defaults: `button`, `card`, `input`, `select`, `badge`, `tabs`, `dialog`, `sheet`, `dropdown-menu`, `table` — sharper corners, hairline borders, mono labels on badges.

### 2. App shell (replaces current sidebar + header)
- New `src/components/shell/IconRail.tsx` (60px left rail, icon-only nav, active indicator, tooltips).
- New `src/components/shell/TopBar.tsx` (breadcrumb + ⌘K trigger + notifications + profile, 48px tall).
- New `src/components/shell/CommandPalette.tsx` using `cmdk` with sections: Navigate, Create, Recent, Search.
- New `src/components/shell/AppShell.tsx` composing rail + topbar + outlet, with blueprint-grid background.
- Rewrite `DashboardLayout.tsx` to use `AppShell`. Retire `DashboardSidebar`, `DashboardHeader`, `GradientBackground`, `ContentContainer` (or reduce to thin wrappers).

### 3. Dual-pane workspace primitive
- New `src/components/shell/WorkspacePane.tsx`: takes `list` and `detail` slots, handles responsive collapse, sticky detail, URL param sync (`?id=`).
- New `src/components/shell/ListItemRow.tsx`: ticket-style row with mono ID strip, title, status pill, secondary metadata, selected state (amber left border).

### 4. Page redesigns (every main page)
For each, rebuild the page-level composition; reuse existing data hooks/services unchanged.

- **Dashboard** (`Dashboard.tsx`, `OverviewTab.tsx`, `DashboardQuickActions`, `DashboardRecentActivities`, `DashboardTasksOverview`, `DashboardStatsCards`): KPI strip with mono numbers + delta indicators, blueprint-grid section dividers, activity feed as a drafting timeline, quick actions as labeled tile buttons.
- **Work Orders** (`WorkOrdersPage`, `WorkOrderDetailPage`): dual-pane. List with status/priority pills, mono WO-#### ID, due date. Detail pane with header strip (ID, status, assignee), tabs (Details, Tasks, Comments, History), action bar pinned to bottom.
- **Assets** (`AssetsPage`, `AssetFormPage`): dual-pane. List grouped by location with collapsible sections. Detail pane shows asset card with technical spec sheet styling, QR code area, related WOs.
- **Vendors** (`VendorsPage`, `VendorFormPage`, `VendorImportPage`): dual-pane. Detail shows contact card, contracts, assets serviced.
- **Inspections** (`InspectionsPage`, `InspectionDetailPage`, `NewInspectionPage`): dual-pane. Inspection forms restyled as drafting forms with section numbers.
- **Checklists** (`ChecklistsPage`, `ChecklistDetailPage`, `EditChecklistPage`, `NewChecklistPage`, `ChecklistSubmitPage`, `ChecklistSubmissionsPage`): dual-pane for the index; submit/edit pages as full-width forms.
- **Team** (`Team.tsx`): dual-pane. Member list + detail with roles, recent activity.
- **Calendar** (`Calendar.tsx`): full-width. Restyle to look like a wall planner — mono day numbers, hairline grid, amber today indicator, ticket-style events.
- **Reports** (`ReportsPage.tsx`): full-width. Section dividers as drafting rules, tables with mono numerics, chart restyling (single-color amber/blueprint, no gradients).
- **Settings** (`Settings.tsx`): full-width with vertical sub-nav. Forms use the new field styling.
- **Profile** (`ProfilePage.tsx`): full-width settings-style layout.
- **Help** (`Help.tsx`): full-width article layout.
- **Maintenance** (`MaintenancePage.tsx`): full-width.
- **Locations** (`LocationsPage.tsx`, `LocationDetailPage.tsx`): dual-pane.
- **Chat** (`Chat.tsx`): three-column (channels rail | conversation | details), restyled in industrial palette.
- **Auth** (`Auth.tsx`, `auth/AuthLayout.tsx`, `auth/AuthHeader.tsx`): split-screen with a blueprint-grid + technical schematic illustration on the left, ticket-style form card on the right. Replaces the current generic split-screen.
- **Onboarding** (`OnboardingPage.tsx`, `CompanySetup.tsx`, `TeamSetup.tsx`, `SetupPage.tsx`): stepper restyled as a drafting checklist with numbered steps and tick marks.
- **Index / landing** (`Index.tsx`, `components/Hero.tsx`, `Features.tsx`, `CTA.tsx`, `Testimonials.tsx`, `Footer.tsx`, `Navbar.tsx`): editorial industrial landing — large Space Grotesk display, blueprint-grid hero, mono section numbers (01 / 02 / 03), amber CTAs.
- **404** (`NotFound.tsx`): on-brand error page with mono "ERR_404" stamp.

### 5. Cross-cutting cleanup
- Audit and replace remaining hardcoded Tailwind colors (`bg-gray-*`, `text-blue-*`, `bg-white`, `bg-maintenease-*`) with semantic tokens. Targeted sweep across `src/components/**` and `src/pages/**`.
- Remove the `maintenease` color scale from `tailwind.config.ts` once references are migrated.
- Verify both light and dark modes on every redesigned surface.

### 6. QA pass
- Type-check, dev server build check.
- Visual spot-check key surfaces in light + dark via the preview at desktop and mobile viewports.

### What this plan does NOT include
- No backend / data model / RLS changes.
- No new features, routes, or business logic.
- Existing data hooks, services, and edge functions are untouched.

### Tradeoffs to flag
- This is a large change touching ~40+ files. Expect noticeable credit usage.
- Dual-pane layouts change URL behavior for list pages (selected item in query param). Existing deep links to detail routes will keep working — detail routes will redirect into the dual-pane view with the id preselected.
- The `maintenease` brand color scale will be retired in favor of semantic tokens. Any external mention of brand color will need to reference the new blueprint-blue/amber system.
