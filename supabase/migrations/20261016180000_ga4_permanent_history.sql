-- Permanent GA4 history. Nightly sync upserts daily rows and does not delete them.
-- Standard aggregated Data API reports are requested back to 2015-08-14, the earliest
-- start date the API accepts. Event-scoped rows can stop earlier when a property's
-- retention setting drops them; those dates are simply never stored. Rows already
-- stored stay even if Google later stops returning them.

CREATE TABLE public.ga4_overview_daily (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  date DATE NOT NULL,
  active_users INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  screen_page_views INTEGER NOT NULL DEFAULT 0,
  average_session_duration NUMERIC NOT NULL DEFAULT 0,
  bounce_rate NUMERIC NOT NULL DEFAULT 0,
  engagement_rate NUMERIC NOT NULL DEFAULT 0,
  conversions NUMERIC NOT NULL DEFAULT 0,
  purchase_revenue NUMERIC NOT NULL DEFAULT 0,
  ecommerce_purchases INTEGER NOT NULL DEFAULT 0,
  currency_code TEXT,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, date)
);

CREATE TABLE public.ga4_pages_daily (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  date DATE NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT NOT NULL DEFAULT '',
  screen_page_views INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, date, page_path)
);

CREATE TABLE public.ga4_acquisition_daily (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  date DATE NOT NULL,
  session_source TEXT NOT NULL DEFAULT '(not set)',
  session_medium TEXT NOT NULL DEFAULT '(not set)',
  sessions INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  screen_page_views INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, date, session_source, session_medium)
);

CREATE TABLE public.ga4_events_daily (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, date, event_name)
);

CREATE TABLE public.ga4_sales_daily (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  date DATE NOT NULL,
  session_source TEXT NOT NULL DEFAULT '(not set)',
  session_medium TEXT NOT NULL DEFAULT '(not set)',
  purchase_revenue NUMERIC NOT NULL DEFAULT 0,
  ecommerce_purchases INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, date, session_source, session_medium)
);

CREATE TABLE public.ga4_sync_cursors (
  project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  report TEXT NOT NULL CHECK (report IN ('overview', 'pages', 'acquisition', 'events', 'sales')),
  backfill_next_end DATE,
  backfill_complete BOOLEAN NOT NULL DEFAULT false,
  empty_windows INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, property_id, report)
);

CREATE TABLE public.ga4_sync_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT,
  report TEXT,
  mode TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('running', 'success', 'error', 'quota')),
  start_date DATE,
  end_date DATE,
  rows_fetched INTEGER NOT NULL DEFAULT 0,
  rows_written INTEGER NOT NULL DEFAULT 0,
  attempt INTEGER NOT NULL DEFAULT 1,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.ga4_sync_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  property_id TEXT,
  report TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'quota')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ga4_overview_daily_date ON public.ga4_overview_daily (date DESC);
CREATE INDEX idx_ga4_pages_daily_project_date ON public.ga4_pages_daily (project_id, date DESC);
CREATE INDEX idx_ga4_acquisition_daily_project_date ON public.ga4_acquisition_daily (project_id, date DESC);
CREATE INDEX idx_ga4_events_daily_project_date ON public.ga4_events_daily (project_id, date DESC);
CREATE INDEX idx_ga4_sales_daily_project_date ON public.ga4_sales_daily (project_id, date DESC);
CREATE INDEX idx_ga4_sync_runs_started ON public.ga4_sync_runs (started_at DESC);
CREATE INDEX idx_ga4_sync_alerts_unread ON public.ga4_sync_alerts (project_id, created_at DESC) WHERE NOT is_read;

ALTER TABLE public.ga4_overview_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_pages_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_acquisition_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_events_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_sales_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_sync_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_sync_alerts ENABLE ROW LEVEL SECURITY;

-- Owners can read history. They cannot insert, update, or delete it.
-- The sync worker uses the service role and only upserts.

CREATE POLICY "Users can read GA4 overview history"
ON public.ga4_overview_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_overview_daily.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 page history"
ON public.ga4_pages_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_pages_daily.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 acquisition history"
ON public.ga4_acquisition_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_acquisition_daily.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 event history"
ON public.ga4_events_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_events_daily.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 sales history"
ON public.ga4_sales_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sales_daily.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 sync cursors"
ON public.ga4_sync_cursors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sync_cursors.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 sync runs"
ON public.ga4_sync_runs FOR SELECT
USING (
  project_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sync_runs.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read GA4 sync alerts"
ON public.ga4_sync_alerts FOR SELECT
USING (
  project_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sync_alerts.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark GA4 sync alerts read"
ON public.ga4_sync_alerts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sync_alerts.project_id
      AND seo_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_projects
    WHERE seo_projects.id = ga4_sync_alerts.project_id
      AND seo_projects.user_id = auth.uid()
  )
);

GRANT SELECT ON public.ga4_overview_daily, public.ga4_pages_daily, public.ga4_acquisition_daily,
  public.ga4_events_daily, public.ga4_sales_daily, public.ga4_sync_cursors, public.ga4_sync_runs,
  public.ga4_sync_alerts TO authenticated;
GRANT UPDATE ON public.ga4_sync_alerts TO authenticated;

-- Range reads stay in SQL so the browser does not download every daily page row.

