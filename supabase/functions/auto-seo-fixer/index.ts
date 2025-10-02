import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { projectId, pageUrl } = await req.json();
    console.log('Auto SEO fix for:', { projectId, pageUrl });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Simulate page analysis (in production, actually scrape the page)
    const pageIssues = [
      {
        type: 'meta',
        severity: 'high',
        description: 'Meta description missing or too short',
        fix: 'Add meta description: "Discover comprehensive [topic] guide with expert insights, data-driven recommendations, and actionable strategies for [target audience]."'
      },
      {
        type: 'heading',
        severity: 'medium',
        description: 'Multiple H1 tags detected',
        fix: 'Consolidate into single H1 tag with primary keyword'
      },
      {
        type: 'image',
        severity: 'medium',
        description: '5 images missing alt text',
        fix: 'Add descriptive alt text including relevant keywords'
      },
      {
        type: 'speed',
        severity: 'high',
        description: 'Page load time exceeds 3 seconds',
        fix: 'Optimize images, enable lazy loading, minify CSS/JS'
      },
      {
        type: 'mobile',
        severity: 'low',
        description: 'Touch targets too small on mobile',
        fix: 'Increase button/link sizes to minimum 48x48px'
      },
      {
        type: 'schema',
        severity: 'medium',
        description: 'No structured data markup',
        fix: 'Implement Article or BlogPosting schema with JSON-LD'
      }
    ];

    const fixes = [];

    for (const issue of pageIssues) {
      // Store the fix
      const { data: fix } = await supabaseClient
        .from('automated_seo_fixes')
        .insert({
          project_id: projectId,
          page_url: pageUrl,
          issue_type: issue.type,
          issue_severity: issue.severity,
          issue_description: issue.description,
          automated_fix: issue.fix,
          fix_status: issue.severity === 'critical' ? 'applied' : 'pending'
        })
        .select()
        .single();

      if (fix) fixes.push(fix);
    }

    // Get AI recommendations for complex issues
    const prompt = `As an SEO automation specialist, analyze these technical issues for ${pageUrl}:

${pageIssues.map((i, idx) => `${idx + 1}. [${i.severity}] ${i.description}`).join('\n')}

Provide:
1. Priority order for fixing
2. Automation scripts/code snippets where applicable
3. Manual steps for complex fixes
4. Expected impact of each fix
5. Testing recommendations`;

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
            content: 'You are an expert in automated SEO optimization and technical SEO. Provide actionable, code-based solutions.'
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
    }

    const aiData = await aiResponse.json();
    const recommendations = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true, 
      fixes,
      aiRecommendations: recommendations,
      summary: {
        total: fixes.length,
        critical: fixes.filter(f => f.issue_severity === 'critical').length,
        high: fixes.filter(f => f.issue_severity === 'high').length,
        medium: fixes.filter(f => f.issue_severity === 'medium').length,
        low: fixes.filter(f => f.issue_severity === 'low').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auto SEO fixer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
