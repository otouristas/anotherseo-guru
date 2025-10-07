-- ===========================================
-- COMPREHENSIVE DATABASE MIGRATION
-- Push all migrations to Supabase Database
-- Project: cabzhcbnxbnhjannbpxj
-- ===========================================

-- 1. API Settings Tables (DataForSEO & Firecrawl)
-- ===========================================

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

-- 2. Fix Google API Settings Table
-- ===========================================

-- Add missing columns to google_api_settings table
-- This fixes the error: column google_api_settings.last_ga4_sync does not exist

-- Add last_ga4_sync column
ALTER TABLE public.google_api_settings 
ADD COLUMN IF NOT EXISTS last_ga4_sync TIMESTAMPTZ;

-- Add last_gsc_sync column for consistency
ALTER TABLE public.google_api_settings 
ADD COLUMN IF NOT EXISTS last_gsc_sync TIMESTAMPTZ;

-- Add sync_status column to track sync state
ALTER TABLE public.google_api_settings 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle';

-- 3. Create Indexes for Performance
-- ===========================================

-- DataForSEO indexes
CREATE INDEX IF NOT EXISTS idx_dataforseo_settings_project ON public.dataforseo_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_firecrawl_settings_project ON public.firecrawl_settings(project_id);

-- Google API Settings indexes
CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_ga4_sync 
ON public.google_api_settings(last_ga4_sync);

CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_gsc_sync 
ON public.google_api_settings(last_gsc_sync);

-- 4. Create Triggers for Updated At
-- ===========================================

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_dataforseo_settings_updated_at
BEFORE UPDATE ON public.dataforseo_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_firecrawl_settings_updated_at
BEFORE UPDATE ON public.firecrawl_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add Column Comments for Documentation
-- ===========================================

COMMENT ON COLUMN public.google_api_settings.last_ga4_sync IS 'Last time GA4 data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.last_gsc_sync IS 'Last time Google Search Console data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.sync_status IS 'Current sync status: idle, syncing, error, completed';

COMMENT ON TABLE public.dataforseo_settings IS 'DataForSEO API settings and usage tracking per project';
COMMENT ON TABLE public.firecrawl_settings IS 'Firecrawl API settings and usage tracking per project';

-- 6. Verification Queries
-- ===========================================

-- Verify tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dataforseo_settings', 'firecrawl_settings', 'google_api_settings')
ORDER BY table_name;

-- Verify google_api_settings columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'google_api_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('dataforseo_settings', 'firecrawl_settings', 'google_api_settings')
ORDER BY tablename, indexname;
