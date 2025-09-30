-- Create comprehensive SEO features database schema

-- SEO Projects table
CREATE TABLE IF NOT EXISTS public.seo_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  target_location TEXT,
  target_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects"
ON public.seo_projects FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Competitor Analysis table
CREATE TABLE IF NOT EXISTS public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  competitor_domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position INTEGER,
  traffic_estimate INTEGER,
  domain_authority INTEGER,
  backlinks_count INTEGER,
  referring_domains INTEGER,
  content_score DECIMAL(5,2),
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitor data for their projects"
ON public.competitor_analysis FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = competitor_analysis.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert competitor data"
ON public.competitor_analysis FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = competitor_analysis.project_id AND user_id = auth.uid()
));

-- SERP Rankings table
CREATE TABLE IF NOT EXISTS public.serp_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  position INTEGER,
  url TEXT,
  page_title TEXT,
  featured_snippet BOOLEAN DEFAULT false,
  local_pack BOOLEAN DEFAULT false,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.serp_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage SERP rankings for their projects"
ON public.serp_rankings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = serp_rankings.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = serp_rankings.project_id AND user_id = auth.uid()
));

-- Content Scores table
CREATE TABLE IF NOT EXISTS public.content_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID,
  url TEXT,
  readability_score DECIMAL(5,2),
  seo_score DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  keyword_density DECIMAL(5,2),
  word_count INTEGER,
  entities JSONB,
  topics JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their content scores"
ON public.content_scores FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Keyword Tracking table
CREATE TABLE IF NOT EXISTS public.keyword_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  cpc DECIMAL(10,2),
  search_intent TEXT,
  related_questions TEXT[],
  lsi_keywords TEXT[],
  seasonal_trend TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage keywords for their projects"
ON public.keyword_tracking FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_tracking.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = keyword_tracking.project_id AND user_id = auth.uid()
));

-- Backlink Analysis table
CREATE TABLE IF NOT EXISTS public.backlink_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  source_domain TEXT NOT NULL,
  source_url TEXT,
  target_url TEXT,
  anchor_text TEXT,
  link_type TEXT,
  domain_authority INTEGER,
  is_dofollow BOOLEAN DEFAULT true,
  status TEXT,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.backlink_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage backlinks for their projects"
ON public.backlink_analysis FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = backlink_analysis.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = backlink_analysis.project_id AND user_id = auth.uid()
));

-- Technical SEO Audits table
CREATE TABLE IF NOT EXISTS public.technical_seo_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN,
  core_web_vitals JSONB,
  schema_markup TEXT[],
  has_ssl BOOLEAN,
  canonical_url TEXT,
  meta_robots TEXT,
  issues JSONB,
  recommendations TEXT[],
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.technical_seo_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage audits for their projects"
ON public.technical_seo_audits FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = technical_seo_audits.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = technical_seo_audits.project_id AND user_id = auth.uid()
));

-- Content Calendar table
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT,
  target_keyword TEXT,
  secondary_keywords TEXT[],
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  scheduled_date DATE,
  published_date DATE,
  url TEXT,
  content_brief TEXT,
  word_count_target INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage content calendar for their projects"
ON public.content_calendar FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = content_calendar.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = content_calendar.project_id AND user_id = auth.uid()
));

-- Link Opportunities table
CREATE TABLE IF NOT EXISTS public.link_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  url TEXT,
  opportunity_type TEXT,
  domain_authority INTEGER,
  relevance_score DECIMAL(5,2),
  contact_email TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.link_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage link opportunities for their projects"
ON public.link_opportunities FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = link_opportunities.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = link_opportunities.project_id AND user_id = auth.uid()
));

-- Local SEO Tracking table
CREATE TABLE IF NOT EXISTS public.local_seo_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  keyword TEXT NOT NULL,
  local_pack_position INTEGER,
  organic_position INTEGER,
  gmb_listing_id TEXT,
  reviews_count INTEGER,
  average_rating DECIMAL(3,2),
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.local_seo_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage local SEO data for their projects"
ON public.local_seo_tracking FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = local_seo_tracking.project_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_projects 
  WHERE id = local_seo_tracking.project_id AND user_id = auth.uid()
));

-- Add triggers for timestamp updates
CREATE TRIGGER update_seo_projects_updated_at
BEFORE UPDATE ON public.seo_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keyword_tracking_updated_at
BEFORE UPDATE ON public.keyword_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
BEFORE UPDATE ON public.content_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();