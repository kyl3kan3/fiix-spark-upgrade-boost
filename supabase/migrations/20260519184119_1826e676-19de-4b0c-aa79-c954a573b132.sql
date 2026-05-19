
-- 1) organization_invitations: prevent invitee from escalating their role
DROP POLICY IF EXISTS "Invitations: admins or invitee can update" ON public.organization_invitations;

CREATE POLICY "Invitations: admins or invitee can update"
ON public.organization_invitations
FOR UPDATE
USING (
  ((organization_id = get_user_company(auth.uid())) AND has_role(auth.uid(), 'administrator'::app_role))
  OR (email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()))
)
WITH CHECK (
  ((organization_id = get_user_company(auth.uid())) AND has_role(auth.uid(), 'administrator'::app_role))
  OR (
    email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
    AND role = (SELECT oi.role FROM public.organization_invitations oi WHERE oi.id = organization_invitations.id)
    AND organization_id = (SELECT oi.organization_id FROM public.organization_invitations oi WHERE oi.id = organization_invitations.id)
    AND email = (SELECT oi.email FROM public.organization_invitations oi WHERE oi.id = organization_invitations.id)
    AND invited_by = (SELECT oi.invited_by FROM public.organization_invitations oi WHERE oi.id = organization_invitations.id)
  )
);

-- 2) profiles: prevent any user (including admins) from changing role/company_id on OTHER users' rows via this policy.
-- Tighten the restrictive policy so it applies to ALL rows: nobody can change role/company_id through these client-facing policies.
DROP POLICY IF EXISTS "Profiles: cannot change role or company" ON public.profiles;

CREATE POLICY "Profiles: cannot change role or company"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
USING (true)
WITH CHECK (
  role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id)
  AND company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = profiles.id)
);

-- 3) checklist_submission_items: add DELETE policy mirroring submissions
CREATE POLICY "Submitter or admin can delete submission items"
ON public.checklist_submission_items
FOR DELETE
USING (
  submission_id IN (
    SELECT cs.id
    FROM public.checklist_submissions cs
    JOIN public.checklists c ON c.id = cs.checklist_id
    WHERE c.company_id = get_user_company(auth.uid())
      AND (cs.submitted_by = auth.uid() OR has_role(auth.uid(), 'administrator'::app_role))
  )
);

-- 4) notification_dispatch_log: explicit deny for user writes
CREATE POLICY "dispatch_log: deny user inserts"
ON public.notification_dispatch_log
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "dispatch_log: deny user updates"
ON public.notification_dispatch_log
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "dispatch_log: deny user deletes"
ON public.notification_dispatch_log
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);
