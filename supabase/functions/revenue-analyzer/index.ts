import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, startDate, endDate, attributionModel = 'first_touch' } = await req.json();

    // Get SERP rankings for revenue-generating keywords
    const { data: rankings } = await supabase
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId)
      .gte('checked_at', startDate)
      .lte('checked_at', endDate)
      .order('checked_at', { ascending: false });

    if (!rankings?.length) {
      throw new Error('No ranking data found for the specified period');
    }

    // Analyze revenue attribution using AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const analysisPrompt = `Analyze SEO revenue attribution for the period ${startDate} to ${endDate}.

Attribution Model: ${attributionModel}
Total keywords tracked: ${rankings.length}
Top ranking keywords: ${rankings.slice(0, 10).map(r => `${r.keyword} (Position ${r.position})`).join(', ')}

Provide realistic revenue attribution analysis:
1. Estimated revenue per keyword (top 10)
2. Conversion rate estimates by position
3. ROI projections
4. Revenue optimization opportunities
5. High-value keyword recommendations

Format as JSON with keys: keywordRevenue (array), conversionRates (object), roiProjections (object), opportunities (array), recommendations (array)`;

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
      }),
    });

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Store revenue attribution data
    for (const kwData of analysis.keywordRevenue) {
      await supabase.from('revenue_attribution').insert({
        project_id: projectId,
        keyword: kwData.keyword,
        page_url: kwData.url || '/',
        traffic_source: 'organic',
        attribution_model: attributionModel,
        period_start: startDate,
        period_end: endDate,
        revenue: kwData.estimatedRevenue,
        conversions: kwData.estimatedConversions,
        conversion_rate: analysis.conversionRates[kwData.keyword],
        roi_percentage: kwData.roi,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        totalRevenue: analysis.keywordRevenue.reduce((sum: number, kw: unknown) => sum + kw.estimatedRevenue, 0),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
