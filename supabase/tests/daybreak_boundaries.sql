-- Run after daybreak_fixture.sql and the Daybreak migration, in a disposable DB.
\set ON_ERROR_STOP on
CREATE FUNCTION pg_temp.ok(value boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF value IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAILED: %',label; END IF; END $$;
CREATE FUNCTION pg_temp.denied(statement text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE affected bigint;
BEGIN
 BEGIN
 EXECUTE statement; GET DIAGNOSTICS affected=ROW_COUNT;
 IF affected=0 THEN RETURN; END IF;
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN RETURN;
 END;
 RAISE EXCEPTION 'Expected denied: %',statement;
END $$;
SELECT set_config('request.jwt.claim.role','service_role',false);
INSERT INTO public.companies(id,name) VALUES
 ('10000000-0000-0000-0000-000000000001','A'),('10000000-0000-0000-0000-000000000002','B'),('10000000-0000-0000-0000-000000000003','Starter');
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES
 ('20000000-0000-0000-0000-000000000001','admin@example.test',now()),
 ('20000000-0000-0000-0000-000000000002','manager@example.test',now()),
 ('20000000-0000-0000-0000-000000000003','technician@example.test',now()),
 ('20000000-0000-0000-0000-000000000004','viewer@example.test',now()),
 ('20000000-0000-0000-0000-000000000005','other@example.test',now()),
 ('20000000-0000-0000-0000-000000000006','invited@example.test',null),
 ('20000000-0000-0000-0000-000000000007','kyle@decent4.com',now()),
 ('20000000-0000-0000-0000-000000000008','stale-super@example.test',now()),
 ('20000000-0000-0000-0000-000000000009','new@example.test',now());
INSERT INTO public.profiles(id,email,first_name,company_id,role)
SELECT id,email,'Member',CASE WHEN id IN ('20000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000009') THEN NULL
 WHEN id='20000000-0000-0000-0000-000000000005' THEN '10000000-0000-0000-0000-000000000002'::uuid ELSE '10000000-0000-0000-0000-000000000001'::uuid END,
 CASE id WHEN '20000000-0000-0000-0000-000000000001' THEN 'administrator' WHEN '20000000-0000-0000-0000-000000000002' THEN 'manager'
 WHEN '20000000-0000-0000-0000-000000000004' THEN 'viewer' ELSE 'technician' END FROM auth.users;
INSERT INTO public.user_roles(user_id,company_id,role) SELECT id,company_id,role::public.app_role FROM public.profiles WHERE company_id IS NOT NULL;
INSERT INTO public.user_roles(user_id,company_id,role) SELECT id,company_id,'super_admin' FROM public.profiles WHERE id IN ('20000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000008');
INSERT INTO public.subscriptions(company_id,tier,status,created_at) VALUES
 ('10000000-0000-0000-0000-000000000001','pro','active',now()),('10000000-0000-0000-0000-000000000002','business','active',now()),('10000000-0000-0000-0000-000000000003','starter','trialing',now());
INSERT INTO public.assets(id,company_id,name) VALUES('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','A'),('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','B');
INSERT INTO public.work_orders(id,company_id,created_by,assigned_to,title) VALUES('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Work');
INSERT INTO public.energy_readings(id,company_id,created_by,kwh) VALUES('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',5);
INSERT INTO public.notifications(id,user_id,company_id,type,provider_message_id,read) VALUES
 ('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','email','provider-A',false);
INSERT INTO public.email_events(provider_message_id,event_type) VALUES('provider-A','delivered');
INSERT INTO public.checklists(id,company_id,created_by,frequency) VALUES('70000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','daily'),('70000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005','daily');
INSERT INTO public.checklist_items(id,checklist_id) VALUES('71000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001'),('71000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000002');
INSERT INTO public.checklist_submissions(id,checklist_id,submitted_by) VALUES('72000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003');
INSERT INTO public.checklist_submission_items(id,submission_id,checklist_item_id,is_checked) VALUES('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001',false);
INSERT INTO storage.objects(id,bucket_id,name,owner_id) VALUES('80000000-0000-0000-0000-000000000001','asset-images','10000000-0000-0000-0000-000000000001/asset/30000000-0000-0000-0000-000000000001/photo.png','20000000-0000-0000-0000-000000000001');
INSERT INTO public.organization_invitations(id,organization_id,email,role,status,token,created_at) VALUES('90000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','invited@example.test','technician','pending','test-random-token',now());
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.denied($q$UPDATE public.energy_readings SET kwh=999$q$);
SELECT pg_temp.denied($q$DELETE FROM public.energy_readings$q$);
SELECT pg_temp.denied($q$INSERT INTO public.energy_readings(company_id,kwh) VALUES('10000000-0000-0000-0000-000000000001',999)$q$);
SELECT pg_temp.denied($q$SELECT public.get_or_create_energy_ingest_token()$q$);
SELECT pg_temp.denied($q$SELECT public.regenerate_energy_ingest_token()$q$);
SELECT pg_temp.denied($q$UPDATE public.notifications SET provider_message_id='provider-B'$q$);
SELECT pg_temp.denied($q$UPDATE public.notifications SET company_id='10000000-0000-0000-0000-000000000002'$q$);
UPDATE public.notifications SET read=true;
SELECT pg_temp.ok((SELECT read FROM public.notifications LIMIT 1),'read flag remains editable');
SELECT pg_temp.denied($q$DELETE FROM public.notifications WHERE type='email'$q$);
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.email_events),'email-event reads restored');
SELECT pg_temp.denied($q$INSERT INTO public.email_events(provider_message_id,event_type) VALUES('fake','delivered')$q$);
SELECT pg_temp.denied($q$UPDATE public.checklist_submission_items SET checklist_item_id='71000000-0000-0000-0000-000000000002'$q$);
SELECT pg_temp.denied($q$INSERT INTO public.checklist_submission_items(submission_id,checklist_item_id) VALUES('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002')$q$);
UPDATE public.checklist_submission_items SET is_checked=true,notes='Legitimate correction';
UPDATE public.work_orders SET status='completed' WHERE assigned_to=auth.uid();
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.work_orders WHERE status='completed'),'technician completion preserved');
SELECT pg_temp.denied($q$DELETE FROM public.work_orders$q$);
SELECT pg_temp.denied($q$UPDATE storage.objects SET metadata='{"forged":true}'$q$);
SELECT pg_temp.denied($q$DELETE FROM storage.objects$q$);
SELECT pg_temp.denied($q$INSERT INTO public.asset_risk_score_runs(company_id,status) VALUES('10000000-0000-0000-0000-000000000001','success')$q$);
SELECT pg_temp.ok(public.get_user_company('20000000-0000-0000-0000-000000000005') IS NULL,'cross-tenant helper metadata denied');
SELECT pg_temp.ok(public.get_user_company('20000000-0000-0000-0000-000000000001')='10000000-0000-0000-0000-000000000001','same-company recipient lookup preserved');
SELECT pg_temp.ok(NOT public.has_feature('10000000-0000-0000-0000-000000000002','analytics'),'cross-tenant plan probe denied');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.profiles),'private profile fields restricted');
SELECT pg_temp.ok((SELECT count(*)>1 FROM public.get_company_directory()),'safe directory still lists peers');
SELECT pg_temp.ok(NOT EXISTS(SELECT 1 FROM public.get_company_directory() WHERE id<>auth.uid() AND email IS NOT NULL),'directory masks peer emails');
SELECT pg_temp.denied($q$SELECT public.consume_operation_budget(auth.uid(),'send-email')$q$);
SELECT set_config('realtime.topic','company:10000000-0000-0000-0000-000000000001:presence',false);
INSERT INTO realtime.messages(extension,private) VALUES('presence',true);
SELECT set_config('realtime.topic','company:10000000-0000-0000-0000-000000000002:presence',false);
SELECT pg_temp.denied($q$INSERT INTO realtime.messages(extension,private) VALUES('presence',true)$q$);
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000008',false);
SELECT pg_temp.ok(NOT public.is_super_admin(auth.uid()),'stale super-admin role denied');
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000007',false);
SELECT pg_temp.ok(public.is_super_admin(auth.uid()),'verified internal admin preserved');
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000006',false);
SELECT pg_temp.denied($q$SELECT public.accept_invitation('test-random-token')$q$);
UPDATE public.profiles SET first_name='Pending';
SELECT pg_temp.ok((SELECT first_name='Pending' FROM public.profiles WHERE id=auth.uid()),'nullable profile edits work');
RESET ROLE;
UPDATE auth.users SET email_confirmed_at=now() WHERE id='20000000-0000-0000-0000-000000000006';
SET ROLE authenticated;
SELECT public.accept_invitation('test-random-token');
SELECT pg_temp.ok((SELECT company_id='10000000-0000-0000-0000-000000000001' FROM public.profiles WHERE id=auth.uid()),'confirmed invitation acceptance preserved');
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000002',false);
UPDATE public.energy_readings SET kwh=6;
SELECT pg_temp.ok((SELECT kwh=6 FROM public.energy_readings LIMIT 1),'manager energy edits preserved');
SELECT pg_temp.denied($q$INSERT INTO public.asset_health_metrics(company_id,asset_id) VALUES('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002')$q$);
INSERT INTO public.asset_health_metrics(company_id,asset_id) VALUES('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001');
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',false);
INSERT INTO public.locations(id,company_id,name) VALUES('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Root');
INSERT INTO public.locations(id,company_id,name,parent_id) VALUES('a0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Child','a0000000-0000-0000-0000-000000000001');
SELECT pg_temp.denied($q$UPDATE public.locations SET parent_id='a0000000-0000-0000-0000-000000000002' WHERE id='a0000000-0000-0000-0000-000000000001'$q$);
SELECT pg_temp.denied($q$UPDATE public.locations SET parent_id=id$q$);
SELECT pg_temp.ok((SELECT count(*)=2 FROM public.locations),'acyclic locations preserved');
INSERT INTO public.system_settings(id) VALUES('b0000000-0000-0000-0000-000000000001');
SELECT pg_temp.ok((SELECT user_id=auth.uid() FROM public.system_settings LIMIT 1),'settings derive owner');
INSERT INTO public.attachments(company_id,entity_type,entity_id,uploaded_by,storage_path) VALUES('10000000-0000-0000-0000-000000000001','asset','30000000-0000-0000-0000-000000000001',auth.uid(),'10000000-0000-0000-0000-000000000001/asset/30000000-0000-0000-0000-000000000001/new.png');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.attachment_audit_log),'actual attachment event logged');
SELECT public.log_attachment_event('asset','30000000-0000-0000-0000-000000000001','deleted',null,'{"forged":true}');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.attachment_audit_log),'legacy audit RPC cannot forge events');
SELECT pg_temp.denied($q$UPDATE public.attachments SET uploaded_by='20000000-0000-0000-0000-000000000005'$q$);
UPDATE public.attachments SET caption='Approved edit';
SELECT pg_temp.ok((SELECT count(*)=2 FROM public.attachment_audit_log),'metadata edit logged atomically');
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false);
SET ROLE service_role;
DO $$ DECLARE operation text; maximum integer; i integer; BEGIN
 FOREACH operation IN ARRAY ARRAY['extract-assets','maintenance-assistant','send-email','trial-signup','resolve-public-request'] LOOP
 maximum:=CASE operation WHEN 'extract-assets' THEN 5 WHEN 'maintenance-assistant' THEN 20 WHEN 'send-email' THEN 10 WHEN 'resolve-public-request' THEN 10 ELSE 1 END;
 FOR i IN 1..maximum LOOP PERFORM pg_temp.ok(public.consume_operation_budget('20000000-0000-0000-0000-000000000001',operation),'allowed budget'); END LOOP;
 PERFORM pg_temp.ok(NOT public.consume_operation_budget('20000000-0000-0000-0000-000000000001',operation),'exhausted budget');
 END LOOP;
