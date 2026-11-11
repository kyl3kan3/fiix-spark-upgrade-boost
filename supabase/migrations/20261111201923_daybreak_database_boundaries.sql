-- Enforce tenant/role boundaries at the database API, preserving service jobs.
BEGIN;
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id uuid)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_company uuid; caller_company uuid;
BEGIN
  SELECT coalesce((SELECT p.company_id FROM public.profiles p WHERE p.id=_user_id), (SELECT r.company_id FROM public.user_roles r WHERE r.user_id=_user_id ORDER BY r.created_at DESC NULLS LAST LIMIT 1)) INTO target_company;
  IF _user_id=auth.uid() OR auth.role()='service_role' THEN RETURN target_company; END IF;
  SELECT coalesce((SELECT p.company_id FROM public.profiles p WHERE p.id=auth.uid()), (SELECT r.company_id FROM public.user_roles r WHERE r.user_id=auth.uid() ORDER BY r.created_at DESC NULLS LAST LIMIT 1)) INTO caller_company;
  IF caller_company=target_company THEN RETURN target_company; END IF;
  RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.get_user_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_company(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT (_user_id=auth.uid() OR auth.role()='service_role') AND EXISTS (
 SELECT 1 FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id
 WHERE r.user_id=_user_id AND r.role='super_admin'::public.app_role
 AND lower(u.email)='kyle@decent4.com' AND u.email_confirmed_at IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT (_user_id=auth.uid() OR auth.role()='service_role' OR
   public.get_user_company(_user_id)=public.get_user_company(auth.uid()))
 AND CASE WHEN _role='super_admin'::public.app_role THEN public.is_super_admin(_user_id)
 ELSE EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=_user_id AND r.role=_role
 AND r.company_id=public.get_user_company(_user_id)) END;
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_manage_company(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT _company=public.get_user_company(auth.uid()) AND
 (public.has_role(auth.uid(),'administrator') OR public.has_role(auth.uid(),'manager'));
$$;
REVOKE ALL ON FUNCTION public.can_manage_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_company(uuid) TO authenticated, service_role;

CREATE POLICY "daybreak manager insert" ON public.energy_readings AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.energy_readings AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.energy_readings AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.maintenance_costs AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.maintenance_costs AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.maintenance_costs AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.asset_health_metrics AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.asset_health_metrics AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.asset_health_metrics AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.asset_failure_events AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.asset_failure_events AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.asset_failure_events AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.asset_risk_scores AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.asset_risk_scores AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.asset_risk_scores AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.floor_plans AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.floor_plans AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.floor_plans AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.floor_plan_markers AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager update" ON public.floor_plan_markers AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.can_manage_company(company_id)) WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager delete" ON public.floor_plan_markers AS RESTRICTIVE FOR DELETE TO authenticated USING (public.can_manage_company(company_id)) ;

CREATE POLICY "daybreak manager insert" ON public.assets AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager insert" ON public.vendors AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak manager insert" ON public.work_orders AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.can_manage_company(company_id));

CREATE POLICY "daybreak admin deletes work orders" ON public.work_orders AS RESTRICTIVE FOR DELETE TO authenticated
USING (company_id=public.get_user_company(auth.uid()) AND public.has_role(auth.uid(),'administrator'));

CREATE POLICY "daybreak sensitive audit readers" ON public.self_healing_runs AS RESTRICTIVE FOR SELECT TO authenticated USING (public.can_manage_company(company_id));

CREATE POLICY "daybreak sensitive audit readers" ON public.self_healing_actions AS RESTRICTIVE FOR SELECT TO authenticated USING (public.can_manage_company(company_id));

CREATE POLICY "daybreak sensitive audit readers" ON public.public_request_triage AS RESTRICTIVE FOR SELECT TO authenticated USING (public.can_manage_company(company_id));

CREATE POLICY "daybreak sensitive audit readers" ON public.attachment_audit_log AS RESTRICTIVE FOR SELECT TO authenticated USING (public.can_manage_company(company_id));

CREATE OR REPLACE FUNCTION public.guard_client_update_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NOT NULL AND auth.role() IS DISTINCT FROM 'service_role'
 AND (to_jsonb(NEW)-TG_ARGV) IS DISTINCT FROM (to_jsonb(OLD)-TG_ARGV) THEN
   RAISE EXCEPTION 'Only editable fields may be changed' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_client_update_columns() FROM PUBLIC;
CREATE TRIGGER daybreak_notification_columns BEFORE UPDATE ON public.notifications FOR EACH ROW
EXECUTE FUNCTION public.guard_client_update_columns('read');
CREATE TRIGGER daybreak_attachment_columns BEFORE UPDATE ON public.attachments FOR EACH ROW
EXECUTE FUNCTION public.guard_client_update_columns('sort_order','caption','description');
CREATE TRIGGER daybreak_submission_answer_columns BEFORE UPDATE ON public.checklist_submission_items FOR EACH ROW
EXECUTE FUNCTION public.guard_client_update_columns('response_value','is_checked','notes');
CREATE TRIGGER daybreak_checklist_asset_columns BEFORE UPDATE ON public.checklist_assets FOR EACH ROW
EXECUTE FUNCTION public.guard_client_update_columns('start_offset_minutes');
CREATE POLICY "daybreak preserve notification delivery records" ON public.notifications AS RESTRICTIVE FOR DELETE TO authenticated
USING (user_id=auth.uid() AND type IS DISTINCT FROM 'email' AND provider_message_id IS NULL);
DROP POLICY IF EXISTS "email_events: deny user writes" ON public.email_events;
REVOKE INSERT,UPDATE,DELETE ON public.email_events FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.validate_checklist_answer_links()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE checklist uuid; company uuid;
BEGIN
 SELECT s.checklist_id,c.company_id INTO checklist,company FROM public.checklist_submissions s
 JOIN public.checklists c ON c.id=s.checklist_id WHERE s.id=NEW.submission_id;
 IF checklist IS NULL OR NOT EXISTS (SELECT 1 FROM public.checklist_items i WHERE i.id=NEW.checklist_item_id AND i.checklist_id=checklist)
 OR (NEW.asset_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.checklist_assets ca JOIN public.assets a ON a.id=ca.asset_id
 WHERE ca.checklist_id=checklist AND ca.asset_id=NEW.asset_id AND a.company_id=company)) THEN
 RAISE EXCEPTION 'Invalid checklist response relationship' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validate_checklist_answer_links() FROM PUBLIC;
