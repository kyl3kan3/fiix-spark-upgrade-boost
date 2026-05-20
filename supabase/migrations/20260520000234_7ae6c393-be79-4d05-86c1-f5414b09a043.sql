CREATE TABLE public.marketing_page_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  page_slug text NOT NULL,
  page_url text,
  referrer text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT marketing_page_events_event_type_len CHECK (char_length(event_type) BETWEEN 1 AND 60),
  CONSTRAINT marketing_page_events_page_slug_len CHECK (char_length(page_slug) BETWEEN 1 AND 120),
  CONSTRAINT marketing_page_events_page_url_len CHECK (page_url IS NULL OR char_length(page_url) <= 2048),
  CONSTRAINT marketing_page_events_referrer_len CHECK (referrer IS NULL OR char_length(referrer) <= 2048),
  CONSTRAINT marketing_page_events_user_agent_len CHECK (user_agent IS NULL OR char_length(user_agent) <= 1024)
);

ALTER TABLE public.marketing_page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a marketing event"
  ON public.marketing_page_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(event_type) > 0 AND char_length(page_slug) > 0);

CREATE POLICY "Admins can view marketing events"
  ON public.marketing_page_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));

CREATE POLICY "Admins can delete marketing events"
  ON public.marketing_page_events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));

CREATE INDEX marketing_page_events_created_at_idx ON public.marketing_page_events (created_at DESC);
CREATE INDEX marketing_page_events_slug_type_idx ON public.marketing_page_events (page_slug, event_type, created_at DESC);