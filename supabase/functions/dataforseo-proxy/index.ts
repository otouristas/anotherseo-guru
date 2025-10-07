import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE = "https://api.dataforseo.com/v3";
const ALLOW = new Set([
  "/serp/google/live/advanced",
  "/serp/endpoints",
  "/serp/google/locations",
  "/keywords_data/google_ads/search_volume/live",
  "/keywords_data/google_ads/related_keywords/live",
  "/dataforseo_labs/categories",
  "/on_page/summary",
  "/on_page/links",
  "/on_page/keywords",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Use POST", { status: 405, headers: corsHeaders });
  }

  try {
    const { path, payload } = await req.json().catch(() => ({}));
    
    if (!path || !ALLOW.has(path)) {
      return new Response("Forbidden path", { status: 403, headers: corsHeaders });
    }

    const login = Deno.env.get("DATAFORSEO_LOGIN");
    const password = Deno.env.get("DATAFORSEO_PASSWORD");
    
    if (!login || !password) {
      return new Response("DataForSEO credentials not configured", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const auth = "Basic " + btoa(`${login}:${password}`);

    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
    });

    const data = await r.text();
    
    return new Response(data, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("Content-Type") ?? "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('DataForSEO proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
