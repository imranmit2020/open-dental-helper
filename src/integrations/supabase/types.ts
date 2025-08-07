export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_practice_insights: {
        Row: {
          actionable_items: Json | null
          confidence_score: number | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          insight_category: string
          insight_type: string
          practice_name: string
          predicted_impact: number | null
          priority_level: string | null
          title: string
        }
        Insert: {
          actionable_items?: Json | null
          confidence_score?: number | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          insight_category: string
          insight_type: string
          practice_name: string
          predicted_impact?: number | null
          priority_level?: string | null
          title: string
        }
        Update: {
          actionable_items?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          insight_category?: string
          insight_type?: string
          practice_name?: string
          predicted_impact?: number | null
          priority_level?: string | null
          title?: string
        }
        Relationships: []
      }
      allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reaction: string | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reaction?: string | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          dentist_id: string | null
          description: string | null
          duration: number | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          tenant_id: string | null
          title: string
          treatment_type: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          dentist_id?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          tenant_id?: string | null
          title: string
          treatment_type?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          dentist_id?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          tenant_id?: string | null
          title?: string
          treatment_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          patient_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          ai_personalization: Json | null
          campaign_id: string
          channel: string
          clicked_at: string | null
          converted_at: string | null
          created_at: string
          delivered_at: string | null
          id: string
          opened_at: string | null
          patient_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          ai_personalization?: Json | null
          campaign_id: string
          channel: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          patient_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          ai_personalization?: Json | null
          campaign_id?: string
          channel?: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          patient_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_forms: {
        Row: {
          created_at: string
          expires_at: string | null
          form_data: Json
          id: string
          patient_id: string
          signature: string | null
          status: string | null
          submitted_at: string | null
          treatment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          form_data: Json
          id?: string
          patient_id: string
          signature?: string | null
          status?: string | null
          submitted_at?: string | null
          treatment_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          form_data?: Json
          id?: string
          patient_id?: string
          signature?: string | null
          status?: string | null
          submitted_at?: string | null
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_users: {
        Row: {
          corporation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          corporation_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          corporation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_users_corporation_id_fkey"
            columns: ["corporation_id"]
            isOneToOne: false
            referencedRelation: "corporations"
            referencedColumns: ["id"]
          },
        ]
      }
      corporations: {
        Row: {
          address: string | null
          corporate_code: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          corporate_code: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          corporate_code?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      dentist_availability: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string
          day_of_week: number
          dentist_id: string
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week: number
          dentist_id: string
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week?: number
          dentist_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      image_analyses: {
        Row: {
          ai_results: Json | null
          analysis_type: string
          confidence_score: number | null
          created_at: string
          findings: string[] | null
          id: string
          image_url: string
          patient_id: string
          recommendations: string[] | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          ai_results?: Json | null
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          findings?: string[] | null
          id?: string
          image_url: string
          patient_id: string
          recommendations?: string[] | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          ai_results?: Json | null
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          findings?: string[] | null
          id?: string
          image_url?: string
          patient_id?: string
          recommendations?: string[] | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_analyses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_analyses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lead_id: string
          next_action: string | null
          outcome: string | null
          scheduled_for: string | null
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id: string
          next_action?: string | null
          outcome?: string | null
          scheduled_for?: string | null
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string
          next_action?: string | null
          outcome?: string | null
          scheduled_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_insights: Json | null
          ai_lead_score: number | null
          assigned_to: string | null
          conversion_date: string | null
          conversion_probability: number | null
          created_at: string
          email: string | null
          first_contact_at: string | null
          follow_up_sequence: Json | null
          id: string
          last_contact_at: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          service_interest: string[] | null
          source: string
          status: string
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          ai_insights?: Json | null
          ai_lead_score?: number | null
          assigned_to?: string | null
          conversion_date?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string | null
          first_contact_at?: string | null
          follow_up_sequence?: Json | null
          id?: string
          last_contact_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          service_interest?: string[] | null
          source: string
          status?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          ai_insights?: Json | null
          ai_lead_score?: number | null
          assigned_to?: string | null
          conversion_date?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string | null
          first_contact_at?: string | null
          follow_up_sequence?: Json | null
          id?: string
          last_contact_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          service_interest?: string[] | null
          source?: string
          status?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          ai_generated_content: string | null
          campaign_name: string
          campaign_type: string
          content: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          ai_generated_content?: string | null
          campaign_name: string
          campaign_type: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          ai_generated_content?: string | null
          campaign_name?: string
          campaign_type?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns_enhanced: {
        Row: {
          actual_start: string | null
          ai_generated_content: Json | null
          ai_optimization_enabled: boolean | null
          campaign_name: string
          campaign_type: string
          content: string | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          performance_metrics: Json | null
          scheduled_start: string | null
          status: string
          target_audience: Json
          updated_at: string
        }
        Insert: {
          actual_start?: string | null
          ai_generated_content?: Json | null
          ai_optimization_enabled?: boolean | null
          campaign_name: string
          campaign_type: string
          content?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          scheduled_start?: string | null
          status?: string
          target_audience: Json
          updated_at?: string
        }
        Update: {
          actual_start?: string | null
          ai_generated_content?: Json | null
          ai_optimization_enabled?: boolean | null
          campaign_name?: string
          campaign_type?: string
          content?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          scheduled_start?: string | null
          status?: string
          target_audience?: Json
          updated_at?: string
        }
        Relationships: []
      }
      medical_conditions: {
        Row: {
          condition_name: string
          created_at: string
          diagnosed_date: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          attachments: string[] | null
          created_at: string
          dentist_id: string | null
          description: string | null
          diagnosis: string | null
          follow_up_date: string | null
          id: string
          patient_id: string
          record_type: string
          status: string | null
          title: string
          treatment: string | null
          updated_at: string
          visit_date: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          dentist_id?: string | null
          description?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          patient_id: string
          record_type: string
          status?: string | null
          title: string
          treatment?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          dentist_id?: string | null
          description?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          patient_id?: string
          record_type?: string
          status?: string | null
          title?: string
          treatment?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_journey_events: {
        Row: {
          ai_insights: Json | null
          created_at: string
          event_data: Json
          event_type: string
          id: string
          patient_id: string
          source_module: string
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          patient_id: string
          source_module: string
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          patient_id?: string
          source_module?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_info: Json | null
          last_name: string
          last_visit: string | null
          phone: string | null
          risk_level: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          last_name: string
          last_visit?: string | null
          phone?: string | null
          risk_level?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          last_name?: string
          last_visit?: string | null
          phone?: string | null
          risk_level?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number | null
          period_end: string | null
          period_start: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Relationships: []
      }
      practice_leaderboard: {
        Row: {
          created_at: string
          id: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          practice_name: string
          ranking: number | null
          staff_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          practice_name: string
          ranking?: number | null
          staff_name: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          practice_name?: string
          ranking?: number | null
          staff_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          actual_response: string | null
          ai_sentiment_analysis: Json | null
          ai_sentiment_score: number | null
          ai_suggested_response: string | null
          appointment_id: string | null
          created_at: string
          id: string
          patient_id: string
          platform: string
          request_sent_at: string | null
          responded_at: string | null
          response_required: boolean | null
          review_rating: number | null
          review_received_at: string | null
          review_text: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_response?: string | null
          ai_sentiment_analysis?: Json | null
          ai_sentiment_score?: number | null
          ai_suggested_response?: string | null
          appointment_id?: string | null
          created_at?: string
          id?: string
          patient_id: string
          platform: string
          request_sent_at?: string | null
          responded_at?: string | null
          response_required?: boolean | null
          review_rating?: number | null
          review_received_at?: string | null
          review_text?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_response?: string | null
          ai_sentiment_analysis?: Json | null
          ai_sentiment_score?: number | null
          ai_suggested_response?: string | null
          appointment_id?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          platform?: string
          request_sent_at?: string | null
          responded_at?: string | null
          response_required?: boolean | null
          review_rating?: number | null
          review_received_at?: string | null
          review_text?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_revenue: {
        Row: {
          created_at: string
          id: string
          patient_count: number | null
          practice_name: string
          revenue_amount: number
          service_date: string
          service_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_count?: number | null
          practice_name: string
          revenue_amount: number
          service_date?: string
          service_type: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_count?: number | null
          practice_name?: string
          revenue_amount?: number
          service_date?: string
          service_type?: string
        }
        Relationships: []
      }
      staff_performance: {
        Row: {
          created_at: string
          efficiency_rating: number | null
          hours_worked: number | null
          id: string
          patient_satisfaction_score: number | null
          patients_served: number | null
          performance_date: string
          practice_name: string
          productivity_score: number | null
          revenue_generated: number | null
          staff_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          efficiency_rating?: number | null
          hours_worked?: number | null
          id?: string
          patient_satisfaction_score?: number | null
          patients_served?: number | null
          performance_date?: string
          practice_name: string
          productivity_score?: number | null
          revenue_generated?: number | null
          staff_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          efficiency_rating?: number | null
          hours_worked?: number | null
          id?: string
          patient_satisfaction_score?: number | null
          patients_served?: number | null
          performance_date?: string
          practice_name?: string
          productivity_score?: number | null
          revenue_generated?: number | null
          staff_member_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teledentistry_sessions: {
        Row: {
          ai_soap_notes: Json | null
          ai_summary: string | null
          ai_transcript: string | null
          created_at: string
          dentist_id: string
          ended_at: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          patient_id: string
          recording_url: string | null
          scheduled_at: string
          session_type: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_soap_notes?: Json | null
          ai_summary?: string | null
          ai_transcript?: string | null
          created_at?: string
          dentist_id: string
          ended_at?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          patient_id: string
          recording_url?: string | null
          scheduled_at: string
          session_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_soap_notes?: Json | null
          ai_summary?: string | null
          ai_transcript?: string | null
          created_at?: string
          dentist_id?: string
          ended_at?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          patient_id?: string
          recording_url?: string | null
          scheduled_at?: string
          session_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          clinic_code: string
          corporation_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          clinic_code: string
          corporation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          clinic_code?: string
          corporation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenants_corporation"
            columns: ["corporation_id"]
            isOneToOne: false
            referencedRelation: "corporations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_corporation_id_fkey"
            columns: ["corporation_id"]
            isOneToOne: false
            referencedRelation: "corporations"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          original_text: string
          source_language: string
          status: string | null
          target_language: string
          translated_text: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          original_text: string
          source_language: string
          status?: string | null
          target_language: string
          translated_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          original_text?: string
          source_language?: string
          status?: string | null
          target_language?: string
          translated_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          created_at: string
          created_by: string
          estimated_duration: number | null
          id: string
          notes: string | null
          patient_id: string
          phases: Json | null
          plan_name: string
          priority: string | null
          status: string | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          phases?: Json | null
          plan_name: string
          priority?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          phases?: Json | null
          plan_name?: string
          priority?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_predictions: {
        Row: {
          alternative_treatments: string[] | null
          created_at: string
          created_by: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          id: string
          patient_id: string
          recommendations: string[] | null
          risk_factors: string[] | null
          success_probability: number | null
          treatment_type: string
          updated_at: string
        }
        Insert: {
          alternative_treatments?: string[] | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          id?: string
          patient_id: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          success_probability?: number | null
          treatment_type: string
          updated_at?: string
        }
        Update: {
          alternative_treatments?: string[] | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          id?: string
          patient_id?: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          success_probability?: number | null
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_predictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_predictions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          ai_analysis: Json | null
          audio_file_url: string | null
          created_at: string
          dentist_id: string
          duration: number | null
          id: string
          patient_id: string | null
          status: string | null
          summary: string | null
          transcription: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          audio_file_url?: string | null
          created_at?: string
          dentist_id: string
          duration?: number | null
          id?: string
          patient_id?: string | null
          status?: string | null
          summary?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          audio_file_url?: string | null
          created_at?: string
          dentist_id?: string
          duration?: number | null
          id?: string
          patient_id?: string | null
          status?: string | null
          summary?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tenant_schema: {
        Args: {
          tenant_id_param: string
          schema_name_param: string
          clinic_code_param: string
        }
        Returns: undefined
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dentist_availability_for_date: {
        Args: { _dentist_id: string; _tenant_id: string; _date: string }
        Returns: {
          is_available: boolean
          start_time: string
          end_time: string
          break_start_time: string
          break_end_time: string
        }[]
      }
      get_user_tenant_role: {
        Args: { _user_id: string; _tenant_id: string }
        Returns: string
      }
      user_belongs_to_tenant: {
        Args: { _user_id: string; _tenant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
