/*
  # Create Remaining SEO Platform Tables
  
  This migration creates all the remaining tables needed for the full SEO platform functionality.
  
  ## Tables Created
  - jobs - Background job queue
  - credit_costs - Credit pricing per platform
  - keyword_analysis - Keyword research data
  - keyword_clusters - Grouped keywords by topic
  - gsc_analytics - Google Search Console data cache
  - ga4_analytics - Google Analytics 4 data cache
  - google_api_settings - Google API credentials per project
  - serp_alerts - Real-time SERP monitoring alerts
  - content_gap_analysis - Content gap findings
  - ranking_predictions - AI-powered ranking forecasts
  - voice_search_tracking - Voice search optimization
  - content_calendar_suggestions - AI content suggestions
  - content_performance_predictions - Predicted content performance
  - automated_seo_fixes - Auto-fix tracking
  - link_opportunity_scoring - Link opportunity analysis
  - multi_location_tracking - Multi-location SEO tracking
  - revenue_attribution - Revenue attribution data
  - white_label_reports - White-label report generation
  - cross_channel_analytics - Cross-channel marketing data
  - competitor_analysis - Competitor analysis data
  - backlink_analysis - Backlink tracking
  - keyword_tracking - Keyword rank tracking
  - technical_seo_audits - Technical audit results
  - content_scores - Content quality scores
  - serp_rankings - SERP position tracking
  - content_calendar - Editorial calendar
  - link_opportunities - Link building opportunities
  - local_seo_tracking - Local SEO data
*/

-- Create jobs table for background tasks
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create credit_costs table
CREATE TABLE IF NOT EXISTS public.credit_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  cost INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view credit costs"
ON public.credit_costs FOR SELECT
USING (true);

INSERT INTO public.credit_costs (platform, cost) VALUES
  ('seo-blog', 3),
  ('medium', 2),
  ('linkedin', 2),
  ('reddit', 2),
  ('quora', 2),
  ('twitter', 1),
  ('instagram', 1),
  ('youtube', 2),
  ('newsletter', 2),
  ('tiktok', 1)
ON CONFLICT (platform) DO NOTHING;

-- Create keyword_analysis table
CREATE TABLE IF NOT EXISTS public.keyword_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  cpc NUMERIC,
  search_intent TEXT,
  trends JSONB,
  related_keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage keyword analysis for their projects"
ON public.keyword_analysis FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_analysis.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_analysis.project_id AND user_id = auth.uid()
));

-- Create keyword_clusters table
CREATE TABLE IF NOT EXISTS public.keyword_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  cluster_name TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  total_search_volume INTEGER,
  avg_difficulty NUMERIC,
  content_recommendations TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage keyword clusters for their projects"
ON public.keyword_clusters FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_clusters.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_clusters.project_id AND user_id = auth.uid()
));

-- Create gsc_analytics table
CREATE TABLE IF NOT EXISTS public.gsc_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  query TEXT,
  page TEXT,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr NUMERIC,
  position NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gsc_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage GSC analytics for their projects"
ON public.gsc_analytics FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = gsc_analytics.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = gsc_analytics.project_id AND user_id = auth.uid()
));

CREATE INDEX idx_gsc_analytics_project_date ON public.gsc_analytics(project_id, date DESC);

-- Create ga4_analytics table
CREATE TABLE IF NOT EXISTS public.ga4_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  dimension_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ga4_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage GA4 analytics for their projects"
ON public.ga4_analytics FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = ga4_analytics.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = ga4_analytics.project_id AND user_id = auth.uid()
));

-- Create google_api_settings table
CREATE TABLE IF NOT EXISTS public.google_api_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  google_analytics_property_id TEXT,
  google_search_console_site_url TEXT,
  google_ads_customer_id TEXT,
  credentials_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

ALTER TABLE public.google_api_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project Google settings"
ON public.google_api_settings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = google_api_settings.project_id
  AND seo_projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = google_api_settings.project_id
  AND seo_projects.user_id = auth.uid()
));

CREATE TRIGGER update_google_api_settings_updated_at
BEFORE UPDATE ON public.google_api_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create remaining SEO tables
CREATE TABLE IF NOT EXISTS public.serp_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  old_position INTEGER,
  new_position INTEGER,
  competitor_domain TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  competitor_urls TEXT[] NOT NULL,
  missing_topics TEXT[] NOT NULL,
  content_suggestions TEXT[] NOT NULL,
  keyword_gaps TEXT[] NOT NULL,
  ai_recommendations JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ranking_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  predicted_position_7d INTEGER,
  predicted_position_30d INTEGER,
  predicted_position_90d INTEGER,
  confidence_score NUMERIC,
  trend TEXT,
  factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voice_search_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  has_featured_snippet BOOLEAN DEFAULT false,
  snippet_content TEXT,
  people_also_ask TEXT[],
  answer_box_present BOOLEAN DEFAULT false,
  voice_search_score NUMERIC,
  optimization_tips TEXT[],
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_calendar_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  suggested_topic TEXT NOT NULL,
  target_keyword TEXT,
  estimated_traffic INTEGER,
  difficulty INTEGER,
  priority TEXT DEFAULT 'medium',
  content_type TEXT,
  ai_brief TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_performance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  content_title TEXT NOT NULL,
  predicted_traffic INTEGER,
  predicted_ranking INTEGER,
  confidence_score NUMERIC,
  prediction_factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automated_seo_fixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  affected_url TEXT NOT NULL,
  fix_applied TEXT NOT NULL,
  status TEXT DEFAULT 'applied',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.link_opportunity_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  opportunity_score NUMERIC,
  domain_authority INTEGER,
  relevance_score NUMERIC,
  traffic_estimate INTEGER,
  contact_info JSONB,
  outreach_status TEXT DEFAULT 'identified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.multi_location_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position INTEGER,
  local_pack_position INTEGER,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.revenue_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT,
  revenue_amount NUMERIC,
  conversion_count INTEGER,
  date DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.white_label_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_config JSONB,
  generated_url TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cross_channel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  date DATE NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.serp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_seo_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_opportunity_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_location_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_channel_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Users can manage serp alerts for their projects" ON public.serp_alerts FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = serp_alerts.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = serp_alerts.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage content gap analysis for their projects" ON public.content_gap_analysis FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_gap_analysis.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_gap_analysis.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage ranking predictions for their projects" ON public.ranking_predictions FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = ranking_predictions.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = ranking_predictions.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage voice search tracking for their projects" ON public.voice_search_tracking FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = voice_search_tracking.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = voice_search_tracking.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage content calendar suggestions for their projects" ON public.content_calendar_suggestions FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_calendar_suggestions.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_calendar_suggestions.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage content performance predictions for their projects" ON public.content_performance_predictions FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_performance_predictions.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = content_performance_predictions.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage automated seo fixes for their projects" ON public.automated_seo_fixes FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = automated_seo_fixes.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = automated_seo_fixes.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage link opportunity scoring for their projects" ON public.link_opportunity_scoring FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = link_opportunity_scoring.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = link_opportunity_scoring.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage multi location tracking for their projects" ON public.multi_location_tracking FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = multi_location_tracking.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = multi_location_tracking.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage revenue attribution for their projects" ON public.revenue_attribution FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = revenue_attribution.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = revenue_attribution.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage white label reports for their projects" ON public.white_label_reports FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = white_label_reports.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = white_label_reports.project_id AND seo_projects.user_id = auth.uid()));

