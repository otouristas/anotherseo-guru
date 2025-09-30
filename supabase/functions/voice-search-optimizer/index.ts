import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, keyword } = await req.json();
    console.log('Voice search optimization for:', { projectId, keyword });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get project details
    const { data: project } = await supabaseClient
      .from('seo_projects')
      .select('domain, target_location')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Call DataForSEO to get SERP features
    const DATAFORSEO_API_KEY = Deno.env.get('DATAFORSEO_API_KEY');
    const auth = btoa(`${DATAFORSEO_API_KEY}`);

    const dataForSeoResponse = await fetch(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          keyword,
          location_name: project.target_location || 'United States',
          language_code: 'en',
          device: 'desktop',
          depth: 10
        }])
      }
    );

    const dataForSeoData = await dataForSeoResponse.json();
    const serpResults = dataForSeoData?.tasks?.[0]?.result?.[0];

    // Extract voice search features
    const featuredSnippet = serpResults?.items?.find((item: any) => 
      item.type === 'featured_snippet'
    );

    const peopleAlsoAsk = serpResults?.items
      ?.filter((item: any) => item.type === 'people_also_ask')
      ?.map((item: any) => item.title) || [];

    const answerBox = serpResults?.items?.find((item: any) => 
      item.type === 'answer_box'
    );

    // Call Lovable AI to analyze voice search optimization
    const prompt = `Analyze voice search optimization for the keyword "${keyword}":

SERP Features:
- Featured Snippet: ${featuredSnippet ? 'Yes' : 'No'}
${featuredSnippet ? `  Content: ${featuredSnippet.description}` : ''}
- People Also Ask: ${peopleAlsoAsk.length} questions
${peopleAlsoAsk.slice(0, 5).map((q: string) => `  - ${q}`).join('\n')}
- Answer Box: ${answerBox ? 'Yes' : 'No'}

Provide:
1. Voice search readiness score (0-100)
2. Specific optimization tips for voice search
3. Question-based content recommendations
4. Natural language optimization strategies
5. Schema markup recommendations`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a voice search and conversational AI SEO expert. Analyze SERP features and provide actionable voice search optimization strategies.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Calculate voice search score
    let voiceSearchScore = 0;
    if (featuredSnippet) voiceSearchScore += 40;
    if (peopleAlsoAsk.length > 0) voiceSearchScore += 20;
    if (answerBox) voiceSearchScore += 20;
    if (peopleAlsoAsk.length >= 3) voiceSearchScore += 20;

    // Generate optimization tips
    const optimizationTips = [
      featuredSnippet ? '✓ Featured snippet present' : '⚠️ Target featured snippet with concise 40-60 word answers',
      peopleAlsoAsk.length > 0 ? '✓ PAA questions available' : '⚠️ Create FAQ content targeting common questions',
      answerBox ? '✓ Answer box captured' : '⚠️ Structure content for answer boxes with direct answers',
      'Use conversational, natural language in headings',
      'Implement FAQ schema markup',
      'Optimize for "near me" and local voice queries'
    ];

    // Store tracking data
    const { data, error } = await supabaseClient
      .from('voice_search_tracking')
      .insert({
        project_id: projectId,
        keyword,
        has_featured_snippet: !!featuredSnippet,
        snippet_content: featuredSnippet?.description || null,
        people_also_ask: peopleAlsoAsk,
        answer_box_present: !!answerBox,
        voice_search_score: voiceSearchScore,
        optimization_tips: optimizationTips
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      aiAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Voice search optimizer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
