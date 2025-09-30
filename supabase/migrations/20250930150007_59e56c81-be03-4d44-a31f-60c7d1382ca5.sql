-- Create table for keyword analysis and clustering
CREATE TABLE public.keyword_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  cluster_name TEXT,
  search_volume INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  position NUMERIC DEFAULT 0,
  difficulty_score NUMERIC DEFAULT 0,
  potential_score NUMERIC DEFAULT 0,
  opportunity_type TEXT,
  ai_recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, page_url, keyword)
);

-- Enable RLS
ALTER TABLE public.keyword_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage keyword analysis for their projects"
ON public.keyword_analysis
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = keyword_analysis.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = keyword_analysis.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_keyword_analysis_project ON public.keyword_analysis(project_id);
CREATE INDEX idx_keyword_analysis_page ON public.keyword_analysis(page_url);
CREATE INDEX idx_keyword_analysis_score ON public.keyword_analysis(potential_score DESC);
CREATE INDEX idx_keyword_analysis_cluster ON public.keyword_analysis(cluster_name);