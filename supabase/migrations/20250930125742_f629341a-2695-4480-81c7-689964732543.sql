-- Create keyword clusters table
CREATE TABLE public.keyword_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  cluster_name TEXT NOT NULL,
  cluster_label TEXT,
  keywords TEXT[] NOT NULL,
  center_keyword TEXT,
  avg_search_volume INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.keyword_clusters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage clusters for their projects"
ON public.keyword_clusters
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = keyword_clusters.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = keyword_clusters.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_keyword_clusters_project_id ON public.keyword_clusters(project_id);
CREATE INDEX idx_keyword_clusters_created_at ON public.keyword_clusters(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_keyword_clusters_updated_at
BEFORE UPDATE ON public.keyword_clusters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();