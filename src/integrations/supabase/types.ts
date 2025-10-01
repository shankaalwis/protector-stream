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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anomaly_alerts: {
        Row: {
          anomaly_score: number
          client_id: string
          created_at: string
          id: string
          is_anomaly: boolean
          packet_count: number
          timestamp: string
        }
        Insert: {
          anomaly_score: number
          client_id: string
          created_at?: string
          id?: string
          is_anomaly?: boolean
          packet_count: number
          timestamp: string
        }
        Update: {
          anomaly_score?: number
          client_id?: string
          created_at?: string
          id?: string
          is_anomaly?: boolean
          packet_count?: number
          timestamp?: string
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_key: string
          metric_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_key: string
          metric_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_key?: string
          metric_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          alerts: Json | null
          client_id: string
          connected_since: string | null
          created_at: string | null
          device_name: string
          id: string
          ip_address: string
          mac_address: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alerts?: Json | null
          client_id: string
          connected_since?: string | null
          created_at?: string | null
          device_name: string
          id?: string
          ip_address: string
          mac_address?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alerts?: Json | null
          client_id?: string
          connected_since?: string | null
          created_at?: string | null
          device_name?: string
          id?: string
          ip_address?: string
          mac_address?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      network_metrics: {
        Row: {
          created_at: string | null
          data_transferred_mb: number | null
          id: string
          network_activity: Json | null
          threats_detected: number | null
          total_devices: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_transferred_mb?: number | null
          id?: string
          network_activity?: Json | null
          threats_detected?: number | null
          total_devices?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_transferred_mb?: number | null
          id?: string
          network_activity?: Json | null
          threats_detected?: number | null
          total_devices?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          ai_analysis_chat: Json | null
          alert_type: string
          created_at: string | null
          description: string
          device_id: string
          id: string
          severity: string
          status: string | null
          timestamp: string | null
        }
        Insert: {
          ai_analysis_chat?: Json | null
          alert_type: string
          created_at?: string | null
          description: string
          device_id: string
          id?: string
          severity: string
          status?: string | null
          timestamp?: string | null
        }
        Update: {
          ai_analysis_chat?: Json | null
          alert_type?: string
          created_at?: string | null
          description?: string
          device_id?: string
          id?: string
          severity?: string
          status?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          firewall_api_key: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          firewall_api_key?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          firewall_api_key?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
