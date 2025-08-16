export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      lab_provider_accounts: {
        Row: {
          id: string
          company_name: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          specialties: string[] | null
          certifications: string[] | null
          equipment: string[] | null
          quality_standards: string[] | null
          capacity: number | null
          turnaround_times: Json | null
          verification_status: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          specialties?: string[] | null
          certifications?: string[] | null
          equipment?: string[] | null
          quality_standards?: string[] | null
          capacity?: number | null
          turnaround_times?: Json | null
          verification_status?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          specialties?: string[] | null
          certifications?: string[] | null
          equipment?: string[] | null
          quality_standards?: string[] | null
          capacity?: number | null
          turnaround_times?: Json | null
          verification_status?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_provider_users: {
        Row: {
          id: string
          lab_provider_account_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          lab_provider_account_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          lab_provider_account_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_provider_users_lab_provider_account_id_fkey"
            columns: ["lab_provider_account_id"]
            isOneToOne: false
            referencedRelation: "lab_provider_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_provider_email_verifications: {
        Row: {
          id: string
          lab_provider_account_id: string
          verification_token: string
          expires_at: string
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lab_provider_account_id: string
          verification_token: string
          expires_at: string
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lab_provider_account_id?: string
          verification_token?: string
          expires_at?: string
          verified_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_provider_email_verifications_lab_provider_account_id_fkey"
            columns: ["lab_provider_account_id"]
            isOneToOne: false
            referencedRelation: "lab_provider_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_orders: {
        Row: {
          id: string
          order_number: string
          patient_name: string
          dentist_name: string
          dentist_email: string
          clinic_name: string
          order_type: string
          priority: string
          status: string
          instructions: string | null
          due_date: string | null
          estimated_cost: number | null
          actual_cost: number | null
          lab_provider_account_id: string
          case_details: Json
          attachments: string[] | null
          tracking_number: string | null
          quality_notes: string | null
          shipped_date: string | null
          delivered_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          patient_name: string
          dentist_name: string
          dentist_email: string
          clinic_name: string
          order_type: string
          priority?: string
          status?: string
          instructions?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          lab_provider_account_id: string
          case_details?: Json
          attachments?: string[] | null
          tracking_number?: string | null
          quality_notes?: string | null
          shipped_date?: string | null
          delivered_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          patient_name?: string
          dentist_name?: string
          dentist_email?: string
          clinic_name?: string
          order_type?: string
          priority?: string
          status?: string
          instructions?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          lab_provider_account_id?: string
          case_details?: Json
          attachments?: string[] | null
          tracking_number?: string | null
          quality_notes?: string | null
          shipped_date?: string | null
          delivered_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_lab_provider_account_id_fkey"
            columns: ["lab_provider_account_id"]
            isOneToOne: false
            referencedRelation: "lab_provider_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_provider_order_tracking: {
        Row: {
          id: string
          order_id: string
          status: string
          message: string
          progress_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          message: string
          progress_percentage?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          message?: string
          progress_percentage?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_provider_order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}