CREATE POLICY "Users can manage cross channel analytics for their projects" ON public.cross_channel_analytics FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = cross_channel_analytics.project_id AND seo_projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE seo_projects.id = cross_channel_analytics.project_id AND seo_projects.user_id = auth.uid()));

-- Apply the rest of the SEO tables from the original migrations
CREATE TABLE IF NOT EXISTS public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  competitor_domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position INTEGER,
  traffic_estimate INTEGER,
  domain_authority INTEGER,
  backlinks_count INTEGER,
  referring_domains INTEGER,
  content_score DECIMAL(5,2),
  last_checked TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.backlink_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  source_domain TEXT NOT NULL,
  source_url TEXT,
  target_url TEXT,
  anchor_text TEXT,
  link_type TEXT,
  domain_authority INTEGER,
  is_dofollow BOOLEAN DEFAULT true,
  status TEXT,
  first_seen TIMESTAMPTZ,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.keyword_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  cpc DECIMAL(10,2),
  search_intent TEXT,
  related_questions TEXT[],
  lsi_keywords TEXT[],
  seasonal_trend TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technical_seo_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN,
  core_web_vitals JSONB,
  schema_markup TEXT[],
  has_ssl BOOLEAN,
  canonical_url TEXT,
  meta_robots TEXT,
  issues JSONB,
  recommendations TEXT[],
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID,
  url TEXT,
  readability_score DECIMAL(5,2),
  seo_score DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  keyword_density DECIMAL(5,2),
  word_count INTEGER,
  entities JSONB,
  topics JSONB,
  recommendations TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.serp_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  position INTEGER,
  url TEXT,
  page_title TEXT,
  featured_snippet BOOLEAN DEFAULT false,
  local_pack BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT,
  target_keyword TEXT,
  secondary_keywords TEXT[],
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  scheduled_date DATE,
  published_date DATE,
  url TEXT,
  content_brief TEXT,
  word_count_target INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.link_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  url TEXT,
  opportunity_type TEXT,
  domain_authority INTEGER,
  relevance_score DECIMAL(5,2),
  contact_email TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.local_seo_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  keyword TEXT NOT NULL,
  local_pack_position INTEGER,
  organic_position INTEGER,
  gmb_listing_id TEXT,
  reviews_count INTEGER,
  average_rating DECIMAL(3,2),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on these tables
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serp_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_seo_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage competitor analysis for their projects" ON public.competitor_analysis FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = competitor_analysis.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = competitor_analysis.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage backlinks for their projects" ON public.backlink_analysis FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = backlink_analysis.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = backlink_analysis.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage keywords for their projects" ON public.keyword_tracking FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = keyword_tracking.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = keyword_tracking.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage audits for their projects" ON public.technical_seo_audits FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = technical_seo_audits.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = technical_seo_audits.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their content scores" ON public.content_scores FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage SERP rankings for their projects" ON public.serp_rankings FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = serp_rankings.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = serp_rankings.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage content calendar for their projects" ON public.content_calendar FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = content_calendar.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = content_calendar.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage link opportunities for their projects" ON public.link_opportunities FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = link_opportunities.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = link_opportunities.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage local SEO data for their projects" ON public.local_seo_tracking FOR ALL
USING (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = local_seo_tracking.project_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.seo_projects WHERE id = local_seo_tracking.project_id AND user_id = auth.uid()));

-- Add triggers for timestamp updates
CREATE TRIGGER update_keyword_tracking_updated_at
BEFORE UPDATE ON public.keyword_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
BEFORE UPDATE ON public.content_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_keyword_analysis_project_id ON public.keyword_analysis(project_id);
CREATE INDEX idx_keyword_clusters_project_id ON public.keyword_clusters(project_id);
CREATE INDEX idx_serp_alerts_project_id ON public.serp_alerts(project_id);
CREATE INDEX idx_content_gap_project_id ON public.content_gap_analysis(project_id);
CREATE INDEX idx_ranking_predictions_project_id ON public.ranking_predictions(project_id);
CREATE INDEX idx_voice_search_project_id ON public.voice_search_tracking(project_id);
