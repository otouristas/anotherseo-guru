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

    const { reportId, projectId } = await req.json();

    // Get report configuration
    const { data: report } = await supabase
      .from('white_label_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (!report) {
      throw new Error('Report not found');
    }

    // Gather data based on report sections
    const reportData: any = {};

    if (report.report_sections.serp) {
      const { data: serpData } = await supabase
        .from('serp_rankings')
        .select('*')
        .eq('project_id', projectId)
        .order('checked_at', { ascending: false })
        .limit(100);
      reportData.serp = serpData;
    }

    if (report.report_sections.backlinks) {
      const { data: backlinkData } = await supabase
        .from('backlink_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('last_checked', { ascending: false })
        .limit(50);
      reportData.backlinks = backlinkData;
    }

    if (report.report_sections.technical) {
      const { data: technicalData } = await supabase
        .from('technical_seo_audits')
        .select('*')
        .eq('project_id', projectId)
        .order('checked_at', { ascending: false })
        .limit(10);
      reportData.technical = technicalData;
    }

    // Generate report narrative using AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const reportPrompt = `Generate a professional white-label SEO report for ${report.client_name}.

Report Type: ${report.report_type}
Sections: ${Object.keys(report.report_sections).join(', ')}

Data Summary:
- SERP Rankings: ${reportData.serp?.length || 0} keywords
- Backlinks: ${reportData.backlinks?.length || 0} links
- Technical Issues: ${reportData.technical?.length || 0} audits

Create an executive summary, key insights, and actionable recommendations in a professional tone suitable for client presentation.

Format as JSON with keys: executiveSummary, keyMetrics, insights (array), recommendations (array), nextSteps (array)`;

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [{ role: 'user', content: reportPrompt }],
      }),
    });

    const aiResult = await aiResponse.json();
    const narrative = JSON.parse(aiResult.choices[0].message.content);

    // Update report with generated content
    await supabase
      .from('white_label_reports')
      .update({
        last_generated: new Date().toISOString(),
      })
      .eq('id', reportId);

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          ...report,
          data: reportData,
          narrative,
          generatedAt: new Date().toISOString(),
        },
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
