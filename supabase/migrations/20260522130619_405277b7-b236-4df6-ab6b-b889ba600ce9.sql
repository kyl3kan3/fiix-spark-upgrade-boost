create or replace function public.dispatch_notification_event(_event_type text, _payload jsonb)
returns void
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/notify-event';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac';
  _secret text;
begin
  select decrypted_secret into _secret
  from vault.decrypted_secrets
  where lower(name) = 'notify_shared_secret'
  limit 1;

  if _secret is null then
    raise warning 'notify_shared_secret not configured in vault; skipping dispatch';
    return;
  end if;

  perform net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', _anon,
      'Authorization', 'Bearer ' || _anon,
      'x-notify-secret', _secret
    ),
    body := jsonb_build_object('event_type', _event_type, 'payload', _payload)
  );
end;
$function$;

drop trigger if exists public_requests_notify_after_insert on public.public_requests;