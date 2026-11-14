-- Isolated PostgreSQL fixture based on generated public Row types. The repository
-- does not contain its initial base schema; this is not a full migration replay.
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE EXTENSION pgcrypto;
CREATE SCHEMA auth; CREATE SCHEMA storage; CREATE SCHEMA realtime;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role',true),'') $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT jsonb_build_object('sub',auth.uid(),'role',auth.role()) $$;
CREATE FUNCTION realtime.topic() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_setting('realtime.topic',true) $$;
CREATE TABLE realtime.messages(id bigint,extension text,private boolean);
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
CREATE TABLE storage.buckets(id text PRIMARY KEY,public boolean,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,owner uuid,owner_id text,metadata jsonb);
CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array($1,'/') $$;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY fixture_storage ON storage.objects FOR ALL TO authenticated USING(true) WITH CHECK(true);
GRANT USAGE ON SCHEMA public,auth,storage,realtime TO anon,authenticated,service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage,realtime TO authenticated,service_role;

CREATE TYPE public.app_role AS ENUM ('administrator','manager','technician','viewer','super_admin');
CREATE TYPE public.billing_interval AS ENUM ('month','year');
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','past_due','canceled','incomplete');
CREATE TYPE public.subscription_tier AS ENUM ('starter','pro','business');
CREATE TYPE public.work_order_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.work_order_status AS ENUM ('pending','in_progress','completed','cancelled');
CREATE TABLE public.api_keys ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"key_hash" text,
"key_prefix" text,
"last_used_at" timestamptz,
"name" text,
"revoked_at" timestamptz);
CREATE TABLE public.asset_failure_events ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"downtime_minutes" numeric,
"failed_at" timestamptz,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"resolved_at" timestamptz,
"root_cause" text,
"severity" text,
"updated_at" timestamptz DEFAULT now(),
"work_order_id" uuid);
CREATE TABLE public.asset_health_metrics ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"metric_type" text,
"notes" text,
"recorded_at" timestamptz,
"source" text,
"unit" text,
"updated_at" timestamptz DEFAULT now(),
"value" numeric);
CREATE TABLE public.asset_meters ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"current_reading" numeric,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"name" text,
"unit" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.asset_risk_score_runs ("actor_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"duration_ms" numeric,
"error_message" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"model_version" text,
"snapshot" jsonb,
"status" text,
"summary" jsonb,
"triggered_by" text);
CREATE TABLE public.asset_risk_scores ("asset_id" uuid,
"company_id" uuid,
"computed_at" timestamptz,
"contributing_factors" jsonb,
"created_at" timestamptz DEFAULT now(),
"failure_probability" numeric,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"model_version" text,
"predicted_failure_date" text,
"recommended_action" text,
"remaining_useful_life_days" numeric,
"risk_level" text,
"risk_score" numeric,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.assets ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"image_url" text,
"location" text,
"location_id" uuid,
"model" text,
"name" text,
"parent_id" uuid,
"purchase_date" text,
"serial_number" text,
"status" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.attachment_audit_log ("action" text,
"actor_id" uuid,
"attachment_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"details" jsonb,
"entity_id" uuid,
"entity_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.attachments ("caption" text,
"company_id" uuid,
"content_type" text,
"created_at" timestamptz DEFAULT now(),
"description" text,
"entity_id" uuid,
"entity_type" text,
"file_name" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"size_bytes" numeric,
"sort_order" numeric,
"storage_path" text,
"uploaded_by" uuid,
"url" text);
CREATE TABLE public.backlink_prospects ("authority" numeric,
"company_id" uuid,
"contact_email" text,
"contact_name" text,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"domain" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"status" text,
"updated_at" timestamptz DEFAULT now(),
"url" text);
CREATE TABLE public.billing_checkout_authorizations ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"environment" text,
"expires_at" timestamptz,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"paddle_subscription_id" uuid,
"user_id" uuid);
CREATE TABLE public.blog_posts ("content_html" text,
"content_markdown" text,
"created_at" timestamptz DEFAULT now(),
"faq_schema" jsonb,
"hero_image_alt" text,
"hero_image_url" text,
"id" numeric,
"infographic_url" text,
"language" text,
"meta_description" text,
"meta_keywords" text,
"published_at" timestamptz,
"reading_time" numeric,
"received_at" timestamptz,
"slug" text,
"tags" text,
"title" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.checklist_assets ("asset_id" uuid,
"checklist_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"start_offset_minutes" numeric);
CREATE TABLE public.checklist_items ("checklist_id" uuid,
"created_at" timestamptz DEFAULT now(),
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"is_required" boolean,
"item_type" text,
"sort_order" numeric,
"title" text);
CREATE TABLE public.checklist_meter_rules ("checklist_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"interval_units" numeric,
"last_service_reading" numeric,
"meter_id" uuid,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.checklist_schedules ("checklist_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"last_submitted_at" timestamptz,
"next_due_at" timestamptz,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.checklist_submission_items ("asset_id" uuid,
"checklist_item_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"is_checked" boolean,
"notes" text,
"response_value" text,
"submission_id" uuid);
CREATE TABLE public.checklist_submissions ("checklist_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"status" text,
"submitted_at" timestamptz,
"submitted_by" uuid);
CREATE TABLE public.checklists ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"description" text,
"frequency" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"is_active" boolean,
"name" text,
"type" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.companies ("address" text,
"city" text,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"industry" text,
"logo" text,
"name" text,
"phone" text,
"public_slug" text,
"state" text,
"temp_max_c" numeric,
"temp_min_c" numeric,
"temp_unit" text,
"timezone" text,
"updated_at" timestamptz DEFAULT now(),
"weather_alerts_enabled" boolean,
"website" text,
"zip_code" text);
CREATE TABLE public.daily_logs ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"date" text,
"equipment_readings" jsonb,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"incidents" jsonb,
"notes" text,
"shift_end" text,
"shift_start" text,
"tasks" jsonb,
"technician" text,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid,
"weather_conditions" text);
CREATE TABLE public.device_tokens ("created_at" timestamptz DEFAULT now(),
"device_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"last_used_at" timestamptz,
"token" text,
"user_id" uuid);
CREATE TABLE public.email_events ("created_at" timestamptz DEFAULT now(),
"event_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"occurred_at" timestamptz,
"provider_message_id" uuid,
"raw" jsonb,
"recipient_email" text);
CREATE TABLE public.email_send_log ("created_at" timestamptz DEFAULT now(),
"error_message" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"message_id" uuid,
"metadata" jsonb,
"recipient_email" text,
"status" text,
"template_name" text);
CREATE TABLE public.email_send_state ("auth_email_ttl_minutes" numeric,
"batch_size" numeric,
"id" numeric,
"retry_after_until" text,
"send_delay_ms" numeric,
"transactional_email_ttl_minutes" numeric,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.email_unsubscribe_tokens ("created_at" timestamptz DEFAULT now(),
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"token" text,
"used_at" timestamptz);
CREATE TABLE public.energy_ingest_tokens ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"last_used_at" timestamptz,
"rate_count" numeric,
"rate_window_start" text,
"token" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.energy_readings ("asset_id" uuid,
"company_id" uuid,
"cost" numeric,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"currency" text,
"external_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"kwh" numeric,
"meter_label" text,
"notes" text,
"reading_date" text,
"source" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.floor_plan_markers ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"floor_plan_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"label" text,
"updated_at" timestamptz DEFAULT now(),
"x" numeric,
"y" numeric);
CREATE TABLE public.floor_plans ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"name" text,
"storage_path" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.google_ads_connections ("access_token" text,
"account_descriptive_name" text,
"company_id" uuid,
"connected_by" text,
"created_at" timestamptz DEFAULT now(),
"customer_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"login_customer_id" uuid,
"refresh_token" text,
"scope" text,
"token_expires_at" timestamptz,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.google_ads_oauth_states ("created_at" timestamptz DEFAULT now(),
"state" text,
"user_id" uuid);
CREATE TABLE public.google_analytics_connections ("access_token" text,
"account_display_name" text,
"company_id" uuid,
"connected_by" text,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"property_display_name" text,
"property_id" uuid,
"refresh_token" text,
"scope" text,
"token_expires_at" timestamptz,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.google_analytics_oauth_states ("created_at" timestamptz DEFAULT now(),
"state" text,
"user_id" uuid);
CREATE TABLE public.locations ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"image_url" text,
"latitude" numeric,
"longitude" numeric,
"name" text,
"parent_id" uuid,
"updated_at" timestamptz DEFAULT now(),
"weather_alerts_enabled" boolean);
CREATE TABLE public.lubricant_assets ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"lubricant_id" uuid);
CREATE TABLE public.lubricant_checklists ("checklist_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"lubricant_id" uuid);
CREATE TABLE public.lubricant_stock_adjustments ("adjustment_type" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"lubricant_id" uuid,
"notes" text,
"quantity_after" numeric,
"quantity_before" numeric,
"quantity_delta" numeric);
CREATE TABLE public.lubricant_usage_logs ("asset_id" uuid,
"checklist_id" uuid,
"checklist_submission_id" uuid,
"company_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"lubricant_id" uuid,
"notes" text,
"quantity" numeric,
"used_at" timestamptz,
"used_by" text,
"work_order_id" uuid);
CREATE TABLE public.lubricants ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"lubricant_type" text,
"manufacturer" text,
"name" text,
"notes" text,
"quantity_on_hand" numeric,
"reorder_level" numeric,
"unit_of_measure" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.maintenance_codes ("code" text,
"code_type" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"label" text);
CREATE TABLE public.maintenance_costs ("amount" numeric,
"asset_id" uuid,
"category" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"currency" text,
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"incurred_at" timestamptz,
"maintenance_type" text,
"updated_at" timestamptz DEFAULT now(),
"work_order_id" uuid);
CREATE TABLE public.marketing_leads ("company" text,
"created_at" timestamptz DEFAULT now(),
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"message" text,
"name" text,
"phone" text,
"source_slug" text,
"source_url" text);
CREATE TABLE public.marketing_page_events ("created_at" timestamptz DEFAULT now(),
"event_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"metadata" jsonb,
"page_slug" text,
"page_url" text,
"referrer" text,
"user_agent" text);
CREATE TABLE public.messages ("content" text,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"read" boolean,
"recipient_id" uuid,
"sender_id" uuid);
CREATE TABLE public.meter_readings ("company_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"meter_id" uuid,
"notes" text,
"reading_value" numeric,
"recorded_at" timestamptz,
"recorded_by" text);
CREATE TABLE public.notification_dispatch_log ("event_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"recipient_id" uuid,
"reference_id" uuid,
"sent_at" timestamptz);
CREATE TABLE public.notification_preferences ("created_at" timestamptz DEFAULT now(),
"digest_frequency" text,
"email_address" text,
"email_enabled" boolean,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"phone_number" text,
"push_enabled" boolean,
"sms_enabled" boolean,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid);
CREATE TABLE public.notifications ("body" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"event_type" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"provider_message_id" uuid,
"read" boolean,
"reference_id" uuid,
"title" text,
"type" text,
"user_id" uuid);
CREATE TABLE public.onboarding_documents ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"doc_kind" text,
"file_name" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"mime_type" text,
"notes" text,
"size_bytes" numeric,
"status" text,
"storage_path" text,
"updated_at" timestamptz DEFAULT now(),
"uploaded_by" uuid);
CREATE TABLE public.onboarding_profiles ("company_id" uuid,
"completed_at" timestamptz,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"goals" text[],
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"industry" text,
"plan" jsonb,
"team_size" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.onboarding_progress ("checklist_dismissed" boolean,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"tasks_completed" jsonb,
"tour_complete" boolean,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid,
"wizard_complete" boolean,
"wizard_step" numeric);
CREATE TABLE public.organization_invitations ("accepted_at" timestamptz,
"created_at" timestamptz DEFAULT now(),
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"invited_by" uuid,
"organization_id" uuid,
"role" text,
"status" text,
"token" text);
CREATE TABLE public.organizations ("created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"name" text);
CREATE TABLE public.part_assets ("asset_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"part_id" uuid);
CREATE TABLE public.part_stock_adjustments ("adjustment_type" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"part_id" uuid,
"quantity_after" numeric,
"quantity_before" numeric,
"quantity_delta" numeric);
CREATE TABLE public.part_usage_logs ("asset_id" uuid,
"company_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"part_id" uuid,
"quantity" numeric,
"used_at" timestamptz,
"used_by" text,
"work_order_id" uuid);
CREATE TABLE public.parts ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"manufacturer" text,
"min_quantity" numeric,
"name" text,
"notes" text,
"part_number" text,
"quantity_on_hand" numeric,
"unit_of_measure" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.profiles ("account_type" text,
"avatar_url" text,
"company_id" uuid,
"company_name" text,
"created_at" timestamptz DEFAULT now(),
"email" text,
"first_name" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"last_name" text,
"phone_number" text,
"role" text,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.public_request_authorizations ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"expires_at" timestamptz,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"upload_prefix" text,
"used_at" timestamptz);
CREATE TABLE public.public_request_triage ("accepted_at" timestamptz,
"accepted_by" text,
"category" text,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"error_message" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"model_version" text,
"reasoning" text,
"request_id" uuid,
"status" text,
"suggested_assignee_role" text,
"summary" text,
"updated_at" timestamptz DEFAULT now(),
"urgency" text,
"work_order_id" uuid);
CREATE TABLE public.public_requests ("company_id" uuid,
"contact_email" text,
"contact_name" text,
"contact_phone" text,
"created_at" timestamptz DEFAULT now(),
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"location_text" text,
"photos" jsonb,
"status" text,
"submitter_ip" text,
"title" text,
"type" text,
"updated_at" timestamptz DEFAULT now(),
"user_agent" text);
CREATE TABLE public.purchase_order_lines ("company_id" uuid,
"description" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"part_id" uuid,
"purchase_order_id" uuid,
"qty_received" numeric,
"quantity" numeric,
"unit_cost" numeric);
CREATE TABLE public.purchase_orders ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"request_id" uuid,
"status" text,
"subtotal" numeric,
"tax_amount" numeric,
"tax_rate_percent" numeric,
"total" numeric,
"vendor_id" uuid,
"vendor_name" text);
CREATE TABLE public.purchase_requests ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"requested_by" text,
"status" text,
"title" text);
CREATE TABLE public.self_healing_actions ("action" text,
"after" jsonb,
"before" jsonb,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"details" text,
"entity_id" uuid,
"entity_type" text,
"healer" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"requires_review" boolean,
"reviewed_at" timestamptz,
"reviewed_by" text,
"run_id" uuid);
CREATE TABLE public.self_healing_runs ("actor_id" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"duration_ms" numeric,
"error_message" text,
"fixed" numeric,
"flagged" numeric,
"healer" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"scanned" numeric,
"snapshot" jsonb,
"status" text,
"triggered_by" text);
CREATE TABLE public.self_healing_settings ("ai_triage_enabled" boolean,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"data_integrity_enabled" boolean,
"risk_scoring_enabled" boolean,
"updated_at" timestamptz DEFAULT now(),
"work_orders_enabled" boolean);
CREATE TABLE public.signup_reminders_sent ("sent_at" timestamptz,
"stage" text,
"user_id" uuid);
CREATE TABLE public.sms_optins ("consent" boolean,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"ip_address" text,
"phone_number" text,
"source" text,
"user_agent" text);
CREATE TABLE public.subscriptions ("billing_interval" public.billing_interval,
"cancel_at_period_end" boolean,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"current_period_end" timestamptz,
"environment" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"included_seats" integer,
"paddle_customer_id" uuid,
"paddle_price_id" uuid,
"paddle_product_id" uuid,
"paddle_subscription_id" uuid,
"paid_seats" integer,
"status" public.subscription_status,
"tier" public.subscription_tier,
"trial_ends_at" timestamptz,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.suppressed_emails ("created_at" timestamptz DEFAULT now(),
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"metadata" jsonb,
"reason" text);
CREATE TABLE public.system_settings ("asset_categories" jsonb,
"company_info" jsonb,
"created_at" timestamptz DEFAULT now(),
"dashboard_customization" jsonb,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"integrations" jsonb,
"locations" jsonb,
"maintenance_schedules" jsonb,
"notifications" jsonb,
"setup_completed" boolean,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid,
"user_roles" jsonb);
CREATE TABLE public.user_roles ("company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"role" public.app_role,
"user_id" uuid);
CREATE TABLE public.user_sessions ("created_at" timestamptz DEFAULT now(),
"expires_at" timestamptz,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"session_data" jsonb,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid);
CREATE TABLE public.user_settings ("created_at" timestamptz DEFAULT now(),
"dashboard_layout" text,
"display_settings" jsonb,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notification_preferences" jsonb,
"setup_completed" boolean,
"updated_at" timestamptz DEFAULT now(),
"user_id" uuid);
CREATE TABLE public.vendor_assets ("asset_id" uuid,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"notes" text,
"relationship_type" text,
"vendor_id" uuid);
CREATE TABLE public.vendor_contracts ("contract_number" text,
"contract_type" text,
"contract_value" numeric,
"created_at" timestamptz DEFAULT now(),
"description" text,
"end_date" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"start_date" text,
"status" text,
"terms" text,
"title" text,
"updated_at" timestamptz DEFAULT now(),
"vendor_id" uuid);
CREATE TABLE public.vendors ("address" text,
"city" text,
"company_id" uuid,
"contact_person" text,
"contact_title" text,
"created_at" timestamptz DEFAULT now(),
"description" text,
"email" text,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"name" text,
"phone" text,
"rating" numeric,
"state" text,
"status" text,
"updated_at" timestamptz DEFAULT now(),
"vendor_type" text,
"website" text,
"zip_code" text);
CREATE TABLE public.weather_alert_state ("company_id" uuid,
"last_alert_at" timestamptz,
"last_kind" text,
"last_temperature_c" numeric,
"location_id" uuid,
"updated_at" timestamptz DEFAULT now());
CREATE TABLE public.weather_readings ("company_id" uuid,
"fetched_at" timestamptz,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"location_id" uuid,
"raw" jsonb,
"temperature_c" numeric);
CREATE TABLE public.work_order_comments ("comment" text,
"created_at" timestamptz DEFAULT now(),
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"user_id" uuid,
"work_order_id" uuid);
CREATE TABLE public.work_orders ("asset_id" uuid,
"assigned_to" uuid,
"company_id" uuid,
"created_at" timestamptz DEFAULT now(),
"created_by" uuid,
"description" text,
"downtime_code_id" uuid,
"downtime_minutes" numeric,
"due_date" text,
"failure_code_id" uuid,
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
"priority" public.work_order_priority,
"status" public.work_order_status,
"title" text,
"updated_at" timestamptz DEFAULT now(),
"vendor_id" uuid);
ALTER TABLE public.user_roles ADD UNIQUE(user_id,role,company_id);
ALTER TABLE public.subscriptions ADD UNIQUE(company_id);
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_id_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id);
ALTER TABLE public.notifications ALTER COLUMN reference_id TYPE text;
ALTER TABLE public.notifications ALTER COLUMN provider_message_id TYPE text;
ALTER TABLE public.email_events ALTER COLUMN provider_message_id TYPE text;
CREATE FUNCTION public.get_user_company(uuid) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT company_id FROM public.profiles WHERE id=$1 $$;
CREATE FUNCTION public.has_role(uuid,public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=$1 AND role=$2) $$;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.api_keys FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.asset_failure_events ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.asset_failure_events FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.asset_health_metrics ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.asset_health_metrics FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.asset_meters ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.asset_meters FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.asset_risk_score_runs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.asset_risk_score_runs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.asset_risk_scores ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.asset_risk_scores FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.assets FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.attachment_audit_log ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.attachment_audit_log FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.attachments FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.backlink_prospects ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.backlink_prospects FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.billing_checkout_authorizations ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.billing_checkout_authorizations FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.checklist_meter_rules ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.checklist_meter_rules FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.checklists FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.daily_logs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.energy_ingest_tokens ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.energy_ingest_tokens FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.energy_readings FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.floor_plan_markers ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.floor_plan_markers FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.floor_plans FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.google_ads_connections ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.google_ads_connections FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.google_analytics_connections ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.google_analytics_connections FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.locations FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.lubricant_assets ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.lubricant_assets FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.lubricant_checklists ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.lubricant_checklists FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.lubricant_stock_adjustments ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.lubricant_stock_adjustments FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.lubricant_usage_logs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.lubricant_usage_logs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.lubricants ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.lubricants FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.maintenance_codes ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.maintenance_codes FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.maintenance_costs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.maintenance_costs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.meter_readings FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.notifications FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.onboarding_documents FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.onboarding_profiles FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.onboarding_progress FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.part_assets ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.part_assets FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.part_stock_adjustments ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.part_stock_adjustments FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.part_usage_logs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.part_usage_logs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.parts FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.profiles FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.public_request_authorizations ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.public_request_authorizations FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.public_request_triage ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.public_request_triage FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.public_requests ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.public_requests FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.purchase_order_lines FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.purchase_orders FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.purchase_requests FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.self_healing_actions ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.self_healing_actions FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.self_healing_runs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.self_healing_runs FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.self_healing_settings ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.self_healing_settings FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.subscriptions FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.user_roles FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.vendors FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.weather_alert_state ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.weather_alert_state FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.weather_readings FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_company ON public.work_orders FOR ALL TO authenticated USING(company_id=public.get_user_company(auth.uid())) WITH CHECK(company_id=public.get_user_company(auth.uid()));
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.notifications FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.checklist_submission_items ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.checklist_submission_items FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.checklist_assets ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.checklist_assets FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY; CREATE POLICY "Users view email events for their notifications" ON public.email_events FOR SELECT TO authenticated USING(provider_message_id IN (SELECT provider_message_id FROM public.notifications WHERE user_id=auth.uid()));
CREATE POLICY "email_events: deny user writes" ON public.email_events AS RESTRICTIVE FOR ALL TO authenticated USING(false) WITH CHECK(false);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.checklist_items FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.checklist_submissions ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.checklist_submissions FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.checklist_schedules ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.checklist_schedules FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.system_settings FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.daily_logs FOR ALL TO authenticated USING(true) WITH CHECK(true);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY; CREATE POLICY fixture_operations ON public.blog_posts FOR ALL TO authenticated USING(true) WITH CHECK(true);
CREATE POLICY fixture_profile_self ON public.profiles FOR ALL TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated,service_role;
GRANT SELECT ON public.blog_posts TO anon;
CREATE POLICY fixture_blog ON public.blog_posts FOR SELECT TO anon USING(true);
INSERT INTO storage.buckets(id,public) VALUES('asset-images',false),('onboarding-docs',false),('floor-plans',false);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _workflow text := pg_catalog.current_setting(
    'app.profile_privileged_update',
    true
  );
BEGIN
  IF auth.uid() IS NOT NULL
     AND COALESCE(_workflow, '') NOT IN ('owner_onboarding', 'accept_invitation') THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Changing profile role is not allowed';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Changing profile company is not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.complete_owner_onboarding_with_timezone(
  _company_name text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _timezone text DEFAULT 'UTC'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _company_id uuid;
  _existing_company_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF NULLIF(pg_catalog.btrim(_company_name), '') IS NULL THEN
    RAISE EXCEPTION 'Company name is required';
  END IF;

  IF pg_catalog.length(pg_catalog.btrim(_company_name)) > 200 THEN
    RAISE EXCEPTION 'Company name must be 200 characters or fewer';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = COALESCE(NULLIF(_timezone, ''), 'UTC')
  ) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', _timezone;
  END IF;

  SELECT p.email, p.company_id
  INTO _email, _existing_company_id
  FROM public.profiles AS p
  WHERE p.id = _uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _existing_company_id IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'This account already belongs to a company';
  END IF;

  INSERT INTO public.companies (name, created_by, email, timezone)
  VALUES (
    pg_catalog.btrim(_company_name),
    _uid,
    NULLIF(pg_catalog.btrim(_email), ''),
    COALESCE(NULLIF(_timezone, ''), 'UTC')
  )
  RETURNING id INTO _company_id;

  INSERT INTO public.organizations (id, name)
  VALUES (_company_id, pg_catalog.btrim(_company_name))
  ON CONFLICT (id) DO NOTHING;

  PERFORM pg_catalog.set_config(
    'app.profile_privileged_update',
    'owner_onboarding',
    true
  );

  UPDATE public.profiles
  SET company_id = _company_id,
      role = 'administrator',
      first_name = COALESCE(NULLIF(pg_catalog.btrim(_first_name), ''), first_name),
      last_name = COALESCE(NULLIF(pg_catalog.btrim(_last_name), ''), last_name),
      phone_number = COALESCE(NULLIF(pg_catalog.btrim(_phone), ''), phone_number),
      updated_at = pg_catalog.now()
  WHERE id = _uid;

  PERFORM pg_catalog.set_config('app.profile_privileged_update', '', true);

  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, 'administrator'::public.app_role, _company_id, _uid)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  INSERT INTO public.subscriptions (
    company_id,
    tier,
    status,
    trial_ends_at,
    included_seats
  )
  VALUES (
    _company_id,
    'pro'::public.subscription_tier,
    'trialing'::public.subscription_status,
    pg_catalog.now() + interval '7 days',
    2
  )
  ON CONFLICT (company_id) DO NOTHING;

  RETURN pg_catalog.jsonb_build_object(
    'company_id', _company_id,
    'created', true
  );
END;
$$;
CREATE OR REPLACE FUNCTION public.enforce_asset_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NOT public.company_within_limit_for(NEW.company_id, 'asset') THEN
    RAISE EXCEPTION 'plan_limit_reached: asset limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.enforce_work_order_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT company_id INTO _company FROM public.profiles WHERE id = COALESCE(NEW.created_by, auth.uid());
  IF NOT public.company_within_limit_for(_company, 'work_order') THEN
    RAISE EXCEPTION 'plan_limit_reached: monthly work order limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profile_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_company_change();
CREATE TRIGGER quota_asset BEFORE INSERT ON public.assets FOR EACH ROW EXECUTE FUNCTION public.enforce_asset_limit();
CREATE TRIGGER quota_work_order BEFORE INSERT ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.enforce_work_order_limit();

ALTER TABLE public.checklist_assets ADD FOREIGN KEY(checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
ALTER TABLE public.checklist_schedules ADD FOREIGN KEY(checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
ALTER TABLE public.checklist_submissions ADD FOREIGN KEY(checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
ALTER TABLE public.checklist_items ADD FOREIGN KEY(checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
ALTER TABLE public.checklist_submission_items ADD FOREIGN KEY(submission_id) REFERENCES public.checklist_submissions(id) ON DELETE CASCADE;
ALTER TABLE public.checklist_submission_items ADD FOREIGN KEY(checklist_item_id) REFERENCES public.checklist_items(id) ON DELETE CASCADE;

ALTER TABLE public.energy_ingest_tokens ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(24),'hex');
ALTER TABLE public.energy_ingest_tokens ADD UNIQUE(company_id);

CREATE OR REPLACE FUNCTION public.next_checklist_due(
  _frequency text,
  _from timestamptz,
  _timezone text
)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  _local_from timestamp without time zone;
  _local_next timestamp without time zone;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = _timezone
  ) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', _timezone;
  END IF;

  _local_from := _from AT TIME ZONE _timezone;

  CASE _frequency
    WHEN 'twice-daily' THEN
      IF pg_catalog.date_part('hour', _local_from) < 12 THEN
        _local_next := pg_catalog.date_trunc('day', _local_from) + interval '12 hours';
      ELSE
        _local_next := pg_catalog.date_trunc('day', _local_from) + interval '1 day';
      END IF;
    WHEN 'daily' THEN
      _local_next := pg_catalog.date_trunc('day', _local_from) + interval '1 day';
    WHEN 'weekly' THEN
      _local_next := _local_from + interval '7 days';
    WHEN 'biweekly' THEN
      _local_next := _local_from + interval '14 days';
    WHEN 'monthly' THEN
      _local_next := _local_from + interval '1 month';
    WHEN 'quarterly' THEN
      _local_next := _local_from + interval '3 months';
    WHEN 'annually' THEN
      _local_next := _local_from + interval '1 year';
    ELSE
      RETURN NULL;
  END CASE;

  RETURN _local_next AT TIME ZONE _timezone;
END;
$$;
ALTER TABLE public.checklist_schedules ADD UNIQUE(checklist_id);
ALTER TABLE public.checklists ALTER COLUMN is_active SET DEFAULT true;
