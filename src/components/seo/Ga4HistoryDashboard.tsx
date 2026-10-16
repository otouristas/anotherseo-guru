import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type OverviewRow = {
  date: string;
  active_users: number;
  sessions: number;
  screen_page_views: number;
  average_session_duration: number;
  bounce_rate: number;
  engagement_rate: number;
  conversions: number;
  purchase_revenue: number;
  ecommerce_purchases: number;
};

type PageRow = {
  page_path: string;
  page_title: string;
  screen_page_views: number;
  active_users: number;
  sessions: number;
};

type AcquisitionRow = {
  session_source: string;
  session_medium: string;
  sessions: number;
  active_users: number;
  screen_page_views: number;
};

type EventRow = { event_name: string; event_count: number; active_users: number };

type SalesRow = {
  session_source: string;
  session_medium: string;
  purchase_revenue: number;
  ecommerce_purchases: number;
  sessions: number;
  currency_code: string;
};

type PropertyRow = {
  project_id: string;
  property_id: string;
  sessions: number;
  active_users: number;
  screen_page_views: number;
  purchase_revenue: number;
  ecommerce_purchases: number;
  currency_code: string | null;
  latest_date: string;
};

type AlertRow = { id: string; message: string; severity: string; created_at: string; property_id: string | null };

interface Ga4HistoryDashboardProps {
  projectId: string | null;
  projectName?: string;
  showPortfolio?: boolean;
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addUtcDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function asNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString();
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}m ${total % 60}s`;
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function Ga4HistoryDashboard({
  projectId,
  projectName,
  showPortfolio = false,
}: Ga4HistoryDashboardProps) {
  const { toast } = useToast();
  const [start, setStart] = useState(() => addUtcDays(utcToday(), -29));
  const [end, setEnd] = useState(() => utcToday());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [acquisition, setAcquisition] = useState<AcquisitionRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [sales, setSales] = useState<SalesRow[]>([]);
  const [portfolio, setPortfolio] = useState<PropertyRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const range = { p_project_id: projectId, p_start: start, p_end: end };
    let alertQuery = supabase
      .from("ga4_sync_alerts")
      .select("id, message, severity, created_at, property_id")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(8);
    let runQuery = supabase
      .from("ga4_sync_runs")
      .select("finished_at, state")
      .order("started_at", { ascending: false })
      .limit(1);
    if (projectId) {
      alertQuery = alertQuery.eq("project_id", projectId);
      runQuery = runQuery.eq("project_id", projectId);
    }

    const [overviewResult, pagesResult, acquisitionResult, eventsResult, salesResult, portfolioResult, alertResult, runResult] =
      await Promise.all([
        supabase.rpc("ga4_history_overview", range),
        supabase.rpc("ga4_history_pages", { ...range, p_limit: 50 }),
        supabase.rpc("ga4_history_acquisition", { ...range, p_limit: 50 }),
        supabase.rpc("ga4_history_events", { ...range, p_limit: 50 }),
        supabase.rpc("ga4_history_sales", { ...range, p_limit: 50 }),
        showPortfolio
          ? supabase.rpc("ga4_history_properties", { p_start: start, p_end: end })
          : Promise.resolve({ data: [] as PropertyRow[], error: null }),
        alertQuery,
        runQuery,
      ]);

    const firstError = [overviewResult.error, pagesResult.error, acquisitionResult.error, eventsResult.error, salesResult.error, portfolioResult.error]
      .find(Boolean);
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setOverview((overviewResult.data ?? []).map((row) => ({
      date: row.date,
      active_users: asNumber(row.active_users),
      sessions: asNumber(row.sessions),
      screen_page_views: asNumber(row.screen_page_views),
      average_session_duration: asNumber(row.average_session_duration),
      bounce_rate: asNumber(row.bounce_rate),
      engagement_rate: asNumber(row.engagement_rate),
      conversions: asNumber(row.conversions),
      purchase_revenue: asNumber(row.purchase_revenue),
      ecommerce_purchases: asNumber(row.ecommerce_purchases),
    })));
    setPages((pagesResult.data ?? []).map((row) => ({
      page_path: row.page_path,
      page_title: row.page_title,
      screen_page_views: asNumber(row.screen_page_views),
      active_users: asNumber(row.active_users),
      sessions: asNumber(row.sessions),
    })));
    setAcquisition((acquisitionResult.data ?? []).map((row) => ({
      session_source: row.session_source,
      session_medium: row.session_medium,
      sessions: asNumber(row.sessions),
      active_users: asNumber(row.active_users),
      screen_page_views: asNumber(row.screen_page_views),
    })));
    setEvents((eventsResult.data ?? []).map((row) => ({
      event_name: row.event_name,
      event_count: asNumber(row.event_count),
      active_users: asNumber(row.active_users),
    })));
    setSales((salesResult.data ?? []).map((row) => ({
      session_source: row.session_source,
      session_medium: row.session_medium,
      purchase_revenue: asNumber(row.purchase_revenue),
      ecommerce_purchases: asNumber(row.ecommerce_purchases),
      sessions: asNumber(row.sessions),
      currency_code: row.currency_code,
    })));
    setPortfolio((portfolioResult.data ?? []).map((row) => ({
      project_id: row.project_id,
      property_id: row.property_id,
      sessions: asNumber(row.sessions),
      active_users: asNumber(row.active_users),
      screen_page_views: asNumber(row.screen_page_views),
      purchase_revenue: asNumber(row.purchase_revenue),
      ecommerce_purchases: asNumber(row.ecommerce_purchases),
      currency_code: row.currency_code,
      latest_date: row.latest_date,
    })));
    setAlerts((alertResult.data ?? []) as AlertRow[]);
    setLastSync(runResult.data?.[0]?.finished_at ?? null);
    setLoading(false);
  }, [end, projectId, showPortfolio, start]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    return overview.reduce(
      (sum, row) => ({
        sessions: sum.sessions + row.sessions,
        views: sum.views + row.screen_page_views,
        users: sum.users + row.active_users,
        revenue: sum.revenue + row.purchase_revenue,
        purchases: sum.purchases + row.ecommerce_purchases,
        durationWeight: sum.durationWeight + row.average_session_duration * row.sessions,
        bounceWeight: sum.bounceWeight + row.bounce_rate * row.sessions,
      }),
      { sessions: 0, views: 0, users: 0, revenue: 0, purchases: 0, durationWeight: 0, bounceWeight: 0 },
    );
  }, [overview]);

  const refreshToday = async () => {
    if (!projectId) return;
    setRefreshing(true);
    const { data, error: refreshError } = await supabase.functions.invoke("ga4-nightly-sync", {
      body: { mode: "today", projectId },
    });
    setRefreshing(false);
    if (refreshError) {
      let description = refreshError.message;
      const context = "context" in refreshError ? refreshError.context : null;
      if (context instanceof Response) {
        const body = await context.clone().json().catch(() => null);
        if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
          description = body.error;
        }
      }
      toast({
        title: "Today's refresh failed",
        description,
        variant: "destructive",
      });
      return;
    }
    const charged = Boolean(data && typeof data === "object" && "creditsCharged" in data && data.creditsCharged);
    toast({
      title: "Today refreshed",
      description: charged
        ? "Today's Analytics rows were stored. 2 credits were used."
        : "Today's Analytics rows were stored.",
    });
    await load();
  };

  const markAlertsRead = async () => {
    const ids = alerts.map((alert) => alert.id);
    if (!ids.length) return;
    await supabase.from("ga4_sync_alerts").update({ is_read: true }).in("id", ids);
    setAlerts([]);
  };

  const includesToday = start <= utcToday() && end >= utcToday();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Analytics</h2>
          <p className="text-sm text-muted-foreground">
            {projectName ? `${projectName}. ` : ""}
            Stored history loads for any date range. Dates are UTC.
            {lastSync ? ` Last sync ${new Date(lastSync).toLocaleString()}.` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Start</span>
            <input
              type="date"
              value={start}
              max={end}
              onChange={(event) => setStart(event.target.value)}
              className="h-10 rounded-md border bg-background px-3"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">End</span>
            <input
              type="date"
              value={end}
              min={start}
              max={utcToday()}
              onChange={(event) => setEnd(event.target.value)}
              className="h-10 rounded-md border bg-background px-3"
            />
          </label>
          <Button variant="outline" onClick={() => void refreshToday()} disabled={!projectId || refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing today" : "Refresh today"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Reading this history does not use credits.
        {projectId
          ? " Refresh today fetches only today's rows from Google and uses 2 credits."
          : " Choose one property before refreshing today."}
        {includesToday ? "" : " Include today in the range to see a refresh."}
      </p>

      {alerts.length > 0 && (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {alerts.map((alert) => (
              <p key={alert.id} className="flex gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{alert.message}</span>
              </p>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => void markAlertsRead()}>
            Mark read
          </Button>
        </Card>
      )}

      {showPortfolio && (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">All properties</h3>
          {portfolio.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stored Analytics rows in this range yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Property</th>
                    <th className="py-2 pr-3 text-right">Sessions</th>
                    <th className="py-2 pr-3 text-right">Views</th>
                    <th className="py-2 pr-3 text-right">Revenue</th>
                    <th className="py-2 text-right">Through</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((row) => (
                    <tr key={`${row.project_id}:${row.property_id}`} className="border-b">
                      <td className="py-2 pr-3">
                        <Link className="font-medium hover:underline" to={`/app/performance/analytics?project=${row.project_id}`}>
                          {row.property_id}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-right">{formatCount(row.sessions)}</td>
                      <td className="py-2 pr-3 text-right">{formatCount(row.screen_page_views)}</td>
                      <td className="py-2 pr-3 text-right">
                        {row.purchase_revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {row.currency_code ?? ""}
                      </td>
                      <td className="py-2 text-right">{row.latest_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading stored Analytics…</Card>
      ) : error ? (
        <Card className="space-y-3 p-8 text-center">
          <p>{error}</p>
          <Button variant="outline" onClick={() => void load()}>Try again</Button>
        </Card>
      ) : overview.length === 0 && pages.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold">No stored Analytics for this range</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The nightly sync keeps history for every connected property. Connect Analytics, then wait for the next sync or refresh today.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Sessions" value={formatCount(totals.sessions)} />
            <Metric label="Views" value={formatCount(totals.views)} />
            <Metric
              label="Avg. session"
              value={totals.sessions > 0 ? formatDuration(totals.durationWeight / totals.sessions) : "—"}
            />
            <Metric
              label="Bounce rate"
              value={totals.sessions > 0 ? formatPercent(totals.bounceWeight / totals.sessions) : "—"}
            />
          </div>
          <Card className="p-4">
            <h3 className="mb-3 font-semibold">Sessions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#3b82f6" dot={false} name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Active users are unique per day ({formatCount(totals.users)} summed across days) and are not one audience for the whole range.
            </p>
          </Card>
          <Tabs defaultValue="pages">
            <TabsList>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            <TabsContent value="pages">
              <SimpleTable
                columns={["Page", "Views", "Sessions", "Active users"]}
                rows={pages.map((row) => [row.page_path, formatCount(row.screen_page_views), formatCount(row.sessions), formatCount(row.active_users)])}
                empty="No page rows in this range."
              />
            </TabsContent>
            <TabsContent value="acquisition">
              <SimpleTable
                columns={["Source", "Medium", "Sessions", "Views"]}
                rows={acquisition.map((row) => [row.session_source, row.session_medium, formatCount(row.sessions), formatCount(row.screen_page_views)])}
                empty="No acquisition rows in this range."
              />
            </TabsContent>
            <TabsContent value="events">
              <SimpleTable
                columns={["Event", "Count", "Active users"]}
                rows={events.map((row) => [row.event_name, formatCount(row.event_count), formatCount(row.active_users)])}
                empty="No event rows in this range."
              />
            </TabsContent>
            <TabsContent value="sales">
              <SimpleTable
                columns={["Source", "Medium", "Revenue", "Purchases", "Sessions"]}
                rows={sales.map((row) => [
                  row.session_source,
                  row.session_medium,
                  `${row.purchase_revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${row.currency_code}`,
                  formatCount(row.ecommerce_purchases),
                  formatCount(row.sessions),
                ])}
                empty="No sales rows in this range. Sales stay in history once the nightly sync has seen them."
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

function SimpleTable({ columns, rows, empty }: { columns: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) {
    return <Card className="p-6 text-sm text-muted-foreground">{empty}</Card>;
  }
  return (
    <Card className="overflow-x-auto p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            {columns.map((column) => (
              <th key={column} className="py-2 pr-3 last:text-right">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}:${index}`} className="border-b">
              {row.map((cell, cellIndex) => (
                <td key={`${columns[cellIndex]}:${cell}`} className="max-w-sm truncate py-2 pr-3 last:text-right">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
