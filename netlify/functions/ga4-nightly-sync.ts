/**
 * Nightly trigger for the GA4 history worker.
 * Scheduled functions time out after 30 seconds, so this only starts the
 * Supabase function. That function returns 202 and keeps syncing with
 * EdgeRuntime.waitUntil, then chains another hop while backfill remains.
 *
 * Required Netlify environment variables:
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   GA4_SYNC_SECRET  (same value as the Supabase function secret)
 */

declare const Netlify: { env: { get(name: string): string | undefined } };

export default async (req: Request) => {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL") || Netlify.env.get("VITE_SUPABASE_URL");
  const secret = Netlify.env.get("GA4_SYNC_SECRET");
  if (!supabaseUrl || !secret) {
    console.error("GA4 nightly sync is not configured. Set SUPABASE_URL and GA4_SYNC_SECRET.");
    return new Response(JSON.stringify({ error: "GA4 nightly sync is not configured" }), { status: 500 });
  }

  let nextRun: string | null = null;
  try {
    const body = await req.json();
    nextRun = typeof body?.next_run === "string" ? body.next_run : null;
  } catch {
    nextRun = null;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/ga4-nightly-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ga4-sync-secret": secret,
    },
    body: JSON.stringify({ mode: "nightly", hop: 0 }),
  });
  const payload = await response.text();
  if (!response.ok && response.status !== 202) {
    console.error("GA4 nightly sync failed to start", response.status, payload.slice(0, 500));
    return new Response(payload, { status: response.status });
  }
  console.log("GA4 nightly sync accepted", { status: response.status, nextRun });
  return new Response(payload, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  schedule: "15 3 * * *",
};
