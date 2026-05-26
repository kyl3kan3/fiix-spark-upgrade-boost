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
      complete_owner_onboarding: {
        Args: {
          _company_name: string
          _first_name?: string
          _last_name?: string
          _phone?: string
        }
        Returns: Json
      }
      dispatch_notification_event: {
        Args: { _event_type: string; _payload: Json }
        Returns: undefined
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
