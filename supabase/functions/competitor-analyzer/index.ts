import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, competitors } = await req.json();
    const apiKey = Deno.env.get('DATAFORSEO_API_KEY');
    
    if (!apiKey) {
      throw new Error('DATAFORSEO_API_KEY not configured');
    }

    const [login, password] = apiKey.split(':');
    const auth = btoa(`${login}:${password}`);

    console.log('Analyzing competitors:', { domain, competitors });

    // Get domain overview for main domain and competitors
    const domainsToAnalyze = [domain, ...(competitors || [])];
    const results = [];

    for (const targetDomain of domainsToAnalyze) {
      try {
        const response = await fetch('https://api.dataforseo.com/v3/domain_analytics/google/overview/live', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            target: targetDomain,
            location_code: 2840, // United States
            language_code: "en"
          }]),
        });

        if (response.ok) {
          const data = await response.json();
          const metrics = data.tasks?.[0]?.result?.[0]?.metrics || {};
          
          results.push({
            domain: targetDomain,
            organicTraffic: metrics.organic?.etv || 0,
            organicKeywords: metrics.organic?.count || 0,
            paidTraffic: metrics.paid?.etv || 0,
            paidKeywords: metrics.paid?.count || 0,
            backlinks: metrics.backlinks || 0,
            referringDomains: metrics.referring_domains || 0
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${targetDomain}:`, error);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in competitor-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});