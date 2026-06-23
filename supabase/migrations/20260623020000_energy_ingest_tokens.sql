-- Live power integration: a per-company ingest token so an external utility/IoT
-- feed can POST energy readings into the energy_readings table (source='integration')
-- via the public `ingest-energy` edge function.
--
-- The token is a bearer secret stored per company. Company members can read and
-- regenerate it through SECURITY DEFINER RPCs; the edge function (service role)
-- resolves a token to its company id.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_energy_ingest_tokens_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.energy_ingest_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.energy_ingest_tokens ENABLE ROW LEVEL SECURITY;

-- Members may read their company's token (so the UI can show it).
CREATE POLICY "Users can view their company ingest token"
  ON public.energy_ingest_tokens FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_energy_ingest_tokens_updated_at
  BEFORE UPDATE ON public.energy_ingest_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_energy_ingest_tokens_updated_at();

-- Ensure a token row exists for the caller's company and return it.
CREATE OR REPLACE FUNCTION public.get_or_create_energy_ingest_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cid uuid := public.get_user_company(auth.uid());
  _token text;
BEGIN
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'No company context';
  END IF;
  INSERT INTO public.energy_ingest_tokens (company_id)
  VALUES (_cid)
  ON CONFLICT (company_id) DO NOTHING;
  SELECT token INTO _token FROM public.energy_ingest_tokens WHERE company_id = _cid;
  RETURN _token;
END;
$$;

-- Rotate the caller's company token and return the new value.
CREATE OR REPLACE FUNCTION public.regenerate_energy_ingest_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cid uuid := public.get_user_company(auth.uid());
  _token text := encode(gen_random_bytes(24), 'hex');
BEGIN
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'No company context';
  END IF;
  INSERT INTO public.energy_ingest_tokens (company_id, token)
  VALUES (_cid, _token)
  ON CONFLICT (company_id) DO UPDATE SET token = EXCLUDED.token;
  RETURN _token;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_energy_ingest_token() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.regenerate_energy_ingest_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_energy_ingest_token() TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_energy_ingest_token() TO authenticated;
