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
    const { projectId, targetDomains } = await req.json();
    console.log('Link opportunity scoring for:', { projectId, targetDomains });

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
      .select('*')
      .eq('id', projectId)
      .single();

    const opportunityScores: any[] = [];

    for (const domain of targetDomains) {
      // Simplified domain analysis (in production, use actual API)
      const domainAuthority = Math.floor(Math.random() * 50) + 30;
      const relevanceScore = Math.floor(Math.random() * 40) + 60;
      
      // Calculate opportunity score
      const opportunityScore = (domainAuthority * 0.4 + relevanceScore * 0.6);
      
      const outreachDifficulty = opportunityScore > 80 ? 'easy' : 
                                 opportunityScore > 60 ? 'medium' : 'hard';
      
      const successProbability = opportunityScore / 100 * 0.8;

      opportunityScores.push({
        domain,
        domainAuthority,
        relevanceScore,
        opportunityScore,
        outreachDifficulty,
        successProbability
      });
    }

    // Use AI to analyze opportunities
    const prompt = `As a link building expert, analyze these link opportunities and provide strategic recommendations:

Project Domain: ${project?.domain}
Project Focus: ${project?.name}

Link Opportunities:
${JSON.stringify(opportunityScores, null, 2)}

For each opportunity, provide:
1. Refined opportunity assessment
2. Outreach strategy and template
3. Value estimation (how valuable is this link)
4. Best approach (guest post, resource page, broken link, etc.)
5. Red flags to watch for
6. Success probability factors`;

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
            content: 'You are a link building expert specializing in identifying high-quality backlink opportunities and creating effective outreach strategies.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) throw new Error('Rate limit exceeded');
      if (aiResponse.status === 402) throw new Error('AI credits exhausted');
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();

    // Store opportunities
    const records = opportunityScores.map(opp => ({
      project_id: projectId,
      target_domain: opp.domain,
      opportunity_score: opp.opportunityScore,
      domain_authority: opp.domainAuthority,
      relevance_score: opp.relevanceScore,
      outreach_difficulty: opp.outreachDifficulty,
      success_probability: opp.successProbability,
      estimated_value: opp.opportunityScore * 10,
      outreach_template: `Hi there,\n\nI came across your site ${opp.domain} and loved your content on [topic].\n\nI recently published a comprehensive guide on [related topic] at ${project?.domain} that I think would be valuable for your readers.\n\nWould you be interested in checking it out?\n\nBest regards`,
      reasoning: aiData.choices[0].message.content
    }));

    const { data, error } = await supabaseClient
      .from('link_opportunity_scoring')
      .insert(records)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      opportunities: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Link opportunity scorer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
