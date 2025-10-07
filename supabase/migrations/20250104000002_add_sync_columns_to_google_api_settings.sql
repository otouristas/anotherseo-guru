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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_ga4_sync 
ON public.google_api_settings(last_ga4_sync);

CREATE INDEX IF NOT EXISTS idx_google_api_settings_last_gsc_sync 
ON public.google_api_settings(last_gsc_sync);

-- Add comments for documentation
COMMENT ON COLUMN public.google_api_settings.last_ga4_sync IS 'Last time GA4 data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.last_gsc_sync IS 'Last time Google Search Console data was synced for this project';
COMMENT ON COLUMN public.google_api_settings.sync_status IS 'Current sync status: idle, syncing, error, completed';
