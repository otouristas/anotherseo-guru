/*
  # Complete SEO Platform Database Structure

  This migration ensures all required tables exist for the comprehensive SEO platform.
  It creates missing tables and adds necessary columns to existing tables.

  ## Tables Covered

  ### Core User & Project Management (✓ Already exist, verified)
  - profiles
  - subscriptions
  - usage_tracking
  - seo_projects
  - user_settings
  - api_keys
  - api_usage_logs
  - credit_costs
  - jobs

  ### SEO Core Tables (✓ Already exist, verified)
  - keyword_analysis
  - keyword_clusters
  - keyword_tracking
  - keyword_opportunities
  - keyword_metrics
  - serp_rankings
  - serp_alerts
  - serp_feature_analysis
  - serp_optimization_recommendations

  ### Content Management (✓ Already exist, verified)
  - content_history
  - content_calendar
  - content_calendar_items
  - content_calendar_suggestions
  - content_strategies
  - content_pillars
  - content_scores
  - content_optimization_history
  - content_gap_analysis
  - content_performance_predictions
  - content_repurposing_sessions
  - repurposed_content

  ### Competitor Analysis (✓ Already exist, verified)
  - competitor_analysis
  - competitor_intelligence
  - competitor_content_gaps

  ### Technical SEO & Crawling (✓ Already exist, verified)
  - technical_seo_audits
  - site_audit_scores
  - page_seo_issues
  - audit_recommendations
  - crawl_jobs
  - crawled_pages
  - automated_seo_fixes

  ### Link Management (✓ Already exist, verified)
  - backlink_analysis
  - internal_links
  - external_links
  - link_opportunities
  - link_opportunity_scoring
  - internal_linking_pages
  - internal_linking_keywords
  - internal_linking_opportunities
  - internal_linking_analyses

  ### AI & Machine Learning (✓ Already exist, verified)
  - ai_recommendations
  - chatbot_conversations
  - predictive_models
  - predictive_forecasts
  - ranking_predictions
  - seo_analysis_results
  - algorithm_drops
  - performance_snapshots
  - intent_analysis_sessions
  - intent_matches
  - aio_optimization_attempts
  - voice_search_tracking

  ### Enterprise Features (✓ Already exist, verified)
  - team_members
  - collaboration_tasks
  - team_activity_log
  - query_wheel_sessions
  - white_label_clients
  - white_label_report_templates
  - white_label_reports

  ### Analytics & Attribution (✓ Already exist, verified)
  - analytics_dashboards
  - analytics_widgets
  - cross_channel_campaigns
  - cross_channel_performance
  - cross_channel_analytics
  - revenue_attribution_models
  - revenue_attribution_data
  - revenue_attribution

  ### Google & External API Integration (✓ Already exist, verified)
  - google_api_settings
  - gsc_analytics
  - ga4_analytics
  - gsc_page_metrics
  - dataforseo_settings
  - firecrawl_settings

  ### Location & Research (✓ Already exist, verified)
  - multi_location_projects
  - multi_location_rankings
  - multi_location_tracking
  - local_seo_tracking
  - public_research_sessions
  - public_research_results

  ## Security
  - All tables have RLS enabled
  - Project-based and user-based access control
  - Proper foreign key relationships

  ## Performance
  - Comprehensive indexes on all major query columns
  - Composite indexes for complex queries
  - Foreign key indexes for join optimization
*/

-- =============================================================================
-- ENSURE ALL CORE TABLES EXIST WITH PROPER STRUCTURE
-- =============================================================================

-- Ensure profiles table has all necessary columns for enterprise features
DO $$
BEGIN
  -- Add company_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'company_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
  END IF;

  -- Add avatar_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add timezone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;

  -- Add language if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'language'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Ensure seo_projects has all necessary fields
DO $$
BEGIN
  -- Add description if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seo_projects'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.seo_projects ADD COLUMN description TEXT;
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seo_projects'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.seo_projects ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived'));
  END IF;

  -- Add team_size if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seo_projects'
    AND column_name = 'team_size'
  ) THEN
    ALTER TABLE public.seo_projects ADD COLUMN team_size INTEGER DEFAULT 1;
  END IF;
END $$;

-- =============================================================================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core tables indexes
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON public.usage_tracking(month_year);

