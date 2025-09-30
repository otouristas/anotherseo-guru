-- Create table for Google Search Console data
CREATE TABLE public.gsc_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  page_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  position NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, keyword, page_url, date)
);

-- Create table for Google Analytics 4 data
CREATE TABLE public.ga4_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  channel TEXT NOT NULL,
  users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  conversions NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, page_path, channel, date)
);

-- Enable RLS
ALTER TABLE public.gsc_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for gsc_analytics
CREATE POLICY "Users can manage GSC data for their projects"
ON public.gsc_analytics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = gsc_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = gsc_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- RLS policies for ga4_analytics
CREATE POLICY "Users can manage GA4 data for their projects"
ON public.ga4_analytics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_gsc_analytics_project_date ON public.gsc_analytics(project_id, date DESC);
CREATE INDEX idx_gsc_analytics_keyword ON public.gsc_analytics(keyword);
CREATE INDEX idx_ga4_analytics_project_date ON public.ga4_analytics(project_id, date DESC);
CREATE INDEX idx_ga4_analytics_page ON public.ga4_analytics(page_path);