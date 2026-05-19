CREATE TABLE public.marketing_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  message text,
  source_slug text,
  source_url text,
  CONSTRAINT marketing_leads_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT marketing_leads_email_len CHECK (char_length(email) BETWEEN 3 AND 255),
  CONSTRAINT marketing_leads_company_len CHECK (company IS NULL OR char_length(company) <= 160),
  CONSTRAINT marketing_leads_phone_len CHECK (phone IS NULL OR char_length(phone) <= 40),
  CONSTRAINT marketing_leads_message_len CHECK (message IS NULL OR char_length(message) <= 2000)
);

ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.marketing_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON public.marketing_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));

CREATE POLICY "Admins can delete leads"
  ON public.marketing_leads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));

CREATE INDEX marketing_leads_created_at_idx ON public.marketing_leads (created_at DESC);
CREATE INDEX marketing_leads_source_slug_idx ON public.marketing_leads (source_slug);