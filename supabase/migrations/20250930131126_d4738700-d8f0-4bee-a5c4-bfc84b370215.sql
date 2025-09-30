-- Create content performance predictions table
CREATE TABLE public.content_performance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  content_title TEXT NOT NULL,
  content_preview TEXT,
  target_keywords TEXT[] NOT NULL,
  predicted_traffic_30d INTEGER,
  predicted_traffic_90d INTEGER,
  predicted_ranking_position INTEGER,
  predicted_engagement_score NUMERIC,
  predicted_backlinks INTEGER,
  confidence_score NUMERIC,
  success_factors JSONB,
  improvement_recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automated SEO fixes table
CREATE TABLE public.automated_seo_fixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  issue_type TEXT NOT NULL, -- 'meta', 'heading', 'image', 'speed', 'mobile', 'schema'
  issue_severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  issue_description TEXT NOT NULL,
  automated_fix TEXT NOT NULL,
  fix_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'failed', 'manual_required'
  fix_result JSONB,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fixed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create smart content calendar suggestions table
CREATE TABLE public.content_calendar_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  suggested_topic TEXT NOT NULL,
  suggested_keywords TEXT[] NOT NULL,
  trending_score NUMERIC,
  search_volume INTEGER,
  competition_level TEXT, -- 'low', 'medium', 'high'
  optimal_publish_date DATE,
  reasoning TEXT,
  related_trends JSONB,
  priority_score NUMERIC,
  status TEXT DEFAULT 'suggested', -- 'suggested', 'scheduled', 'published', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create link opportunity scoring table
CREATE TABLE public.link_opportunity_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  target_domain TEXT NOT NULL,
  target_url TEXT,
  opportunity_score NUMERIC NOT NULL,
  domain_authority INTEGER,
  relevance_score NUMERIC,
  outreach_difficulty TEXT, -- 'easy', 'medium', 'hard'
  contact_info JSONB,
  outreach_status TEXT DEFAULT 'identified', -- 'identified', 'contacted', 'responded', 'acquired', 'rejected'
  outreach_template TEXT,
  success_probability NUMERIC,
  estimated_value NUMERIC,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_outreach_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.content_performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_seo_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_opportunity_scoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage content predictions for their projects"
ON public.content_performance_predictions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_performance_predictions.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_performance_predictions.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage SEO fixes for their projects"
ON public.automated_seo_fixes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = automated_seo_fixes.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = automated_seo_fixes.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage calendar suggestions for their projects"
ON public.content_calendar_suggestions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_calendar_suggestions.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = content_calendar_suggestions.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage link opportunities for their projects"
ON public.link_opportunity_scoring
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = link_opportunity_scoring.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = link_opportunity_scoring.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_content_predictions_project_id ON public.content_performance_predictions(project_id);
CREATE INDEX idx_automated_fixes_project_id ON public.automated_seo_fixes(project_id);
CREATE INDEX idx_automated_fixes_status ON public.automated_seo_fixes(fix_status);
CREATE INDEX idx_calendar_suggestions_project_id ON public.content_calendar_suggestions(project_id);
CREATE INDEX idx_calendar_suggestions_status ON public.content_calendar_suggestions(status);
CREATE INDEX idx_link_scoring_project_id ON public.link_opportunity_scoring(project_id);
CREATE INDEX idx_link_scoring_score ON public.link_opportunity_scoring(opportunity_score DESC);