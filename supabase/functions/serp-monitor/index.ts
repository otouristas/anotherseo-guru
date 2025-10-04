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
    console.log('SERP monitoring for:', { projectId, keyword });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get project details
    const { data: project } = await supabaseClient
      .from('seo_projects')
      .select('domain, target_location')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Get previous ranking
    const { data: previousRanking } = await supabaseClient
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId)
      .eq('keyword', keyword)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    // Call SERP tracker to get current ranking
    const { data: trackingData, error: trackError } = await supabaseClient.functions.invoke('serp-tracker', {
      body: { 
        keyword, 
        domain: project.domain,
        location: project.target_location || 'United States'
      }
    });

    if (trackError) {
      console.error('SERP tracking error:', trackError);
      throw trackError;
    }

    const currentPosition = trackingData.domainPosition || null;
    const alerts: unknown[] = [];

    // Create alerts based on changes
    if (previousRanking && currentPosition) {
      const positionChange = previousRanking.position - currentPosition;
      
      // Significant position change
      if (Math.abs(positionChange) >= 3) {
        alerts.push({
          project_id: projectId,
          keyword,
          alert_type: positionChange > 0 ? 'position_change' : 'ranking_drop',
          severity: Math.abs(positionChange) >= 5 ? 'high' : 'medium',
          old_position: previousRanking.position,
          new_position: currentPosition,
          message: positionChange > 0 
            ? `🎉 Ranking improved by ${positionChange} positions for "${keyword}"` 
            : `⚠️ Ranking dropped by ${Math.abs(positionChange)} positions for "${keyword}"`
        });
      }

      // Featured snippet lost
      if (previousRanking.featured_snippet && !trackingData.features?.featuredSnippet) {
        alerts.push({
          project_id: projectId,
          keyword,
          alert_type: 'snippet_lost',
          severity: 'high',
          old_position: previousRanking.position,
          new_position: currentPosition,
          message: `❌ Lost featured snippet for "${keyword}"`
        });
      }

      // New competitor in top 3
      if (currentPosition && currentPosition <= 3 && trackingData.competitors) {
        const newCompetitors = trackingData.competitors.filter((comp: unknown) => 
          comp.position <= 3 && !previousRanking.url
        );
        
        if (newCompetitors.length > 0) {
          newCompetitors.forEach((comp: unknown) => {
            alerts.push({
              project_id: projectId,
              keyword,
              alert_type: 'new_competitor',
              severity: 'medium',
              competitor_domain: new URL(comp.url).hostname,
              message: `🔍 New competitor in top 3: ${new URL(comp.url).hostname}`
            });
          });
        }
      }
    } else if (currentPosition) {
      // First time tracking
      alerts.push({
        project_id: projectId,
        keyword,
        alert_type: 'position_change',
        severity: 'low',
        new_position: currentPosition,
        message: `📊 Started tracking "${keyword}" at position ${currentPosition}`
      });
    }

    // Insert alerts
    if (alerts.length > 0) {
      await supabaseClient.from('serp_alerts').insert(alerts);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      alerts: alerts.length,
      currentPosition 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SERP monitor error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
