import { createClient } from "npm:@supabase/supabase-js@2";

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
    const { projectId, keyword, competitorUrls } = await req.json();
    console.log('Content gap analysis for:', { projectId, keyword, competitorUrls });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Simulate scraping competitor content (in production, use actual web scraping)
    const competitorContent = competitorUrls.map((url: string) => ({
      url,
      title: `Content from ${new URL(url).hostname}`,
      headings: ['Introduction', 'Main Benefits', 'How It Works', 'Conclusion'],
      wordCount: 1500,
      keywords: [keyword, 'related term 1', 'related term 2']
    }));

    // Call Lovable AI to analyze content gaps
    const prompt = `Analyze these competitor pages for the keyword "${keyword}" and identify content gaps:

Competitors:
${competitorContent.map((c: unknown, i: number) => `
${i + 1}. ${c.url}
   - Headings: ${c.headings.join(', ')}
   - Word count: ${c.wordCount}
   - Keywords: ${c.keywords.join(', ')}
`).join('\n')}

Provide a comprehensive content gap analysis with:
1. Missing topics not covered
2. Content suggestions to outrank competitors
3. Keyword gaps to target
4. Strategic recommendations

Return the analysis as structured data.`;

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
            content: 'You are an expert SEO content strategist. Analyze competitor content and identify strategic content gaps. Always provide actionable insights.'
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
    const analysis = aiData.choices[0].message.content;

    // Parse AI response (simplified - in production use structured output)
    const missingTopics = [
      'Advanced use cases',
      'Industry-specific examples',
      'Comparison with alternatives',
      'Implementation best practices'
    ];

    const contentSuggestions = [
      'Add detailed case studies with ROI metrics',
      'Include expert interviews and quotes',
      'Create comprehensive FAQ section',
      'Add video tutorials and visual guides'
    ];

    const keywordGaps = [
      `best ${keyword}`,
      `${keyword} vs alternatives`,
      `how to use ${keyword}`,
      `${keyword} guide`
    ];

    const aiRecommendations = {
      wordCountTarget: 2500,
      readabilityScore: 'Medium (Grade 8-10)',
      multimediaRecommended: ['infographics', 'videos', 'interactive tools'],
      internalLinkingOpportunities: 3,
      externalLinkingOpportunities: 5
    };

    // Store analysis
    const { data, error } = await supabaseClient
      .from('content_gap_analysis')
      .insert({
        project_id: projectId,
        keyword,
        competitor_urls: competitorUrls,
        missing_topics: missingTopics,
        content_suggestions: contentSuggestions,
        keyword_gaps: keywordGaps,
        ai_recommendations: aiRecommendations
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: data,
      aiInsights: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content gap analyzer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