CREATE OR REPLACE FUNCTION public.ga4_history_overview(
  p_project_id UUID,
  p_start DATE,
  p_end DATE
)
RETURNS TABLE (
  date DATE,
  active_users BIGINT,
  sessions BIGINT,
  screen_page_views BIGINT,
  average_session_duration NUMERIC,
  bounce_rate NUMERIC,
  engagement_rate NUMERIC,
  conversions NUMERIC,
  purchase_revenue NUMERIC,
  ecommerce_purchases BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    d.date,
    SUM(d.active_users)::BIGINT,
    SUM(d.sessions)::BIGINT,
    SUM(d.screen_page_views)::BIGINT,
    CASE WHEN SUM(d.sessions) = 0 THEN AVG(d.average_session_duration)
         ELSE SUM(d.average_session_duration * d.sessions) / SUM(d.sessions) END,
    CASE WHEN SUM(d.sessions) = 0 THEN AVG(d.bounce_rate)
         ELSE SUM(d.bounce_rate * d.sessions) / SUM(d.sessions) END,
    CASE WHEN SUM(d.sessions) = 0 THEN AVG(d.engagement_rate)
         ELSE SUM(d.engagement_rate * d.sessions) / SUM(d.sessions) END,
    SUM(d.conversions),
    SUM(d.purchase_revenue),
    SUM(d.ecommerce_purchases)::BIGINT
  FROM public.ga4_overview_daily d
  WHERE (p_project_id IS NULL OR d.project_id = p_project_id)
    AND d.date BETWEEN p_start AND p_end
  GROUP BY d.date
  ORDER BY d.date;
$$;

CREATE OR REPLACE FUNCTION public.ga4_history_pages(
  p_project_id UUID,
  p_start DATE,
  p_end DATE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  page_path TEXT,
  page_title TEXT,
  screen_page_views BIGINT,
  active_users BIGINT,
  sessions BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    page_path,
    MAX(page_title),
    SUM(screen_page_views)::BIGINT,
    SUM(active_users)::BIGINT,
    SUM(sessions)::BIGINT
  FROM public.ga4_pages_daily
  WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND date BETWEEN p_start AND p_end
  GROUP BY page_path
  ORDER BY SUM(screen_page_views) DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1);
$$;

CREATE OR REPLACE FUNCTION public.ga4_history_acquisition(
  p_project_id UUID,
  p_start DATE,
  p_end DATE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  session_source TEXT,
  session_medium TEXT,
  sessions BIGINT,
  active_users BIGINT,
  screen_page_views BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    session_source,
    session_medium,
    SUM(sessions)::BIGINT,
    SUM(active_users)::BIGINT,
    SUM(screen_page_views)::BIGINT
  FROM public.ga4_acquisition_daily
  WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND date BETWEEN p_start AND p_end
  GROUP BY session_source, session_medium
  ORDER BY SUM(sessions) DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1);
$$;

CREATE OR REPLACE FUNCTION public.ga4_history_events(
  p_project_id UUID,
  p_start DATE,
  p_end DATE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  event_name TEXT,
  event_count BIGINT,
  active_users BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    event_name,
    SUM(event_count)::BIGINT,
    SUM(active_users)::BIGINT
  FROM public.ga4_events_daily
  WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND date BETWEEN p_start AND p_end
  GROUP BY event_name
  ORDER BY SUM(event_count) DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1);
$$;

CREATE OR REPLACE FUNCTION public.ga4_history_sales(
  p_project_id UUID,
  p_start DATE,
  p_end DATE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  session_source TEXT,
  session_medium TEXT,
  purchase_revenue NUMERIC,
  ecommerce_purchases BIGINT,
  sessions BIGINT,
  currency_code TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    session_source,
    session_medium,
    SUM(purchase_revenue),
    SUM(ecommerce_purchases)::BIGINT,
    SUM(sessions)::BIGINT,
    MAX(currency_code)
  FROM public.ga4_sales_daily
  WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND date BETWEEN p_start AND p_end
  GROUP BY session_source, session_medium
  ORDER BY SUM(purchase_revenue) DESC, SUM(ecommerce_purchases) DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1);
$$;

CREATE OR REPLACE FUNCTION public.ga4_history_properties(
  p_start DATE,
  p_end DATE
)
RETURNS TABLE (
  project_id UUID,
  property_id TEXT,
  sessions BIGINT,
  active_users BIGINT,
  screen_page_views BIGINT,
  purchase_revenue NUMERIC,
  ecommerce_purchases BIGINT,
  currency_code TEXT,
  latest_date DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    project_id,
    property_id,
    SUM(sessions)::BIGINT,
    SUM(active_users)::BIGINT,
    SUM(screen_page_views)::BIGINT,
    SUM(purchase_revenue),
    SUM(ecommerce_purchases)::BIGINT,
    MAX(currency_code),
    MAX(date)
  FROM public.ga4_overview_daily
  WHERE date BETWEEN p_start AND p_end
  GROUP BY project_id, property_id
  ORDER BY SUM(sessions) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.ga4_history_overview(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ga4_history_pages(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ga4_history_acquisition(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ga4_history_events(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ga4_history_sales(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ga4_history_properties(DATE, DATE) TO authenticated;
