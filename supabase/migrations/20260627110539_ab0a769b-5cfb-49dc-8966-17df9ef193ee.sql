
-- Explicit admin-only write policies on energy_ingest_tokens (previously only SELECT was defined).
DROP POLICY IF EXISTS "Admins can insert energy ingest tokens" ON public.energy_ingest_tokens;
DROP POLICY IF EXISTS "Admins can update energy ingest tokens" ON public.energy_ingest_tokens;
DROP POLICY IF EXISTS "Admins can delete energy ingest tokens" ON public.energy_ingest_tokens;

CREATE POLICY "Admins can insert energy ingest tokens"
ON public.energy_ingest_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
);

CREATE POLICY "Admins can update energy ingest tokens"
ON public.energy_ingest_tokens
FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
)
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
);

CREATE POLICY "Admins can delete energy ingest tokens"
ON public.energy_ingest_tokens
FOR DELETE
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
);
