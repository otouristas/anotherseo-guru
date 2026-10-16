/**
 * Pure GA4 history planning. The nightly worker and the unit tests both use this
 * module so quota, retry, and backfill decisions stay out of the database client.
 *
 * History is append-only. Callers upsert a date window and must not delete rows.
 */

export const GA4_HISTORY_FLOOR = "2015-08-14";
export const BACKFILL_WINDOW_DAYS = 28;
export const EMPTY_WINDOWS_BEFORE_COMPLETE = 3;
export const QUOTA_REMAINING_FLOOR = 500;
export const MAX_RETRY_ATTEMPTS = 4;
export const MANUAL_REFRESH_CREDITS = 2;

export const GA4_REPORTS = ["overview", "pages", "acquisition", "events", "sales"] as const;
export type Ga4Report = (typeof GA4_REPORTS)[number];

export type SyncCursor = {
  report: Ga4Report;
  backfill_next_end: string | null;
  backfill_complete: boolean;
  empty_windows: number;
};

export type SyncJob = {
  kind: "incremental" | "backfill";
  report: Ga4Report;
  start: string;
  end: string;
};

export type PropertyQuota = {
  tokensPerHour?: { remaining?: number };
  tokensPerProjectPerHour?: { remaining?: number };
  tokensPerDay?: { remaining?: number };
};

type MetricMap = Record<string, number>;
type DimensionMap = Record<string, string>;

export type Ga4ApiRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

export type Ga4ApiReport = {
  dimensionHeaders?: Array<{ name?: string }>;
  metricHeaders?: Array<{ name?: string }>;
  rows?: Ga4ApiRow[];
  metadata?: { currencyCode?: string };
  propertyQuota?: PropertyQuota;
};

export type OverviewRow = {
  project_id: string;
  property_id: string;
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
  currency_code: string | null;
};

export type PageRow = {
  project_id: string;
  property_id: string;
  date: string;
  page_path: string;
  page_title: string;
  screen_page_views: number;
  active_users: number;
  sessions: number;
};

export type AcquisitionRow = {
  project_id: string;
  property_id: string;
  date: string;
  session_source: string;
  session_medium: string;
  sessions: number;
  active_users: number;
  screen_page_views: number;
};

export type EventRow = {
  project_id: string;
  property_id: string;
  date: string;
  event_name: string;
  event_count: number;
  active_users: number;
};

export type SalesRow = {
  project_id: string;
  property_id: string;
  date: string;
  session_source: string;
  session_medium: string;
  purchase_revenue: number;
  ecommerce_purchases: number;
  sessions: number;
  currency_code: string;
};

export type MappedRows =
  | { report: "overview"; rows: OverviewRow[] }
  | { report: "pages"; rows: PageRow[] }
  | { report: "acquisition"; rows: AcquisitionRow[] }
  | { report: "events"; rows: EventRow[] }
  | { report: "sales"; rows: SalesRow[] };

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

export function ga4DimensionDate(value: string): string {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value;
}

