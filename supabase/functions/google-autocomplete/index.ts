const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AutocompleteRequest {
  query: string;
  expand?: boolean; // A-Z expansion
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, expand = false }: AutocompleteRequest = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [], query, categorized: {} }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Fetching Google Autocomplete for: "${query}", expand: ${expand}`);

    // Fetch from Google Suggest endpoint
    const suggestions = await fetchGoogleSuggestions(query);

    // If expand is true, do A-Z expansion
    let allSuggestions = [...suggestions];
    if (expand) {
      const expandedSuggestions = await expandAtoZ(query);
      allSuggestions = [...new Set([...suggestions, ...expandedSuggestions])];
    }

    // Categorize suggestions
    const categorized = categorizeSuggestions(allSuggestions);

    return new Response(
      JSON.stringify({
        query,
        source: "google_autocomplete",
        suggestions: allSuggestions,
        categorized,
        total: allSuggestions.length,
        cached: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Google Autocomplete error:", error);

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

async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AnotherSEO/1.0)",
      },
    });

    if (!response.ok) {
      console.error("Google Suggest API error:", response.status);
      return [];
    }

    const data = await response.json();

    // Google returns: ["query", ["suggestion1", "suggestion2", ...]]
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1].filter((s: any) => typeof s === "string");
    }

    return [];
  } catch (error) {
    console.error("Error fetching Google suggestions:", error);
    return [];
  }
}

async function expandAtoZ(query: string): Promise<string[]> {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const results: string[] = [];

  // Fetch in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < letters.length; i += batchSize) {
    const batch = letters.slice(i, i + batchSize);

    const promises = batch.map(async (letter) => {
      const suggestions = await fetchGoogleSuggestions(`${query} ${letter}`);
      return suggestions;
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.flat());

    // Small delay between batches to be respectful
    if (i + batchSize < letters.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return [...new Set(results)]; // Remove duplicates
}

function categorizeSuggestions(suggestions: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    questions: [],
    prepositions: [],
    comparisons: [],
    modifiers: [],
    alphabetical: [],
    others: [],
  };

  // Regex patterns for categorization
  const questionRx = /^(who|what|when|where|why|how|which|can|should|do|does|did|are|is|will|would|could|may)\b/i;
  const comparisonRx = /\b(vs|vs\.|versus|like|than|or)\b/i;
  const prepositionRx = /\b(for|near|with|without|to|from|by|on|in|at|about|under|over|between)\b/i;
  const modifierRx = /\b(best|cheap|price|cost|review|reviews|near me|booking|book|hours|open|discount|top|free|online)\b/i;
  const alphabeticalRx = /\s[a-z]$/i; // Ends with single letter (from A-Z expansion)

  for (const suggestion of suggestions) {
    const trimmed = suggestion.trim();
    if (!trimmed) continue;

    if (questionRx.test(trimmed)) {
      categories.questions.push(trimmed);
    } else if (comparisonRx.test(trimmed)) {
      categories.comparisons.push(trimmed);
    } else if (prepositionRx.test(trimmed)) {
      categories.prepositions.push(trimmed);
    } else if (modifierRx.test(trimmed)) {
      categories.modifiers.push(trimmed);
    } else if (alphabeticalRx.test(trimmed)) {
      categories.alphabetical.push(trimmed);
    } else {
      categories.others.push(trimmed);
    }
  }

  return categories;
}
