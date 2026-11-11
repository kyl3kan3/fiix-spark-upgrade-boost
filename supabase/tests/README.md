# Daybreak database regression tests

These tests use a disposable PostgreSQL 17 container and synthetic users/tenants.
They never connect to a Supabase tenant. The repository is missing its original
base-schema migration, so `daybreak_fixture.sql` supplies a focused schema from
the generated client types, baseline policy behavior, relevant current functions,
and the real cascading checklist foreign keys. This validates the new migration
and its security boundaries; it does not establish that a full historical
`supabase db reset` succeeds or test Supabase Storage HTTP MIME enforcement.

Run from the repository root with Docker:

```sh
docker run --detach --name fiix-security-postgres \
  -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine
docker exec fiix-security-postgres psql -U postgres -c 'CREATE DATABASE daybreak_test;'
docker exec -i fiix-security-postgres psql -U postgres -d daybreak_test -v ON_ERROR_STOP=1 \
  < supabase/tests/daybreak_fixture.sql
docker exec -i fiix-security-postgres psql -U postgres -d daybreak_test -v ON_ERROR_STOP=1 \
  < supabase/migrations/20261111201923_daybreak_database_boundaries.sql
docker exec -i fiix-security-postgres psql -U postgres -d daybreak_test -v ON_ERROR_STOP=1 \
  < supabase/tests/daybreak_boundaries.sql
```

Then run the concurrent-session checks:

```sh
python supabase/tests/daybreak_concurrency.py
```

Covered boundaries include tenant/role mutation authorization, immutable audit
fields, real attachment events, verified invitation acceptance, contact privacy,
notification read-only edits, budget caps, recipient deduplication, expired
trials, personal onboarding, checklist cascades, recurring-feature enforcement,
bulk and concurrent asset quotas, and concurrent location reparenting.

Deployment prerequisites: configure Vault `maintenance_job_secret` to match the
Edge Function `MAINTENANCE_JOB_SECRET`, and rotate/configure `notify_shared_secret`
to match `NOTIFY_SHARED_SECRET`. Removing historical secret literals does not
rotate deployed credentials. Existing legacy `system_settings` rows with a NULL
owner are intentionally not assigned to an arbitrary user.
