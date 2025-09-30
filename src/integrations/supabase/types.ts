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
      backlink_analysis: {
        Row: {
          anchor_text: string | null
          domain_authority: number | null
          first_seen: string | null
          id: string
          is_dofollow: boolean | null
          last_checked: string
          link_type: string | null
          project_id: string | null
          source_domain: string
          source_url: string | null
          status: string | null
          target_url: string | null
        }
        Insert: {
          anchor_text?: string | null
          domain_authority?: number | null
          first_seen?: string | null
          id?: string
          is_dofollow?: boolean | null
          last_checked?: string
          link_type?: string | null
          project_id?: string | null
          source_domain: string
          source_url?: string | null
          status?: string | null
          target_url?: string | null
        }
        Update: {
          anchor_text?: string | null
          domain_authority?: number | null
          first_seen?: string | null
          id?: string
          is_dofollow?: boolean | null
          last_checked?: string
          link_type?: string | null
          project_id?: string | null
          source_domain?: string
          source_url?: string | null
          status?: string | null
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analysis: {
        Row: {
          backlinks_count: number | null
          competitor_domain: string
          content_score: number | null
          created_at: string
          domain_authority: number | null
          id: string
          keyword: string
          last_checked: string
          position: number | null
          project_id: string | null
          referring_domains: number | null
          traffic_estimate: number | null
        }
        Insert: {
          backlinks_count?: number | null
          competitor_domain: string
          content_score?: number | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          keyword: string
          last_checked?: string
          position?: number | null
          project_id?: string | null
          referring_domains?: number | null
          traffic_estimate?: number | null
        }
        Update: {
          backlinks_count?: number | null
          competitor_domain?: string
          content_score?: number | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          keyword?: string
          last_checked?: string
          position?: number | null
          project_id?: string | null
          referring_domains?: number | null
          traffic_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_calendar: {
        Row: {
          assigned_to: string | null
          content_brief: string | null
          content_type: string | null
          created_at: string
          id: string
          notes: string | null
          priority: string | null
          project_id: string | null
          published_date: string | null
          scheduled_date: string | null
          secondary_keywords: string[] | null
          status: string | null
          target_keyword: string | null
          title: string
          updated_at: string
          url: string | null
          word_count_target: number | null
        }
        Insert: {
          assigned_to?: string | null
          content_brief?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          published_date?: string | null
          scheduled_date?: string | null
          secondary_keywords?: string[] | null
          status?: string | null
          target_keyword?: string | null
          title: string
          updated_at?: string
          url?: string | null
          word_count_target?: number | null
        }
        Update: {
          assigned_to?: string | null
          content_brief?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          published_date?: string | null
          scheduled_date?: string | null
          secondary_keywords?: string[] | null
          status?: string | null
          target_keyword?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          word_count_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_history: {
        Row: {
          created_at: string
          generated_content: string
          id: string
          keywords: string[] | null
          original_content: string
          platform: string
          style: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_content: string
          id?: string
          keywords?: string[] | null
          original_content: string
          platform: string
          style?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_content?: string
          id?: string
          keywords?: string[] | null
          original_content?: string
          platform?: string
          style?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_scores: {
        Row: {
          content_id: string | null
          created_at: string
          engagement_score: number | null
          entities: Json | null
          id: string
          keyword_density: number | null
          readability_score: number | null
          recommendations: string[] | null
          seo_score: number | null
          topics: Json | null
          url: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          engagement_score?: number | null
          entities?: Json | null
          id?: string
          keyword_density?: number | null
          readability_score?: number | null
          recommendations?: string[] | null
          seo_score?: number | null
          topics?: Json | null
          url?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          content_id?: string | null
          created_at?: string
          engagement_score?: number | null
          entities?: Json | null
          id?: string
          keyword_density?: number | null
          readability_score?: number | null
          recommendations?: string[] | null
          seo_score?: number | null
          topics?: Json | null
          url?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      credit_costs: {
        Row: {
          cost: number
          created_at: string
          id: string
          platform: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          platform: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          platform?: string
        }
        Relationships: []
      }
      google_api_settings: {
        Row: {
          created_at: string
          credentials_json: Json | null
          google_ads_customer_id: string | null
          google_analytics_property_id: string | null
          google_search_console_site_url: string | null
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials_json?: Json | null
          google_ads_customer_id?: string | null
          google_analytics_property_id?: string | null
          google_search_console_site_url?: string | null
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials_json?: Json | null
          google_ads_customer_id?: string | null
          google_analytics_property_id?: string | null
          google_search_console_site_url?: string | null
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_api_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          job_type: Database["public"]["Enums"]["job_type"]
          progress: number | null
          result_data: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          total_items: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data: Json
          job_type: Database["public"]["Enums"]["job_type"]
          progress?: number | null
          result_data?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_items?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          job_type?: Database["public"]["Enums"]["job_type"]
          progress?: number | null
          result_data?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_items?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      keyword_clusters: {
        Row: {
          avg_search_volume: number | null
          center_keyword: string | null
          cluster_label: string | null
          cluster_name: string
          created_at: string
          id: string
          keywords: string[]
          project_id: string | null
          updated_at: string
        }
        Insert: {
          avg_search_volume?: number | null
          center_keyword?: string | null
          cluster_label?: string | null
          cluster_name: string
          created_at?: string
          id?: string
          keywords: string[]
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          avg_search_volume?: number | null
          center_keyword?: string | null
          cluster_label?: string | null
          cluster_name?: string
          created_at?: string
          id?: string
          keywords?: string[]
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_clusters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_tracking: {
        Row: {
          cpc: number | null
          created_at: string
          difficulty: number | null
          id: string
          keyword: string
          lsi_keywords: string[] | null
          project_id: string | null
          related_questions: string[] | null
          search_intent: string | null
          search_volume: number | null
          seasonal_trend: string | null
          updated_at: string
        }
        Insert: {
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword: string
          lsi_keywords?: string[] | null
          project_id?: string | null
          related_questions?: string[] | null
          search_intent?: string | null
          search_volume?: number | null
          seasonal_trend?: string | null
          updated_at?: string
        }
        Update: {
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword?: string
          lsi_keywords?: string[] | null
          project_id?: string | null
          related_questions?: string[] | null
          search_intent?: string | null
          search_volume?: number | null
          seasonal_trend?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      link_opportunities: {
        Row: {
          contact_email: string | null
          created_at: string
          domain: string
          domain_authority: number | null
          id: string
          notes: string | null
          opportunity_type: string | null
          project_id: string | null
          relevance_score: number | null
          status: string | null
          url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          domain: string
          domain_authority?: number | null
          id?: string
          notes?: string | null
          opportunity_type?: string | null
          project_id?: string | null
          relevance_score?: number | null
          status?: string | null
          url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          domain?: string
          domain_authority?: number | null
          id?: string
          notes?: string | null
          opportunity_type?: string | null
          project_id?: string | null
          relevance_score?: number | null
          status?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_opportunities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      local_seo_tracking: {
        Row: {
          average_rating: number | null
          checked_at: string
          gmb_listing_id: string | null
          id: string
          keyword: string
          local_pack_position: number | null
          location: string
          organic_position: number | null
          project_id: string | null
          reviews_count: number | null
        }
        Insert: {
          average_rating?: number | null
          checked_at?: string
          gmb_listing_id?: string | null
          id?: string
          keyword: string
          local_pack_position?: number | null
          location: string
          organic_position?: number | null
          project_id?: string | null
          reviews_count?: number | null
        }
        Update: {
          average_rating?: number | null
          checked_at?: string
          gmb_listing_id?: string | null
          id?: string
          keyword?: string
          local_pack_position?: number | null
          location?: string
          organic_position?: number | null
          project_id?: string | null
          reviews_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "local_seo_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          credits: number
          first_name: string | null
          id: string
          last_name: string | null
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          first_name?: string | null
          id: string
          last_name?: string | null
          plan_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_projects: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
          target_language: string | null
          target_location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name: string
          target_language?: string | null
          target_location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
          target_language?: string | null
          target_location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      serp_rankings: {
        Row: {
          checked_at: string
          featured_snippet: boolean | null
          id: string
          keyword: string
          local_pack: boolean | null
          page_title: string | null
          position: number | null
          project_id: string | null
          url: string | null
        }
        Insert: {
          checked_at?: string
          featured_snippet?: boolean | null
          id?: string
          keyword: string
          local_pack?: boolean | null
          page_title?: string | null
          position?: number | null
          project_id?: string | null
          url?: string | null
        }
        Update: {
          checked_at?: string
          featured_snippet?: boolean | null
          id?: string
          keyword?: string
          local_pack?: boolean | null
          page_title?: string | null
          position?: number | null
          project_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serp_rankings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_seo_audits: {
        Row: {
          canonical_url: string | null
          checked_at: string
          core_web_vitals: Json | null
          has_ssl: boolean | null
          id: string
          issues: Json | null
          meta_robots: string | null
          mobile_friendly: boolean | null
          page_speed_score: number | null
          page_url: string
          project_id: string | null
          recommendations: string[] | null
          schema_markup: string[] | null
        }
        Insert: {
          canonical_url?: string | null
          checked_at?: string
          core_web_vitals?: Json | null
          has_ssl?: boolean | null
          id?: string
          issues?: Json | null
          meta_robots?: string | null
          mobile_friendly?: boolean | null
          page_speed_score?: number | null
          page_url: string
          project_id?: string | null
          recommendations?: string[] | null
          schema_markup?: string[] | null
        }
        Update: {
          canonical_url?: string | null
          checked_at?: string
          core_web_vitals?: Json | null
          has_ssl?: boolean | null
          id?: string
          issues?: Json | null
          meta_robots?: string | null
          mobile_friendly?: boolean | null
          page_speed_score?: number | null
          page_url?: string
          project_id?: string | null
          recommendations?: string[] | null
          schema_markup?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_seo_audits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          content_generated_count: number
          created_at: string
          credits_used: number
          id: string
          month_year: string
          platforms_used_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_generated_count?: number
          created_at?: string
          credits_used?: number
          id?: string
          month_year: string
          platforms_used_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_generated_count?: number
          created_at?: string
          credits_used?: number
          id?: string
          month_year?: string
          platforms_used_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: { credits_to_deduct: number; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      job_type:
        | "backlinks_analysis"
        | "traffic_analysis"
        | "keyword_research"
        | "keyword_clustering"
        | "competitor_analysis"
        | "serp_tracking"
        | "bulk_analysis"
        | "pdf_report"
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
      job_status: ["pending", "processing", "completed", "failed", "cancelled"],
      job_type: [
        "backlinks_analysis",
        "traffic_analysis",
        "keyword_research",
        "keyword_clustering",
        "competitor_analysis",
        "serp_tracking",
        "bulk_analysis",
        "pdf_report",
      ],
    },
  },
} as const
