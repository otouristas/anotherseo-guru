/*
  # SEO Intelligence Tables

  1. New Tables
    - `seo_analysis_results`
      - Stores AI-generated SEO recommendations and analysis results
      - Links to content_history and projects
      - Tracks analysis timestamp and model used
    
    - `algorithm_drops`
      - Tracks detected ranking declines and algorithm impact
      - Stores drop severity, affected keywords, and recovery status
    
    - `content_optimization_history`
      - Records all optimization changes made to content
      - Tracks before/after metrics for ROI analysis
    
    - `competitor_intelligence`
      - Stores SERP competitor data from DataForSEO
      - Tracks competitor positions, content strategies, and changes
    
    - `keyword_opportunities`
      - Prioritized list of keyword opportunities from GSC + DataForSEO
      - Includes quick wins and high-potential keywords
    
    - `ai_recommendations`
      - Detailed actionable recommendations from AI analysis
      - Status tracking: pending, applied, dismissed
      - Impact scores and priority levels
    
    - `performance_snapshots`
      - Before/after performance tracking
      - Links optimizations to measurable results

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Project-based access control
*/

-- SEO Analysis Results Table
CREATE TABLE IF NOT EXISTS seo_analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE,
  content_history_id uuid REFERENCES content_history(id) ON DELETE SET NULL,
  url text,
  content_hash text,
  analysis_type text NOT NULL DEFAULT 'comprehensive',
  llm_model text NOT NULL DEFAULT 'gemini-2.5-flash',
  gsc_data jsonb DEFAULT '{}',
  dataforseo_data jsonb DEFAULT '{}',
  competitor_data jsonb DEFAULT '{}',
  analysis_summary text,
  optimization_score numeric DEFAULT 0,
  estimated_traffic_impact numeric DEFAULT 0,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_analysis_user ON seo_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_analysis_project ON seo_analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_analysis_created ON seo_analysis_results(created_at DESC);

ALTER TABLE seo_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own SEO analysis results"
  ON seo_analysis_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SEO analysis results"
  ON seo_analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SEO analysis results"
  ON seo_analysis_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Algorithm Drops Table
CREATE TABLE IF NOT EXISTS algorithm_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  detected_date date NOT NULL,
  drop_severity text NOT NULL DEFAULT 'moderate',
  affected_keywords jsonb DEFAULT '[]',
  position_drop_avg numeric DEFAULT 0,
  traffic_loss_estimate numeric DEFAULT 0,
  recovery_status text DEFAULT 'pending',
  recovery_date date,
  likely_algorithm text,
  ai_diagnosis text,
  recommended_actions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_algorithm_drops_user ON algorithm_drops(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_drops_project ON algorithm_drops(project_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_drops_date ON algorithm_drops(detected_date DESC);

ALTER TABLE algorithm_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own algorithm drops"
  ON algorithm_drops FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own algorithm drops"
  ON algorithm_drops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own algorithm drops"
  ON algorithm_drops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Content Optimization History Table
CREATE TABLE IF NOT EXISTS content_optimization_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES seo_analysis_results(id) ON DELETE SET NULL,
  url text NOT NULL,
  optimization_type text NOT NULL,
  before_content text,
  after_content text,
  before_metrics jsonb DEFAULT '{}',
  after_metrics jsonb DEFAULT '{}',
  improvements jsonb DEFAULT '{}',
  roi_percentage numeric DEFAULT 0,
  applied_date timestamptz DEFAULT now(),
  measured_date timestamptz,
  status text DEFAULT 'applied',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_optimization_history_user ON content_optimization_history(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_project ON content_optimization_history(project_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_date ON content_optimization_history(applied_date DESC);

ALTER TABLE content_optimization_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own optimization history"
  ON content_optimization_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimization history"
  ON content_optimization_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Competitor Intelligence Table
CREATE TABLE IF NOT EXISTS competitor_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  competitor_url text NOT NULL,
  position integer NOT NULL,
  domain_authority numeric,
  page_authority numeric,
  backlink_count integer DEFAULT 0,
  content_length integer,
  title text,
  meta_description text,
  headings jsonb DEFAULT '{}',
  keyword_density numeric,
  content_quality_score numeric,
  unique_features jsonb DEFAULT '[]',
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_intel_user ON competitor_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_project ON competitor_intelligence(project_id);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_keyword ON competitor_intelligence(keyword);

ALTER TABLE competitor_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitor intelligence"
  ON competitor_intelligence FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitor intelligence"
  ON competitor_intelligence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Keyword Opportunities Table
CREATE TABLE IF NOT EXISTS keyword_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_id uuid REFERENCES seo_analysis_results(id) ON DELETE SET NULL,
  keyword text NOT NULL,
  current_position integer,
  target_position integer DEFAULT 10,
  search_volume integer DEFAULT 0,
  keyword_difficulty numeric DEFAULT 0,
  ctr_estimate numeric DEFAULT 0,
  traffic_potential integer DEFAULT 0,
  opportunity_type text NOT NULL,
  priority_score numeric DEFAULT 0,
  quick_win boolean DEFAULT false,
  recommended_actions jsonb DEFAULT '[]',
  status text DEFAULT 'pending',
  gsc_data jsonb DEFAULT '{}',
  dataforseo_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keyword_opps_user ON keyword_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_opps_project ON keyword_opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_keyword_opps_priority ON keyword_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_opps_keyword ON keyword_opportunities(keyword);

ALTER TABLE keyword_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keyword opportunities"
  ON keyword_opportunities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keyword opportunities"
  ON keyword_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keyword opportunities"
  ON keyword_opportunities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES seo_analysis_results(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  detailed_steps jsonb DEFAULT '[]',
  impact_score numeric DEFAULT 0,
  effort_level text DEFAULT 'medium',
  priority_level text DEFAULT 'medium',
  estimated_traffic_lift numeric DEFAULT 0,
  implementation_time_hours numeric DEFAULT 0,
  code_examples jsonb DEFAULT '[]',
  before_after_examples jsonb DEFAULT '{}',
  related_keywords text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  applied_date timestamptz,
  dismissed_date timestamptz,
  dismissal_reason text,
  custom_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_project ON ai_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_analysis ON ai_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority_level, impact_score DESC);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI recommendations"
  ON ai_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI recommendations"
  ON ai_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI recommendations"
  ON ai_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI recommendations"
  ON ai_recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance Snapshots Table
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  optimization_id uuid REFERENCES content_optimization_history(id) ON DELETE SET NULL,
  url text NOT NULL,
  snapshot_type text NOT NULL,
  snapshot_date date DEFAULT CURRENT_DATE,
  organic_traffic integer DEFAULT 0,
  avg_position numeric DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_impressions integer DEFAULT 0,
  avg_ctr numeric DEFAULT 0,
  ranking_keywords integer DEFAULT 0,
  top_10_keywords integer DEFAULT 0,
  top_3_keywords integer DEFAULT 0,
  backlinks_count integer DEFAULT 0,
  referring_domains integer DEFAULT 0,
  domain_authority numeric DEFAULT 0,
  page_speed_score numeric DEFAULT 0,
  core_web_vitals jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_snapshots_user ON performance_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_project ON performance_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_date ON performance_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_url ON performance_snapshots(url);

ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance snapshots"
  ON performance_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance snapshots"
  ON performance_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
