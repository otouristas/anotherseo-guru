/*
  # Website Crawling & SEO Audit System Schema

  ## Overview
  This migration creates comprehensive tables for website crawling, SEO analysis, 
  and audit tracking. Designed to support enterprise-grade SEO analysis similar to 
  Ahrefs/SEMrush.

  ## New Tables
  
  ### 1. crawl_jobs
  Tracks website crawl operations with status, progress, and configuration
  
  ### 2. crawled_pages
  Stores individual page data from website crawls
  
  ### 3. page_seo_issues
  Tracks specific SEO issues found on each page
  
  ### 4. site_audit_scores
  Stores overall SEO health scores for each audit
  
  ### 5. internal_links
  Maps internal linking structure for link analysis
  
  ### 6. external_links
  Tracks external links for broken link detection
  
  ### 7. audit_recommendations
  AI-generated recommendations for improving SEO

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access data for their own projects
  - Policies enforce proper authorization checks

  ## Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for join optimization
  
  ## Plan-based Crawl Limits
  - Free: 10 pages
  - Starter: 100 pages
  - Professional: 500 pages
  - Agency: 2000 pages
*/

-- crawl_jobs table
CREATE TABLE IF NOT EXISTS public.crawl_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'crawling', 'analyzing', 'completed', 'failed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  pages_discovered INTEGER NOT NULL DEFAULT 0,
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  max_pages INTEGER NOT NULL DEFAULT 10,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  crawl_config JSONB DEFAULT '{"depth": 3, "respect_robots": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_project_id ON public.crawl_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON public.crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created_at ON public.crawl_jobs(created_at DESC);

ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view crawl jobs for their projects"
ON public.crawl_jobs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = crawl_jobs.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create crawl jobs for their projects"
ON public.crawl_jobs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = crawl_jobs.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update crawl jobs for their projects"
ON public.crawl_jobs FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = crawl_jobs.project_id AND user_id = auth.uid()
));

-- crawled_pages table
CREATE TABLE IF NOT EXISTS public.crawled_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status_code INTEGER,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  load_time_ms INTEGER,
  internal_links_count INTEGER DEFAULT 0,
  external_links_count INTEGER DEFAULT 0,
  images_count INTEGER DEFAULT 0,
  images_without_alt INTEGER DEFAULT 0,
  html_size_bytes BIGINT,
  has_canonical BOOLEAN DEFAULT false,
  canonical_url TEXT,
  meta_robots TEXT,
  has_schema_markup BOOLEAN DEFAULT false,
  schema_types TEXT[],
  og_tags JSONB,
  twitter_tags JSONB,
  hreflang_tags JSONB,
  headers JSONB,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crawl_job_id, url)
);

CREATE INDEX IF NOT EXISTS idx_crawled_pages_crawl_job ON public.crawled_pages(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_project_id ON public.crawled_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_url ON public.crawled_pages(url);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_status_code ON public.crawled_pages(status_code);

ALTER TABLE public.crawled_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view crawled pages for their projects"
ON public.crawled_pages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = crawled_pages.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert crawled pages for their projects"
ON public.crawled_pages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = crawled_pages.project_id AND user_id = auth.uid()
));

-- page_seo_issues table
CREATE TABLE IF NOT EXISTS public.page_seo_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.crawled_pages(id) ON DELETE CASCADE,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'on-page', 'content', 'performance', 'mobile', 'security')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  affected_element TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_seo_issues_page_id ON public.page_seo_issues(page_id);
CREATE INDEX IF NOT EXISTS idx_page_seo_issues_crawl_job ON public.page_seo_issues(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_page_seo_issues_severity ON public.page_seo_issues(severity);
CREATE INDEX IF NOT EXISTS idx_page_seo_issues_category ON public.page_seo_issues(category);

ALTER TABLE public.page_seo_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view issues for their projects"
ON public.page_seo_issues FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = page_seo_issues.page_id AND sp.user_id = auth.uid()
));

