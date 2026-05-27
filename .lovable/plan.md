# Plan

## 1. Personal / Company toggle in onboarding

**Frontend (`src/components/onboarding/`):**
- Add `accountType: "personal" | "company"` to `FormState` (default `company`).
- Add a segmented toggle at the top of `OnboardingFormFields` (hidden when `isInvited`).
- When `personal` is selected, hide the Company field; when `company`, show it as required.

**Submit flow (`useOnboardingSubmit.ts`):**
- If invited → unchanged.
- If `accountType === "company"` → existing `complete_owner_onboarding` flow.
- If `accountType === "personal"` → call new RPC `complete_personal_onboarding(_first_name, _last_name, _phone)` that only updates the profile (no company). User lands on dashboard; the existing `CompanyRequiredWrapper` banner nudges them to create a company later.

**Migration:** add `complete_personal_onboarding` SECURITY DEFINER function.

## 2. Hourly abandoned-signup reminder emails

Two drop-off points, both addressed:

| Stage | Trigger | When |
|---|---|---|
| `unverified_1h` | `auth.users.email_confirmed_at IS NULL` | ≥1h after signup |
| `unverified_24h` | same | ≥24h, ≤7d |
| `onboarding_24h` | confirmed user, `profiles.company_id IS NULL`, not personal | ≥24h |
| `onboarding_72h` | same | ≥72h, ≤14d |

**Migration:**
- New table `signup_reminders_sent (user_id uuid, stage text, sent_at timestamptz, PRIMARY KEY (user_id, stage))` — service-role only, RLS denies everything else.
- Add `account_type text` column to `profiles` (`'personal' | 'company'`) so we don't pester personal users about company setup.

**Templates** (`supabase/functions/_shared/transactional-email-templates/`):
- `signup-verify-reminder.tsx` — "Confirm your email to start using MaintenEase" + resend link to `/auth?email=...`.
- `onboarding-reminder.tsx` — "Finish setting up your account" + link to `/onboarding`.
- Register both in `registry.ts`.

**Edge function `send-signup-reminders`** (service role, `verify_jwt = false`, scheduled — no public input):
- Query `auth.admin.listUsers()` (or direct `auth.users` via service role) for candidates per stage.
- Skip rows already in `signup_reminders_sent` for that stage.
- For each: invoke `send-transactional-email` with the right template; on success insert into `signup_reminders_sent`.
- Cap per run (e.g. 200 emails) to avoid bursts.

**Schedule (pg_cron via insert tool, not migration — contains project ref/anon key):**
```sql
select cron.schedule(
  'send-signup-reminders-hourly',
  '0 * * * *',
  $$ select net.http_post(
       url:='https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/send-signup-reminders',
       headers:='{"Content-Type":"application/json","Authorization":"Bearer <anon>"}'::jsonb,
       body:='{}'::jsonb
     ); $$
);
```

## Files

- migration: `complete_personal_onboarding`, `signup_reminders_sent` table, `profiles.account_type`
- `src/hooks/onboarding/types.ts`, `OnboardingFormFields.tsx`, `useOnboardingSubmit.ts`, `useOnboarding.ts` (state init)
- `supabase/functions/_shared/transactional-email-templates/signup-verify-reminder.tsx` + `onboarding-reminder.tsx` + `registry.ts`
- `supabase/functions/send-signup-reminders/index.ts` (+ config.toml entry with `verify_jwt = false`)
- pg_cron schedule via insert tool

Proceed?