export function normalizePropertyId(raw: string): string {
  return raw.trim().replace(/^properties\//, "");
}

export function propertyResource(propertyId: string): string {
  return `properties/${normalizePropertyId(propertyId)}`;
}

export function incrementalWindow(todayIso: string): { start: string; end: string } {
  return { start: addDays(todayIso, -2), end: todayIso };
}

export function nextBackfillWindow(
  nextEnd: string | null,
  todayIso: string,
): { start: string; end: string } | null {
  const end = nextEnd ?? addDays(todayIso, -3);
  if (end < GA4_HISTORY_FLOOR) return null;
  const startCandidate = addDays(end, -(BACKFILL_WINDOW_DAYS - 1));
  const start = startCandidate < GA4_HISTORY_FLOOR ? GA4_HISTORY_FLOOR : startCandidate;
  if (start > end) return null;
  return { start, end };
}

export function jobsForProperty(
  cursors: SyncCursor[],
  todayIso: string,
  includeIncremental: boolean,
): SyncJob[] {
  const jobs: SyncJob[] = [];
  if (includeIncremental) {
    const window = incrementalWindow(todayIso);
    for (const report of GA4_REPORTS) {
      jobs.push({ kind: "incremental", report, start: window.start, end: window.end });
    }
  }
  for (const report of GA4_REPORTS) {
    const cursor = cursors.find((item) => item.report === report);
    if (cursor?.backfill_complete) continue;
    const window = nextBackfillWindow(cursor?.backfill_next_end ?? null, todayIso);
    if (!window) continue;
    jobs.push({ kind: "backfill", report, start: window.start, end: window.end });
  }
  return jobs;
}

export function advanceBackfill(
  window: { start: string; end: string },
  rowCount: number,
  emptyWindows: number,
): { nextEnd: string; emptyWindows: number; complete: boolean } {
  const nextEnd = addDays(window.start, -1);
  const nextEmpty = rowCount === 0 ? emptyWindows + 1 : 0;
  const complete = nextEnd < GA4_HISTORY_FLOOR || nextEmpty >= EMPTY_WINDOWS_BEFORE_COMPLETE;
  return { nextEnd, emptyWindows: nextEmpty, complete };
}

export function shouldStopForQuota(quota: PropertyQuota | undefined): boolean {
  if (!quota) return false;
  const buckets = [quota.tokensPerHour?.remaining, quota.tokensPerProjectPerHour?.remaining, quota.tokensPerDay?.remaining];
  return buckets.some((remaining) => typeof remaining === "number" && remaining < QUOTA_REMAINING_FLOOR);
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

export function retryDelayMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 60_000);
    const parsed = Date.parse(retryAfterHeader);
    if (!Number.isNaN(parsed)) return Math.min(Math.max(parsed - Date.now(), 0), 60_000);
  }
  return Math.min(1000 * 2 ** Math.max(attempt - 1, 0), 30_000);
}

export function isHistoryFloorError(status: number, message: string): boolean {
  if (status !== 400) return false;
  return /startDate|date range|data retention/i.test(message);
}

