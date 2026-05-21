DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.marketing_leads;

CREATE POLICY "Anyone can submit a lead"
ON public.marketing_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 200
  AND char_length(trim(email)) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (message IS NULL OR char_length(message) <= 5000)
  AND (company IS NULL OR char_length(company) <= 200)
  AND (phone IS NULL OR char_length(phone) <= 50)
);