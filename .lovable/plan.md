# Self-Healing Engine

A background system that detects problems in your MaintenEase tenant and fixes them automatically — with every action written to an audit log you can review.

## What it does

Four "healers" run on a schedule (every 30 min) and react to events. Each healer reports what it found, what it fixed, and what it flagged for a human.

### 1. Risk-scoring auto-remediation
- Watches `asset_risk_score_runs` for `failed` or `empty` outcomes.
- Retries with exponential backoff (3 attempts).
- If still failing, keeps last known-good scores visible and surfaces a banner on the Predictive Maintenance page with the failure reason + a "Retry now" button.

### 2. Stuck/orphaned work orders
- `in_progress` for > 14 days with no comments/updates → flagged "stalled" + notification to assignee + admin.
- Assigned to a deleted/deactivated user → auto-reassign to the team admin and add a comment.
- Past-due `open` work orders with critical priority → bump notification.

### 3. Data integrity sweep
- Orphan risk scores for deleted assets → delete.
- Profiles without a `user_roles` entry → create matching role from `profiles.role`.
- Work orders missing `company_id` → backfill from creator's profile.
- Assets missing `company_id` → flagged for admin review (never auto-assigned).
- Each repair logged with before/after snapshot.

### 4. AI request triage (Lovable AI)
- New `public_requests` rows trigger an LLM call (Gemini Flash via Lovable AI Gateway).
- Returns: urgency level, suggested category, suggested assignee role, summary.
- Stored as a `triage_suggestion` on the request — admin sees a one-click "Accept & create work order" button. Never auto-creates without approval.

## How you'll see it

New page **Settings → Self-Healing** with:
- Last 50 healer runs (timestamp, healer name, items scanned, fixed, flagged, duration).
- Per-healer toggle (on/off).
- "Run all now" button.
- Expandable row showing every individual action taken.

A small badge in the sidebar when there are unreviewed flags.

## Technical implementation

**Database (one migration):**
- `self_healing_runs` — run-level audit (healer, status, scanned/fixed/flagged counts, duration, error).
- `self_healing_actions` — row-level audit (run_id, entity_type, entity_id, action, before, after, requires_review).
- `self_healing_settings` — per-company on/off per healer.
- `public_request_triage` — AI suggestion cache (request_id, urgency, category, assignee_role, summary, model_version, accepted_at).
- All tables: company_id-scoped RLS via `get_user_company(auth.uid())`, GRANTs for authenticated + service_role.

**Edge functions:**
- `self-heal` (scheduled): orchestrator. Iterates companies, runs enabled healers, writes audit rows. Service-role.
- `triage-request` (event-driven): called from a DB trigger on `public_requests` insert via `pg_net.http_post`. Uses Lovable AI Gateway (`google/gemini-3-flash-preview`, structured output via `Output.object`).

**Scheduling:**
- `pg_cron` job every 30 min → `net.http_post` to `self-heal`.
- DB trigger on `public_requests` INSERT → `net.http_post` to `triage-request`.

**Frontend:**
- `src/pages/SelfHealingPage.tsx` + route.
- `src/components/selfHealing/RunsTable.tsx`, `HealerToggles.tsx`, `ActionDetails.tsx`.
- `src/services/selfHealingService.ts` (fetch runs, toggle healers, manual trigger via `supabase.functions.invoke('self-heal')`).
- `src/hooks/useSelfHealing.tsx`.
- `TriageSuggestionCard` on existing public request detail view → "Accept & create WO" calls existing work-order creation flow with pre-filled fields.

**Reliability:**
- Healers run in try/catch per company so one bad tenant doesn't break others.
- Idempotent: every fix checks current state before writing.
- `runs.snapshot` JSONB stores input counts so you can reproduce.

## Out of scope (ask later)
- Auto-creating work orders from AI triage without human approval.
- Self-healing for billing/subscription state.
- Cross-tenant repair (super-admin only — separate feature).
