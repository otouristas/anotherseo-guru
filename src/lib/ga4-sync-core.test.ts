import { describe, expect, it } from "vitest";
import {
  GA4_HISTORY_FLOOR,
  GA4_REPORTS,
  advanceBackfill,
  conflictColumns,
  ga4DimensionDate,
  incrementalWindow,
  isHistoryFloorError,
  isRetryableStatus,
  jobsForProperty,
  mapReport,
  nextBackfillWindow,
  reportRequest,
  retryDelayMs,
  shouldStopForQuota,
  tableForReport,
  type Ga4Report,
} from "../../supabase/functions/_shared/ga4-sync-core";

const projectId = "11111111-1111-1111-1111-111111111111";
const propertyId = "123456789";

describe("GA4 history planning", () => {
  it("refreshes the last three UTC days and backfills older windows without deleting", () => {
    const jobs = jobsForProperty([], "2026-10-16", true);
    expect(jobs.filter((job) => job.kind === "incremental")).toEqual(
      GA4_REPORTS.map((report) => ({
        kind: "incremental",
        report,
        ...incrementalWindow("2026-10-16"),
      })),
    );
    const backfill = jobs.filter((job) => job.kind === "backfill");
    expect(backfill).toHaveLength(5);
    expect(backfill[0]).toMatchObject({ start: "2026-09-16", end: "2026-10-13" });
    expect(JSON.stringify(jobs)).not.toContain("delete");
  });

  it("stops backfill after three empty windows and at the API floor", () => {
    const first = nextBackfillWindow(null, "2026-10-16");
    expect(first).toEqual({ start: "2026-08-17", end: "2026-10-13" });
    const empty = advanceBackfill(first!, 0, 2);
    expect(empty.complete).toBe(true);
    expect(empty.emptyWindows).toBe(3);

    const withRows = advanceBackfill(first!, 4, 2);
    expect(withRows.complete).toBe(false);
    expect(withRows.emptyWindows).toBe(0);
    expect(withRows.nextEnd).toBe("2026-09-15");

    const floorWindow = { start: GA4_HISTORY_FLOOR, end: "2015-08-20" };
    expect(advanceBackfill(floorWindow, 1, 0).complete).toBe(true);
    expect(nextBackfillWindow("2015-08-13", "2026-10-16")).toBeNull();
  });

  it("skips reports whose backfill is already complete", () => {
    const jobs = jobsForProperty(
      GA4_REPORTS.map((report) => ({
        report,
        backfill_next_end: "2024-01-01",
        backfill_complete: report !== "sales",
        empty_windows: 0,
      })),
      "2026-10-16",
      false,
    );
    expect(jobs.map((job) => job.report)).toEqual(["sales"]);
  });

  it("classifies quota and retries", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(403)).toBe(false);
    expect(retryDelayMs(1, null)).toBe(1000);
    expect(retryDelayMs(3, null)).toBe(4000);
    expect(retryDelayMs(1, "2")).toBe(2000);
    expect(shouldStopForQuota({ tokensPerProjectPerHour: { remaining: 499 } })).toBe(true);
    expect(shouldStopForQuota({ tokensPerHour: { remaining: 5000 } })).toBe(false);
    expect(shouldStopForQuota(undefined)).toBe(false);
    expect(isHistoryFloorError(400, "startDate is before data retention")).toBe(true);
    expect(isHistoryFloorError(403, "startDate is before data retention")).toBe(false);
  });

  it("maps each report onto an upsert row and never a delete", () => {
    const api = {
      dimensionHeaders: [{ name: "date" }, { name: "pagePath" }, { name: "pageTitle" }, { name: "sessionSource" }, { name: "sessionMedium" }, { name: "eventName" }],
      metricHeaders: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "engagementRate" },
        { name: "conversions" },
        { name: "purchaseRevenue" },
        { name: "ecommercePurchases" },
        { name: "eventCount" },
      ],
      rows: [{
        dimensionValues: [
          { value: "20261015" },
          { value: "/pricing" },
          { value: "Pricing" },
          { value: "google" },
          { value: "organic" },
          { value: "purchase" },
        ],
        metricValues: [
          { value: "3" },
          { value: "4" },
          { value: "9" },
          { value: "12.5" },
          { value: "0.25" },
          { value: "0.75" },
          { value: "1" },
          { value: "19.5" },
          { value: "1" },
          { value: "8" },
        ],
      }],
      metadata: { currencyCode: "EUR" },
    };

    for (const report of GA4_REPORTS) {
      const mapped = mapReport(report, projectId, propertyId, api);
      expect(mapped.rows.length).toBe(1);
      expect(mapped.rows[0]).toMatchObject({ project_id: projectId, property_id: propertyId, date: "2026-10-15" });
      expect(tableForReport(report).length).toBeGreaterThan(0);
      expect(conflictColumns(report)).toContain("project_id,property_id,date");
      const request = reportRequest(report, "2026-10-01", "2026-10-15", 0);
      expect(request).not.toHaveProperty("delete");
      expect(request.returnPropertyQuota).toBe(true);
    }

    const sales = mapReport("sales", projectId, propertyId, api);
    if (sales.report !== "sales") throw new Error("expected sales");
    expect(sales.rows[0].currency_code).toBe("EUR");
    expect(sales.rows[0].purchase_revenue).toBe(19.5);
    expect(ga4DimensionDate("20261015")).toBe("2026-10-15");
  });

  it("keeps the report switch exhaustive", () => {
    const labels = GA4_REPORTS.map((report) => label(report));
    expect(labels).toEqual(["overview", "pages", "acquisition", "events", "sales"]);
  });
});

function label(report: Ga4Report): string {
  switch (report) {
    case "overview":
    case "pages":
    case "acquisition":
    case "events":
    case "sales":
      return report;
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}
