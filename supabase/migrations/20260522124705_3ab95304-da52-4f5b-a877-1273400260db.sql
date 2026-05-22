
CREATE OR REPLACE FUNCTION public.public_requests_notify_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.type = 'urgent' THEN
    PERFORM public.dispatch_notification_event(
      'urgent_public_request',
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
  END IF;
  RETURN NEW;
END;
$function$;
