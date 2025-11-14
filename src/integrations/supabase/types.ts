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
      n8n_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_brand_name: string | null
          client_logo_url: string | null
          created_at: string
          description: string | null
          id: string
          link_unique: string
          logo_custom_height: number | null
          logo_position: string | null
          logo_size: string | null
          name: string
          public_description: string | null
          public_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_brand_name?: string | null
          client_logo_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          link_unique?: string
          logo_custom_height?: number | null
          logo_position?: string | null
          logo_size?: string | null
          name: string
          public_description?: string | null
          public_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_brand_name?: string | null
          client_logo_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          link_unique?: string
          logo_custom_height?: number | null
          logo_position?: string | null
          logo_size?: string | null
          name?: string
          public_description?: string | null
          public_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          id: string
          max_stars: number | null
          options: Json | null
          order_index: number
          project_id: string
          question_text: string
          question_type: string
          scale_config: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          max_stars?: number | null
          options?: Json | null
          order_index?: number
          project_id: string
          question_text: string
          question_type: string
          scale_config?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          max_stars?: number | null
          options?: Json | null
          order_index?: number
          project_id?: string
          question_text?: string
          question_type?: string
          scale_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          chatwoot_account_id: string | null
          chatwoot_conversation_id: string | null
          id: string
          project_id: string
          question_id: string
          response_data: Json | null
          response_text: string | null
          response_value: number | null
          session_id: string
          submitted_at: string
        }
        Insert: {
          chatwoot_account_id?: string | null
          chatwoot_conversation_id?: string | null
          id?: string
          project_id: string
          question_id: string
          response_data?: Json | null
          response_text?: string | null
          response_value?: number | null
          session_id: string
          submitted_at?: string
        }
        Update: {
          chatwoot_account_id?: string | null
          chatwoot_conversation_id?: string | null
          id?: string
          project_id?: string
          question_id?: string
          response_data?: Json | null
          response_text?: string | null
          response_value?: number | null
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          data_sharing: boolean
          email_notifications: boolean
          id: string
          openai_api_key: string | null
          updated_at: string
          user_id: string
          weekly_reports: boolean
        }
        Insert: {
          created_at?: string
          data_sharing?: boolean
          email_notifications?: boolean
          id?: string
          openai_api_key?: string | null
          updated_at?: string
          user_id: string
          weekly_reports?: boolean
        }
        Update: {
          created_at?: string
          data_sharing?: boolean
          email_notifications?: boolean
          id?: string
          openai_api_key?: string | null
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          average_rating: number | null
          total_projects: number | null
          total_responses: number | null
        }
        Relationships: []
      }
      projects_with_counts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          link_unique: string | null
          name: string | null
          public_description: string | null
          public_title: string | null
          response_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_project_by_link: {
        Args: { link: string }
        Returns: {
          description: string
          id: string
          name: string
        }[]
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
