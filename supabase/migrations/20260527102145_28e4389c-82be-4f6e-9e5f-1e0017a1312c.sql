
-- 1. account_type on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'company'
  CHECK (account_type IN ('personal','company'));

-- 2. Personal onboarding RPC (no company created)
CREATE OR REPLACE FUNCTION public.complete_personal_onboarding(
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
  SET first_name = COALESCE(NULLIF(trim(_first_name), ''), first_name),
      last_name  = COALESCE(NULLIF(trim(_last_name),  ''), last_name),
      phone_number = COALESCE(NULLIF(trim(_phone), ''), phone_number),
      account_type = 'personal',
      updated_at = now()
  WHERE id = _uid;

  RETURN jsonb_build_object('account_type', 'personal');
END;
$$;

-- 3. signup_reminders_sent table
CREATE TABLE IF NOT EXISTS public.signup_reminders_sent (
  user_id uuid NOT NULL,
  stage   text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, stage)
);

GRANT ALL ON public.signup_reminders_sent TO service_role;

ALTER TABLE public.signup_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Deny everything to regular users; service role bypasses RLS.
CREATE POLICY "signup_reminders_sent: deny all to users"
  ON public.signup_reminders_sent
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
