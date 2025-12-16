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
      assessment_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          branch_condition: Json | null
          created_at: string
          help_text: string | null
          id: string
          is_active: boolean | null
          is_calibration: boolean | null
          max_level: string | null
          min_level: string | null
          module_id: string
          order_index: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          skill_dimensions: string[] | null
          weight: number | null
        }
        Insert: {
          branch_condition?: Json | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_calibration?: boolean | null
          max_level?: string | null
          min_level?: string | null
          module_id: string
          order_index?: number
          prompt: string
          question_type?: Database["public"]["Enums"]["question_type"]
          skill_dimensions?: string[] | null
          weight?: number | null
        }
        Update: {
          branch_condition?: Json | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_calibration?: boolean | null
          max_level?: string | null
          min_level?: string | null
          module_id?: string
          order_index?: number
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          skill_dimensions?: string[] | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "assessment_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_reports: {
        Row: {
          created_at: string
          growth_plan_json: Json | null
          id: string
          report_markdown: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          growth_plan_json?: Json | null
          id?: string
          report_markdown?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          growth_plan_json?: Json | null
          id?: string
          report_markdown?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          created_at: string
          id: string
          numeric_value: number | null
          question_id: string
          selected_option_id: string | null
          session_id: string
          text_value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          numeric_value?: number | null
          question_id: string
          selected_option_id?: string | null
          session_id: string
          text_value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          numeric_value?: number | null
          question_id?: string
          selected_option_id?: string | null
          session_id?: string
          text_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_scores: {
        Row: {
          blocker_archetype: string | null
          created_at: string
          current_level_inferred: string | null
          dimension_scores: Json | null
          experience_gaps: Json | null
          id: string
          level_gap: number | null
          market_fit: Json | null
          overall_score: number | null
          session_id: string
          skill_heatmap: Json | null
        }
        Insert: {
          blocker_archetype?: string | null
          created_at?: string
          current_level_inferred?: string | null
          dimension_scores?: Json | null
          experience_gaps?: Json | null
          id?: string
          level_gap?: number | null
          market_fit?: Json | null
          overall_score?: number | null
          session_id: string
          skill_heatmap?: Json | null
        }
        Update: {
          blocker_archetype?: string | null
          created_at?: string
          current_level_inferred?: string | null
          dimension_scores?: Json | null
          experience_gaps?: Json | null
          id?: string
          level_gap?: number | null
          market_fit?: Json | null
          overall_score?: number | null
          session_id?: string
          skill_heatmap?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          created_at: string
          current_module_index: number | null
          current_question_index: number | null
          email: string | null
          id: string
          inferred_level: string | null
          scored_at: string | null
          session_token: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_module_index?: number | null
          current_question_index?: number | null
          email?: string | null
          id?: string
          inferred_level?: string | null
          scored_at?: string | null
          session_token?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_module_index?: number | null
          current_question_index?: number | null
          email?: string | null
          id?: string
          inferred_level?: string | null
          scored_at?: string | null
          session_token?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      career_assessments: {
        Row: {
          ai_assessment: Json | null
          career_goals: string | null
          conversation_history: Json | null
          created_at: string
          current_level: string | null
          id: string
          job_description: string | null
          resume_text: string | null
          resume_url: string | null
          session_id: string
          skills: Json | null
          target_companies: string[] | null
          target_level: string | null
          updated_at: string
        }
        Insert: {
          ai_assessment?: Json | null
          career_goals?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_level?: string | null
          id?: string
          job_description?: string | null
          resume_text?: string | null
          resume_url?: string | null
          session_id: string
          skills?: Json | null
          target_companies?: string[] | null
          target_level?: string | null
          updated_at?: string
        }
        Update: {
          ai_assessment?: Json | null
          career_goals?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_level?: string | null
          id?: string
          job_description?: string | null
          resume_text?: string | null
          resume_url?: string | null
          session_id?: string
          skills?: Json | null
          target_companies?: string[] | null
          target_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          program_id: string
          sort_order: number | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          program_id: string
          sort_order?: number | null
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          program_id?: string
          sort_order?: number | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          lead_magnet: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lead_magnet?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lead_magnet?: string
        }
        Relationships: []
      }
      enrollment_resources: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          title: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          title: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          title?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_resources_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          cancellation_effective_at: string | null
          cancellation_requested_at: string | null
          city: string | null
          country: string | null
          email: string | null
          enrolled_at: string
          enrollment_code: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          occupation: string | null
          payment_status: string
          phone: string | null
          program_id: string
          start_date: string | null
          state: string | null
          stripe_subscription_id: string | null
          subscription_type: string | null
          user_id: string | null
          zip_code: string | null
          zoom_link: string | null
        }
        Insert: {
          cancellation_effective_at?: string | null
          cancellation_requested_at?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          enrolled_at?: string
          enrollment_code?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          occupation?: string | null
          payment_status?: string
          phone?: string | null
          program_id: string
          start_date?: string | null
          state?: string | null
          stripe_subscription_id?: string | null
          subscription_type?: string | null
          user_id?: string | null
          zip_code?: string | null
          zoom_link?: string | null
        }
        Update: {
          cancellation_effective_at?: string | null
          cancellation_requested_at?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          enrolled_at?: string
          enrollment_code?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          occupation?: string | null
          payment_status?: string
          phone?: string | null
          program_id?: string
          start_date?: string | null
          state?: string | null
          stripe_subscription_id?: string | null
          subscription_type?: string | null
          user_id?: string | null
          zip_code?: string | null
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
          slug: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
          slug: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          slug?: string
          start_date?: string | null
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          level_map: Json | null
          option_label: string
          option_text: string
          order_index: number
          question_id: string
          score_map: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          level_map?: Json | null
          option_label: string
          option_text: string
          order_index?: number
          question_id: string
          score_map?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          level_map?: Json | null
          option_label?: string
          option_text?: string
          order_index?: number
          question_id?: string
          score_map?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          is_published: boolean
          name: string
          outcome: string | null
          program: string | null
          published_at: string | null
          quote: string
          rating: number | null
          role: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          is_published?: boolean
          name: string
          outcome?: string | null
          program?: string | null
          published_at?: string | null
          quote: string
          rating?: number | null
          role?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_published?: boolean
          name?: string
          outcome?: string | null
          program?: string | null
          published_at?: string | null
          quote?: string
          rating?: number | null
          role?: string | null
        }
        Relationships: []
      }
      tool_purchases: {
        Row: {
          access_token: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          last_used_at: string | null
          purchased_at: string
          reminder_sent_at: string | null
          results_summary: Json | null
          status: string
          stripe_session_id: string | null
          tool_type: string
          usage_count: number
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          last_used_at?: string | null
          purchased_at?: string
          reminder_sent_at?: string | null
          results_summary?: Json | null
          status?: string
          stripe_session_id?: string | null
          tool_type: string
          usage_count?: number
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          purchased_at?: string
          reminder_sent_at?: string | null
          results_summary?: Json | null
          status?: string
          stripe_session_id?: string | null
          tool_type?: string
          usage_count?: number
        }
        Relationships: []
      }
      user_career_profiles: {
        Row: {
          blockers_self_report: string | null
          created_at: string
          current_title: string | null
          domain: string | null
          goals: string | null
          id: string
          location: string | null
          target_comp_range: string | null
          target_level: Database["public"]["Enums"]["target_level"] | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          blockers_self_report?: string | null
          created_at?: string
          current_title?: string | null
          domain?: string | null
          goals?: string | null
          id?: string
          location?: string | null
          target_comp_range?: string | null
          target_level?: Database["public"]["Enums"]["target_level"] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          blockers_self_report?: string | null
          created_at?: string
          current_title?: string | null
          domain?: string | null
          goals?: string | null
          id?: string
          location?: string | null
          target_comp_range?: string | null
          target_level?: Database["public"]["Enums"]["target_level"] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_enrollment_code: {
        Args: { code: string }
        Returns: {
          enrollment_id: string
          is_valid: boolean
        }[]
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      create_session_by_token: {
        Args: { p_session_token: string }
        Returns: {
          created_at: string
          current_module_index: number
          current_question_index: number
          email: string
          id: string
          inferred_level: string
          scored_at: string
          session_token: string
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          submitted_at: string
          user_id: string
        }[]
      }
      generate_enrollment_code: { Args: never; Returns: string }
      get_session_by_token: {
        Args: { p_session_token: string }
        Returns: {
          created_at: string
          current_module_index: number
          current_question_index: number
          email: string
          id: string
          inferred_level: string
          scored_at: string
          session_token: string
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          submitted_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_assessment_response: {
        Args: {
          p_numeric_value?: number
          p_question_id: string
          p_selected_option_id?: string
          p_session_token: string
          p_text_value?: string
        }
        Returns: string
      }
      update_session_by_token: {
        Args: {
          p_current_module_index?: number
          p_current_question_index?: number
          p_email?: string
          p_inferred_level?: string
          p_session_token: string
          p_status?: Database["public"]["Enums"]["session_status"]
          p_submitted_at?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      question_type:
        | "multiple_choice"
        | "forced_choice"
        | "scale_1_5"
        | "short_text"
        | "scenario"
        | "confidence"
      session_status: "not_started" | "in_progress" | "submitted" | "scored"
      target_level: "PM" | "Senior" | "Principal" | "GPM" | "Director"
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
      app_role: ["admin", "user"],
      question_type: [
        "multiple_choice",
        "forced_choice",
        "scale_1_5",
        "short_text",
        "scenario",
        "confidence",
      ],
      session_status: ["not_started", "in_progress", "submitted", "scored"],
      target_level: ["PM", "Senior", "Principal", "GPM", "Director"],
    },
  },
} as const