CREATE POLICY "Users can insert issues for their projects"
ON public.page_seo_issues FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = page_seo_issues.page_id AND sp.user_id = auth.uid()
));

-- site_audit_scores table
CREATE TABLE IF NOT EXISTS public.site_audit_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  technical_score INTEGER DEFAULT 0 CHECK (technical_score >= 0 AND technical_score <= 100),
  onpage_score INTEGER DEFAULT 0 CHECK (onpage_score >= 0 AND onpage_score <= 100),
  content_score INTEGER DEFAULT 0 CHECK (content_score >= 0 AND content_score <= 100),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  mobile_score INTEGER DEFAULT 0 CHECK (mobile_score >= 0 AND mobile_score <= 100),
  total_issues INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  pages_analyzed INTEGER DEFAULT 0,
  score_breakdown JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crawl_job_id)
);

CREATE INDEX IF NOT EXISTS idx_site_audit_scores_crawl_job ON public.site_audit_scores(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_site_audit_scores_project_id ON public.site_audit_scores(project_id);
CREATE INDEX IF NOT EXISTS idx_site_audit_scores_created_at ON public.site_audit_scores(created_at DESC);

ALTER TABLE public.site_audit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit scores for their projects"
ON public.site_audit_scores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = site_audit_scores.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert audit scores for their projects"
ON public.site_audit_scores FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = site_audit_scores.project_id AND user_id = auth.uid()
));

-- internal_links table
CREATE TABLE IF NOT EXISTS public.internal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  source_page_id UUID NOT NULL REFERENCES public.crawled_pages(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  is_broken BOOLEAN DEFAULT false,
  rel_attributes TEXT[],
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_links_crawl_job ON public.internal_links(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_source_page ON public.internal_links(source_page_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_target_url ON public.internal_links(target_url);
CREATE INDEX IF NOT EXISTS idx_internal_links_broken ON public.internal_links(is_broken) WHERE is_broken = true;

ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view internal links for their projects"
ON public.internal_links FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = internal_links.source_page_id AND sp.user_id = auth.uid()
));

CREATE POLICY "Users can insert internal links for their projects"
ON public.internal_links FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = internal_links.source_page_id AND sp.user_id = auth.uid()
));

-- external_links table
CREATE TABLE IF NOT EXISTS public.external_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  source_page_id UUID NOT NULL REFERENCES public.crawled_pages(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  is_broken BOOLEAN DEFAULT false,
  status_code INTEGER,
  rel_attributes TEXT[],
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_external_links_crawl_job ON public.external_links(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_external_links_source_page ON public.external_links(source_page_id);
CREATE INDEX IF NOT EXISTS idx_external_links_broken ON public.external_links(is_broken) WHERE is_broken = true;

ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view external links for their projects"
ON public.external_links FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = external_links.source_page_id AND sp.user_id = auth.uid()
));

CREATE POLICY "Users can insert external links for their projects"
ON public.external_links FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.crawled_pages cp
  JOIN public.seo_projects sp ON cp.project_id = sp.id
  WHERE cp.id = external_links.source_page_id AND sp.user_id = auth.uid()
));

-- audit_recommendations table
CREATE TABLE IF NOT EXISTS public.audit_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crawl_job_id UUID NOT NULL REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('quick-win', 'high-impact', 'long-term')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  effort TEXT NOT NULL CHECK (effort IN ('low', 'medium', 'high')),
  affected_pages_count INTEGER DEFAULT 0,
  estimated_improvement TEXT,
  implementation_guide TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_recommendations_crawl_job ON public.audit_recommendations(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_project_id ON public.audit_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_priority ON public.audit_recommendations(priority);

ALTER TABLE public.audit_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations for their projects"
ON public.audit_recommendations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = audit_recommendations.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert recommendations for their projects"
ON public.audit_recommendations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = audit_recommendations.project_id AND user_id = auth.uid()
));
