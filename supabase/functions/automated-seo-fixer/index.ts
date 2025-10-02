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
    const { projectId, pageUrl } = await req.json();
    console.log('Automated SEO fix analysis for:', { projectId, pageUrl });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get technical audit data for this page
    const { data: auditData } = await supabaseClient
      .from('technical_seo_audits')
      .select('*')
      .eq('project_id', projectId)
      .eq('page_url', pageUrl)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    const issues = auditData?.issues || {};
    const detectedIssues: any[] = [];

    // Analyze issues and generate automated fixes
    if (!auditData?.meta_robots || auditData.meta_robots === 'noindex') {
      detectedIssues.push({
        issue_type: 'meta',
        issue_severity: 'critical',
        issue_description: 'Page is set to noindex - blocking search engines',
        automated_fix: 'Remove noindex tag and add: <meta name="robots" content="index, follow">',
        fix_status: 'manual_required'
      });
    }

    if (!auditData?.canonical_url) {
      detectedIssues.push({
        issue_type: 'meta',
        issue_severity: 'high',
        issue_description: 'Missing canonical URL',
        automated_fix: `Add canonical tag: <link rel="canonical" href="${pageUrl}">`,
        fix_status: 'manual_required'
      });
    }

    if (auditData?.page_speed_score && auditData.page_speed_score < 50) {
      detectedIssues.push({
        issue_type: 'speed',
        issue_severity: 'high',
        issue_description: `Poor page speed score: ${auditData.page_speed_score}/100`,
        automated_fix: 'Optimize images, minify CSS/JS, enable compression, use CDN',
        fix_status: 'manual_required'
      });
    }

    if (!auditData?.mobile_friendly) {
      detectedIssues.push({
        issue_type: 'mobile',
        issue_severity: 'critical',
        issue_description: 'Page is not mobile-friendly',
        automated_fix: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
        fix_status: 'manual_required'
      });
    }

    if (!auditData?.schema_markup || auditData.schema_markup.length === 0) {
      detectedIssues.push({
        issue_type: 'schema',
        issue_severity: 'medium',
        issue_description: 'Missing structured data (Schema.org)',
        automated_fix: 'Add appropriate schema markup (Article, Product, Organization, etc.)',
        fix_status: 'manual_required'
      });
    }

    // Use AI to analyze and prioritize fixes
    const prompt = `As an SEO automation expert, analyze these technical issues and provide automated fix strategies:

Page URL: ${pageUrl}
Detected Issues:
${JSON.stringify(detectedIssues, null, 2)}

Audit Data:
${JSON.stringify(auditData, null, 2)}

Provide:
1. Priority order for fixes
2. Step-by-step automated implementation guides
3. Expected impact of each fix
4. Which fixes can be automated vs manual
5. Risk assessment for automated changes`;

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
            content: 'You are a technical SEO automation expert specializing in identifying and implementing automated SEO fixes.'
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

    // Store detected issues
    const fixRecords = detectedIssues.map(issue => ({
      ...issue,
      project_id: projectId,
      page_url: pageUrl,
      fix_result: { aiAnalysis: aiData.choices[0].message.content }
    }));

    if (fixRecords.length > 0) {
      await supabaseClient
        .from('automated_seo_fixes')
        .insert(fixRecords);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      issuesFound: fixRecords.length,
      fixes: fixRecords
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Automated SEO fixer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
