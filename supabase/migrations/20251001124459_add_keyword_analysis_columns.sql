/*
  # Add Missing Columns to keyword_analysis Table

  1. Changes
    - Add missing columns needed by keyword-opportunity-analyzer function:
      - page_url (text) - The URL of the page being analyzed
      - cluster_name (text) - The semantic cluster/topic this keyword belongs to
      - impressions (integer) - Number of impressions from GSC
      - clicks (integer) - Number of clicks from GSC
      - ctr (numeric) - Click-through rate
      - position (numeric) - Average SERP position
      - difficulty_score (numeric) - Calculated difficulty score (0-1)
      - potential_score (numeric) - Calculated potential score (0-1)
      - opportunity_type (text) - Type of opportunity identified
      - ai_recommendations (jsonb) - AI-generated recommendations
      - updated_at (timestamp) - Last update timestamp

  2. Notes
    - Uses IF NOT EXISTS pattern to safely add columns
    - All new columns are nullable to support existing data
*/

DO $$ 
BEGIN
  -- Add page_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'page_url'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN page_url text;
  END IF;

  -- Add cluster_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'cluster_name'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN cluster_name text;
  END IF;

  -- Add impressions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'impressions'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN impressions integer DEFAULT 0;
  END IF;

  -- Add clicks column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'clicks'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN clicks integer DEFAULT 0;
  END IF;

  -- Add ctr column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'ctr'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN ctr numeric DEFAULT 0;
  END IF;

  -- Add position column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'position'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN position numeric DEFAULT 0;
  END IF;

  -- Add difficulty_score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'difficulty_score'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN difficulty_score numeric DEFAULT 0;
  END IF;

  -- Add potential_score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'potential_score'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN potential_score numeric DEFAULT 0;
  END IF;

  -- Add opportunity_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'opportunity_type'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN opportunity_type text;
  END IF;

  -- Add ai_recommendations column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'ai_recommendations'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN ai_recommendations jsonb;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keyword_analysis' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE keyword_analysis ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Create index on project_id and potential_score for faster queries
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_project_potential 
  ON keyword_analysis(project_id, potential_score DESC);

-- Create index on opportunity_type for filtering
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_opportunity_type 
  ON keyword_analysis(project_id, opportunity_type);