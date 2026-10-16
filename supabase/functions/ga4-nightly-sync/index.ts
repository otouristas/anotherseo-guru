import { createClient } from "npm:@supabase/supabase-js@2";
import {
  GA4_REPORTS,
  MANUAL_REFRESH_CREDITS,
  MAX_RETRY_ATTEMPTS,
  advanceBackfill,
  conflictColumns,
  incrementalWindow,
  isHistoryFloorError,
  isRetryableStatus,
  jobsForProperty,
  mapReport,
  normalizePropertyId,
  propertyResource,
  reportRequest,
  retryDelayMs,
  shouldStopForQuota,
  tableForReport,
  type Ga4ApiReport,
  type Ga4Report,
  type SyncCursor,
  type SyncJob,
} from "../_shared/ga4-sync-core.ts";

/**
 * Nightly GA4 history sync.
 *
 * Quota (Analytics Data API core tokens, standard properties):
 *   200,000 / property / day, 40,000 / property / hour,
 *   14,000 / project / property / hour, 10 concurrent requests / property.
 * This worker runs one request at a time, sends returnPropertyQuota, and stops
 * a property when any remaining bucket drops below 500 tokens. 429, 500, and
 * 503 retry up to 4 times with exponential backoff, honoring Retry-After.
 *
 * History is upserted. This function never deletes stored rows.
 * Backfill walks 28-day windows toward 2015-08-14 (the earliest start date the
 * Data API accepts) until three consecutive empty windows or that floor.
 * A nightly run refreshes the last 3 days, then continues backfill until the
 * time budget. Further windows resume on the next hop or the next night.
 *
 * Manual mode "today" refreshes a single owned property for today and charges
 * MANUAL_REFRESH_CREDITS (2) after Google returns data, matching the previous
 * on-demand report cost. Reading stored history does not charge credits.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-ga4-sync-secret",
};

const TIME_BUDGET_MS = 90_000;
const PAGE_ROW_CAP = 100_000;

type EdgeRuntimeGlobal = { waitUntil: (promise: Promise<unknown>) => void };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function secretsMatch(supplied: string, expected: string): boolean {
  if (supplied.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < supplied.length; index += 1) {
    mismatch |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

type Db = ReturnType<typeof createClient>;

type ConnectedProperty = {
  project_id: string;
  property_id: string;
  credentials_json: Record<string, unknown>;
};

async function refreshAccessToken(db: Db, projectId: string, credentials: Record<string, unknown>): Promise<string> {
  const expiresAt = Number(credentials.expires_at ?? 0);
  const current = typeof credentials.access_token === "string" ? credentials.access_token : "";
  if (current && expiresAt > Date.now() + 300_000) return current;

  const refreshToken = typeof credentials.refresh_token === "string" ? credentials.refresh_token : "";
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") ?? "";
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Google OAuth refresh credentials are missing");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed (${response.status})`);
  const tokens = await response.json();
  const accessToken = String(tokens.access_token ?? "");
  if (!accessToken) throw new Error("Google token refresh returned no access token");

  await db.from("google_api_settings").update({
    credentials_json: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + Number(tokens.expires_in ?? 3600) * 1000,
      token_type: tokens.token_type ?? "Bearer",
    },
    updated_at: new Date().toISOString(),
  }).eq("project_id", projectId);

  return accessToken;
}

async function runReport(
  accessToken: string,
  propertyId: string,
  report: Ga4Report,
  start: string,
  end: string,
): Promise<{ report: Ga4ApiReport; attempts: number }> {
  const collected: Ga4ApiReport = { rows: [], dimensionHeaders: [], metricHeaders: [] };
  let offset = 0;
  let attemptsUsed = 1;
  let lastQuota: Ga4ApiReport["propertyQuota"];

  while (offset < PAGE_ROW_CAP) {
    let attempt = 0;
    let page: Ga4ApiReport | null = null;
    while (attempt < MAX_RETRY_ATTEMPTS) {
      attempt += 1;
      attemptsUsed = attempt;
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyResource(propertyId)}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportRequest(report, start, end, offset)),
        },
      );
      if (response.ok) {
        page = await response.json() as Ga4ApiReport;
        break;
      }
      const errorText = await response.text();
      if (isHistoryFloorError(response.status, errorText)) {
        const floor = new Error(`GA4 history floor: ${errorText.slice(0, 300)}`);
        floor.name = "Ga4HistoryFloor";
        throw floor;
      }
      if (!isRetryableStatus(response.status) || attempt >= MAX_RETRY_ATTEMPTS) {
        const quota = response.status === 429;
        const failed = new Error(`GA4 ${report} ${response.status}: ${errorText.slice(0, 400)}`);
        failed.name = quota ? "Ga4Quota" : "Ga4Api";
        throw failed;
      }
      await sleep(retryDelayMs(attempt, response.headers.get("retry-after")));
    }
    if (!page) break;
    if (offset === 0) {
      collected.dimensionHeaders = page.dimensionHeaders;
      collected.metricHeaders = page.metricHeaders;
      collected.metadata = page.metadata;
    }
    lastQuota = page.propertyQuota ?? lastQuota;
    const rows = page.rows ?? [];
    collected.rows = [...(collected.rows ?? []), ...rows];
    if (rows.length < 10000) break;
    offset += rows.length;
    if (shouldStopForQuota(lastQuota)) break;
  }
  collected.propertyQuota = lastQuota;
  return { report: collected, attempts: attemptsUsed };
}

function dedupeRows(report: Ga4Report, rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const keys = conflictColumns(report).split(",");
  const byKey = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    byKey.set(keys.map((key) => String(row[key] ?? "")).join("\u0000"), row);
  }
  return [...byKey.values()];
}

async function writeRows(db: Db, report: Ga4Report, rows: Record<string, unknown>[]) {
  const table = tableForReport(report);
  const onConflict = conflictColumns(report);
  const unique = dedupeRows(report, rows);
  for (let index = 0; index < unique.length; index += 500) {
    const batch = unique.slice(index, index + 500).map((row) => ({
      ...row,
      synced_at: new Date().toISOString(),
    }));
    if (!batch.length) continue;
    const { error } = await db.from(table).upsert(batch, { onConflict, ignoreDuplicates: false });
    if (error) throw error;
  }
}

async function recordRun(
  db: Db,
  input: {
    projectId: string;
    propertyId: string;
    report: Ga4Report;
    mode: string;
    state: "success" | "error" | "quota";
    start: string;
    end: string;
    rowsFetched: number;
    rowsWritten: number;
    attempt: number;
    error?: string;
  },
) {
  await db.from("ga4_sync_runs").insert({
    project_id: input.projectId,
    property_id: input.propertyId,
    report: input.report,
    mode: input.mode,
    state: input.state,
    start_date: input.start,
    end_date: input.end,
    rows_fetched: input.rowsFetched,
    rows_written: input.rowsWritten,
    attempt: input.attempt,
    error: input.error?.slice(0, 2000) ?? null,
    finished_at: new Date().toISOString(),
  });
}

async function alertFailure(
  db: Db,
  projectId: string,
  propertyId: string,
  report: string,
  severity: "error" | "quota",
  message: string,
) {
  console.error("GA4 sync alert", { projectId, propertyId, report, severity, message });
  const { error } = await db.from("ga4_sync_alerts").insert({
    project_id: projectId,
    property_id: propertyId,
    report,
    severity,
    message: message.slice(0, 2000),
  });
  if (error) console.error("GA4 sync alert insert failed", error.message);
}

async function loadCursors(db: Db, projectId: string, propertyId: string): Promise<SyncCursor[]> {
  const { data, error } = await db
    .from("ga4_sync_cursors")
    .select("report, backfill_next_end, backfill_complete, empty_windows")
    .eq("project_id", projectId)
    .eq("property_id", propertyId);
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const report = GA4_REPORTS.find((item) => item === row.report);
    if (!report) return [];
    return [{
      report,
      backfill_next_end: row.backfill_next_end,
      backfill_complete: Boolean(row.backfill_complete),
      empty_windows: Number(row.empty_windows ?? 0),
    }];
  });
}

async function saveCursor(db: Db, projectId: string, propertyId: string, cursor: SyncCursor) {
  const { error } = await db.from("ga4_sync_cursors").upsert({
    project_id: projectId,
    property_id: propertyId,
    report: cursor.report,
    backfill_next_end: cursor.backfill_next_end,
    backfill_complete: cursor.backfill_complete,
    empty_windows: cursor.empty_windows,
    updated_at: new Date().toISOString(),
  }, { onConflict: "project_id,property_id,report" });
  if (error) throw error;
}

async function runJob(
  db: Db,
  property: ConnectedProperty,
  accessToken: string,
  job: SyncJob,
  mode: string,
): Promise<{ written: number; quotaStop: boolean; floor: boolean }> {
  try {
    const fetched = await runReport(accessToken, property.property_id, job.report, job.start, job.end);
    if (shouldStopForQuota(fetched.report.propertyQuota) && (fetched.report.rows?.length ?? 0) === 0) {
      await recordRun(db, {
        projectId: property.project_id,
        propertyId: property.property_id,
        report: job.report,
        mode,
        state: "quota",
        start: job.start,
        end: job.end,
        rowsFetched: 0,
        rowsWritten: 0,
        attempt: fetched.attempts,
        error: "Stopped before writing because remaining GA4 tokens are below the safety floor",
      });
      await alertFailure(
        db,
        property.project_id,
        property.property_id,
        job.report,
        "quota",
        `GA4 quota is nearly exhausted for ${job.report} ${job.start} to ${job.end}. The next nightly run will resume this window.`,
      );
      return { written: 0, quotaStop: true, floor: false };
    }
    const mapped = mapReport(job.report, property.project_id, property.property_id, fetched.report);
    await writeRows(db, job.report, mapped.rows);
    await recordRun(db, {
      projectId: property.project_id,
      propertyId: property.property_id,
      report: job.report,
      mode,
      state: "success",
      start: job.start,
      end: job.end,
      rowsFetched: fetched.report.rows?.length ?? 0,
      rowsWritten: mapped.rows.length,
      attempt: fetched.attempts,
    });
    if (job.kind === "backfill") {
      const cursors = await loadCursors(db, property.project_id, property.property_id);
      const previous = cursors.find((cursor) => cursor.report === job.report);
      const advanced = advanceBackfill(job, mapped.rows.length, previous?.empty_windows ?? 0);
      await saveCursor(db, property.project_id, property.property_id, {
        report: job.report,
        backfill_next_end: advanced.nextEnd,
        backfill_complete: advanced.complete,
        empty_windows: advanced.emptyWindows,
      });
    }
    return {
      written: mapped.rows.length,
      quotaStop: shouldStopForQuota(fetched.report.propertyQuota),
      floor: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const floor = error instanceof Error && error.name === "Ga4HistoryFloor";
    const quota = error instanceof Error && error.name === "Ga4Quota";
    if (floor && job.kind === "backfill") {
      await saveCursor(db, property.project_id, property.property_id, {
        report: job.report,
        backfill_next_end: job.start,
        backfill_complete: true,
        empty_windows: 0,
      });
    }
    await recordRun(db, {
      projectId: property.project_id,
      propertyId: property.property_id,
      report: job.report,
      mode,
      state: quota ? "quota" : "error",
      start: job.start,
      end: job.end,
      rowsFetched: 0,
      rowsWritten: 0,
      attempt: MAX_RETRY_ATTEMPTS,
      error: message,
    });
    if (!floor) {
      await alertFailure(
        db,
        property.project_id,
        property.property_id,
        job.report,
        quota ? "quota" : "error",
        message,
      );
    }
    return { written: 0, quotaStop: quota, floor };
  }
}

async function listProperties(db: Db, onlyProjectId: string | null): Promise<ConnectedProperty[]> {
  let query = db
    .from("google_api_settings")
    .select("project_id, google_analytics_property_id, credentials_json")
    .not("google_analytics_property_id", "is", null)
    .not("credentials_json", "is", null);
  if (onlyProjectId) query = query.eq("project_id", onlyProjectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const propertyId = normalizePropertyId(String(row.google_analytics_property_id ?? ""));
    if (!/^\d+$/.test(propertyId) || !row.credentials_json || typeof row.credentials_json !== "object") {
      console.error("Skipping GA4 property with missing credentials or an invalid id", row.project_id);
      return [];
    }
    return [{
      project_id: String(row.project_id),
      property_id: propertyId,
      credentials_json: row.credentials_json as Record<string, unknown>,
    }];
  });
}

async function syncProperties(
  db: Db,
  properties: ConnectedProperty[],
  mode: "nightly" | "today",
  hop: number,
) {
  const started = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const results: Array<Record<string, unknown>> = [];
  let continueBackfill = false;
  let quotaHit = false;

  for (const property of properties) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      continueBackfill = true;
      break;
    }
    try {
      const accessToken = await refreshAccessToken(db, property.project_id, property.credentials_json);
      const jobs: SyncJob[] = mode === "today"
        ? GA4_REPORTS.map((report) => ({ kind: "incremental" as const, report, start: today, end: today }))
        : jobsForProperty(
          await loadCursors(db, property.project_id, property.property_id),
          today,
          hop === 0,
        );
      let written = 0;
      let quotaStop = false;
      for (const job of jobs) {
        if (Date.now() - started > TIME_BUDGET_MS) {
          continueBackfill = true;
          break;
        }
        const outcome = await runJob(db, property, accessToken, job, mode);
        written += outcome.written;
        if (outcome.quotaStop) {
          quotaStop = true;
          quotaHit = true;
          break;
        }
      }
      if (mode === "nightly" && !quotaStop) {
        const cursors = await loadCursors(db, property.project_id, property.property_id);
        const pending = jobsForProperty(cursors, today, false).some((job) => job.kind === "backfill");
        if (pending) continueBackfill = true;
      }
      results.push({ projectId: property.project_id, propertyId: property.property_id, written, quotaStop });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await alertFailure(db, property.project_id, property.property_id, "auth", "error", message);
      await db.from("ga4_sync_runs").insert({
        project_id: property.project_id,
        property_id: property.property_id,
        report: null,
        mode,
        state: "error",
        error: message.slice(0, 2000),
        finished_at: new Date().toISOString(),
      });
      results.push({ projectId: property.project_id, propertyId: property.property_id, error: message });
    }
  }

  return { results, continueBackfill, quotaHit, today, incremental: incrementalWindow(today) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json({ error: "Server configuration missing" }, 500);
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "today" ? "today" : body.mode === "nightly" ? "nightly" : "";
    if (!mode) return json({ error: "mode must be nightly or today" }, 400);
    const hop = Number.isInteger(body.hop) ? Number(body.hop) : 0;
    const maxProperties = Number.isInteger(body.maxProperties) ? Number(body.maxProperties) : null;
    const dryRun = body.dryRun === true;

    if (mode === "nightly") {
      const expected = Deno.env.get("GA4_SYNC_SECRET") ?? "";
      const supplied = req.headers.get("x-ga4-sync-secret") ?? "";
      if (!expected || !supplied || !secretsMatch(supplied, expected)) {
        return json({ error: "Unauthorized" }, 401);
      }
    }

    let onlyProjectId: string | null = null;
    let todayUserId: string | null = null;
    if (mode === "today") {
      const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const authorization = req.headers.get("Authorization") ?? "";
      if (!anon || !authorization.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
      const userClient = createClient(supabaseUrl, anon, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false },
      });
      const { data: userData } = await userClient.auth.getUser();
      const user = userData.user;
      if (!user) return json({ error: "Unauthorized" }, 401);
      onlyProjectId = String(body.projectId ?? "");
      const { data: project } = await userClient
        .from("seo_projects")
        .select("id")
        .eq("id", onlyProjectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!project) return json({ error: "Project not found" }, 403);
      todayUserId = user.id;
      if (!dryRun) {
        const { data: profile } = await db.from("profiles").select("credits").eq("id", user.id).maybeSingle();
        if (Number(profile?.credits ?? 0) < MANUAL_REFRESH_CREDITS) {
          return json({
            error: "Not enough credits. Refreshing today uses 2 credits. Stored history stays free.",
          }, 402);
        }
      }
    }

    let properties = await listProperties(db, onlyProjectId);
    if (maxProperties && maxProperties > 0) properties = properties.slice(0, maxProperties);
    if (dryRun) {
      const today = new Date().toISOString().slice(0, 10);
      const planned = [];
      for (const property of properties) {
        const cursors = mode === "nightly"
          ? await loadCursors(db, property.project_id, property.property_id)
          : [];
        planned.push({
          projectId: property.project_id,
          propertyId: property.property_id,
          jobs: mode === "today"
            ? GA4_REPORTS.map((report) => ({ kind: "incremental", report, start: today, end: today }))
            : jobsForProperty(cursors, today, hop === 0),
        });
      }
      return json({ ok: true, dryRun: true, mode, properties: planned });
    }

    const work = (async () => {
      const summary = await syncProperties(db, properties, mode, hop);
      let creditsCharged = false;
      if (mode === "today" && onlyProjectId) {
        const wrote = summary.results.some((result) => Number(result.written ?? 0) > 0 && !result.error);
        if (wrote) {
          if (todayUserId) {
            const { data: charged, error: creditError } = await db.rpc("deduct_credits", {
              user_id_param: todayUserId,
              credits_to_deduct: MANUAL_REFRESH_CREDITS,
            });
            creditsCharged = charged === true;
            if (creditError || !creditsCharged) {
              console.error("GA4 today refresh credit deduction failed", creditError?.message ?? "insufficient credits");
            }
          }
        }
      }
      if (
        mode === "nightly" &&
        summary.continueBackfill &&
        !summary.quotaHit &&
        hop < 24 &&
        summary.results.length > 0
      ) {
        const secret = Deno.env.get("GA4_SYNC_SECRET") ?? "";
        await fetch(`${supabaseUrl}/functions/v1/ga4-nightly-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-ga4-sync-secret": secret,
          },
          body: JSON.stringify({ mode: "nightly", hop: hop + 1, maxProperties }),
        });
      }
      return { ...summary, creditsCharged };
    })();

    const runtime = (globalThis as { EdgeRuntime?: EdgeRuntimeGlobal }).EdgeRuntime;
    if (runtime?.waitUntil && mode === "nightly") {
      runtime.waitUntil(work);
      return json({ accepted: true, mode, properties: properties.length, hop }, 202);
    }

    const summary = await work;
    return json({ ok: true, mode, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ga4-nightly-sync", message);
    return json({ error: message }, 500);
  }
});
