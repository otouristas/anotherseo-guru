-- ===========================================
-- CRITICAL DATABASE FIXES
-- Fix duplicate key constraint and missing columns
-- Project: cabzhcbnxbnhjannbpxj
-- ===========================================

-- 1. Fix Google API Settings Table (Missing Columns)
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

-- 2. Fix Keyword Analysis Table (Duplicate Key Constraint)
-- ===========================================

-- First, let's check if there are duplicate entries causing the constraint violation
-- Remove duplicates before fixing the constraint
WITH duplicates AS (
  SELECT 
    project_id, 
    page_url, 
    keyword,
    MIN(created_at) as keep_date,
    COUNT(*) as duplicate_count
  FROM public.keyword_analysis 
  WHERE page_url IS NOT NULL
  GROUP BY project_id, page_url, keyword
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT ka.id
  FROM public.keyword_analysis ka
  INNER JOIN duplicates d ON (
    ka.project_id = d.project_id 
    AND ka.page_url = d.page_url 
    AND ka.keyword = d.keyword
    AND ka.created_at > d.keep_date
  )
)
DELETE FROM public.keyword_analysis 
WHERE id IN (SELECT id FROM to_delete);

-- Now drop the existing unique constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'keyword_analysis_project_id_page_url_keyword_key'
  ) THEN
    ALTER TABLE public.keyword_analysis 
    DROP CONSTRAINT keyword_analysis_project_id_page_url_keyword_key;
  END IF;
END $$;

-- Recreate the unique constraint with proper handling
ALTER TABLE public.keyword_analysis 
ADD CONSTRAINT keyword_analysis_project_id_page_url_keyword_key 
UNIQUE (project_id, COALESCE(page_url, ''), keyword);

-- 3. Ensure All Required Columns Exist in keyword_analysis
-- ===========================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add page_url column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'page_url'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN page_url TEXT;
  END IF;

  -- Add cluster_name column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'cluster_name'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN cluster_name TEXT;
  END IF;

  -- Add impressions column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'impressions'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN impressions INTEGER DEFAULT 0;
  END IF;

  -- Add clicks column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'clicks'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN clicks INTEGER DEFAULT 0;
  END IF;

  -- Add ctr column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'ctr'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN ctr NUMERIC DEFAULT 0;
  END IF;

  -- Add position column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'position'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN position NUMERIC DEFAULT 0;
  END IF;

  -- Add difficulty_score column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'difficulty_score'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN difficulty_score NUMERIC DEFAULT 0;
  END IF;

  -- Add potential_score column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'potential_score'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN potential_score NUMERIC DEFAULT 0;
  END IF;

  -- Add opportunity_type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'opportunity_type'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN opportunity_type TEXT;
  END IF;

  -- Add ai_recommendations column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'ai_recommendations'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN ai_recommendations JSONB;
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.keyword_analysis ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 4. Create Missing Tables
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

-- 5. Create Indexes for Performance
-- ===========================================

-- Google API Settings indexes
CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_ga4_sync 
ON public.google_api_settings(last_ga4_sync);

CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_gsc_sync 
ON public.google_api_settings(last_gsc_sync);

-- DataForSEO indexes
CREATE INDEX IF NOT EXISTS idx_dataforseo_settings_project ON public.dataforseo_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_firecrawl_settings_project ON public.firecrawl_settings(project_id);

-- Keyword Analysis indexes
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_project ON public.keyword_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_page ON public.keyword_analysis(page_url);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_score ON public.keyword_analysis(potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_cluster ON public.keyword_analysis(cluster_name);

-- 6. Create Triggers for Updated At
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

CREATE TRIGGER update_keyword_analysis_updated_at
BEFORE UPDATE ON public.keyword_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Add Column Comments for Documentation
-- ===========================================

COMMENT ON COLUMN public.google_api_settings.last_ga4_sync IS 'Last time GA4 data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.last_gsc_sync IS 'Last time Google Search Console data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.sync_status IS 'Current sync status: idle, syncing, error, completed';

COMMENT ON TABLE public.dataforseo_settings IS 'DataForSEO API settings and usage tracking per project';
COMMENT ON TABLE public.firecrawl_settings IS 'Firecrawl API settings and usage tracking per project';

-- 8. Verification Queries
-- ===========================================

-- Verify tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dataforseo_settings', 'firecrawl_settings', 'google_api_settings', 'keyword_analysis')
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

-- Verify keyword_analysis columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'keyword_analysis' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for remaining duplicates
SELECT 
  project_id, 
  page_url, 
  keyword,
  COUNT(*) as duplicate_count
FROM public.keyword_analysis 
WHERE page_url IS NOT NULL
GROUP BY project_id, page_url, keyword
HAVING COUNT(*) > 1
LIMIT 10;
