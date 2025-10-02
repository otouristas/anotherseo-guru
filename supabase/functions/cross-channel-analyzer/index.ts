import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, startDate, endDate, channels = ['organic', 'paid', 'social', 'direct'] } = await req.json();

    // Get cross-channel analytics data
    const { data: analyticsData } = await supabase
      .from('cross_channel_analytics')
      .select('*')
      .eq('project_id', projectId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .in('channel', channels)
      .order('metric_date', { ascending: true });

    if (!analyticsData?.length) {
      throw new Error('No analytics data found for the specified period');
    }

    // Aggregate metrics by channel
    const channelMetrics = channels.map((channel: string) => {
      const channelData = analyticsData.filter((d: any) => d.channel === channel);
      return {
        channel,
        totalImpressions: channelData.reduce((sum: number, d: any) => sum + (d.impressions || 0), 0),
        totalClicks: channelData.reduce((sum: number, d: any) => sum + (d.clicks || 0), 0),
        totalConversions: channelData.reduce((sum: number, d: any) => sum + (d.conversions || 0), 0),
        totalRevenue: channelData.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0),
        totalCost: channelData.reduce((sum: number, d: any) => sum + (d.cost || 0), 0),
      };
    });

    // Analyze cross-channel impact using AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const analysisPrompt = `Analyze cross-channel marketing performance for period ${startDate} to ${endDate}.

Channel Performance:
${channelMetrics.map((m: any) => `${m.channel}: ${m.totalConversions} conversions, $${m.totalRevenue.toFixed(2)} revenue, ROAS: ${(m.totalRevenue / (m.totalCost || 1)).toFixed(2)}`).join('\n')}

Provide:
1. Channel synergy analysis (how channels work together)
2. Attribution insights (which channels assist vs convert)
3. Budget reallocation recommendations
4. Cross-channel optimization strategies
5. Expected ROI improvements

Format as JSON with keys: synergyAnalysis, attributionInsights, budgetRecommendations (array), optimizationStrategies (array), expectedImprovements (object)`;

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [{ role: 'user', content: analysisPrompt }],
      }),
    });

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Calculate overall ROAS
    const totalRevenue = channelMetrics.reduce((sum: number, m: any) => sum + m.totalRevenue, 0);
    const totalCost = channelMetrics.reduce((sum: number, m: any) => sum + m.totalCost, 0);
    const overallROAS = totalCost > 0 ? (totalRevenue / totalCost) : 0;

    return new Response(
      JSON.stringify({
        success: true,
        period: { startDate, endDate },
        channelMetrics,
        overallROAS: overallROAS.toFixed(2),
        analysis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
