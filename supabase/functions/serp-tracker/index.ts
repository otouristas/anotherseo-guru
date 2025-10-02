
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, domain, location = "United States" } = await req.json();
    const apiKey = Deno.env.get('DATAFORSEO_API_KEY');
    
    if (!apiKey) {
      throw new Error('DATAFORSEO_API_KEY not configured');
    }

    const [login, password] = apiKey.split(':');
    const auth = btoa(`${login}:${password}`);

    console.log('Tracking SERP for:', { keyword, domain, location });

    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword: keyword,
        location_name: location,
        language_name: "English",
        device: "desktop",
        os: "windows",
        depth: 100
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error:', response.status, errorText);
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.tasks?.[0]?.result?.[0]?.items || [];
    
    // Find domain position and analyze competitors
    let domainPosition = null;
    let domainUrl = null;
    const competitors = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.type === 'organic') {
        const resultDomain = new URL(result.url).hostname.replace('www.', '');
        
        if (resultDomain.includes(domain) || domain.includes(resultDomain)) {
          domainPosition = result.rank_absolute;
          domainUrl = result.url;
        } else if (i < 10) {
          // Track top 10 competitors
          competitors.push({
            domain: resultDomain,
            url: result.url,
            position: result.rank_absolute,
            title: result.title,
            description: result.description
          });
        }
      }
    }

    return new Response(JSON.stringify({
      keyword,
      domain,
      position: domainPosition,
      url: domainUrl,
      competitors,
      totalResults: results.length,
      featuredSnippet: results.some((r: any) => r.type === 'featured_snippet'),
      localPack: results.some((r: any) => r.type === 'local_pack')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in serp-tracker:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Tracking failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});