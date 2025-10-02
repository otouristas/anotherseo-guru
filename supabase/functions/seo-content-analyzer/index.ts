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
    const { url, project_id } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scrape the URL content
    let content = '';
    try {
      const scrapeResponse = await fetch(url);
      if (scrapeResponse.ok) {
        const html = await scrapeResponse.text();
        // Basic HTML text extraction
        content = html.replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 10000);
      }
    } catch (scrapeError) {
      console.error('Error scraping URL:', scrapeError);
      content = 'Unable to fetch page content';
    }

    // Analyze content using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are an expert SEO auditor. Analyze the page content and provide:
1. Technical SEO issues (meta tags, headings, structure)
2. Content quality issues (readability, depth, value)
3. Keyword optimization opportunities
4. Internal linking suggestions
5. E-E-A-T signals present or missing
6. Core Web Vitals considerations
7. Mobile-friendliness issues
8. Schema markup recommendations

Return JSON only with structure:
{
  "technical_issues": ["issue1", "issue2"],
  "content_issues": ["issue1", "issue2"],
  "keyword_opportunities": ["opp1", "opp2"],
  "internal_linking": ["suggestion1", "suggestion2"],
  "eeat_signals": ["signal1", "signal2"],
  "core_web_vitals": ["issue1", "issue2"],
  "mobile_issues": ["issue1", "issue2"],
  "schema_recommendations": ["rec1", "rec2"],
  "priority_actions": ["action1", "action2", "action3"],
  "overall_score": 75
}`
        }, {
          role: 'user',
          content: `Analyze this page:\nURL: ${url}\n\nContent:\n${content.substring(0, 8000)}`
        }],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Analysis service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    analysis.url = url;
    analysis.analyzed_at = new Date().toISOString();

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seo-content-analyzer:', error);
    
    const errorMessage = error instanceof Error && error.message.includes('API') 
      ? 'Service temporarily unavailable' 
      : 'Analysis failed';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
