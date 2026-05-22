
CREATE OR REPLACE FUNCTION public.public_requests_notify_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.dispatch_notification_event(
    CASE WHEN NEW.type = 'urgent' THEN 'urgent_public_request' ELSE 'new_public_request' END,
    jsonb_build_object(
      'request_id', NEW.id,
      'company_id', NEW.company_id,
      'title', NEW.title,
      'description', NEW.description,
      'location', NEW.location_text,
      'contact_name', NEW.contact_name,
      'contact_email', NEW.contact_email,
      'contact_phone', NEW.contact_phone,
      'photos', COALESCE(NEW.photos, '[]'::jsonb)
    )
  );
  RETURN NEW;
END;
$function$;
