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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      error_log: {
        Row: {
          context: string | null
          created_at: string
          id: number
          message: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: never
          message: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: never
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_log: {
        Row: {
          created_at: string
          id: number
          is_qa: boolean
          metadata: Json
          session_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          is_qa?: boolean
          metadata?: Json
          session_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          is_qa?: boolean
          metadata?: Json
          session_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          calificacion: number
          comentario: string | null
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          calificacion: number
          comentario?: string | null
          created_at?: string
          id?: never
          user_id?: string | null
        }
        Update: {
          calificacion?: number
          comentario?: string | null
          created_at?: string
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          activo: boolean
          created_at: string
          dolor: string | null
          email: string | null
          id: string
          momento: string | null
          role: string
          source: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          dolor?: string | null
          email?: string | null
          id: string
          momento?: string | null
          role?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          dolor?: string | null
          email?: string | null
          id?: string
          momento?: string | null
          role?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      processed_events: {
        Row: {
          event_id: string
          event_type: string
          payload_hash: string | null
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          payload_hash?: string | null
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          payload_hash?: string | null
          processed_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sesiones_rutina: {
        Row: {
          capacidad: string
          created_at: string
          duracion: number
          id: string
          nombre_rutina: string
          respuestas: Json
          rutina_id: string
          te_llevas: string
          user_id: string
        }
        Insert: {
          capacidad: string
          created_at?: string
          duracion: number
          id?: string
          nombre_rutina: string
          respuestas?: Json
          rutina_id: string
          te_llevas: string
          user_id: string
        }
        Update: {
          capacidad?: string
          created_at?: string
          duracion?: number
          id?: string
          nombre_rutina?: string
          respuestas?: Json
          rutina_id?: string
          te_llevas?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_log: {
        Row: {
          detail: string | null
          event_id: string | null
          id: number
          received_at: string
          result: string
          type: string | null
        }
        Insert: {
          detail?: string | null
          event_id?: string | null
          id?: number
          received_at?: string
          result: string
          type?: string | null
        }
        Update: {
          detail?: string | null
          event_id?: string | null
          id?: number
          received_at?: string
          result?: string
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
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
