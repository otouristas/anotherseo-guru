-- Create SERP alerts table for real-time monitoring
CREATE TABLE public.serp_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'position_change', 'new_competitor', 'snippet_lost', 'ranking_drop'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  old_position INTEGER,
  new_position INTEGER,
  competitor_domain TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content gap analysis table
CREATE TABLE public.content_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  competitor_urls TEXT[] NOT NULL,
  missing_topics TEXT[] NOT NULL,
  content_suggestions TEXT[] NOT NULL,
  keyword_gaps TEXT[] NOT NULL,
  ai_recommendations JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ranking predictions table
CREATE TABLE public.ranking_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  predicted_position_7d INTEGER,
  predicted_position_30d INTEGER,
  predicted_position_90d INTEGER,
  confidence_score NUMERIC,
  trend TEXT, -- 'improving', 'declining', 'stable'
  factors JSONB, -- Contributing factors to the prediction
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice search tracking table
CREATE TABLE public.voice_search_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  has_featured_snippet BOOLEAN DEFAULT false,
  snippet_content TEXT,
  people_also_ask TEXT[],
  answer_box_present BOOLEAN DEFAULT false,
  voice_search_score NUMERIC, -- 0-100 score for voice search optimization
  optimization_tips TEXT[],
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for serp_alerts
CREATE POLICY "Users can manage SERP alerts for their projects"
ON public.serp_alerts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = serp_alerts.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = serp_alerts.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- RLS Policies for content_gap_analysis
CREATE POLICY "Users can manage content gap analysis for their projects"
ON public.content_gap_analysis
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_gap_analysis.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_gap_analysis.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- RLS Policies for ranking_predictions
CREATE POLICY "Users can manage ranking predictions for their projects"
ON public.ranking_predictions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ranking_predictions.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ranking_predictions.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- RLS Policies for voice_search_tracking
CREATE POLICY "Users can manage voice search tracking for their projects"
ON public.voice_search_tracking
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = voice_search_tracking.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = voice_search_tracking.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_serp_alerts_project_id ON public.serp_alerts(project_id);
CREATE INDEX idx_serp_alerts_created_at ON public.serp_alerts(created_at DESC);
CREATE INDEX idx_serp_alerts_is_read ON public.serp_alerts(is_read);
CREATE INDEX idx_content_gap_project_id ON public.content_gap_analysis(project_id);
CREATE INDEX idx_ranking_predictions_project_id ON public.ranking_predictions(project_id);
CREATE INDEX idx_voice_search_project_id ON public.voice_search_tracking(project_id);