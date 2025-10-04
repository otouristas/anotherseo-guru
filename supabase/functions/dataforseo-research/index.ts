
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let action = 'unknown';
  try {
    const requestData = await req.json();
    action = requestData.action;
    const { keyword, keywords, location, domain } = requestData;
    const locationName = location || "United States";
    
    const apiKey = Deno.env.get('DATAFORSEO_API_KEY');
    
    if (!apiKey) {
      throw new Error('DATAFORSEO_API_KEY not configured');
    }

    // DataForSEO uses login:password format
    const [login, password] = apiKey.includes(':') ? apiKey.split(':') : [apiKey, apiKey];
    const auth = btoa(`${login}:${password}`);

    let endpoint = '';
    let payload: unknown[] = [];

    console.log('DataForSEO action:', action);

    switch (action) {
      case 'keyword_research':
        // Search volume endpoint
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';
        payload = [{
          keywords: Array.isArray(keywords) ? keywords : (keywords ? [keywords] : [keyword]),
          location_name: locationName,
          language_name: "English"
        }];
        break;

      case 'keyword_suggestions':
        // Keyword suggestions endpoint
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';
        payload = [{
          keywords: [keyword],
          location_name: locationName,
          language_name: "English",
          include_seed_keyword: true,
          include_serp_info: true,
          limit: 50
        }];
        break;

      case 'trends': {
        // Google Trends endpoint
        endpoint = 'https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live';
        const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const dateTo = new Date().toISOString().split('T')[0];
        payload = [{
          keywords: Array.isArray(keywords) ? keywords : [keyword],
          location_name: locationName,
          language_name: "English",
          date_from: dateFrom,
          date_to: dateTo
        }];
        break;
      }

      case 'serp_analysis':
        // SERP organic results endpoint
        endpoint = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';
        payload = [{
          keyword: keyword || domain,
          location_name: locationName,
          language_name: "English",
          device: "desktop",
          os: "windows",
          depth: 100
        }];
        break;

      case 'domain_overview':
        // Domain metrics using backlinks API
        endpoint = 'https://api.dataforseo.com/v3/backlinks/summary/live';
        payload = [{
          target: domain || keyword,
          internal_list_limit: 10,
          include_subdomains: true,
          backlinks_status_type: "live"
        }];
        break;

      case 'generate':
        // Generate text from partial text
        endpoint = 'https://api.dataforseo.com/v3/content_generation/generate/live';
        payload = [{
          text: requestData.text,
          max_new_tokens: requestData.max_new_tokens || 100,
          creativity_index: requestData.creativity_index || 0.8,
          stop_words: requestData.stop_words || [],
          avoid_starting_words: requestData.avoid_starting_words || []
        }];
        break;

      case 'generate_text':
        // Generate text from topic
        endpoint = 'https://api.dataforseo.com/v3/content_generation/generate_text/live';
        payload = [{
          topic: requestData.topic,
          word_count: requestData.word_count || 300,
          sub_topics: requestData.sub_topics || [],
          description: requestData.description || '',
          meta_keywords: requestData.meta_keywords || [],
          creativity_index: requestData.creativity_index || 0.8,
          include_conclusion: requestData.include_conclusion !== false
        }];
        break;

      case 'generate_meta_tags':
        // Generate SEO meta tags
        endpoint = 'https://api.dataforseo.com/v3/content_generation/generate_meta_tags/live';
        payload = [{
          text: requestData.text,
          creativity_index: requestData.creativity_index || 0.8
        }];
        break;

      case 'generate_sub_topics':
        // Generate subtopics for a topic
        endpoint = 'https://api.dataforseo.com/v3/content_generation/generate_sub_topics/live';
        payload = [{
          topic: requestData.topic,
          creativity_index: requestData.creativity_index || 0.9
        }];
        break;

      case 'paraphrase':
        // Paraphrase existing text
        endpoint = 'https://api.dataforseo.com/v3/content_generation/paraphrase/live';
        payload = [{
          text: requestData.text,
          creativity_index: requestData.creativity_index || 0.8
        }];
        break;

      case 'serp_ai_summary':
        // SERP AI Summary - requires task_id from previous SERP call
        endpoint = 'https://api.dataforseo.com/v3/serp/ai_summary';
        payload = [{
          task_id: requestData.task_id,
          prompt: requestData.prompt,
          include_links: requestData.include_links !== false,
          fetch_content: requestData.fetch_content || false
        }];
        break;

      case 'google_organic':
        // Google Organic SERP Live
        endpoint = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';
        payload = [{
          keyword: keyword,
          location_name: locationName,
          language_name: "English",
          device: requestData.device || "desktop",
          os: requestData.os || "windows",
          depth: requestData.depth || 10
        }];
        break;

      case 'google_ai_mode':
        // Google AI Mode SERP
        endpoint = 'https://api.dataforseo.com/v3/serp/google/ai_mode/live/advanced';
        payload = [{
          keyword: keyword,
          location_name: locationName,
          language_name: "English",
          depth: requestData.depth || 20
        }];
        break;

      case 'google_maps':
        // Google Maps SERP
        endpoint = 'https://api.dataforseo.com/v3/serp/google/maps/live/advanced';
        payload = [{
          keyword: keyword,
          location_name: locationName,
          language_name: "English",
          depth: requestData.depth || 100
        }];
        break;

      case 'google_images':
        // Google Images SERP
        endpoint = 'https://api.dataforseo.com/v3/serp/google/images/live/advanced';
        payload = [{
          keyword: keyword,
          location_name: locationName,
          language_name: "English",
          depth: requestData.depth || 100
        }];
        break;

      case 'onpage_task':
        // OnPage API - Create crawl task
        endpoint = 'https://api.dataforseo.com/v3/on_page/task_post';
        payload = [{
          target: domain || keyword,
          max_crawl_pages: requestData.max_crawl_pages || 100,
          enable_javascript: requestData.enable_javascript || false,
          store_raw_html: requestData.store_raw_html || false
        }];
        break;

      case 'onpage_summary': {
        // OnPage API - Get summary
        const taskId = requestData.task_id;
        endpoint = `https://api.dataforseo.com/v3/on_page/summary/${taskId}`;
        payload = [];
        break;
      }

      case 'onpage_duplicate_content':
        // OnPage API - Duplicate Content
        endpoint = 'https://api.dataforseo.com/v3/on_page/duplicate_content';
        payload = [{
          id: requestData.task_id,
          url: requestData.url,
          similarity: requestData.similarity || 6,
          limit: requestData.limit || 100
        }];
        break;

      case 'onpage_links':
        // OnPage API - Links Analysis
        endpoint = 'https://api.dataforseo.com/v3/on_page/links';
        payload = [{
          id: requestData.task_id,
          page_from: requestData.page_from,
          filters: requestData.filters,
          limit: requestData.limit || 100
        }];
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    console.log('DataForSEO request:', { action, keyword, endpoint });

    // Handle GET requests (like onpage_summary)
    const isGetRequest = action === 'onpage_summary';
    const requestOptions: RequestInit = {
      method: isGetRequest ? 'GET' : 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      }
    };

    if (!isGetRequest && payload.length > 0) {
      requestOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(endpoint, requestOptions);

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