CREATE TRIGGER daybreak_answer_links BEFORE INSERT OR UPDATE ON public.checklist_submission_items
FOR EACH ROW EXECUTE FUNCTION public.validate_checklist_answer_links();
CREATE POLICY "Managers can update checklist offsets" ON public.checklist_assets FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id=checklist_id AND public.can_manage_company(c.company_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c JOIN public.assets a ON a.company_id=c.company_id
 WHERE c.id=checklist_id AND a.id=asset_id AND public.can_manage_company(c.company_id)));

CREATE OR REPLACE FUNCTION public.validate_company_references()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE row_data jsonb := to_jsonb(NEW); referenced uuid; relation text; col text;
BEGIN
 FOREACH col IN ARRAY TG_ARGV LOOP
  referenced := nullif(row_data->>col,'')::uuid;
  IF referenced IS NULL THEN CONTINUE; END IF;
  relation := CASE col WHEN 'asset_id' THEN 'assets' WHEN 'work_order_id' THEN 'work_orders'
    WHEN 'location_id' THEN 'locations' WHEN 'floor_plan_id' THEN 'floor_plans' END;
  IF relation IS NULL THEN RAISE EXCEPTION 'Unsupported reference'; END IF;
  EXECUTE format('SELECT id FROM public.%I WHERE id=$1 AND company_id=$2',relation)
    INTO referenced USING referenced,(row_data->>'company_id')::uuid;
  IF referenced IS NULL THEN RAISE EXCEPTION 'Reference must belong to the same company' USING ERRCODE='23514'; END IF;
 END LOOP;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validate_company_references() FROM PUBLIC;

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.asset_health_metrics FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('asset_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.asset_failure_events FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('asset_id','work_order_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.asset_risk_scores FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('asset_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.maintenance_costs FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('asset_id','work_order_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.energy_readings FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('asset_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.floor_plans FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('location_id');

CREATE TRIGGER daybreak_company_references BEFORE INSERT OR UPDATE ON public.floor_plan_markers FOR EACH ROW EXECUTE FUNCTION public.validate_company_references('floor_plan_id','asset_id');

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
  IF _cid IS NULL OR NOT public.has_role(auth.uid(), 'administrator') THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.energy_ingest_tokens (company_id)
  VALUES (_cid)
  ON CONFLICT (company_id) DO NOTHING;
  SELECT token INTO _token FROM public.energy_ingest_tokens WHERE company_id = _cid;
  RETURN _token;
END;
$$;

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
  IF _cid IS NULL OR NOT public.has_role(auth.uid(), 'administrator') THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.energy_ingest_tokens (company_id, token)
  VALUES (_cid, _token)
  ON CONFLICT (company_id) DO UPDATE SET token = EXCLUDED.token;
  RETURN _token;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(
  _token text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _existing_company_id uuid;
  _inv public.organization_invitations%ROWTYPE;
  _role_enum public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  SELECT u.email INTO _email
  FROM auth.users AS u
  WHERE u.id = _uid AND u.email_confirmed_at IS NOT NULL;

  SELECT oi.* INTO _inv
  FROM public.organization_invitations AS oi
  WHERE oi.token = _token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF _inv.status <> 'pending' OR _inv.created_at IS NULL OR _inv.created_at <= pg_catalog.now()-interval '7 days' THEN
    RAISE EXCEPTION 'Invitation is no longer pending';
  END IF;

  IF _email IS NULL
     OR pg_catalog.lower(_inv.email) <> pg_catalog.lower(_email) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Invitation email does not match the signed-in user';
  END IF;

  SELECT p.company_id INTO _existing_company_id
  FROM public.profiles AS p
  WHERE p.id = _uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _existing_company_id IS NOT NULL
     AND _existing_company_id <> _inv.organization_id THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'This account already belongs to another company';
  END IF;

  BEGIN
    _role_enum := _inv.role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role_enum := 'technician'::public.app_role;
  END;

  IF _role_enum = 'super_admin'::public.app_role THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Super administrator access cannot be granted by invitation';
  END IF;

  PERFORM pg_catalog.set_config(
    'app.profile_privileged_update',
    'accept_invitation',
    true
  );

  UPDATE public.profiles
  SET company_id = _inv.organization_id,
      role = _role_enum::text,
      first_name = COALESCE(NULLIF(pg_catalog.btrim(_first_name), ''), first_name),
      last_name = COALESCE(NULLIF(pg_catalog.btrim(_last_name), ''), last_name),
      phone_number = COALESCE(NULLIF(pg_catalog.btrim(_phone), ''), phone_number),
      updated_at = pg_catalog.now()
  WHERE id = _uid;

  PERFORM pg_catalog.set_config('app.profile_privileged_update', '', true);

  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, _role_enum, _inv.organization_id, _inv.invited_by)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  UPDATE public.organization_invitations
  SET status = 'accepted', accepted_at = pg_catalog.now()
  WHERE id = _inv.id;

  RETURN pg_catalog.jsonb_build_object(
    'company_id', _inv.organization_id,
    'role', _role_enum::text,
    'invitation_id', _inv.id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE (
  id uuid,
  email text,
  status text,
  organization_id uuid,
  role text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, status, organization_id, role, created_at
  FROM public.organization_invitations
  WHERE token = _token AND status = 'pending' AND created_at > now()-interval '7 days'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _tier public.subscription_tier; _status public.subscription_status;
BEGIN
  IF _company_id IS NULL OR (auth.role() IS DISTINCT FROM 'service_role' AND _company_id IS DISTINCT FROM public.get_user_company(auth.uid())) THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN RETURN false; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  IF _status='trialing' AND NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE company_id=_company_id AND trial_ends_at>now()) THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'predictive_maintenance' THEN _tier IN ('pro','business')
    WHEN 'analytics' THEN _tier IN ('pro','business')
    WHEN 'automations' THEN _tier IN ('pro','business')
    WHEN 'api' THEN _tier = 'business'
    WHEN 'sso' THEN _tier = 'business'
    WHEN 'lubricant_tracking' THEN _tier IN ('pro','business')
    WHEN 'parts_inventory' THEN _tier IN ('pro','business')
    WHEN 'meter_based_pm' THEN _tier IN ('pro','business')
    WHEN 'bulk_pm_generation' THEN _tier IN ('pro','business')
    WHEN 'purchasing' THEN _tier IN ('pro','business')
    WHEN 'failure_downtime_codes' THEN _tier IN ('pro','business')
    WHEN 'mobile_pwa_offline' THEN _tier IN ('pro','business')
    ELSE false END;
END;
$$;

REVOKE ALL ON FUNCTION public.has_feature(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_feature(uuid,text) TO authenticated,service_role;
REVOKE INSERT,UPDATE,DELETE ON public.asset_risk_score_runs FROM anon,authenticated;

CREATE POLICY "daybreak predictive entitlement" ON public.asset_health_metrics AS RESTRICTIVE FOR ALL TO authenticated
 USING (public.has_feature(company_id,'predictive_maintenance')) WITH CHECK (public.has_feature(company_id,'predictive_maintenance'));

CREATE POLICY "daybreak predictive entitlement" ON public.asset_failure_events AS RESTRICTIVE FOR ALL TO authenticated
 USING (public.has_feature(company_id,'predictive_maintenance')) WITH CHECK (public.has_feature(company_id,'predictive_maintenance'));

CREATE POLICY "daybreak predictive entitlement" ON public.asset_risk_scores AS RESTRICTIVE FOR ALL TO authenticated
 USING (public.has_feature(company_id,'predictive_maintenance')) WITH CHECK (public.has_feature(company_id,'predictive_maintenance'));

CREATE POLICY "daybreak predictive entitlement" ON public.asset_risk_score_runs AS RESTRICTIVE FOR ALL TO authenticated
 USING (public.has_feature(company_id,'predictive_maintenance')) WITH CHECK (public.has_feature(company_id,'predictive_maintenance'));

CREATE OR REPLACE FUNCTION public.company_within_limit_for(_company uuid, _resource text)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
  _limit integer;
  _count integer;
BEGIN
  IF _company IS NULL THEN RETURN false; END IF;
  IF auth.role() IS DISTINCT FROM 'service_role' AND _company IS DISTINCT FROM public.get_user_company(auth.uid()) THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(_company::text, 7711));
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company;
  IF _tier IS NULL THEN RETURN false; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  IF _status='trialing' AND NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE company_id=_company AND trial_ends_at>now()) THEN RETURN false; END IF;

  IF _resource = 'asset' THEN
    _limit := CASE _tier WHEN 'starter' THEN 50 WHEN 'pro' THEN 500 ELSE NULL END;
    IF _limit IS NULL THEN RETURN true; END IF;
    SELECT count(*) INTO _count FROM public.assets WHERE company_id = _company;
    RETURN _count < _limit;
  ELSIF _resource = 'work_order' THEN
    _limit := CASE _tier WHEN 'starter' THEN 100 WHEN 'pro' THEN 2000 ELSE NULL END;
    IF _limit IS NULL THEN RETURN true; END IF;
    SELECT count(*) INTO _count FROM public.work_orders
      WHERE company_id = _company
        AND created_at >= date_trunc('month', now());
    RETURN _count < _limit;
  ELSIF _resource = 'seat' THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.company_within_limit_for(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_within_limit_for(uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.company_within_limit(_resource text)
RETURNS boolean LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
 SELECT public.company_within_limit_for(public.get_user_company(auth.uid()),_resource);
$$;
-- Existing update trigger protects role/company without recursive RLS or NULL equality.
DROP POLICY IF EXISTS "Profiles: cannot change role or company" ON public.profiles;
ALTER TABLE public.system_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_id_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE storage.buckets SET public=false, file_size_limit=10485760,
 allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','image/gif'] WHERE id='asset-images';
UPDATE storage.buckets SET file_size_limit=26214400,
 allowed_mime_types=ARRAY['application/pdf','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'application/vnd.ms-excel','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'image/png','image/jpeg','image/webp','text/plain'] WHERE id='onboarding-docs';
CREATE POLICY "daybreak asset upload roles" ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (bucket_id<>'asset-images' OR
 ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text AND
 (public.can_manage_company(public.get_user_company(auth.uid())) OR
 ((storage.foldername(name))[2] IN ('work_order','daily_log','inspection') AND public.has_role(auth.uid(),'technician')))));
CREATE POLICY "daybreak asset object update" ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated
USING (bucket_id<>'asset-images' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text
 AND ((owner=auth.uid() OR owner_id=auth.uid()::text) OR public.has_role(auth.uid(),'administrator'))))
WITH CHECK (bucket_id<>'asset-images' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text
 AND ((owner=auth.uid() OR owner_id=auth.uid()::text) OR public.has_role(auth.uid(),'administrator'))));
CREATE POLICY "daybreak asset object delete" ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated
USING (bucket_id<>'asset-images' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text
 AND ((owner=auth.uid() OR owner_id=auth.uid()::text) OR public.has_role(auth.uid(),'administrator'))));

CREATE POLICY "daybreak floorplan insert" ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id<>'floor-plans' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text AND public.can_manage_company(public.get_user_company(auth.uid()))));