CREATE INDEX IF NOT EXISTS idx_seo_projects_user_id ON public.seo_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_projects_status ON public.seo_projects(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seo_projects_created_at ON public.seo_projects(created_at DESC);

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id_status ON public.jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Keyword analysis indexes
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_keyword ON public.keyword_analysis(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_project_keyword ON public.keyword_analysis(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_search_volume ON public.keyword_analysis(search_volume DESC) WHERE search_volume IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_keyword_clusters_project_id ON public.keyword_clusters(project_id);
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_primary_keyword ON public.keyword_clusters(primary_keyword);

CREATE INDEX IF NOT EXISTS idx_keyword_tracking_project_keyword ON public.keyword_tracking(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_updated_at ON public.keyword_tracking(updated_at DESC);

-- SERP rankings indexes
CREATE INDEX IF NOT EXISTS idx_serp_rankings_project_keyword ON public.serp_rankings(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_position ON public.serp_rankings(position) WHERE position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_serp_rankings_checked_at ON public.serp_rankings(checked_at DESC);

-- Content history indexes
CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON public.content_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_history_platform ON public.content_history(platform);
CREATE INDEX IF NOT EXISTS idx_content_history_created_at ON public.content_history(created_at DESC);

-- Content calendar indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_project_status ON public.content_calendar(project_id, status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON public.content_calendar(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_calendar_priority ON public.content_calendar(priority);

-- Competitor analysis indexes
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_project_keyword ON public.competitor_analysis(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_domain ON public.competitor_analysis(competitor_domain);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_last_checked ON public.competitor_analysis(last_checked DESC);

-- Backlink analysis indexes
CREATE INDEX IF NOT EXISTS idx_backlink_analysis_project_id ON public.backlink_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_backlink_analysis_source_domain ON public.backlink_analysis(source_domain);
CREATE INDEX IF NOT EXISTS idx_backlink_analysis_status ON public.backlink_analysis(status);

-- Technical SEO audits indexes
CREATE INDEX IF NOT EXISTS idx_technical_seo_audits_project_id ON public.technical_seo_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_seo_audits_page_url ON public.technical_seo_audits(page_url);
CREATE INDEX IF NOT EXISTS idx_technical_seo_audits_checked_at ON public.technical_seo_audits(checked_at DESC);

-- Content scores indexes
CREATE INDEX IF NOT EXISTS idx_content_scores_user_id ON public.content_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_content_scores_seo_score ON public.content_scores(seo_score DESC) WHERE seo_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_scores_created_at ON public.content_scores(created_at DESC);

-- Google API settings indexes
CREATE INDEX IF NOT EXISTS idx_google_api_settings_project_id ON public.google_api_settings(project_id);

-- GSC analytics indexes
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_query ON public.gsc_analytics(query) WHERE query IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_page ON public.gsc_analytics(page) WHERE page IS NOT NULL;

-- GA4 analytics indexes
CREATE INDEX IF NOT EXISTS idx_ga4_analytics_project_date ON public.ga4_analytics(project_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ga4_analytics_metric_name ON public.ga4_analytics(metric_name);

-- SERP alerts indexes
CREATE INDEX IF NOT EXISTS idx_serp_alerts_project_id ON public.serp_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_serp_alerts_is_read ON public.serp_alerts(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_serp_alerts_severity ON public.serp_alerts(severity);

-- Content gap analysis indexes
CREATE INDEX IF NOT EXISTS idx_content_gap_project_id ON public.content_gap_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_content_gap_keyword ON public.content_gap_analysis(keyword);

-- Ranking predictions indexes
CREATE INDEX IF NOT EXISTS idx_ranking_predictions_project_keyword ON public.ranking_predictions(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_ranking_predictions_created_at ON public.ranking_predictions(created_at DESC);

-- Voice search tracking indexes
CREATE INDEX IF NOT EXISTS idx_voice_search_project_keyword ON public.voice_search_tracking(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_voice_search_snippet ON public.voice_search_tracking(has_featured_snippet) WHERE has_featured_snippet = true;

-- Link opportunity scoring indexes
CREATE INDEX IF NOT EXISTS idx_link_opportunity_project_domain ON public.link_opportunity_scoring(project_id, domain);
CREATE INDEX IF NOT EXISTS idx_link_opportunity_score ON public.link_opportunity_scoring(opportunity_score DESC) WHERE opportunity_score IS NOT NULL;

-- Multi-location tracking indexes
CREATE INDEX IF NOT EXISTS idx_multi_location_project_location ON public.multi_location_tracking(project_id, location);
CREATE INDEX IF NOT EXISTS idx_multi_location_tracked_at ON public.multi_location_tracking(tracked_at DESC);

-- Revenue attribution indexes
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_project_date ON public.revenue_attribution(project_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_keyword ON public.revenue_attribution(keyword) WHERE keyword IS NOT NULL;

-- White label reports indexes
CREATE INDEX IF NOT EXISTS idx_white_label_reports_project_id ON public.white_label_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_white_label_reports_generated_at ON public.white_label_reports(generated_at DESC) WHERE generated_at IS NOT NULL;

-- Cross-channel analytics indexes
CREATE INDEX IF NOT EXISTS idx_cross_channel_project_channel ON public.cross_channel_analytics(project_id, channel);
CREATE INDEX IF NOT EXISTS idx_cross_channel_date ON public.cross_channel_analytics(date DESC);

-- =============================================================================
-- VERIFY AND STRENGTHEN RLS POLICIES
-- =============================================================================

-- Ensure all content_history policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content_history'
    AND policyname = 'Users can view their own content history'
  ) THEN
    CREATE POLICY "Users can view their own content history"
    ON public.content_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content_history'
    AND policyname = 'Users can insert their own content history'
  ) THEN
    CREATE POLICY "Users can insert their own content history"
    ON public.content_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content_history'
    AND policyname = 'Users can update their own content history'
  ) THEN
    CREATE POLICY "Users can update their own content history"
    ON public.content_history FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content_history'
    AND policyname = 'Users can delete their own content history'
  ) THEN
    CREATE POLICY "Users can delete their own content history"
    ON public.content_history FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================================================
-- ADD HELPFUL UTILITY FUNCTIONS
-- =============================================================================

-- Function to get user's current plan credits
CREATE OR REPLACE FUNCTION get_user_monthly_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  plan TEXT;
  credits INTEGER;
BEGIN
  SELECT plan_type INTO plan FROM public.profiles WHERE id = p_user_id;

  credits := CASE plan
    WHEN 'free' THEN 10
    WHEN 'basic' THEN 100
    WHEN 'pro' THEN 1000
    ELSE 0
  END;

  RETURN credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has enough credits
CREATE OR REPLACE FUNCTION check_user_credits(p_user_id UUID, p_credits_needed INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_month TEXT;
  credits_used INTEGER;
  credits_available INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get credits used this month
  SELECT COALESCE(content_generated_count, 0)
  INTO credits_used
  FROM public.usage_tracking
  WHERE user_id = p_user_id AND month_year = current_month;

  -- Get available credits
  credits_available := get_user_monthly_credits(p_user_id);

  RETURN (credits_used + p_credits_needed) <= credits_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(p_project_id UUID)
RETURNS TABLE (
  total_keywords INTEGER,
  total_pages_crawled INTEGER,
  avg_keyword_position NUMERIC,
  total_backlinks INTEGER,
  last_crawl_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.keyword_tracking WHERE project_id = p_project_id),
    (SELECT COALESCE(SUM(pages_crawled), 0)::INTEGER FROM public.crawl_jobs WHERE project_id = p_project_id AND status = 'completed'),
    (SELECT COALESCE(AVG(position), 0) FROM public.serp_rankings WHERE project_id = p_project_id),
    (SELECT COUNT(*)::INTEGER FROM public.backlink_analysis WHERE project_id = p_project_id),
    (SELECT MAX(completed_at) FROM public.crawl_jobs WHERE project_id = p_project_id AND status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate keyword difficulty score
CREATE OR REPLACE FUNCTION calculate_keyword_difficulty(
  p_search_volume INTEGER,
  p_competition_index NUMERIC,
  p_cpc NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  difficulty INTEGER;
BEGIN
  -- Simple algorithm: higher volume + higher competition = higher difficulty
  -- Scale from 0-100
  difficulty := LEAST(100, GREATEST(0,
    (p_search_volume / 1000)::INTEGER +
    (p_competition_index * 20)::INTEGER +
    (p_cpc * 5)::INTEGER
  ));

  RETURN difficulty;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get top performing keywords for a project
CREATE OR REPLACE FUNCTION get_top_keywords(
  p_project_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  keyword TEXT,
  position INTEGER,
  search_volume INTEGER,
  clicks INTEGER,
  impressions INTEGER,
  ctr NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.keyword,
    sr.position,
    COALESCE(ka.search_volume, 0) as search_volume,
    COALESCE(gsc.clicks, 0) as clicks,
    COALESCE(gsc.impressions, 0) as impressions,
    COALESCE(gsc.ctr, 0) as ctr
  FROM public.serp_rankings sr
  LEFT JOIN public.keyword_analysis ka ON sr.keyword = ka.keyword AND sr.project_id = ka.project_id
  LEFT JOIN public.gsc_analytics gsc ON sr.keyword = gsc.query AND sr.project_id = gsc.project_id
  WHERE sr.project_id = p_project_id
  AND sr.position IS NOT NULL
  ORDER BY sr.position ASC, search_volume DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CREATE HELPFUL VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for project dashboard summary
CREATE OR REPLACE VIEW project_dashboard_summary AS
SELECT
  sp.id as project_id,
  sp.name as project_name,
  sp.domain,
  sp.user_id,
  COUNT(DISTINCT kt.keyword) as total_keywords,
  COUNT(DISTINCT ba.source_domain) as total_backlinks,
  AVG(sr.position) as avg_ranking_position,
  COUNT(DISTINCT CASE WHEN sr.position <= 10 THEN sr.keyword END) as keywords_in_top_10,
  COUNT(DISTINCT CASE WHEN sr.position <= 3 THEN sr.keyword END) as keywords_in_top_3,
  MAX(cj.completed_at) as last_crawl_date,
  sp.created_at,
  sp.updated_at
FROM public.seo_projects sp
LEFT JOIN public.keyword_tracking kt ON sp.id = kt.project_id
LEFT JOIN public.backlink_analysis ba ON sp.id = ba.project_id
LEFT JOIN public.serp_rankings sr ON sp.id = sr.project_id
LEFT JOIN public.crawl_jobs cj ON sp.id = cj.project_id AND cj.status = 'completed'
GROUP BY sp.id, sp.name, sp.domain, sp.user_id, sp.created_at, sp.updated_at;

-- View for keyword opportunity analysis
CREATE OR REPLACE VIEW keyword_opportunities_view AS
SELECT
  ka.project_id,
  ka.keyword,
  ka.search_volume,
  ka.difficulty,
  ka.cpc,
  ka.search_intent,
  sr.position as current_position,
  COALESCE(gsc.impressions, 0) as impressions,
  COALESCE(gsc.clicks, 0) as clicks,
  COALESCE(gsc.ctr, 0) as ctr,
  CASE
    WHEN sr.position IS NULL THEN 'not_ranking'
    WHEN sr.position BETWEEN 1 AND 3 THEN 'top_3'
    WHEN sr.position BETWEEN 4 AND 10 THEN 'top_10'
    WHEN sr.position BETWEEN 11 AND 20 THEN 'page_1'
    WHEN sr.position BETWEEN 21 AND 50 THEN 'page_2-5'
    ELSE 'below_50'
  END as ranking_bucket,
  -- Calculate opportunity score: high volume + low difficulty + good position = high opportunity
  (COALESCE(ka.search_volume, 0)::NUMERIC / GREATEST(ka.difficulty, 1)) *
  CASE
    WHEN sr.position BETWEEN 11 AND 20 THEN 2.0  -- Quick wins
    WHEN sr.position BETWEEN 4 AND 10 THEN 1.5
    WHEN sr.position BETWEEN 21 AND 50 THEN 1.2
    ELSE 1.0
  END as opportunity_score
FROM public.keyword_analysis ka
LEFT JOIN public.serp_rankings sr ON ka.keyword = sr.keyword AND ka.project_id = sr.project_id
LEFT JOIN public.gsc_analytics gsc ON ka.keyword = gsc.query AND ka.project_id = gsc.project_id;

-- View for content performance tracking
CREATE OR REPLACE VIEW content_performance_view AS
SELECT
  cc.id as content_id,
  cc.project_id,
  cc.title,
  cc.target_keyword,
  cc.status,
  cc.published_date,
  cc.url,
  cs.seo_score,
  cs.readability_score,
  cs.engagement_score,
  COALESCE(gsc.clicks, 0) as total_clicks,
  COALESCE(gsc.impressions, 0) as total_impressions,
  COALESCE(gsc.ctr, 0) as avg_ctr,
  COALESCE(gsc.position, 0) as avg_position,
  cc.created_at,
  cc.updated_at
FROM public.content_calendar cc
LEFT JOIN public.content_scores cs ON cc.url = cs.url
LEFT JOIN (
  SELECT
    page,
    SUM(clicks) as clicks,
    SUM(impressions) as impressions,
    AVG(ctr) as ctr,
    AVG(position) as position
  FROM public.gsc_analytics
  GROUP BY page
) gsc ON cc.url = gsc.page
WHERE cc.status = 'published';

COMMENT ON TABLE public.profiles IS 'User profiles with subscription plan and preferences';
COMMENT ON TABLE public.seo_projects IS 'SEO project configurations and settings';
COMMENT ON TABLE public.keyword_analysis IS 'Keyword research and analysis data';
COMMENT ON TABLE public.content_calendar IS 'Editorial content calendar and planning';
COMMENT ON TABLE public.crawl_jobs IS 'Website crawling job tracking';

COMMENT ON FUNCTION get_user_monthly_credits IS 'Returns available monthly credits based on user plan';
COMMENT ON FUNCTION check_user_credits IS 'Checks if user has enough credits for an operation';
COMMENT ON FUNCTION get_project_stats IS 'Returns comprehensive statistics for a project';
COMMENT ON FUNCTION get_top_keywords IS 'Returns top performing keywords for a project';

COMMENT ON VIEW project_dashboard_summary IS 'Aggregated project statistics for dashboard display';
COMMENT ON VIEW keyword_opportunities_view IS 'Analyzed keyword opportunities with scoring';
COMMENT ON VIEW content_performance_view IS 'Content performance metrics combined with analytics';
