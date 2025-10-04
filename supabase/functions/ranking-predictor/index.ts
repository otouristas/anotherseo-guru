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
    const { projectId, keyword } = await req.json();
    console.log('Ranking prediction for:', { projectId, keyword });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get historical ranking data
    const { data: historicalData, error: historyError } = await supabaseClient
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId)
      .eq('keyword', keyword)
      .order('checked_at', { ascending: false })
      .limit(30);

    if (historyError) throw historyError;

    if (!historicalData || historicalData.length < 3) {
      throw new Error('Insufficient historical data for prediction (minimum 3 data points required)');
    }

    const currentPosition = historicalData[0]?.position || null;

    // Prepare data for AI analysis
    const dataPoints = historicalData.map((d: unknown) => ({
      position: d.position,
      date: d.checked_at,
      hasFeaturedSnippet: d.featured_snippet,
      hasLocalPack: d.local_pack
    }));

    const prompt = `As an SEO data scientist, analyze this ranking history for the keyword "${keyword}" and predict future rankings:

Historical Data (most recent first):
${JSON.stringify(dataPoints, null, 2)}

Current Position: ${currentPosition}

Provide predictions for:
1. Position in 7 days
2. Position in 30 days  
3. Position in 90 days
4. Confidence score (0-100)
5. Trend analysis (improving/declining/stable)
6. Key factors affecting the prediction

Consider: ranking velocity, volatility, seasonal patterns, and SERP features.`;

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
            content: 'You are an SEO data scientist specializing in ranking predictions using time series analysis and machine learning concepts.'
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
    const aiPrediction = aiData.choices[0].message.content;

    // Calculate simple trend
    let trend = 'stable';
    if (historicalData.length >= 5) {
      const recent = historicalData.slice(0, 5).map((d: unknown) => d.position);
      const avgRecent = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
      if (avgRecent < currentPosition) trend = 'improving';
      else if (avgRecent > currentPosition) trend = 'declining';
    }

    // Generate predictions (simplified - AI would provide more accurate predictions)
    const velocity = historicalData.length >= 7 
      ? (historicalData[6].position - currentPosition) / 7 
      : 0;

    const predicted7d = Math.max(1, Math.round(currentPosition - velocity * 7));
    const predicted30d = Math.max(1, Math.round(currentPosition - velocity * 30));
    const predicted90d = Math.max(1, Math.round(currentPosition - velocity * 90));

    const factors = {
      rankingVelocity: velocity,
      volatility: historicalData.length >= 7 
        ? Math.abs(historicalData[0].position - historicalData[6].position) 
        : 0,
      hasFeaturedSnippet: historicalData[0]?.featured_snippet || false,
      dataPoints: historicalData.length,
      aiInsights: aiPrediction
    };

    // Store prediction
    const { data, error } = await supabaseClient
      .from('ranking_predictions')
      .insert({
        project_id: projectId,
        keyword,
        current_position: currentPosition,
        predicted_position_7d: predicted7d,
        predicted_position_30d: predicted30d,
        predicted_position_90d: predicted90d,
        confidence_score: 75, // Simplified
        trend,
        factors
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      prediction: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ranking predictor error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