CREATE POLICY "daybreak floorplan update" ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (bucket_id<>'floor-plans' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text AND public.can_manage_company(public.get_user_company(auth.uid())))) WITH CHECK (bucket_id<>'floor-plans' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text AND public.can_manage_company(public.get_user_company(auth.uid()))));

CREATE POLICY "daybreak floorplan delete" ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (bucket_id<>'floor-plans' OR ((storage.foldername(name))[1]=public.get_user_company(auth.uid())::text AND public.can_manage_company(public.get_user_company(auth.uid())))) ;

CREATE OR REPLACE FUNCTION public.audit_attachment_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE row_data public.attachments; event text;
BEGIN
 row_data := CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
 IF auth.uid() IS NULL THEN RETURN NULL; END IF;
 event := CASE TG_OP WHEN 'INSERT' THEN 'uploaded' WHEN 'DELETE' THEN 'deleted'
 ELSE CASE WHEN NEW.sort_order IS DISTINCT FROM OLD.sort_order THEN 'reordered' ELSE 'updated' END END;
 INSERT INTO public.attachment_audit_log(company_id,entity_type,entity_id,attachment_id,action,actor_id,details)
 VALUES(row_data.company_id,row_data.entity_type,row_data.entity_id,row_data.id,event,auth.uid(),
 jsonb_build_object('caption',row_data.caption,'description',row_data.description,'sort_order',row_data.sort_order));
 RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.audit_attachment_change() FROM PUBLIC;
