import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, keywords } = await req.json();
    
    // Input validation
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (content.length > 100000) {
      return new Response(
        JSON.stringify({ error: 'Content exceeds maximum length of 100,000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (keywords && (!Array.isArray(keywords) || keywords.length > 50)) {
      return new Response(
        JSON.stringify({ error: 'Keywords must be an array with maximum 50 items' }),
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
          content: `You are an expert SEO content analyzer. Analyze content for:
1. Readability (Flesch Reading Ease score 0-100)
2. SEO optimization (keyword usage, structure, meta)
3. Engagement potential (hooks, calls-to-action, value)
4. Keyword density for: ${keywords?.join(', ') || 'N/A'}
5. Extract key entities (people, places, organizations)
6. Identify main topics and themes
7. Provide actionable recommendations

Return JSON only with structure:
{
  "readabilityScore": number,
  "seoScore": number,
  "engagementScore": number,
  "keywordDensity": number,
  "wordCount": number,
  "entities": ["entity1", "entity2"],
  "topics": ["topic1", "topic2"],
  "recommendations": ["rec1", "rec2"],
  "internalLinkSuggestions": ["suggestion1"],
  "eeatSignals": ["signal1", "signal2"]
}`
        }, {
          role: 'user',
          content: `Analyze this content:\n\n${content.substring(0, 10000)}`
        }],
        temperature: 0.3
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seo-content-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});