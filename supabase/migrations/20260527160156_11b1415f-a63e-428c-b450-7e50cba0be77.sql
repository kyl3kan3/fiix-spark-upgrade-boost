CREATE OR REPLACE FUNCTION public.enforce_super_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  IF NEW.role = 'super_admin'::public.app_role THEN
    SELECT email INTO _email FROM auth.users WHERE id = NEW.user_id;
    IF lower(coalesce(_email, '')) <> 'kyle@decent4.com' THEN
      RAISE EXCEPTION 'super_admin role is restricted to kyle@decent4.com';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_super_admin_email_trg ON public.user_roles;
CREATE TRIGGER enforce_super_admin_email_trg
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_super_admin_email();

-- Clean up any existing non-Kyle super_admin rows (defense-in-depth; none exist today)
DELETE FROM public.user_roles
WHERE role = 'super_admin'::public.app_role
  AND user_id NOT IN (SELECT id FROM auth.users WHERE lower(email) = 'kyle@decent4.com');