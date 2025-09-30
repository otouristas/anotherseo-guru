-- Create table for Google API settings per project
CREATE TABLE IF NOT EXISTS public.google_api_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  google_analytics_property_id TEXT,
  google_search_console_site_url TEXT,
  google_ads_customer_id TEXT,
  credentials_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.google_api_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their project Google settings"
ON public.google_api_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = google_api_settings.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = google_api_settings.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_google_api_settings_updated_at
BEFORE UPDATE ON public.google_api_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();