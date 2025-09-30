import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let action = 'unknown';
  try {
    const requestData = await req.json();
    action = requestData.action;
    const keyword = requestData.keyword;
    const location = requestData.location || "United States";
    const apiKey = Deno.env.get('DATAFORSEO_API_KEY');
    
    if (!apiKey) {
      throw new Error('DATAFORSEO_API_KEY not configured');
    }

    const [login, password] = apiKey.split(':');
    const auth = btoa(`${login}:${password}`);

    let endpoint = '';
    let payload = {};

    switch (action) {
      case 'keyword_research':
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';
        payload = [{
          keywords: Array.isArray(keyword) ? keyword : [keyword],
          location_name: location,
          language_name: "English"
        }];
        break;

      case 'keyword_suggestions':
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';
        payload = [{
          keywords: [keyword],
          location_name: location,
          language_name: "English",
          include_seed_keyword: true,
          include_serp_info: true,
          limit: 50
        }];
        break;

      case 'trends':
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live';
        payload = [{
          keywords: Array.isArray(keyword) ? keyword : [keyword],
          location_name: location,
          language_name: "English",
          date_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: new Date().toISOString().split('T')[0]
        }];
        break;

      case 'serp_analysis':
        endpoint = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';
        payload = [{
          keyword: keyword,
          location_name: location,
          language_name: "English",
          device: "desktop",
          os: "windows",
          depth: 10
        }];
        break;

      default:
        throw new Error('Invalid action');
    }

    console.log('DataForSEO request:', { action, keyword, endpoint });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error:', response.status, errorText);
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DataForSEO response received:', data.tasks_count);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dataforseo-research function:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: errorMessage,
      action: action || 'unknown',
      timestamp: new Date().toISOString(),
    };
    
    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
