const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AutocompleteRequest {
  query: string;
  location?: string;
  language?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, location = "United States", language = "en" }: AutocompleteRequest = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const DATAFORSEO_LOGIN = Deno.env.get("DATAFORSEO_LOGIN");
    const DATAFORSEO_PASSWORD = Deno.env.get("DATAFORSEO_PASSWORD");

    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      throw new Error("DataForSEO credentials not configured");
    }

    const auth = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);

    const payload = [{
      keyword: query,
      location_name: location,
      language_code: language,
    }];

    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();

    const suggestions: string[] = [];

    if (data.tasks && data.tasks[0]?.result) {
      const result = data.tasks[0].result[0];

      if (result?.keyword_info) {
        suggestions.push(result.keyword_info.keyword);
      }

      if (result?.keyword_info_normalized_with_bing) {
        suggestions.push(result.keyword_info_normalized_with_bing.keyword);
      }

      if (result?.keyword_info_normalized_with_clickstream) {
        suggestions.push(result.keyword_info_normalized_with_clickstream.keyword);
      }
    }

    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10);

    if (uniqueSuggestions.length < 5) {
      const relatedKeywords = [
        `${query} tools`,
        `${query} tips`,
        `${query} guide`,
        `${query} tutorial`,
        `${query} best practices`,
        `how to ${query}`,
        `${query} examples`,
        `${query} strategies`,
      ];

      relatedKeywords.forEach(kw => {
        if (uniqueSuggestions.length < 10 && !uniqueSuggestions.includes(kw)) {
          uniqueSuggestions.push(kw);
        }
      });
    }

    return new Response(
      JSON.stringify({ suggestions: uniqueSuggestions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Autocomplete error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch autocomplete suggestions",
        suggestions: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
