
-- 1. Fix dispatcher to point to THIS project
CREATE OR REPLACE FUNCTION public.dispatch_notification_event(_event_type text, _payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/notify-event';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac';
  _secret text;
BEGIN
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

-- 2. Add photos column
ALTER TABLE public.public_requests
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-request-photos', 'public-request-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies
DROP POLICY IF EXISTS "Public can view request photos" ON storage.objects;
CREATE POLICY "Public can view request photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-request-photos');

DROP POLICY IF EXISTS "Anyone can upload request photos" ON storage.objects;
CREATE POLICY "Anyone can upload request photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'public-request-photos');

DROP POLICY IF EXISTS "Company members can delete request photos" ON storage.objects;
CREATE POLICY "Company members can delete request photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public-request-photos');
