-- Create multi-location tracking table
CREATE TABLE public.multi_location_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  local_pack_rankings JSONB,
  organic_rankings JSONB,
  gmb_insights JSONB,
  local_competitors TEXT[],
  local_search_volume INTEGER,
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue attribution table
CREATE TABLE public.revenue_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  page_url TEXT NOT NULL,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  attribution_model TEXT NOT NULL, -- 'first_touch', 'last_touch', 'linear', 'time_decay'
  traffic_source TEXT NOT NULL, -- 'organic', 'paid', 'social', 'direct', 'referral'
  conversion_rate NUMERIC,
  average_order_value NUMERIC,
  customer_lifetime_value NUMERIC,
  roi_percentage NUMERIC,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create white-label reports table
CREATE TABLE public.white_label_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'custom'
  client_name TEXT NOT NULL,
  client_logo_url TEXT,
  brand_colors JSONB,
  report_sections JSONB NOT NULL,
  metrics_included JSONB NOT NULL,
  auto_send BOOLEAN DEFAULT false,
  send_frequency TEXT, -- 'weekly', 'monthly', 'quarterly'
  recipient_emails TEXT[],
  last_generated TIMESTAMP WITH TIME ZONE,
  next_scheduled TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cross-channel analytics table
CREATE TABLE public.cross_channel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'organic', 'paid_search', 'social', 'email', 'display'
  metric_date DATE NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  revenue NUMERIC,
  cost NUMERIC,
  roas NUMERIC, -- Return on ad spend
  ctr NUMERIC,
  cpc NUMERIC,
  cpa NUMERIC,
  assisted_conversions INTEGER,
  cross_channel_impact JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.multi_location_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_channel_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage multi-location data for their projects"
ON public.multi_location_tracking
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = multi_location_tracking.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = multi_location_tracking.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage revenue attribution for their projects"
ON public.revenue_attribution
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = revenue_attribution.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = revenue_attribution.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage white-label reports for their projects"
ON public.white_label_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = white_label_reports.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = white_label_reports.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage cross-channel analytics for their projects"
ON public.cross_channel_analytics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = cross_channel_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = cross_channel_analytics.project_id
    AND seo_projects.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_multi_location_project_id ON public.multi_location_tracking(project_id);
CREATE INDEX idx_multi_location_location ON public.multi_location_tracking(city, state, country);
CREATE INDEX idx_revenue_attribution_project_id ON public.revenue_attribution(project_id);
CREATE INDEX idx_revenue_attribution_period ON public.revenue_attribution(period_start, period_end);
CREATE INDEX idx_white_label_reports_project_id ON public.white_label_reports(project_id);
CREATE INDEX idx_cross_channel_project_id ON public.cross_channel_analytics(project_id);
CREATE INDEX idx_cross_channel_date ON public.cross_channel_analytics(metric_date DESC);