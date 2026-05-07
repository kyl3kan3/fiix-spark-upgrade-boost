CREATE OR REPLACE FUNCTION public.work_orders_notify_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor uuid := auth.uid();
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.assigned_to IS NOT NULL
       AND NEW.assigned_to <> COALESCE(_actor, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      PERFORM public.dispatch_notification_event(
        'wo_assigned',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       AND NEW.assigned_to IS NOT NULL
       AND NEW.assigned_to <> COALESCE(_actor, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      PERFORM public.dispatch_notification_event(
        'wo_assigned',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM public.dispatch_notification_event(
        'wo_status_changed',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'old_status', OLD.status::text,
          'new_status', NEW.status::text,
          'creator_id', NEW.created_by,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS work_orders_notify ON public.work_orders;

CREATE TRIGGER work_orders_notify
AFTER INSERT OR UPDATE ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.work_orders_notify_trigger();