CREATE TRIGGER daybreak_attachment_audit AFTER INSERT OR UPDATE OR DELETE ON public.attachments
FOR EACH ROW EXECUTE FUNCTION public.audit_attachment_change();
REVOKE INSERT,UPDATE,DELETE ON public.attachment_audit_log FROM anon,authenticated;
CREATE OR REPLACE FUNCTION public.log_attachment_event(_entity_type text,_entity_id uuid,_action text,_attachment_id uuid DEFAULT NULL,_details jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='42501'; END IF;
 -- Compatibility shim. The row trigger records the real event atomically.
END; $$;

CREATE TABLE public.operation_budgets (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 operation text NOT NULL CHECK(operation IN ('extract-assets','maintenance-assistant','send-email','trial-signup','resolve-public-request')),
 window_started_at timestamptz NOT NULL DEFAULT now(), used integer NOT NULL CHECK(used>=0),
 PRIMARY KEY(user_id,operation)
);
ALTER TABLE public.operation_budgets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.operation_budgets FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.operation_budgets TO service_role;
CREATE OR REPLACE FUNCTION public.consume_operation_budget(p_user_id uuid,p_operation text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE limit_count integer; consumed integer;
BEGIN
 limit_count := CASE p_operation WHEN 'extract-assets' THEN 5 WHEN 'maintenance-assistant' THEN 20 WHEN 'send-email' THEN 10 WHEN 'resolve-public-request' THEN 10 WHEN 'trial-signup' THEN 1 END;
 IF p_user_id IS NULL OR limit_count IS NULL THEN RAISE EXCEPTION 'Invalid budget operation'; END IF;
 INSERT INTO public.operation_budgets(user_id,operation,used) VALUES(p_user_id,p_operation,1)
 ON CONFLICT(user_id,operation) DO UPDATE
 SET used=CASE WHEN p_operation<>'trial-signup' AND operation_budgets.window_started_at<=now()-interval '1 hour' THEN 1 ELSE operation_budgets.used+1 END,
 window_started_at=CASE WHEN p_operation<>'trial-signup' AND operation_budgets.window_started_at<=now()-interval '1 hour' THEN now() ELSE operation_budgets.window_started_at END
 WHERE operation_budgets.used<limit_count OR (p_operation<>'trial-signup' AND operation_budgets.window_started_at<=now()-interval '1 hour')
 RETURNING used INTO consumed;
 RETURN consumed IS NOT NULL;
END; $$;
REVOKE ALL ON FUNCTION public.consume_operation_budget(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_operation_budget(uuid,text) TO service_role;

DO $$ DECLARE c record; BEGIN
 FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='public.vendor_assets'::regclass AND confrelid='public.assets'::regclass AND contype='f'
 LOOP EXECUTE format('ALTER TABLE public.vendor_assets DROP CONSTRAINT %I',c.conname); END LOOP;
 ALTER TABLE public.vendor_assets ADD CONSTRAINT vendor_assets_asset_id_fkey FOREIGN KEY(asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END; $$;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
UPDATE public.subscriptions SET trial_started_at=created_at WHERE trial_started_at IS NULL AND (status='trialing' OR trial_ends_at IS NOT NULL);
CREATE OR REPLACE FUNCTION public.preserve_subscription_trial_start()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.trial_started_at IS NOT NULL THEN NEW.trial_started_at:=OLD.trial_started_at;
 ELSIF NEW.status='trialing' OR NEW.trial_ends_at IS NOT NULL THEN NEW.trial_started_at:=coalesce(NEW.trial_started_at,now()); END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.preserve_subscription_trial_start() FROM PUBLIC;
CREATE TRIGGER daybreak_trial_history BEFORE INSERT OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.preserve_subscription_trial_start();
-- Directory exposes names to teammates, contact details only to owner/admin.
CREATE POLICY "daybreak profile contact privacy" ON public.profiles AS RESTRICTIVE FOR SELECT TO authenticated
USING (id=auth.uid() OR (company_id=public.get_user_company(auth.uid()) AND public.has_role(auth.uid(),'administrator')));
CREATE OR REPLACE FUNCTION public.get_company_directory()
RETURNS TABLE(id uuid,first_name text,last_name text,email text,avatar_url text,role text,company_id uuid,company_name text,created_at timestamptz,updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT DISTINCT ON (p.id) p.id,p.first_name,p.last_name,
 CASE WHEN p.id=auth.uid() OR public.has_role(auth.uid(),'administrator') THEN p.email ELSE NULL END,
 p.avatar_url,p.role,p.company_id,p.company_name,p.created_at,p.updated_at
 FROM public.profiles p WHERE p.company_id=public.get_user_company(auth.uid()) ORDER BY p.id,p.updated_at DESC NULLS LAST;
$$;
-- Notification history needs only company membership, not access to creator PII.
DROP POLICY IF EXISTS "Members view notifications by work order in company" ON public.notifications;
CREATE POLICY "Members view notifications by work order in company" ON public.notifications FOR SELECT TO authenticated
USING(company_id=public.get_user_company(auth.uid()) AND reference_id IN
 (SELECT w.id::text FROM public.work_orders w WHERE w.company_id=public.get_user_company(auth.uid())));

CREATE OR REPLACE FUNCTION public.can_attach_to_entity(_company uuid,_type text,_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF _company IS DISTINCT FROM public.get_user_company(auth.uid()) THEN RETURN false; END IF;
 CASE _type
 WHEN 'asset' THEN RETURN public.can_manage_company(_company) AND EXISTS(SELECT 1 FROM public.assets WHERE id=_id AND company_id=_company);
 WHEN 'location' THEN RETURN public.has_role(auth.uid(),'administrator') AND EXISTS(SELECT 1 FROM public.locations WHERE id=_id AND company_id=_company);
 WHEN 'work_order' THEN RETURN EXISTS(SELECT 1 FROM public.work_orders WHERE id=_id AND company_id=_company AND (public.can_manage_company(_company) OR (public.has_role(auth.uid(),'technician') AND assigned_to=auth.uid())));
 WHEN 'report' THEN RETURN public.can_manage_company(_company) AND public.has_feature(_company,'analytics');
 WHEN 'vendor' THEN RETURN public.can_manage_company(_company) AND EXISTS(SELECT 1 FROM public.vendors WHERE id=_id AND company_id=_company);
 WHEN 'daily_log' THEN RETURN EXISTS(SELECT 1 FROM public.daily_logs WHERE id=_id AND user_id=auth.uid());
 WHEN 'inspection' THEN RETURN EXISTS(SELECT 1 FROM public.checklist_submissions s JOIN public.checklists c ON c.id=s.checklist_id WHERE s.id=_id AND c.company_id=_company AND (public.can_manage_company(_company) OR s.submitted_by=auth.uid()));
 ELSE RETURN false;
 END CASE;
END; $$;
REVOKE ALL ON FUNCTION public.can_attach_to_entity(uuid,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_attach_to_entity(uuid,text,uuid) TO authenticated,service_role;
CREATE POLICY "daybreak attachment entity authorization" ON public.attachments AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK(public.can_attach_to_entity(company_id,entity_type,entity_id) AND uploaded_by=auth.uid()
 AND storage_path LIKE company_id::text || '/' || entity_type || '/' || entity_id::text || '/%');

-- A single company lock serializes competing reparent operations, including
-- bulk updates. The recursive walk also rejects entering an existing cycle.
CREATE OR REPLACE FUNCTION public.validate_location_ancestry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE bad boolean;
BEGIN
 IF TG_OP='UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
 RAISE EXCEPTION 'A location cannot change company' USING ERRCODE='23514'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.company_id::text,7712));
 IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.locations WHERE id=NEW.parent_id AND company_id=NEW.company_id) THEN
 RAISE EXCEPTION 'Parent location must belong to the same company' USING ERRCODE='23514'; END IF;
 WITH RECURSIVE ancestors AS (
 SELECT id,parent_id,ARRAY[id] AS visited,false AS cycle FROM public.locations WHERE id=NEW.parent_id
 UNION ALL SELECT p.id,p.parent_id,a.visited||p.id,p.id=ANY(a.visited)
 FROM public.locations p JOIN ancestors a ON p.id=a.parent_id WHERE NOT a.cycle
 ) SELECT EXISTS(SELECT 1 FROM ancestors WHERE id=NEW.id OR cycle) INTO bad;
 IF bad THEN RAISE EXCEPTION 'Location hierarchy cannot contain a cycle' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validate_location_ancestry() FROM PUBLIC;
CREATE TRIGGER daybreak_location_ancestry BEFORE INSERT OR UPDATE OF parent_id,company_id ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.validate_location_ancestry();

CREATE POLICY "daybreak company presence receive" ON realtime.messages FOR SELECT TO authenticated
USING (private AND extension='presence' AND realtime.topic()='company:'||public.get_user_company(auth.uid())::text||':presence');
CREATE POLICY "daybreak company presence send" ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (private AND extension='presence' AND realtime.topic()='company:'||public.get_user_company(auth.uid())::text||':presence');
CREATE POLICY "daybreak own message topic receive" ON realtime.messages FOR SELECT TO authenticated
USING (private AND extension='postgres_changes' AND
 (realtime.topic() ~ ('^user:'||auth.uid()::text||':messages:[0-9a-f-]{36}$') OR
 realtime.topic() ~ ('^user:'||auth.uid()::text||':team-messages:[A-Za-z0-9_-]{1,100}$')));
CREATE POLICY "daybreak own message topic connect" ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (private AND extension='postgres_changes' AND
 (realtime.topic() ~ ('^user:'||auth.uid()::text||':messages:[0-9a-f-]{36}$') OR
 realtime.topic() ~ ('^user:'||auth.uid()::text||':team-messages:[A-Za-z0-9_-]{1,100}$')));

CREATE OR REPLACE FUNCTION public.complete_personal_onboarding(_first_name text DEFAULT NULL,_last_name text DEFAULT NULL,_phone text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='42501'; END IF;
 result:=public.complete_owner_onboarding_with_timezone('Personal workspace',_first_name,_last_name,_phone,'UTC');
 UPDATE public.profiles SET account_type='personal' WHERE id=auth.uid();
 RETURN result||jsonb_build_object('account_type','personal');
END; $$;
REVOKE ALL ON FUNCTION public.complete_personal_onboarding(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_personal_onboarding(text,text,text) TO authenticated;

CREATE POLICY "daybreak published blog posts" ON public.blog_posts AS RESTRICTIVE FOR SELECT TO anon,authenticated
USING (published_at IS NOT NULL AND published_at<=now());
CREATE TABLE public.public_request_notification_claims (
 request_id uuid PRIMARY KEY,
 recipient_email text NOT NULL,
 claimed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX daybreak_request_claim_recipient ON public.public_request_notification_claims(recipient_email,claimed_at DESC);
ALTER TABLE public.public_request_notification_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_request_notification_claims FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.public_request_notification_claims TO service_role;
CREATE OR REPLACE FUNCTION public.claim_request_notification(p_request_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE claimed uuid; recipient text;
BEGIN
 SELECT lower(btrim(contact_email)) INTO recipient FROM public.public_requests WHERE id=p_request_id;
 IF recipient IS NULL OR recipient='' THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(recipient,7713));
 IF EXISTS (SELECT 1 FROM public.public_request_notification_claims WHERE recipient_email=recipient AND claimed_at>now()-interval '1 day') THEN RETURN false; END IF;
 INSERT INTO public.public_request_notification_claims(request_id,recipient_email) VALUES(p_request_id,recipient)
 ON CONFLICT(request_id) DO NOTHING RETURNING request_id INTO claimed;
 RETURN claimed IS NOT NULL;
END; $$;
REVOKE ALL ON FUNCTION public.claim_request_notification(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_request_notification(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.guard_recurring_checklist_entitlement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE company uuid; frequency text;
BEGIN
 IF auth.uid() IS NULL AND auth.role() IS NULL THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='checklists' THEN company:=NEW.company_id; frequency:=NEW.frequency;
 ELSE
 IF NEW.next_due_at IS NULL THEN RETURN NEW; END IF;
 SELECT c.company_id,c.frequency INTO company,frequency FROM public.checklists c WHERE c.id=NEW.checklist_id; END IF;
 IF coalesce(frequency,'one-time')<>'one-time' AND NOT public.has_feature(company,'automations') THEN
 RAISE EXCEPTION 'Recurring checklists require automations' USING ERRCODE='42501'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_recurring_checklist_entitlement() FROM PUBLIC;
CREATE TRIGGER daybreak_recurring_checklist BEFORE INSERT OR UPDATE OF frequency ON public.checklists
FOR EACH ROW EXECUTE FUNCTION public.guard_recurring_checklist_entitlement();
CREATE TRIGGER daybreak_recurring_schedule BEFORE INSERT OR UPDATE ON public.checklist_schedules
FOR EACH ROW EXECUTE FUNCTION public.guard_recurring_checklist_entitlement();

CREATE OR REPLACE FUNCTION public.run_scheduled_risk_recompute()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/recompute-risk-scores';
  _secret text;
  _request_id bigint;
BEGIN
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE lower(name) = 'maintenance_job_secret'
  LIMIT 1;

  IF _secret IS NULL THEN
    RAISE WARNING 'run_scheduled_risk_recompute: Vault secret maintenance_job_secret not found; the edge function will reject this call';
  END IF;

  SELECT net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-maintenance-secret', COALESCE(_secret, '')
    ),
    body := jsonb_build_object('triggered_by', 'scheduled')
  ) INTO _request_id;

  RAISE LOG 'run_scheduled_risk_recompute: dispatched recompute, net request_id=%', _request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.company_has_active_subscription(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT (auth.role()='service_role' OR _company=public.get_user_company(auth.uid())) AND EXISTS
 (SELECT 1 FROM public.subscriptions WHERE company_id=_company AND (status='active' OR (status='trialing' AND trial_ends_at>now())));
$$;
REVOKE ALL ON FUNCTION public.company_has_active_subscription(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.company_has_active_subscription(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.guard_operational_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE row_data jsonb; company uuid;
BEGIN
 IF auth.uid() IS NULL OR auth.role()='service_role' THEN
  IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
 END IF;
 row_data:=CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
 company:=(row_data->>'company_id')::uuid;
 IF company IS NULL AND row_data ? 'checklist_id' THEN
 SELECT c.company_id INTO company FROM public.checklists c WHERE c.id=(row_data->>'checklist_id')::uuid;
 ELSIF company IS NULL AND row_data ? 'submission_id' THEN
 SELECT c.company_id INTO company FROM public.checklist_submissions s JOIN public.checklists c ON c.id=s.checklist_id WHERE s.id=(row_data->>'submission_id')::uuid;
 END IF;
 -- Parent deletion was already authorized; FK cascades run after its row is gone.
 IF company IS NULL AND TG_OP='DELETE' AND pg_trigger_depth()>1 THEN RETURN OLD; END IF;
 IF NOT coalesce(public.company_has_active_subscription(company),false) THEN
 RAISE EXCEPTION 'An active subscription is required' USING ERRCODE='42501'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.guard_operational_subscription() FROM PUBLIC;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['assets','work_orders','locations','vendors','checklists','checklist_submissions',
 'checklist_submission_items','checklist_assets','checklist_schedules','energy_readings','maintenance_costs',
 'asset_health_metrics','asset_failure_events','asset_risk_scores','floor_plans','floor_plan_markers','attachments']
 LOOP EXECUTE format('CREATE TRIGGER zz_daybreak_active_subscription BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.guard_operational_subscription()',t); END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.get_company_subscription()
RETURNS TABLE (
  tier public.subscription_tier,
  status public.subscription_status,
  billing_interval public.billing_interval,
  included_seats integer,
  paid_seats integer,
  total_seats integer,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  is_active boolean,
  asset_limit integer,
  work_order_limit integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    s.tier, s.status, s.billing_interval, s.included_seats, s.paid_seats,
    (s.included_seats + s.paid_seats) AS total_seats,
    s.trial_ends_at, s.current_period_end, s.cancel_at_period_end,
    (s.status='active' OR (s.status='trialing' AND coalesce(s.trial_ends_at>now(),false))) AS is_active,
    CASE s.tier WHEN 'starter' THEN 50 WHEN 'pro' THEN 500 WHEN 'business' THEN NULL END AS asset_limit,
    CASE s.tier WHEN 'starter' THEN 100 WHEN 'pro' THEN 2000 WHEN 'business' THEN NULL END AS work_order_limit
  FROM public.subscriptions s
  WHERE s.company_id = public.get_user_company(auth.uid())
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_company_subscription() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_company_subscription() TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_client_relationship_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE col text;
BEGIN
 IF auth.uid() IS NOT NULL AND auth.role() IS DISTINCT FROM 'service_role' THEN
 FOREACH col IN ARRAY TG_ARGV LOOP
 IF to_jsonb(NEW)->col IS DISTINCT FROM to_jsonb(OLD)->col THEN
 RAISE EXCEPTION 'Record identity and relationships are immutable' USING ERRCODE='42501'; END IF;
 END LOOP;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_client_relationship_columns() FROM PUBLIC;
CREATE TRIGGER daybreak_submission_relationships BEFORE UPDATE ON public.checklist_submissions FOR EACH ROW
EXECUTE FUNCTION public.guard_client_relationship_columns('id','checklist_id','submitted_by','submitted_at');
CREATE TRIGGER daybreak_checklist_item_relationships BEFORE UPDATE ON public.checklist_items FOR EACH ROW
EXECUTE FUNCTION public.guard_client_relationship_columns('id','checklist_id','created_at');

CREATE OR REPLACE FUNCTION public.create_pm_work_orders_from_preview(_items jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _company_tz text;
  _item record;
  _count integer := 0;
  _due_local timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'items must be array'; END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT coalesce(public.can_manage_company(_company_id),false) THEN RAISE EXCEPTION 'Manager access is required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_feature(_company_id, 'bulk_pm_generation') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Bulk PM generation requires Pro or Business';
  END IF;

  SELECT COALESCE(c.timezone, 'UTC') INTO _company_tz
  FROM public.companies c
  WHERE c.id = _company_id;

  FOR _item IN
    SELECT * FROM jsonb_to_recordset(_items) AS x(
      checklist_id uuid,
      asset_id uuid,
      due_at timestamptz
    )
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.checklists c WHERE c.id=_item.checklist_id AND c.company_id=_company_id) OR
      (_item.asset_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.assets a WHERE a.id=_item.asset_id AND a.company_id=_company_id)) THEN
      RAISE EXCEPTION 'Invalid PM tenant reference' USING ERRCODE='42501';
    END IF;
    _due_local := (
      ((_item.due_at AT TIME ZONE _company_tz)::date + time '12:00')
      AT TIME ZONE _company_tz
    );

    INSERT INTO public.work_orders (
      company_id, title, description, status, priority, asset_id, due_date, created_by
    )
    SELECT
      _company_id,
      'PM: ' || c.name,
      'Auto-generated from PM schedule',
      'pending',
      'medium',
      _item.asset_id,
      _due_local,
      _uid
    FROM public.checklists c
    WHERE c.id = _item.checklist_id AND c.company_id = _company_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;
REVOKE ALL ON FUNCTION public.create_pm_work_orders_from_preview(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_pm_work_orders_from_preview(jsonb) TO authenticated;
CREATE TRIGGER daybreak_public_request_content BEFORE UPDATE ON public.public_requests FOR EACH ROW
EXECUTE FUNCTION public.guard_client_relationship_columns('id','company_id','contact_email','contact_phone','contact_name','title','description','photos','created_at','user_agent','type','location_text');
CREATE OR REPLACE FUNCTION public.submit_checklist_atomic(
  _checklist_id uuid,
  _items jsonb,
  _notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _frequency text;
  _company_id uuid;
  _timezone text;
  _submitted_at timestamptz := pg_catalog.now();
  _submission public.checklist_submissions%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF pg_catalog.jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Checklist items must be a JSON array';
  END IF;

  IF pg_catalog.jsonb_array_length(_items) > 500 THEN
    RAISE EXCEPTION 'A checklist submission can include at most 500 responses';
  END IF;

  IF pg_catalog.octet_length(_items::text) > 1048576 THEN
    RAISE EXCEPTION 'Checklist response payload must be 1 MB or smaller';
  END IF;

  IF pg_catalog.length(COALESCE(_notes, '')) > 5000 THEN
    RAISE EXCEPTION 'Submission notes must be 5000 characters or fewer';
  END IF;

  SELECT c.frequency, co.timezone, c.company_id
  INTO _frequency, _timezone, _company_id
  FROM public.checklists AS c
  JOIN public.profiles AS p
    ON p.id = _uid
   AND p.company_id = c.company_id
  JOIN public.companies AS co
    ON co.id = c.company_id
  WHERE c.id = _checklist_id
    AND c.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Active checklist not found in the current company';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_to_recordset(_items) AS item(
      item_id uuid,
      response_value text,
      is_checked boolean,
      notes text,
      asset_id uuid
    )
    LEFT JOIN public.checklist_items AS ci
      ON ci.id = item.item_id
     AND ci.checklist_id = _checklist_id
    WHERE ci.id IS NULL
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'A response does not belong to this checklist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_to_recordset(_items) AS item(
      item_id uuid,
      response_value text,
      is_checked boolean,
      notes text,
      asset_id uuid
    )
    WHERE item.asset_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.checklist_assets AS ca
        WHERE ca.checklist_id = _checklist_id
          AND ca.asset_id = item.asset_id
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'A response asset is not linked to this checklist';
  END IF;

  INSERT INTO public.checklist_submissions (
    checklist_id,
    submitted_by,
    submitted_at,
    notes
  )
  VALUES (
    _checklist_id,
    _uid,
    _submitted_at,
    NULLIF(_notes, '')
  )
  RETURNING * INTO _submission;

  INSERT INTO public.checklist_submission_items (
    submission_id,
    checklist_item_id,
    response_value,
    is_checked,
    notes,
    asset_id
  )
  SELECT
    _submission.id,
    item.item_id,
    item.response_value,
    item.is_checked,
    item.notes,
    item.asset_id
  FROM pg_catalog.jsonb_to_recordset(_items) AS item(
    item_id uuid,
    response_value text,
    is_checked boolean,
    notes text,
    asset_id uuid
  );

  INSERT INTO public.checklist_schedules (
    checklist_id,
    next_due_at,
    last_submitted_at,
    updated_at
  )
  VALUES (
    _checklist_id,
    CASE WHEN COALESCE(_frequency,'one-time')='one-time' OR public.has_feature(_company_id,'automations') THEN public.next_checklist_due(
      COALESCE(_frequency, 'one-time'),
      _submitted_at,
      _timezone
    ) ELSE NULL END,
    _submitted_at,
    _submitted_at
  )
  ON CONFLICT (checklist_id) DO UPDATE
  SET next_due_at = EXCLUDED.next_due_at,
      last_submitted_at = EXCLUDED.last_submitted_at,
      updated_at = EXCLUDED.updated_at;

  RETURN pg_catalog.to_jsonb(_submission);
END;
$$;
COMMIT;