END $$;
UPDATE public.operation_budgets SET window_started_at=now()-interval '2 hours';
SELECT pg_temp.ok(public.consume_operation_budget('20000000-0000-0000-0000-000000000001','send-email'),'hourly budget resets');
SELECT pg_temp.ok(NOT public.consume_operation_budget('20000000-0000-0000-0000-000000000001','trial-signup'),'trial budget never resets');
INSERT INTO public.public_requests(id,company_id,contact_email) VALUES('c0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','recipient@example.test');
SELECT pg_temp.ok(public.claim_request_notification('c0000000-0000-0000-0000-000000000001'),'first notification claim');
SELECT pg_temp.ok(NOT public.claim_request_notification('c0000000-0000-0000-0000-000000000001'),'duplicate notification claim');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',false);
INSERT INTO public.blog_posts(id,published_at) VALUES(1,now()-interval '1 hour'),(2,null),(3,now()+interval '1 hour');
SET ROLE anon;
SELECT set_config('request.jwt.claim.role','anon',false);
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.blog_posts),'draft/future blog posts hidden');
SELECT pg_temp.denied($q$SELECT public.has_role('20000000-0000-0000-0000-000000000001','administrator')$q$);
SELECT pg_temp.denied($q$SELECT public.company_within_limit_for('10000000-0000-0000-0000-000000000001','asset')$q$);
RESET ROLE;
SELECT 'daybreak SQL security and compatibility checks passed' AS result;
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('20000000-0000-0000-0000-000000000010','quota@example.test',now());
INSERT INTO public.profiles(id,email,first_name,company_id,role) VALUES('20000000-0000-0000-0000-000000000010','quota@example.test','Quota','10000000-0000-0000-0000-000000000003','administrator');
INSERT INTO public.user_roles(user_id,company_id,role) VALUES('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003','administrator');
UPDATE public.subscriptions SET trial_ends_at=now()+interval '7 days' WHERE company_id='10000000-0000-0000-0000-000000000003';
INSERT INTO public.assets(company_id,name) SELECT '10000000-0000-0000-0000-000000000003','Quota '||i FROM generate_series(1,49) AS i;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000010',false);
SELECT pg_temp.denied($q$INSERT INTO public.assets(company_id,name) SELECT '10000000-0000-0000-0000-000000000003','Overflow' FROM generate_series(1,2)$q$);
SELECT pg_temp.ok((SELECT count(*)=49 FROM public.assets),'bulk quota insert rolls back all overflow');
INSERT INTO public.assets(company_id,name) VALUES('10000000-0000-0000-0000-000000000003','Last allowed');
SELECT pg_temp.ok((SELECT count(*)=50 FROM public.assets),'single remaining quota slot allowed');
SELECT pg_temp.denied($q$INSERT INTO public.checklists(company_id,created_by,frequency) VALUES('10000000-0000-0000-0000-000000000003',auth.uid(),'daily')$q$);
INSERT INTO public.checklists(company_id,created_by,frequency) VALUES('10000000-0000-0000-0000-000000000003',auth.uid(),'one-time');
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
DELETE FROM public.assets WHERE name='Last allowed';
UPDATE public.subscriptions SET trial_ends_at=now()-interval '1 minute' WHERE company_id='10000000-0000-0000-0000-000000000003';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000010',false);
SELECT pg_temp.ok(NOT public.company_has_active_subscription('10000000-0000-0000-0000-000000000003'),'expired trial is inactive');
SELECT pg_temp.ok(NOT (SELECT is_active FROM public.get_company_subscription()),'subscription RPC agrees on expired trial');
SELECT pg_temp.denied($q$UPDATE public.assets SET name='After expiry'$q$);
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
UPDATE public.subscriptions SET trial_ends_at=now()+interval '7 days' WHERE company_id='10000000-0000-0000-0000-000000000003';
UPDATE public.organization_invitations SET status='pending',created_at=now()-interval '8 days' WHERE token='test-random-token';
SET ROLE anon;
SELECT pg_temp.ok(NOT EXISTS(SELECT 1 FROM public.get_invitation_by_token('test-random-token')),'expired invitation preview hidden');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000009',false);
SELECT public.complete_personal_onboarding('Personal','User',null);
SELECT pg_temp.ok((SELECT company_id IS NOT NULL AND account_type='personal' FROM public.profiles WHERE id=auth.uid()),'personal onboarding creates private workspace');
SELECT pg_temp.ok((SELECT tier='pro' AND is_active FROM public.get_company_subscription()),'personal workspace receives Pro trial');
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
INSERT INTO public.locations(id,company_id,name) VALUES('a0000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Concurrent A'),('a0000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Concurrent B');
INSERT INTO public.daily_logs(user_id,date) VALUES('20000000-0000-0000-0000-000000000009',current_date);
DELETE FROM auth.users WHERE id='20000000-0000-0000-0000-000000000009';
SELECT pg_temp.ok(NOT EXISTS(SELECT 1 FROM public.daily_logs WHERE user_id='20000000-0000-0000-0000-000000000009'),'daily logs cascade on account deletion');
INSERT INTO public.assets(id,company_id,name) VALUES('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Delete');
INSERT INTO public.vendor_assets(asset_id) VALUES('30000000-0000-0000-0000-000000000003');
DELETE FROM public.assets WHERE id='30000000-0000-0000-0000-000000000003';
SELECT pg_temp.ok(NOT EXISTS(SELECT 1 FROM public.vendor_assets WHERE asset_id='30000000-0000-0000-0000-000000000003'),'vendor links deleted atomically');
SELECT 'quota, expiry, onboarding and deletion checks passed' AS result;
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.denied($q$UPDATE public.checklist_submissions SET checklist_id='70000000-0000-0000-0000-000000000002' WHERE submitted_by=auth.uid()$q$);
SELECT pg_temp.denied($q$SELECT public.create_pm_work_orders_from_preview('[{"checklist_id":"70000000-0000-0000-0000-000000000001","asset_id":"30000000-0000-0000-0000-000000000001","due_at":"2026-11-15T12:00:00Z"}]')$q$);
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',false);
INSERT INTO public.checklist_assets(checklist_id,asset_id) VALUES('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001');
INSERT INTO public.checklist_schedules(checklist_id) VALUES('70000000-0000-0000-0000-000000000001');
SELECT pg_temp.denied($q$SELECT public.create_pm_work_orders_from_preview('[{"checklist_id":"70000000-0000-0000-0000-000000000001","asset_id":"30000000-0000-0000-0000-000000000002","due_at":"2026-11-15T12:00:00Z"}]')$q$);
SELECT pg_temp.ok(public.create_pm_work_orders_from_preview('[{"checklist_id":"70000000-0000-0000-0000-000000000001","asset_id":"30000000-0000-0000-0000-000000000001","due_at":"2026-11-15T12:00:00Z"}]')=1,'manager PM creation works');
DELETE FROM public.checklists WHERE id='70000000-0000-0000-0000-000000000001';
SELECT pg_temp.ok(NOT EXISTS(SELECT 1 FROM public.checklist_schedules WHERE checklist_id='70000000-0000-0000-0000-000000000001'),'checklist cascade deletion preserved');
RESET ROLE;
SELECT 'review bypass and cascade regression checks passed' AS result;

RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
INSERT INTO public.public_requests(id,company_id,contact_email) VALUES('c0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',' RECIPIENT@example.test ');
SELECT pg_temp.ok(NOT public.claim_request_notification('c0000000-0000-0000-0000-000000000002'),'recipient daily limit spans request IDs and email casing');
DELETE FROM public.public_requests WHERE id='c0000000-0000-0000-0000-000000000001';
SELECT pg_temp.ok(NOT public.claim_request_notification('c0000000-0000-0000-0000-000000000002'),'recipient claim survives original request deletion');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.denied($q$UPDATE public.public_requests SET contact_email='new-recipient@example.test'$q$);
UPDATE public.public_requests SET status='resolved';
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.ok(length(public.get_or_create_energy_ingest_token())=48,'admin token creation works');
SELECT pg_temp.ok(length(public.regenerate_energy_ingest_token())=48,'admin token rotation works');
UPDATE storage.objects SET metadata='{"approved":true}' WHERE owner_id=auth.uid()::text;
SELECT pg_temp.ok((SELECT count(*)=1 FROM storage.objects WHERE metadata->>'approved'='true'),'uploader image update preserved');
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);

SELECT pg_temp.ok(public.company_has_active_subscription('10000000-0000-0000-0000-000000000001'),'service subscription lookup works without user subject');
INSERT INTO public.work_orders(company_id,created_by,title,created_at)
SELECT '10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000010','Quota work order',now() FROM generate_series(1,99);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000010',false);
SELECT pg_temp.denied($q$INSERT INTO public.work_orders(company_id,created_by,title) SELECT '10000000-0000-0000-0000-000000000003',auth.uid(),'Overflow' FROM generate_series(1,2)$q$);
SELECT pg_temp.ok((SELECT count(*)=99 FROM public.work_orders),'bulk monthly work-order quota rejects overflow');
SELECT set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000004',false);
SELECT pg_temp.denied($q$INSERT INTO public.maintenance_costs(company_id) VALUES('10000000-0000-0000-0000-000000000001')$q$);
SELECT pg_temp.denied($q$INSERT INTO public.floor_plans(company_id) VALUES('10000000-0000-0000-0000-000000000001')$q$);
SELECT pg_temp.denied($q$INSERT INTO public.floor_plan_markers(company_id) VALUES('10000000-0000-0000-0000-000000000001')$q$);
SELECT pg_temp.denied($q$INSERT INTO storage.objects(bucket_id,name) VALUES('floor-plans','10000000-0000-0000-0000-000000000001/new.pdf')$q$);
SELECT pg_temp.denied($q$INSERT INTO public.attachments(company_id,entity_type,entity_id,uploaded_by,storage_path) VALUES('10000000-0000-0000-0000-000000000001','asset','30000000-0000-0000-0000-000000000001',auth.uid(),'10000000-0000-0000-0000-000000000001/asset/30000000-0000-0000-0000-000000000001/forged.png')$q$);
RESET ROLE;
SELECT pg_temp.ok((SELECT file_size_limit=26214400 AND NOT ('text/html'=ANY(allowed_mime_types)) FROM storage.buckets WHERE id='onboarding-docs'),'document bucket enforces file limits/types');
SELECT pg_temp.ok((SELECT NOT public AND file_size_limit=10485760 AND NOT ('text/html'=ANY(allowed_mime_types)) FROM storage.buckets WHERE id='asset-images'),'image bucket private with limits/types');
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
UPDATE public.companies SET timezone='UTC' WHERE id='10000000-0000-0000-0000-000000000001';
INSERT INTO public.checklists(id,company_id,created_by,frequency) VALUES('70000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','daily');
INSERT INTO public.checklist_items(id,checklist_id) VALUES('71000000-0000-0000-0000-000000000003','70000000-0000-0000-0000-000000000003');
UPDATE public.subscriptions SET tier='starter' WHERE company_id='10000000-0000-0000-0000-000000000001';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false),set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',false);
SELECT public.submit_checklist_atomic('70000000-0000-0000-0000-000000000003','[{"item_id":"71000000-0000-0000-0000-000000000003","is_checked":true}]','Complete existing inspection after downgrade');
SELECT pg_temp.ok((SELECT next_due_at IS NULL FROM public.checklist_schedules WHERE checklist_id='70000000-0000-0000-0000-000000000003'),'downgrade permits completion but stops recurrence');
SELECT pg_temp.denied($q$UPDATE public.checklist_schedules SET next_due_at=now()+interval '1 day' WHERE checklist_id='70000000-0000-0000-0000-000000000003'$q$);
RESET ROLE;
SELECT set_config('request.jwt.claim.role','service_role',false),set_config('request.jwt.claim.sub','',false);
UPDATE public.subscriptions SET tier='pro' WHERE company_id='10000000-0000-0000-0000-000000000001';
