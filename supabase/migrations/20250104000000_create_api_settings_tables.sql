-- Create API Settings Tables for DataForSEO and Firecrawl
-- Created: January 04, 2025

-- Table for DataForSEO settings per project
CREATE TABLE IF NOT EXISTS public.dataforseo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

ALTER TABLE public.dataforseo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage DataForSEO settings for their projects"
ON public.dataforseo_settings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = dataforseo_settings.project_id
  AND seo_projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = dataforseo_settings.project_id
  AND seo_projects.user_id = auth.uid()
));

-- Table for Firecrawl settings per project
CREATE TABLE IF NOT EXISTS public.firecrawl_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

ALTER TABLE public.firecrawl_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage Firecrawl settings for their projects"
ON public.firecrawl_settings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = firecrawl_settings.project_id
  AND seo_projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects
  WHERE seo_projects.id = firecrawl_settings.project_id
  AND seo_projects.user_id = auth.uid()
));

-- Add indexes for better performance
CREATE INDEX idx_dataforseo_settings_project ON public.dataforseo_settings(project_id);
CREATE INDEX idx_firecrawl_settings_project ON public.firecrawl_settings(project_id);

-- Add triggers for updated_at
CREATE TRIGGER update_dataforseo_settings_updated_at
BEFORE UPDATE ON public.dataforseo_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_firecrawl_settings_updated_at
BEFORE UPDATE ON public.firecrawl_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
