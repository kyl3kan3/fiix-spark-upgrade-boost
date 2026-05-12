-- 1) Tighten organization_invitations SELECT
DROP POLICY IF EXISTS "Invitations: view for own org or invited email" ON public.organization_invitations;

CREATE POLICY "Invitations: admins or invitee can view"
ON public.organization_invitations
FOR SELECT
USING (
  ((organization_id = public.get_user_company(auth.uid())) AND public.has_role(auth.uid(), 'administrator'::app_role))
  OR (email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()))
);

-- 2) Allow deletion of checklist_submissions by admins or original submitter
CREATE POLICY "Submitter or admin can delete submissions"
ON public.checklist_submissions
FOR DELETE
USING (
  submitted_by = auth.uid()
  OR (
    public.has_role(auth.uid(), 'administrator'::app_role)
    AND checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
    )
  )
);

-- 3) Replace hardcoded notify shared secret with vault lookup
CREATE OR REPLACE FUNCTION public.dispatch_notification_event(_event_type text, _payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _url text := 'https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/notify-event';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA';
  _secret text;
BEGIN
  -- Read shared secret from Vault (must be set via: select vault.create_secret('<value>', 'notify_shared_secret'))
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE name = 'notify_shared_secret'
  LIMIT 1;

  IF _secret IS NULL THEN
    RAISE WARNING 'notify_shared_secret not configured in vault; skipping dispatch';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', _anon,
      'Authorization', 'Bearer ' || _anon,
      'x-notify-secret', _secret
    ),
    body := jsonb_build_object('event_type', _event_type, 'payload', _payload)
  );
END;
$function$;