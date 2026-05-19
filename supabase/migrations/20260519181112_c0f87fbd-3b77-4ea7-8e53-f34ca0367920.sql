
CREATE TABLE public.sms_optins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  source text DEFAULT 'web_form',
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_optins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an SMS opt-in"
ON public.sms_optins
FOR INSERT
TO anon, authenticated
WITH CHECK (consent = true);

CREATE POLICY "Administrators can view opt-ins"
ON public.sms_optins
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'administrator'::app_role));