export function reportRequest(
  report: Ga4Report,
  start: string,
  end: string,
  offset: number,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    dateRanges: [{ startDate: start, endDate: end }],
    returnPropertyQuota: true,
    keepEmptyRows: false,
    limit: 10000,
    offset,
  };
  switch (report) {
    case "overview":
      return {
        ...base,
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "engagementRate" },
          { name: "conversions" },
          { name: "purchaseRevenue" },
          { name: "ecommercePurchases" },
        ],
      };
    case "pages":
      return {
        ...base,
        dimensions: [{ name: "date" }, { name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      };
    case "acquisition":
      return {
        ...base,
        dimensions: [{ name: "date" }, { name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      };
    case "events":
      return {
        ...base,
        dimensions: [{ name: "date" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      };
    case "sales":
      return {
        ...base,
        dimensions: [{ name: "date" }, { name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "purchaseRevenue" }, { name: "ecommercePurchases" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "purchaseRevenue" }, desc: true }],
      };
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}

export function conflictColumns(report: Ga4Report): string {
  switch (report) {
    case "overview":
      return "project_id,property_id,date";
    case "pages":
      return "project_id,property_id,date,page_path";
    case "acquisition":
      return "project_id,property_id,date,session_source,session_medium";
    case "events":
      return "project_id,property_id,date,event_name";
    case "sales":
      return "project_id,property_id,date,session_source,session_medium";
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}

export function tableForReport(report: Ga4Report): string {
  switch (report) {
    case "overview":
      return "ga4_overview_daily";
    case "pages":
      return "ga4_pages_daily";
    case "acquisition":
      return "ga4_acquisition_daily";
    case "events":
      return "ga4_events_daily";
    case "sales":
      return "ga4_sales_daily";
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}

function num(metrics: MetricMap, name: string): number {
  const value = metrics[name];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function dim(dimensions: DimensionMap, name: string): string {
  const value = dimensions[name]?.trim();
  return value ? value : "(not set)";
}

export function indexReport(report: Ga4ApiReport): Array<{ dimensions: DimensionMap; metrics: MetricMap }> {
  const dimensionNames = (report.dimensionHeaders ?? []).map((header) => header.name ?? "");
  const metricNames = (report.metricHeaders ?? []).map((header) => header.name ?? "");
  return (report.rows ?? []).map((row) => {
    const dimensions: DimensionMap = {};
    dimensionNames.forEach((name, index) => {
      dimensions[name] = row.dimensionValues?.[index]?.value ?? "";
    });
    const metrics: MetricMap = {};
    metricNames.forEach((name, index) => {
      const raw = row.metricValues?.[index]?.value;
      const parsed = raw === undefined || raw.trim() === "" ? 0 : Number(raw);
      metrics[name] = Number.isFinite(parsed) ? parsed : 0;
    });
    return { dimensions, metrics };
  });
}

export function mapReport(
  report: Ga4Report,
  projectId: string,
  propertyId: string,
  apiReport: Ga4ApiReport,
): MappedRows {
  const currency = apiReport.metadata?.currencyCode ?? null;
  const indexed = indexReport(apiReport);
  switch (report) {
    case "overview":
      return {
        report,
        rows: indexed.map((row) => ({
          project_id: projectId,
          property_id: propertyId,
          date: ga4DimensionDate(dim(row.dimensions, "date")),
          active_users: Math.round(num(row.metrics, "activeUsers")),
          sessions: Math.round(num(row.metrics, "sessions")),
          screen_page_views: Math.round(num(row.metrics, "screenPageViews")),
          average_session_duration: num(row.metrics, "averageSessionDuration"),
          bounce_rate: num(row.metrics, "bounceRate"),
          engagement_rate: num(row.metrics, "engagementRate"),
          conversions: num(row.metrics, "conversions"),
          purchase_revenue: num(row.metrics, "purchaseRevenue"),
          ecommerce_purchases: Math.round(num(row.metrics, "ecommercePurchases")),
          currency_code: currency,
        })),
      };
    case "pages":
      return {
        report,
        rows: indexed.map((row) => ({
          project_id: projectId,
          property_id: propertyId,
          date: ga4DimensionDate(dim(row.dimensions, "date")),
          page_path: dim(row.dimensions, "pagePath"),
          page_title: dim(row.dimensions, "pageTitle"),
          screen_page_views: Math.round(num(row.metrics, "screenPageViews")),
          active_users: Math.round(num(row.metrics, "activeUsers")),
          sessions: Math.round(num(row.metrics, "sessions")),
        })),
      };
    case "acquisition":
      return {
        report,
        rows: indexed.map((row) => ({
          project_id: projectId,
          property_id: propertyId,
          date: ga4DimensionDate(dim(row.dimensions, "date")),
          session_source: dim(row.dimensions, "sessionSource"),
          session_medium: dim(row.dimensions, "sessionMedium"),
          sessions: Math.round(num(row.metrics, "sessions")),
          active_users: Math.round(num(row.metrics, "activeUsers")),
          screen_page_views: Math.round(num(row.metrics, "screenPageViews")),
        })),
      };
    case "events":
      return {
        report,
        rows: indexed.map((row) => ({
          project_id: projectId,
          property_id: propertyId,
          date: ga4DimensionDate(dim(row.dimensions, "date")),
          event_name: dim(row.dimensions, "eventName"),
          event_count: Math.round(num(row.metrics, "eventCount")),
          active_users: Math.round(num(row.metrics, "activeUsers")),
        })),
      };
    case "sales":
      return {
        report,
        rows: indexed.map((row) => ({
          project_id: projectId,
          property_id: propertyId,
          date: ga4DimensionDate(dim(row.dimensions, "date")),
          session_source: dim(row.dimensions, "sessionSource"),
          session_medium: dim(row.dimensions, "sessionMedium"),
          purchase_revenue: num(row.metrics, "purchaseRevenue"),
          ecommerce_purchases: Math.round(num(row.metrics, "ecommercePurchases")),
          sessions: Math.round(num(row.metrics, "sessions")),
          currency_code: currency ?? "USD",
        })),
      };
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}
