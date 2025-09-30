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
      automated_seo_fixes: {
        Row: {
          automated_fix: string
          created_at: string
          detected_at: string
          fix_result: Json | null
          fix_status: string
          fixed_at: string | null
          id: string
          issue_description: string
          issue_severity: string
          issue_type: string
          page_url: string
          project_id: string | null
        }
        Insert: {
          automated_fix: string
          created_at?: string
          detected_at?: string
          fix_result?: Json | null
          fix_status?: string
          fixed_at?: string | null
          id?: string
          issue_description: string
          issue_severity?: string
          issue_type: string
          page_url: string
          project_id?: string | null
        }
        Update: {
          automated_fix?: string
          created_at?: string
          detected_at?: string
          fix_result?: Json | null
          fix_status?: string
          fixed_at?: string | null
          id?: string
          issue_description?: string
          issue_severity?: string
          issue_type?: string
          page_url?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_seo_fixes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
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
      content_calendar_suggestions: {
        Row: {
          competition_level: string | null
          created_at: string
          id: string
          optimal_publish_date: string | null
          priority_score: number | null
          project_id: string | null
          reasoning: string | null
          related_trends: Json | null
          search_volume: number | null
          status: string | null
          suggested_keywords: string[]
          suggested_topic: string
          trending_score: number | null
        }
        Insert: {
          competition_level?: string | null
          created_at?: string
          id?: string
          optimal_publish_date?: string | null
          priority_score?: number | null
          project_id?: string | null
          reasoning?: string | null
          related_trends?: Json | null
          search_volume?: number | null
          status?: string | null
          suggested_keywords: string[]
          suggested_topic: string
          trending_score?: number | null
        }
        Update: {
          competition_level?: string | null
          created_at?: string
          id?: string
          optimal_publish_date?: string | null
          priority_score?: number | null
          project_id?: string | null
          reasoning?: string | null
          related_trends?: Json | null
          search_volume?: number | null
          status?: string | null
          suggested_keywords?: string[]
          suggested_topic?: string
          trending_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_gap_analysis: {
        Row: {
          ai_recommendations: Json | null
          analyzed_at: string
          competitor_urls: string[]
          content_suggestions: string[]
          created_at: string
          id: string
          keyword: string
          keyword_gaps: string[]
          missing_topics: string[]
          project_id: string | null
        }
        Insert: {
          ai_recommendations?: Json | null
          analyzed_at?: string
          competitor_urls: string[]
          content_suggestions: string[]
          created_at?: string
          id?: string
          keyword: string
          keyword_gaps: string[]
          missing_topics: string[]
          project_id?: string | null
        }
        Update: {
          ai_recommendations?: Json | null
          analyzed_at?: string
          competitor_urls?: string[]
          content_suggestions?: string[]
          created_at?: string
          id?: string
          keyword?: string
          keyword_gaps?: string[]
          missing_topics?: string[]
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_gap_analysis_project_id_fkey"
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
      content_performance_predictions: {
        Row: {
          confidence_score: number | null
          content_preview: string | null
          content_title: string
          created_at: string
          id: string
          improvement_recommendations: string[] | null
          predicted_backlinks: number | null
          predicted_engagement_score: number | null
          predicted_ranking_position: number | null
          predicted_traffic_30d: number | null
          predicted_traffic_90d: number | null
          project_id: string | null
          success_factors: Json | null
          target_keywords: string[]
        }
        Insert: {
          confidence_score?: number | null
          content_preview?: string | null
          content_title: string
          created_at?: string
          id?: string
          improvement_recommendations?: string[] | null
          predicted_backlinks?: number | null
          predicted_engagement_score?: number | null
          predicted_ranking_position?: number | null
          predicted_traffic_30d?: number | null
          predicted_traffic_90d?: number | null
          project_id?: string | null
          success_factors?: Json | null
          target_keywords: string[]
        }
        Update: {
          confidence_score?: number | null
          content_preview?: string | null
          content_title?: string
          created_at?: string
          id?: string
          improvement_recommendations?: string[] | null
          predicted_backlinks?: number | null
          predicted_engagement_score?: number | null
          predicted_ranking_position?: number | null
          predicted_traffic_30d?: number | null
          predicted_traffic_90d?: number | null
          project_id?: string | null
          success_factors?: Json | null
          target_keywords?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_predictions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
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
      cross_channel_analytics: {
        Row: {
          assisted_conversions: number | null
          channel: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          cpc: number | null
          created_at: string
          cross_channel_impact: Json | null
          ctr: number | null
          id: string
          impressions: number | null
          metric_date: string
          project_id: string | null
          revenue: number | null
          roas: number | null
        }
        Insert: {
          assisted_conversions?: number | null
          channel: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          cross_channel_impact?: Json | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date: string
          project_id?: string | null
          revenue?: number | null
          roas?: number | null
        }
        Update: {
          assisted_conversions?: number | null
          channel?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          cross_channel_impact?: Json | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date?: string
          project_id?: string | null
          revenue?: number | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_channel_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ga4_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          channel: string
          conversions: number | null
          created_at: string
          date: string
          engagement_rate: number | null
          id: string
          page_path: string
          page_views: number | null
          project_id: string
          sessions: number | null
          users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          channel: string
          conversions?: number | null
          created_at?: string
          date: string
          engagement_rate?: number | null
          id?: string
          page_path: string
          page_views?: number | null
          project_id: string
          sessions?: number | null
          users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          channel?: string
          conversions?: number | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          page_path?: string
          page_views?: number | null
          project_id?: string
          sessions?: number | null
          users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ga4_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
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
      gsc_analytics: {
        Row: {
          clicks: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          keyword: string
          page_url: string
          position: number | null
          project_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          keyword: string
          page_url: string
          position?: number | null
          project_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          keyword?: string
          page_url?: string
          position?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsc_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
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
      keyword_analysis: {
        Row: {
          ai_recommendations: Json | null
          clicks: number | null
          cluster_name: string | null
          created_at: string
          ctr: number | null
          difficulty_score: number | null
          id: string
          impressions: number | null
          keyword: string
          opportunity_type: string | null
          page_url: string
          position: number | null
          potential_score: number | null
          project_id: string
          search_volume: number | null
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json | null
          clicks?: number | null
          cluster_name?: string | null
          created_at?: string
          ctr?: number | null
          difficulty_score?: number | null
          id?: string
          impressions?: number | null
          keyword: string
          opportunity_type?: string | null
          page_url: string
          position?: number | null
          potential_score?: number | null
          project_id: string
          search_volume?: number | null
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json | null
          clicks?: number | null
          cluster_name?: string | null
          created_at?: string
          ctr?: number | null
          difficulty_score?: number | null
          id?: string
          impressions?: number | null
          keyword?: string
          opportunity_type?: string | null
          page_url?: string
          position?: number | null
          potential_score?: number | null
          project_id?: string
          search_volume?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
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
      link_opportunity_scoring: {
        Row: {
          contact_info: Json | null
          created_at: string
          domain_authority: number | null
          estimated_value: number | null
          id: string
          last_outreach_at: string | null
          opportunity_score: number
          outreach_difficulty: string | null
          outreach_status: string | null
          outreach_template: string | null
          project_id: string | null
          reasoning: string | null
          relevance_score: number | null
          success_probability: number | null
          target_domain: string
          target_url: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          domain_authority?: number | null
          estimated_value?: number | null
          id?: string
          last_outreach_at?: string | null
          opportunity_score: number
          outreach_difficulty?: string | null
          outreach_status?: string | null
          outreach_template?: string | null
          project_id?: string | null
          reasoning?: string | null
          relevance_score?: number | null
          success_probability?: number | null
          target_domain: string
          target_url?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          domain_authority?: number | null
          estimated_value?: number | null
          id?: string
          last_outreach_at?: string | null
          opportunity_score?: number
          outreach_difficulty?: string | null
          outreach_status?: string | null
          outreach_template?: string | null
          project_id?: string | null
          reasoning?: string | null
          relevance_score?: number | null
          success_probability?: number | null
          target_domain?: string
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_opportunity_scoring_project_id_fkey"
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
      multi_location_tracking: {
        Row: {
          city: string | null
          country: string
          created_at: string
          gmb_insights: Json | null
          id: string
          last_checked: string
          latitude: number | null
          local_competitors: string[] | null
          local_pack_rankings: Json | null
          local_search_volume: number | null
          location_name: string
          longitude: number | null
          organic_rankings: Json | null
          project_id: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          country: string
          created_at?: string
          gmb_insights?: Json | null
          id?: string
          last_checked?: string
          latitude?: number | null
          local_competitors?: string[] | null
          local_pack_rankings?: Json | null
          local_search_volume?: number | null
          location_name: string
          longitude?: number | null
          organic_rankings?: Json | null
          project_id?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          gmb_insights?: Json | null
          id?: string
          last_checked?: string
          latitude?: number | null
          local_competitors?: string[] | null
          local_pack_rankings?: Json | null
          local_search_volume?: number | null
          location_name?: string
          longitude?: number | null
          organic_rankings?: Json | null
          project_id?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multi_location_tracking_project_id_fkey"
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
      ranking_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          current_position: number | null
          factors: Json | null
          id: string
          keyword: string
          predicted_position_30d: number | null
          predicted_position_7d: number | null
          predicted_position_90d: number | null
          project_id: string | null
          trend: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          current_position?: number | null
          factors?: Json | null
          id?: string
          keyword: string
          predicted_position_30d?: number | null
          predicted_position_7d?: number | null
          predicted_position_90d?: number | null
          project_id?: string | null
          trend?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          current_position?: number | null
          factors?: Json | null
          id?: string
          keyword?: string
          predicted_position_30d?: number | null
          predicted_position_7d?: number | null
          predicted_position_90d?: number | null
          project_id?: string | null
          trend?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_predictions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_attribution: {
        Row: {
          attribution_model: string
          average_order_value: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          customer_lifetime_value: number | null
          id: string
          keyword: string
          page_url: string
          period_end: string
          period_start: string
          project_id: string | null
          revenue: number | null
          roi_percentage: number | null
          traffic_source: string
        }
        Insert: {
          attribution_model: string
          average_order_value?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          customer_lifetime_value?: number | null
          id?: string
          keyword: string
          page_url: string
          period_end: string
          period_start: string
          project_id?: string | null
          revenue?: number | null
          roi_percentage?: number | null
          traffic_source: string
        }
        Update: {
          attribution_model?: string
          average_order_value?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          customer_lifetime_value?: number | null
          id?: string
          keyword?: string
          page_url?: string
          period_end?: string
          period_start?: string
          project_id?: string | null
          revenue?: number | null
          roi_percentage?: number | null
          traffic_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_attribution_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
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
      serp_alerts: {
        Row: {
          alert_type: string
          competitor_domain: string | null
          created_at: string
          id: string
          is_read: boolean
          keyword: string
          message: string
          new_position: number | null
          old_position: number | null
          project_id: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          competitor_domain?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          keyword: string
          message: string
          new_position?: number | null
          old_position?: number | null
          project_id?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          competitor_domain?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          keyword?: string
          message?: string
          new_position?: number | null
          old_position?: number | null
          project_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "serp_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
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
      voice_search_tracking: {
        Row: {
          answer_box_present: boolean | null
          checked_at: string
          created_at: string
          has_featured_snippet: boolean | null
          id: string
          keyword: string
          optimization_tips: string[] | null
          people_also_ask: string[] | null
          project_id: string | null
          snippet_content: string | null
          voice_search_score: number | null
        }
        Insert: {
          answer_box_present?: boolean | null
          checked_at?: string
          created_at?: string
          has_featured_snippet?: boolean | null
          id?: string
          keyword: string
          optimization_tips?: string[] | null
          people_also_ask?: string[] | null
          project_id?: string | null
          snippet_content?: string | null
          voice_search_score?: number | null
        }
        Update: {
          answer_box_present?: boolean | null
          checked_at?: string
          created_at?: string
          has_featured_snippet?: boolean | null
          id?: string
          keyword?: string
          optimization_tips?: string[] | null
          people_also_ask?: string[] | null
          project_id?: string | null
          snippet_content?: string | null
          voice_search_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_search_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_reports: {
        Row: {
          auto_send: boolean | null
          brand_colors: Json | null
          client_logo_url: string | null
          client_name: string
          created_at: string
          id: string
          last_generated: string | null
          metrics_included: Json
          next_scheduled: string | null
          project_id: string | null
          recipient_emails: string[] | null
          report_name: string
          report_sections: Json
          report_type: string
          send_frequency: string | null
        }
        Insert: {
          auto_send?: boolean | null
          brand_colors?: Json | null
          client_logo_url?: string | null
          client_name: string
          created_at?: string
          id?: string
          last_generated?: string | null
          metrics_included: Json
          next_scheduled?: string | null
          project_id?: string | null
          recipient_emails?: string[] | null
          report_name: string
          report_sections: Json
          report_type: string
          send_frequency?: string | null
        }
        Update: {
          auto_send?: boolean | null
          brand_colors?: Json | null
          client_logo_url?: string | null
          client_name?: string
          created_at?: string
          id?: string
          last_generated?: string | null
          metrics_included?: Json
          next_scheduled?: string | null
          project_id?: string | null
          recipient_emails?: string[] | null
          report_name?: string
          report_sections?: Json
          report_type?: string
          send_frequency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "white_label_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
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
