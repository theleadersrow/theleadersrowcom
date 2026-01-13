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
      ama_feedback: {
        Row: {
          allow_testimonial_use: boolean | null
          content_quality: number | null
          created_at: string
          email: string
          event_date: string
          full_name: string | null
          id: string
          most_valuable: string | null
          overall_rating: number
          registration_id: string | null
          speaker_quality: number | null
          suggestions: string | null
          testimonial: string | null
          topics_for_next: string | null
          would_recommend: boolean | null
        }
        Insert: {
          allow_testimonial_use?: boolean | null
          content_quality?: number | null
          created_at?: string
          email: string
          event_date: string
          full_name?: string | null
          id?: string
          most_valuable?: string | null
          overall_rating: number
          registration_id?: string | null
          speaker_quality?: number | null
          suggestions?: string | null
          testimonial?: string | null
          topics_for_next?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          allow_testimonial_use?: boolean | null
          content_quality?: number | null
          created_at?: string
          email?: string
          event_date?: string
          full_name?: string | null
          id?: string
          most_valuable?: string | null
          overall_rating?: number
          registration_id?: string | null
          speaker_quality?: number | null
          suggestions?: string | null
          testimonial?: string | null
          topics_for_next?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ama_feedback_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "beta_event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      beta_event_registrations: {
        Row: {
          agrees_to_communication: boolean
          company: string | null
          created_at: string
          current_position: string
          email: string
          event_date: string | null
          full_name: string
          id: string
          invited_at: string | null
          job_search_status: string
          linkedin_url: string | null
          phone: string
          status: string
          subscribe_to_newsletter: boolean | null
          target_roles: string
          tool_type: string
          understands_beta_terms: boolean
          zoom_link_sent: boolean | null
        }
        Insert: {
          agrees_to_communication?: boolean
          company?: string | null
          created_at?: string
          current_position: string
          email: string
          event_date?: string | null
          full_name: string
          id?: string
          invited_at?: string | null
          job_search_status: string
          linkedin_url?: string | null
          phone: string
          status?: string
          subscribe_to_newsletter?: boolean | null
          target_roles: string
          tool_type?: string
          understands_beta_terms?: boolean
          zoom_link_sent?: boolean | null
        }
        Update: {
          agrees_to_communication?: boolean
          company?: string | null
          created_at?: string
          current_position?: string
          email?: string
          event_date?: string | null
          full_name?: string
          id?: string
          invited_at?: string | null
          job_search_status?: string
          linkedin_url?: string | null
          phone?: string
          status?: string
          subscribe_to_newsletter?: boolean | null
          target_roles?: string
          tool_type?: string
          understands_beta_terms?: boolean
          zoom_link_sent?: boolean | null
        }
        Relationships: []
      }
      career_advisor_chats: {
        Row: {
          created_at: string
          email: string | null
          id: string
          messages: Json
          session_id: string
          updated_at: string
          user_profile_context: string | null
          user_profile_type: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          messages?: Json
          session_id: string
          updated_at?: string
          user_profile_context?: string | null
          user_profile_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          messages?: Json
          session_id?: string
          updated_at?: string
          user_profile_context?: string | null
          user_profile_type?: string | null
        }
        Relationships: []
      }
      career_advisor_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          progress: number | null
          session_id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          progress?: number | null
          session_id: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          progress?: number | null
          session_id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_advisor_summaries: {
        Row: {
          action_items: Json | null
          created_at: string
          email: string | null
          id: string
          key_insights: Json | null
          session_id: string
          summary: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          key_insights?: Json | null
          session_id: string
          summary: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          key_insights?: Json | null
          session_id?: string
          summary?: string
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
      career_leverage_analysis: {
        Row: {
          best_fit_company_types: string[] | null
          best_fit_roles: string[] | null
          created_at: string
          current_level_assessment: string | null
          id: string
          level_gap_analysis: string | null
          leveling_strategy: string | null
          market_positioning: string | null
          recommended_level: string | null
          session_id: string | null
          undervaluation_signals: string[] | null
        }
        Insert: {
          best_fit_company_types?: string[] | null
          best_fit_roles?: string[] | null
          created_at?: string
          current_level_assessment?: string | null
          id?: string
          level_gap_analysis?: string | null
          leveling_strategy?: string | null
          market_positioning?: string | null
          recommended_level?: string | null
          session_id?: string | null
          undervaluation_signals?: string[] | null
        }
        Update: {
          best_fit_company_types?: string[] | null
          best_fit_roles?: string[] | null
          created_at?: string
          current_level_assessment?: string | null
          id?: string
          level_gap_analysis?: string | null
          leveling_strategy?: string | null
          market_positioning?: string | null
          recommended_level?: string | null
          session_id?: string | null
          undervaluation_signals?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "career_leverage_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_summaries: {
        Row: {
          consensus_level: string | null
          created_at: string
          final_verdict: string
          id: string
          session_id: string | null
          tipping_factors: string[] | null
          verdict_explanation: string | null
          what_would_change: string[] | null
        }
        Insert: {
          consensus_level?: string | null
          created_at?: string
          final_verdict: string
          id?: string
          session_id?: string | null
          tipping_factors?: string[] | null
          verdict_explanation?: string | null
          what_would_change?: string[] | null
        }
        Update: {
          consensus_level?: string | null
          created_at?: string
          final_verdict?: string
          id?: string
          session_id?: string | null
          tipping_factors?: string[] | null
          verdict_explanation?: string | null
          what_would_change?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          bar_raiser_expectations: string | null
          category_weights: Json
          common_red_flags: string[] | null
          company_name: string
          core_values: string[] | null
          created_at: string
          display_name: string
          id: string
          preferred_answer_style: string | null
        }
        Insert: {
          bar_raiser_expectations?: string | null
          category_weights?: Json
          common_red_flags?: string[] | null
          company_name: string
          core_values?: string[] | null
          created_at?: string
          display_name: string
          id?: string
          preferred_answer_style?: string | null
        }
        Update: {
          bar_raiser_expectations?: string | null
          category_weights?: Json
          common_red_flags?: string[] | null
          company_name?: string
          core_values?: string[] | null
          created_at?: string
          display_name?: string
          id?: string
          preferred_answer_style?: string | null
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
      hiring_committee_reviews: {
        Row: {
          confidence_score: number | null
          created_at: string
          detailed_feedback: string | null
          id: string
          persona_name: string
          persona_role: string
          session_id: string | null
          top_concerns: string[]
          top_positives: string[]
          verdict: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detailed_feedback?: string | null
          id?: string
          persona_name: string
          persona_role: string
          session_id?: string | null
          top_concerns?: string[]
          top_positives?: string[]
          verdict: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detailed_feedback?: string | null
          id?: string
          persona_name?: string
          persona_role?: string
          session_id?: string | null
          top_concerns?: string[]
          top_positives?: string[]
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiring_committee_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          answer_text: string
          audio_url: string | null
          created_at: string
          id: string
          is_retry: boolean | null
          original_answer_id: string | null
          question_id: string
          question_index: number
          session_id: string
          timestamp_end: string | null
          timestamp_start: string
          transcript: string | null
        }
        Insert: {
          answer_text: string
          audio_url?: string | null
          created_at?: string
          id?: string
          is_retry?: boolean | null
          original_answer_id?: string | null
          question_id: string
          question_index?: number
          session_id: string
          timestamp_end?: string | null
          timestamp_start?: string
          transcript?: string | null
        }
        Update: {
          answer_text?: string
          audio_url?: string | null
          created_at?: string
          id?: string
          is_retry?: boolean | null
          original_answer_id?: string | null
          question_id?: string
          question_index?: number
          session_id?: string
          timestamp_end?: string | null
          timestamp_start?: string
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_original_answer_id_fkey"
            columns: ["original_answer_id"]
            isOneToOne: false
            referencedRelation: "interview_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_evaluations: {
        Row: {
          answer_id: string
          assertion_evidence_ratio: number | null
          category_score_0_100: number | null
          coach_next_steps: string[] | null
          communication_clarity_1_5: number | null
          confidence_calibration: string | null
          confidence_coaching: string[] | null
          confidence_score: number | null
          created_at: string
          decision_quality_1_5: number | null
          execution_rigor_1_5: number | null
          feedback_gaps: string[] | null
          feedback_strengths: string[] | null
          followup_questions: string[] | null
          hedging_language_count: number | null
          hire_signals: Json | null
          id: string
          interviewer_notes: string | null
          level_calibration: string | null
          live_checklist: Json | null
          ownership_impact_1_5: number | null
          problem_framing_1_5: number | null
          question_id: string
          rewritten_sample_answer: string | null
          session_id: string
          strategic_thinking_1_5: number | null
        }
        Insert: {
          answer_id: string
          assertion_evidence_ratio?: number | null
          category_score_0_100?: number | null
          coach_next_steps?: string[] | null
          communication_clarity_1_5?: number | null
          confidence_calibration?: string | null
          confidence_coaching?: string[] | null
          confidence_score?: number | null
          created_at?: string
          decision_quality_1_5?: number | null
          execution_rigor_1_5?: number | null
          feedback_gaps?: string[] | null
          feedback_strengths?: string[] | null
          followup_questions?: string[] | null
          hedging_language_count?: number | null
          hire_signals?: Json | null
          id?: string
          interviewer_notes?: string | null
          level_calibration?: string | null
          live_checklist?: Json | null
          ownership_impact_1_5?: number | null
          problem_framing_1_5?: number | null
          question_id: string
          rewritten_sample_answer?: string | null
          session_id: string
          strategic_thinking_1_5?: number | null
        }
        Update: {
          answer_id?: string
          assertion_evidence_ratio?: number | null
          category_score_0_100?: number | null
          coach_next_steps?: string[] | null
          communication_clarity_1_5?: number | null
          confidence_calibration?: string | null
          confidence_coaching?: string[] | null
          confidence_score?: number | null
          created_at?: string
          decision_quality_1_5?: number | null
          execution_rigor_1_5?: number | null
          feedback_gaps?: string[] | null
          feedback_strengths?: string[] | null
          followup_questions?: string[] | null
          hedging_language_count?: number | null
          hire_signals?: Json | null
          id?: string
          interviewer_notes?: string | null
          level_calibration?: string | null
          live_checklist?: Json | null
          ownership_impact_1_5?: number | null
          problem_framing_1_5?: number | null
          question_id?: string
          rewritten_sample_answer?: string | null
          session_id?: string
          strategic_thinking_1_5?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_evaluations_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "interview_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_evaluations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category: string
          company_context: string | null
          created_at: string
          difficulty: number
          followup_prompts: string[] | null
          id: string
          is_active: boolean | null
          prompt_text: string
          rubric_weights: Json
          target_level: string
        }
        Insert: {
          category: string
          company_context?: string | null
          created_at?: string
          difficulty?: number
          followup_prompts?: string[] | null
          id?: string
          is_active?: boolean | null
          prompt_text: string
          rubric_weights?: Json
          target_level?: string
        }
        Update: {
          category?: string
          company_context?: string | null
          created_at?: string
          difficulty?: number
          followup_prompts?: string[] | null
          id?: string
          is_active?: boolean | null
          prompt_text?: string
          rubric_weights?: Json
          target_level?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          committee_notes: string | null
          committee_recommendation: string | null
          company_profile_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          interview_type: string
          notes: string | null
          objection_mode: boolean | null
          overall_score_0_100: number | null
          readiness_verdict: string | null
          red_flags_count: number | null
          selected_categories: string[] | null
          session_token: string | null
          status: string
          strong_hire_signals_count: number | null
          target_company: string | null
          target_level: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          committee_notes?: string | null
          committee_recommendation?: string | null
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interview_type?: string
          notes?: string | null
          objection_mode?: boolean | null
          overall_score_0_100?: number | null
          readiness_verdict?: string | null
          red_flags_count?: number | null
          selected_categories?: string[] | null
          session_token?: string | null
          status?: string
          strong_hire_signals_count?: number | null
          target_company?: string | null
          target_level?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          committee_notes?: string | null
          committee_recommendation?: string | null
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interview_type?: string
          notes?: string | null
          objection_mode?: boolean | null
          overall_score_0_100?: number | null
          readiness_verdict?: string | null
          red_flags_count?: number | null
          selected_categories?: string[] | null
          session_token?: string | null
          status?: string
          strong_hire_signals_count?: number | null
          target_company?: string | null
          target_level?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "interview_users"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_users: {
        Row: {
          created_at: string
          domain_focus: string | null
          email: string | null
          id: string
          name: string | null
          target_company_type: string
          target_role_level: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          domain_focus?: string | null
          email?: string | null
          id?: string
          name?: string | null
          target_company_type?: string
          target_role_level?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          domain_focus?: string | null
          email?: string | null
          id?: string
          name?: string | null
          target_company_type?: string
          target_role_level?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      narrative_insights: {
        Row: {
          clarity_gaps: string[] | null
          concision_clarity_score: number | null
          coverage_score: number | null
          created_at: string
          decision_tradeoffs_score: number | null
          id: string
          metric_gaps: string[] | null
          missing_themes: string[] | null
          narrative_score_0_100: number | null
          next_drill_plan: Json | null
          ownership_clarity_score: number | null
          ownership_gaps: string[] | null
          proof_gaps: Json | null
          proof_metrics_score: number | null
          repeated_themes: string[] | null
          session_id: string
          story_recommendations: string[] | null
          updated_at: string
        }
        Insert: {
          clarity_gaps?: string[] | null
          concision_clarity_score?: number | null
          coverage_score?: number | null
          created_at?: string
          decision_tradeoffs_score?: number | null
          id?: string
          metric_gaps?: string[] | null
          missing_themes?: string[] | null
          narrative_score_0_100?: number | null
          next_drill_plan?: Json | null
          ownership_clarity_score?: number | null
          ownership_gaps?: string[] | null
          proof_gaps?: Json | null
          proof_metrics_score?: number | null
          repeated_themes?: string[] | null
          session_id: string
          story_recommendations?: string[] | null
          updated_at?: string
        }
        Update: {
          clarity_gaps?: string[] | null
          concision_clarity_score?: number | null
          coverage_score?: number | null
          created_at?: string
          decision_tradeoffs_score?: number | null
          id?: string
          metric_gaps?: string[] | null
          missing_themes?: string[] | null
          narrative_score_0_100?: number | null
          next_drill_plan?: Json | null
          ownership_clarity_score?: number | null
          ownership_gaps?: string[] | null
          proof_gaps?: Json | null
          proof_metrics_score?: number | null
          repeated_themes?: string[] | null
          session_id?: string
          story_recommendations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrative_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_readiness: {
        Row: {
          compensation_leverage_signals: string[] | null
          created_at: string
          downlevel_probability: number | null
          id: string
          leveling_risks: string[] | null
          negotiation_readiness: string | null
          negotiation_recommendations: string[] | null
          predicted_level: string | null
          session_id: string | null
          target_company_fit: Json | null
        }
        Insert: {
          compensation_leverage_signals?: string[] | null
          created_at?: string
          downlevel_probability?: number | null
          id?: string
          leveling_risks?: string[] | null
          negotiation_readiness?: string | null
          negotiation_recommendations?: string[] | null
          predicted_level?: string | null
          session_id?: string | null
          target_company_fit?: Json | null
        }
        Update: {
          compensation_leverage_signals?: string[] | null
          created_at?: string
          downlevel_probability?: number | null
          id?: string
          leveling_risks?: string[] | null
          negotiation_readiness?: string | null
          negotiation_recommendations?: string[] | null
          predicted_level?: string | null
          session_id?: string | null
          target_company_fit?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_readiness_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
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
      required_signals: {
        Row: {
          category: string
          created_at: string
          example_prompts: string[] | null
          id: string
          importance: string | null
          signal_description: string | null
          signal_name: string
          target_level: string
        }
        Insert: {
          category: string
          created_at?: string
          example_prompts?: string[] | null
          id?: string
          importance?: string | null
          signal_description?: string | null
          signal_name: string
          target_level: string
        }
        Update: {
          category?: string
          created_at?: string
          example_prompts?: string[] | null
          id?: string
          importance?: string | null
          signal_description?: string | null
          signal_name?: string
          target_level?: string
        }
        Relationships: []
      }
      session_category_scores: {
        Row: {
          above_count: number | null
          at_count: number | null
          below_count: number | null
          category: string
          created_at: string
          id: string
          questions_count: number | null
          score_0_100: number | null
          session_id: string
          strongest_dimension: string | null
          weakest_dimension: string | null
        }
        Insert: {
          above_count?: number | null
          at_count?: number | null
          below_count?: number | null
          category: string
          created_at?: string
          id?: string
          questions_count?: number | null
          score_0_100?: number | null
          session_id: string
          strongest_dimension?: string | null
          weakest_dimension?: string | null
        }
        Update: {
          above_count?: number | null
          at_count?: number | null
          below_count?: number | null
          category?: string
          created_at?: string
          id?: string
          questions_count?: number | null
          score_0_100?: number | null
          session_id?: string
          strongest_dimension?: string | null
          weakest_dimension?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_category_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_coverage: {
        Row: {
          coverage_strength: string | null
          created_at: string
          id: string
          is_covered: boolean | null
          notes: string | null
          session_id: string | null
          signal_id: string | null
          source_answer_id: string | null
        }
        Insert: {
          coverage_strength?: string | null
          created_at?: string
          id?: string
          is_covered?: boolean | null
          notes?: string | null
          session_id?: string | null
          signal_id?: string | null
          source_answer_id?: string | null
        }
        Update: {
          coverage_strength?: string | null
          created_at?: string
          id?: string
          is_covered?: boolean | null
          notes?: string | null
          session_id?: string | null
          signal_id?: string | null
          source_answer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_coverage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_coverage_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "required_signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_coverage_source_answer_id_fkey"
            columns: ["source_answer_id"]
            isOneToOne: false
            referencedRelation: "interview_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      star_bank: {
        Row: {
          action: string
          best_categories: string[] | null
          competency_tags: string[] | null
          confidence_score: number | null
          created_at: string
          id: string
          last_used_at: string | null
          level_signal: string | null
          metrics: Json | null
          missing_fields: string[] | null
          result: string
          risk_areas: string[] | null
          scope: Json | null
          session_token: string | null
          situation: string
          source_answer_id: string | null
          stakeholders: string[] | null
          task: string
          theme_tags: string[] | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string | null
          version_2min: string | null
          version_30sec: string | null
          version_deep_dive: string | null
        }
        Insert: {
          action: string
          best_categories?: string[] | null
          competency_tags?: string[] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          level_signal?: string | null
          metrics?: Json | null
          missing_fields?: string[] | null
          result: string
          risk_areas?: string[] | null
          scope?: Json | null
          session_token?: string | null
          situation: string
          source_answer_id?: string | null
          stakeholders?: string[] | null
          task: string
          theme_tags?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          version_2min?: string | null
          version_30sec?: string | null
          version_deep_dive?: string | null
        }
        Update: {
          action?: string
          best_categories?: string[] | null
          competency_tags?: string[] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          level_signal?: string | null
          metrics?: Json | null
          missing_fields?: string[] | null
          result?: string
          risk_areas?: string[] | null
          scope?: Json | null
          session_token?: string | null
          situation?: string
          source_answer_id?: string | null
          stakeholders?: string[] | null
          task?: string
          theme_tags?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          version_2min?: string | null
          version_30sec?: string | null
          version_deep_dive?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "star_bank_source_answer_id_fkey"
            columns: ["source_answer_id"]
            isOneToOne: false
            referencedRelation: "interview_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "star_bank_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "interview_users"
            referencedColumns: ["id"]
          },
        ]
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
      webinar_registrations: {
        Row: {
          confirmation_sent: boolean | null
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          webinar_date: string
          webinar_title: string
        }
        Insert: {
          confirmation_sent?: boolean | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          status?: string
          webinar_date?: string
          webinar_title?: string
        }
        Update: {
          confirmation_sent?: boolean | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          webinar_date?: string
          webinar_title?: string
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
      check_tool_access: {
        Args: { p_email: string; p_tool_type: string }
        Returns: {
          expires_at: string
          has_access: boolean
          usage_count: number
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
      delete_goal_by_id: {
        Args: { p_goal_id: string; p_session_id: string }
        Returns: boolean
      }
      generate_enrollment_code: { Args: never; Returns: string }
      get_chat_by_session: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          messages: Json
          session_id: string
          updated_at: string
          user_profile_context: string
          user_profile_type: string
        }[]
      }
      get_goals_by_session: {
        Args: { p_session_id: string }
        Returns: {
          completed_at: string
          created_at: string
          description: string
          email: string
          id: string
          progress: number
          session_id: string
          status: string
          target_date: string
          title: string
          updated_at: string
        }[]
      }
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
      get_summaries_by_session: {
        Args: { p_session_id: string }
        Returns: {
          action_items: Json
          created_at: string
          email: string
          id: string
          key_insights: Json
          session_id: string
          summary: string
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
      upsert_chat_by_session: {
        Args: {
          p_email?: string
          p_messages?: Json
          p_session_id: string
          p_user_profile_context?: string
          p_user_profile_type?: string
        }
        Returns: string
      }
      upsert_goal_by_session: {
        Args: {
          p_completed_at?: string
          p_description?: string
          p_email?: string
          p_progress?: number
          p_session_id: string
          p_status?: string
          p_target_date?: string
          p_title: string
        }
        Returns: string
      }
      upsert_summary_by_session: {
        Args: {
          p_action_items?: Json
          p_email?: string
          p_key_insights?: Json
          p_session_id: string
          p_summary: string
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
