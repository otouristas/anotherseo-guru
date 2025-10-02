-- Create ai_recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  impact_score NUMERIC,
  effort_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_recommendations
CREATE POLICY "Users can manage AI recommendations for their projects"
ON public.ai_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ai_recommendations.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ai_recommendations.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create chatbot_conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for chatbot_conversations
CREATE POLICY "Users can manage their own chatbot conversations"
ON public.chatbot_conversations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_chatbot_conversations_updated_at
BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create crawl_jobs table
CREATE TABLE public.crawl_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  pages_discovered INTEGER NOT NULL DEFAULT 0,
  max_pages INTEGER NOT NULL DEFAULT 100,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for crawl_jobs
CREATE POLICY "Users can manage crawl jobs for their projects"
ON public.crawl_jobs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = crawl_jobs.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = crawl_jobs.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create site_audit_scores table
CREATE TABLE public.site_audit_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  overall_score NUMERIC,
  seo_score NUMERIC,
  performance_score NUMERIC,
  accessibility_score NUMERIC,
  best_practices_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_audit_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_audit_scores
CREATE POLICY "Users can manage audit scores for their projects"
ON public.site_audit_scores
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = site_audit_scores.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = site_audit_scores.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create page_seo_issues table
CREATE TABLE public.page_seo_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  how_to_fix TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_seo_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_seo_issues
CREATE POLICY "Users can manage SEO issues for their projects"
ON public.page_seo_issues
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = page_seo_issues.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = page_seo_issues.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create audit_recommendations table
CREATE TABLE public.audit_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_recommendations
CREATE POLICY "Users can manage audit recommendations for their projects"
ON public.audit_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = audit_recommendations.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = audit_recommendations.project_id
    AND seo_projects.user_id = auth.uid()
  )
);