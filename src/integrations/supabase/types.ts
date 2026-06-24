export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      asset_failure_events: {
        Row: {
          asset_id: string
          company_id: string
          created_at: string
          downtime_minutes: number | null
          failed_at: string
          id: string
          notes: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          asset_id: string
          company_id: string
          created_at?: string
          downtime_minutes?: number | null
          failed_at?: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          asset_id?: string
          company_id?: string
          created_at?: string
          downtime_minutes?: number | null
          failed_at?: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_failure_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_failure_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_failure_events_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_health_metrics: {
        Row: {
          asset_id: string
          company_id: string
          created_at: string
          id: string
          metric_type: string
          notes: string | null
          recorded_at: string
          source: string
          unit: string | null
          updated_at: string
          value: number
        }
        Insert: {
          asset_id: string
          company_id: string
          created_at?: string
          id?: string
          metric_type: string
          notes?: string | null
          recorded_at?: string
          source?: string
          unit?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          asset_id?: string
          company_id?: string
          created_at?: string
          id?: string
          metric_type?: string
          notes?: string | null
          recorded_at?: string
          source?: string
          unit?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_health_metrics_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_health_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_risk_score_runs: {
        Row: {
          actor_id: string | null
          company_id: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          model_version: string
          snapshot: Json
          status: string
          summary: Json
          triggered_by: string
        }
        Insert: {
          actor_id?: string | null
          company_id: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          model_version?: string
          snapshot?: Json
          status?: string
          summary?: Json
          triggered_by: string
        }
        Update: {
          actor_id?: string | null
          company_id?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          model_version?: string
          snapshot?: Json
          status?: string
          summary?: Json
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_risk_score_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_risk_scores: {
        Row: {
          asset_id: string
          company_id: string
          computed_at: string
          contributing_factors: Json
          created_at: string
          failure_probability: number
          id: string
          model_version: string
          predicted_failure_date: string | null
          recommended_action: string | null
          remaining_useful_life_days: number | null
          risk_level: string
          risk_score: number
          updated_at: string
        }
        Insert: {
          asset_id: string
          company_id: string
          computed_at?: string
          contributing_factors?: Json
          created_at?: string
          failure_probability?: number
          id?: string
          model_version?: string
          predicted_failure_date?: string | null
          recommended_action?: string | null
          remaining_useful_life_days?: number | null
          risk_level?: string
          risk_score?: number
          updated_at?: string
        }
        Update: {
          asset_id?: string
          company_id?: string
          computed_at?: string
          contributing_factors?: Json
          created_at?: string
          failure_probability?: number
          id?: string
          model_version?: string
          predicted_failure_date?: string | null
          recommended_action?: string | null
          remaining_useful_life_days?: number | null
          risk_level?: string
          risk_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_risk_scores_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_risk_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          location_id: string | null
          model: string | null
          name: string
          parent_id: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          location_id?: string | null
          model?: string | null
          name: string
          parent_id?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          location_id?: string | null
          model?: string | null
          name?: string
          parent_id?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asset_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment_audit_log: {
        Row: {
          action: string
          actor_id: string
          attachment_id: string | null
          company_id: string
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          attachment_id?: string | null
          company_id: string
          created_at?: string
          details?: Json
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          attachment_id?: string | null
          company_id?: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          caption: string | null
          company_id: string
          content_type: string | null
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          file_name: string | null
          id: string
          size_bytes: number | null
          sort_order: number
          storage_path: string
          uploaded_by: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          content_type?: string | null
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          file_name?: string | null
          id?: string
          size_bytes?: number | null
          sort_order?: number
          storage_path: string
          uploaded_by: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          content_type?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string | null
          id?: string
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: []
      }
      checklist_assets: {
        Row: {
          asset_id: string
          checklist_id: string
          created_at: string
          id: string
          start_offset_minutes: number
        }
        Insert: {
          asset_id: string
          checklist_id: string
          created_at?: string
          id?: string
          start_offset_minutes?: number
        }
        Update: {
          asset_id?: string
          checklist_id?: string
          created_at?: string
          id?: string
          start_offset_minutes?: number
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          item_type: string
          sort_order: number
          title: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          item_type?: string
          sort_order?: number
          title: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          item_type?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_schedules: {
        Row: {
          checklist_id: string
          created_at: string
          id: string
          last_submitted_at: string | null
          next_due_at: string | null
          updated_at: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          id?: string
          last_submitted_at?: string | null
          next_due_at?: string | null
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          id?: string
          last_submitted_at?: string | null
          next_due_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      checklist_submission_items: {
        Row: {
          asset_id: string | null
          checklist_item_id: string
          created_at: string
          id: string
          is_checked: boolean | null
          notes: string | null
          response_value: string | null
          submission_id: string
        }
        Insert: {
          asset_id?: string | null
          checklist_item_id: string
          created_at?: string
          id?: string
          is_checked?: boolean | null
          notes?: string | null
          response_value?: string | null
          submission_id: string
        }
        Update: {
          asset_id?: string | null
          checklist_item_id?: string
          created_at?: string
          id?: string
          is_checked?: boolean | null
          notes?: string | null
          response_value?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_submission_items_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "checklist_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_submissions: {
        Row: {
          checklist_id: string
          id: string
          notes: string | null
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          checklist_id: string
          id?: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          checklist_id?: string
          id?: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_submissions_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          industry: string | null
          logo: string | null
          name: string
          phone: string | null
          public_slug: string | null
          state: string | null
          temp_max_c: number | null
          temp_min_c: number | null
          temp_unit: string
          updated_at: string
          weather_alerts_enabled: boolean
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          public_slug?: string | null
          state?: string | null
          temp_max_c?: number | null
          temp_min_c?: number | null
          temp_unit?: string
          updated_at?: string
          weather_alerts_enabled?: boolean
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          public_slug?: string | null
          state?: string | null
          temp_max_c?: number | null
          temp_min_c?: number | null
          temp_unit?: string
          updated_at?: string
          weather_alerts_enabled?: boolean
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          company_id: string | null
          created_at: string
          date: string
          equipment_readings: Json | null
          id: string
          incidents: Json | null
          notes: string | null
          shift_end: string | null
          shift_start: string | null
          tasks: Json | null
          technician: string | null
          updated_at: string
          user_id: string
          weather_conditions: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          date: string
          equipment_readings?: Json | null
          id?: string
          incidents?: Json | null
          notes?: string | null
          shift_end?: string | null
          shift_start?: string | null
          tasks?: Json | null
          technician?: string | null
          updated_at?: string
          user_id: string
          weather_conditions?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          date?: string
          equipment_readings?: Json | null
          id?: string
          incidents?: Json | null
          notes?: string | null
          shift_end?: string | null
          shift_start?: string | null
          tasks?: Json | null
          technician?: string | null
          updated_at?: string
          user_id?: string
          weather_conditions?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          device_type: string
          id: string
          last_used_at: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type: string
          id?: string
          last_used_at?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          last_used_at?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          provider_message_id: string
          raw: Json | null
          recipient_email: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          occurred_at?: string
          provider_message_id: string
          raw?: Json | null
          recipient_email?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          provider_message_id?: string
          raw?: Json | null
          recipient_email?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      energy_ingest_tokens: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          last_used_at: string | null
          token: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_ingest_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_readings: {
        Row: {
          asset_id: string | null
          company_id: string
          cost: number | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          kwh: number
          meter_label: string | null
          notes: string | null
          reading_date: string
          source: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          company_id: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kwh: number
          meter_label?: string | null
          notes?: string | null
          reading_date?: string
          source?: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          company_id?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kwh?: number
          meter_label?: string | null
          notes?: string | null
          reading_date?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_readings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_readings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_plan_markers: {
        Row: {
          asset_id: string | null
          company_id: string
          created_at: string
          floor_plan_id: string
          id: string
          label: string | null
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          asset_id?: string | null
          company_id: string
          created_at?: string
          floor_plan_id: string
          id?: string
          label?: string | null
          updated_at?: string
          x?: number
          y?: number
        }
        Update: {
          asset_id?: string | null
          company_id?: string
          created_at?: string
          floor_plan_id?: string
          id?: string
          label?: string | null
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "floor_plan_markers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plan_markers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plan_markers_floor_plan_id_fkey"
            columns: ["floor_plan_id"]
            isOneToOne: false
            referencedRelation: "floor_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_plans: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_connections: {
        Row: {
          access_token: string | null
          account_descriptive_name: string | null
          company_id: string | null
          connected_by: string
          created_at: string
          customer_id: string | null
          id: string
          login_customer_id: string | null
          refresh_token: string
          scope: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_descriptive_name?: string | null
          company_id?: string | null
          connected_by: string
          created_at?: string
          customer_id?: string | null
          id?: string
          login_customer_id?: string | null
          refresh_token: string
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_descriptive_name?: string | null
          company_id?: string | null
          connected_by?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          login_customer_id?: string | null
          refresh_token?: string
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      google_ads_oauth_states: {
        Row: {
          created_at: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          parent_id: string | null
          updated_at: string
          weather_alerts_enabled: boolean
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          parent_id?: string | null
          updated_at?: string
          weather_alerts_enabled?: boolean
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          parent_id?: string | null
          updated_at?: string
          weather_alerts_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_costs: {
        Row: {
          amount: number
          asset_id: string | null
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          incurred_at: string
          maintenance_type: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          amount: number
          asset_id?: string | null
          category?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          incurred_at?: string
          maintenance_type?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          amount?: number
          asset_id?: string | null
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          incurred_at?: string
          maintenance_type?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_costs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_costs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_costs_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          source_slug: string | null
          source_url: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          source_slug?: string | null
          source_url?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          source_slug?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      marketing_page_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          page_slug: string
          page_url: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          page_slug: string
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          page_slug?: string
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notification_dispatch_log: {
        Row: {
          event_type: string
          id: string
          recipient_id: string
          reference_id: string
          sent_at: string
        }
        Insert: {
          event_type: string
          id?: string
          recipient_id: string
          reference_id: string
          sent_at?: string
        }
        Update: {
          event_type?: string
          id?: string
          recipient_id?: string
          reference_id?: string
          sent_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          digest_frequency: string
          email_address: string | null
          email_enabled: boolean
          id: string
          phone_number: string | null
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_frequency?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          phone_number?: string | null
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_frequency?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          phone_number?: string | null
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          event_type: string | null
          id: string
          provider_message_id: string | null
          read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          provider_message_id?: string | null
          read?: boolean
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          provider_message_id?: string | null
          read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_documents: {
        Row: {
          company_id: string
          created_at: string
          doc_kind: string
          file_name: string
          id: string
          mime_type: string | null
          notes: string | null
          size_bytes: number | null
          status: string
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          doc_kind?: string
          file_name: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          status?: string
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          doc_kind?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_profiles: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          goals: string[]
          id: string
          industry: string | null
          plan: Json
          team_size: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          goals?: string[]
          id?: string
          industry?: string | null
          plan?: Json
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          goals?: string[]
          id?: string
          industry?: string | null
          plan?: Json
          team_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          checklist_dismissed: boolean
          company_id: string
          created_at: string
          id: string
          tasks_completed: Json
          tour_complete: boolean
          updated_at: string
          user_id: string
          wizard_complete: boolean
          wizard_step: number
        }
        Insert: {
          checklist_dismissed?: boolean
          company_id: string
          created_at?: string
          id?: string
          tasks_completed?: Json
          tour_complete?: boolean
          updated_at?: string
          user_id: string
          wizard_complete?: boolean
          wizard_step?: number
        }
        Update: {
          checklist_dismissed?: boolean
          company_id?: string
          created_at?: string
          id?: string
          tasks_completed?: Json
          tour_complete?: boolean
          updated_at?: string
          user_id?: string
          wizard_complete?: boolean
          wizard_step?: number
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          status?: string
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          role: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      public_request_triage: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          category: string | null
          company_id: string
          created_at: string
          error_message: string | null
          id: string
          model_version: string | null
          reasoning: string | null
          request_id: string
          status: string
          suggested_assignee_role: string | null
          summary: string | null
          updated_at: string
          urgency: string | null
          work_order_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          model_version?: string | null
          reasoning?: string | null
          request_id: string
          status?: string
          suggested_assignee_role?: string | null
          summary?: string | null
          updated_at?: string
          urgency?: string | null
          work_order_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          model_version?: string | null
          reasoning?: string | null
          request_id?: string
          status?: string
          suggested_assignee_role?: string | null
          summary?: string | null
          updated_at?: string
          urgency?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_request_triage_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "public_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      public_requests: {
        Row: {
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          location_text: string | null
          photos: Json
          status: string
          submitter_ip: string | null
          title: string
          type: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          location_text?: string | null
          photos?: Json
          status?: string
          submitter_ip?: string | null
          title: string
          type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          location_text?: string | null
          photos?: Json
          status?: string
          submitter_ip?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      self_healing_actions: {
        Row: {
          action: string
          after: Json | null
          before: Json | null
          company_id: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string
          healer: string
          id: string
          requires_review: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          run_id: string
        }
        Insert: {
          action: string
          after?: Json | null
          before?: Json | null
          company_id: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type: string
          healer: string
          id?: string
          requires_review?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_id: string
        }
        Update: {
          action?: string
          after?: Json | null
          before?: Json | null
          company_id?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          healer?: string
          id?: string
          requires_review?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_healing_actions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "self_healing_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      self_healing_runs: {
        Row: {
          actor_id: string | null
          company_id: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          fixed: number
          flagged: number
          healer: string
          id: string
          scanned: number
          snapshot: Json
          status: string
          triggered_by: string
        }
        Insert: {
          actor_id?: string | null
          company_id: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          fixed?: number
          flagged?: number
          healer: string
          id?: string
          scanned?: number
          snapshot?: Json
          status?: string
          triggered_by?: string
        }
        Update: {
          actor_id?: string | null
          company_id?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          fixed?: number
          flagged?: number
          healer?: string
          id?: string
          scanned?: number
          snapshot?: Json
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      self_healing_settings: {
        Row: {
          ai_triage_enabled: boolean
          company_id: string
          created_at: string
          data_integrity_enabled: boolean
          risk_scoring_enabled: boolean
          updated_at: string
          work_orders_enabled: boolean
        }
        Insert: {
          ai_triage_enabled?: boolean
          company_id: string
          created_at?: string
          data_integrity_enabled?: boolean
          risk_scoring_enabled?: boolean
          updated_at?: string
          work_orders_enabled?: boolean
        }
        Update: {
          ai_triage_enabled?: boolean
          company_id?: string
          created_at?: string
          data_integrity_enabled?: boolean
          risk_scoring_enabled?: boolean
          updated_at?: string
          work_orders_enabled?: boolean
        }
        Relationships: []
      }
      signup_reminders_sent: {
        Row: {
          sent_at: string
          stage: string
          user_id: string
        }
        Insert: {
          sent_at?: string
          stage: string
          user_id: string
        }
        Update: {
          sent_at?: string
          stage?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_optins: {
        Row: {
          consent: boolean
          created_at: string
          id: string
          ip_address: string | null
          phone_number: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          id?: string
          ip_address?: string | null
          phone_number: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          id?: string
          ip_address?: string | null
          phone_number?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end: boolean
          company_id: string
          created_at: string
          current_period_end: string | null
          environment: string
          id: string
          included_seats: number
          paddle_customer_id: string | null
          paddle_price_id: string | null
          paddle_product_id: string | null
          paddle_subscription_id: string | null
          paid_seats: number
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          company_id: string
          created_at?: string
          current_period_end?: string | null
          environment?: string
          id?: string
          included_seats?: number
          paddle_customer_id?: string | null
          paddle_price_id?: string | null
          paddle_product_id?: string | null
          paddle_subscription_id?: string | null
          paid_seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          environment?: string
          id?: string
          included_seats?: number
          paddle_customer_id?: string | null
          paddle_price_id?: string | null
          paddle_product_id?: string | null
          paddle_subscription_id?: string | null
          paid_seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          asset_categories: Json | null
          company_info: Json | null
          created_at: string | null
          dashboard_customization: Json | null
          id: string
          integrations: Json | null
          locations: Json | null
          maintenance_schedules: Json | null
          notifications: Json | null
          setup_completed: boolean | null
          updated_at: string | null
          user_id: string | null
          user_roles: Json | null
        }
        Insert: {
          asset_categories?: Json | null
          company_info?: Json | null
          created_at?: string | null
          dashboard_customization?: Json | null
          id?: string
          integrations?: Json | null
          locations?: Json | null
          maintenance_schedules?: Json | null
          notifications?: Json | null
          setup_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_roles?: Json | null
        }
        Update: {
          asset_categories?: Json | null
          company_info?: Json | null
          created_at?: string | null
          dashboard_customization?: Json | null
          id?: string
          integrations?: Json | null
          locations?: Json | null
          maintenance_schedules?: Json | null
          notifications?: Json | null
          setup_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_roles?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          session_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          dashboard_layout: string | null
          display_settings: Json | null
          id: string
          notification_preferences: Json | null
          setup_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_layout?: string | null
          display_settings?: Json | null
          id?: string
          notification_preferences?: Json | null
          setup_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_layout?: string | null
          display_settings?: Json | null
          id?: string
          notification_preferences?: Json | null
          setup_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_assets: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          notes: string | null
          relationship_type: string
          vendor_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          notes?: string | null
          relationship_type?: string
          vendor_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          relationship_type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contracts: {
        Row: {
          contract_number: string | null
          contract_type: string
          contract_value: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          terms: string | null
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          contract_number?: string | null
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          terms?: string | null
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          contract_number?: string | null
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          terms?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          company_id: string | null
          contact_person: string | null
          contact_title: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          rating: number | null
          state: string | null
          status: string
          updated_at: string
          vendor_type: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact_person?: string | null
          contact_title?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          vendor_type?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact_person?: string | null
          contact_title?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          vendor_type?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_alert_state: {
        Row: {
          company_id: string
          last_alert_at: string | null
          last_kind: string
          last_temperature_c: number | null
          location_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          last_alert_at?: string | null
          last_kind?: string
          last_temperature_c?: number | null
          location_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          last_alert_at?: string | null
          last_kind?: string
          last_temperature_c?: number | null
          location_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      weather_readings: {
        Row: {
          company_id: string
          fetched_at: string
          id: string
          location_id: string
          raw: Json | null
          temperature_c: number
        }
        Insert: {
          company_id: string
          fetched_at?: string
          id?: string
          location_id: string
          raw?: Json | null
          temperature_c: number
        }
        Update: {
          company_id?: string
          fetched_at?: string
          id?: string
          location_id?: string
          raw?: Json | null
          temperature_c?: number
        }
        Relationships: []
      }
      work_order_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          user_id: string
          work_order_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          user_id: string
          work_order_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          user_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_comments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          asset_id: string | null
          assigned_to: string | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["work_order_priority"]
          status: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          status?: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          status?: Database["public"]["Enums"]["work_order_status"]
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          _first_name?: string
          _last_name?: string
          _phone?: string
          _token: string
        }
        Returns: Json
      }
      company_within_limit: { Args: { _resource: string }; Returns: boolean }
      company_within_limit_for: {
        Args: { _company: string; _resource: string }
        Returns: boolean
      }
      complete_owner_onboarding: {
        Args: {
          _company_name: string
          _first_name?: string
          _last_name?: string
          _phone?: string
        }
        Returns: Json
      }
      complete_personal_onboarding: {
        Args: { _first_name?: string; _last_name?: string; _phone?: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      dispatch_notification_event: {
        Args: { _event_type: string; _payload: Json }
        Returns: undefined
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_company_directory: {
        Args: never
        Returns: {
          avatar_url: string
          company_id: string
          company_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at: string
        }[]
      }
      get_company_subscription: {
        Args: never
        Returns: {
          asset_limit: number
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end: boolean
          current_period_end: string
          included_seats: number
          is_active: boolean
          paid_seats: number
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          total_seats: number
          trial_ends_at: string
          work_order_limit: number
        }[]
      }
      get_google_ads_connection_status: {
        Args: never
        Returns: {
          account_descriptive_name: string
          company_id: string
          connected_by: string
          created_at: string
          customer_id: string
          id: string
          login_customer_id: string
          scope: string
          token_expires_at: string
          updated_at: string
        }[]
      }
      get_invitation_by_token: {
        Args: { _token: string }
        Returns: {
          company_name: string
          created_at: string
          email: string
          id: string
          organization_id: string
          role: string
          status: string
        }[]
      }
      get_or_create_energy_ingest_token: { Args: never; Returns: string }
      get_public_company_by_slug: {
        Args: { _slug: string }
        Returns: {
          id: string
          logo: string
          name: string
          public_slug: string
        }[]
      }
      get_user_company: { Args: { _user_id: string }; Returns: string }
      get_user_company_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      has_feature: {
        Args: { _company_id: string; _feature: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_attachment_event: {
        Args: {
          _action: string
          _attachment_id?: string
          _details?: Json
          _entity_id: string
          _entity_type: string
        }
        Returns: undefined
      }
      migrate_company_data: { Args: never; Returns: undefined }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      regenerate_energy_ingest_token: { Args: never; Returns: string }
    }
    Enums: {
      app_role:
        | "administrator"
        | "manager"
        | "technician"
        | "viewer"
        | "super_admin"
      billing_interval: "month" | "year"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
      subscription_tier: "starter" | "pro" | "business"
      work_order_priority: "low" | "medium" | "high" | "urgent"
      work_order_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "administrator",
        "manager",
        "technician",
        "viewer",
        "super_admin",
      ],
      billing_interval: ["month", "year"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
      subscription_tier: ["starter", "pro", "business"],
      work_order_priority: ["low", "medium", "high", "urgent"],
      work_order_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
