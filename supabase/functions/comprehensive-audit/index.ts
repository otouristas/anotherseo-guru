import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

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
    const { projectId, domain } = await req.json();
    
    console.log('Starting comprehensive audit for:', domain, 'projectId:', projectId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Crawl site with Firecrawl
    console.log('Step 1: Crawling site with Firecrawl...');
    const crawlData = await crawlSite(domain);
    
    // Step 2: Get keyword data from DataForSEO
    console.log('Step 2: Fetching keyword data...');
    const keywordData = await getKeywordData(domain);
    
    // Step 3: Get GSC and GA4 data
    console.log('Step 3: Fetching GSC and GA4 data...');
    const performanceData = await getPerformanceData(projectId, supabase);
    
    // Step 4: Analyze with Gemini AI
    console.log('Step 4: Generating AI insights...');
    const aiInsights = await generateInsights({
      crawlData,
      keywordData,
      performanceData,
      domain
    });
    
    // Step 5: Assemble audit report
    const auditReport = {
      site: domain,
      timestamp: new Date().toISOString(),
      technical: analyzeTechnicalIssues(crawlData),
      keywords: {
        ranking: keywordData.ranking || [],
        gaps: keywordData.gaps || [],
        opportunities: keywordData.opportunities || []
      },
      traffic: performanceData,
      recommendations: aiInsights.recommendations || [],
      summary: aiInsights.summary || '',
      priority_actions: aiInsights.priority_actions || []
    };

    // Store audit in database
    const { error: insertError } = await supabase
      .from('technical_seo_audits')
      .insert({
        project_id: projectId,
        page_url: domain,
        issues: auditReport.technical,
        recommendations: auditReport.recommendations,
        core_web_vitals: performanceData.core_web_vitals || null,
      });

    if (insertError) {
      console.error('Error storing audit:', insertError);
    }

    return new Response(
      JSON.stringify({ success: true, audit: auditReport }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Comprehensive audit error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function crawlSite(domain: string) {
  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) throw new Error('Firecrawl API key not configured');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: domain.startsWith('http') ? domain : `https://${domain}`,
        formats: ['markdown', 'html'],
        includeTags: ['meta', 'h1', 'h2', 'h3', 'title', 'a'],
        onlyMainContent: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      title: data.metadata?.title || '',
      description: data.metadata?.description || '',
      h1: data.metadata?.h1 || '',
      content: data.markdown || '',
      html: data.html || '',
      links: data.links || [],
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error('Crawl error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Crawl failed' };
  }
}

async function getKeywordData(domain: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching keyword data for domain:', domain);

    // Call DataForSEO with correct action parameter
    const { data, error } = await supabase.functions.invoke('dataforseo-research', {
      body: { 
        action: 'serp_analysis',
        keyword: domain,
        location: 'United States'
      }
    });

    if (error) {
      console.error('DataForSEO error:', error);
      throw error;
    }

    console.log('DataForSEO response:', data);

    // Parse DataForSEO response
    const tasks = data?.tasks || [];
    const ranking: any[] = [];
    const gaps: any[] = [];
    const opportunities: any[] = [];

    if (tasks.length > 0 && tasks[0].result) {
      const items = tasks[0].result[0]?.items || [];
      items.forEach((item: any, index: number) => {
        if (item.type === 'organic') {
          ranking.push({
            keyword: item.title || '',
            position: index + 1,
            url: item.url || '',
            domain: item.domain || ''
          });
        }
      });
    }

    return {
      ranking,
      gaps,
      opportunities
    };
  } catch (error) {
    console.error('Keyword data error:', error);
    return { ranking: [], gaps: [], opportunities: [] };
  }
}

async function getPerformanceData(projectId: string, supabase: any) {
  try {
    console.log('Fetching performance data for project:', projectId);

    // Fetch GSC and GA4 settings
    const { data: settings } = await supabase
      .from('google_api_settings')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (!settings?.credentials_json) {
      console.log('No Google credentials found');
      return {
        gsc: { available: false, message: 'Not connected' },
        ga4: { available: false, message: 'Not connected' },
        core_web_vitals: null
      };
    }

    const results: any = {
      gsc: { available: false },
      ga4: { available: false },
      core_web_vitals: null
    };

    // Fetch GSC data if connected
    if (settings.google_search_console_site_url) {
      try {
        console.log('Fetching GSC data...');
        const { data: gscData, error: gscError } = await supabase.functions.invoke('fetch-gsc-data', {
          body: { 
            projectId,
            siteUrl: settings.google_search_console_site_url
          }
        });

        if (!gscError && gscData?.success) {
          results.gsc = {
            available: true,
            ...gscData.data
          };
          console.log('GSC data fetched successfully');
        } else {
          console.error('GSC fetch error:', gscError);
          results.gsc = {
            available: false,
            error: gscError?.message || 'Failed to fetch GSC data'
          };
        }
      } catch (error) {
        console.error('GSC fetch exception:', error);
        results.gsc = {
          available: false,
          error: error instanceof Error ? error.message : 'GSC fetch failed'
        };
      }
    }

    // Fetch GA4 data if connected
    if (settings.google_analytics_property_id) {
      try {
        console.log('Fetching GA4 data...');
        const { data: ga4Data, error: ga4Error } = await supabase.functions.invoke('fetch-ga4-data', {
          body: { 
            projectId,
            propertyId: settings.google_analytics_property_id
          }
        });

        if (!ga4Error && ga4Data?.success) {
          results.ga4 = {
            available: true,
            ...ga4Data.data
          };
          console.log('GA4 data fetched successfully');
        } else {
          console.error('GA4 fetch error:', ga4Error);
          results.ga4 = {
            available: false,
            error: ga4Error?.message || 'Failed to fetch GA4 data'
          };
        }
      } catch (error) {
        console.error('GA4 fetch exception:', error);
        results.ga4 = {
          available: false,
          error: error instanceof Error ? error.message : 'GA4 fetch failed'
        };
      }
    }

    return results;
  } catch (error) {
    console.error('Performance data error:', error);
    return {
      gsc: { available: false, error: 'Failed to fetch performance data' },
      ga4: { available: false, error: 'Failed to fetch performance data' },
      core_web_vitals: null
    };
  }
}

async function generateInsights(data: any) {
  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('Lovable API key not configured');

    const prompt = `You are an expert SEO analyst. Analyze the following website audit data and provide actionable recommendations:

Domain: ${data.domain}

Crawl Data:
- Title: ${data.crawlData.title}
- Meta Description: ${data.crawlData.description}
- H1: ${data.crawlData.h1}
- Word Count: ${data.crawlData.content?.length || 0}
- Internal Links: ${data.crawlData.links?.length || 0}

Keyword Data:
- Ranking Keywords: ${data.keywordData.ranking.length}
- Keyword Gaps: ${data.keywordData.gaps.length}

Performance:
- GSC Available: ${data.performanceData.gsc.available}
- GA4 Available: ${data.performanceData.ga4.available}

Provide:
1. A brief summary of the site's SEO health
2. Top 5 priority actions with specific recommendations
3. Technical issues found
4. Content optimization suggestions
5. Keyword strategy recommendations

Format as JSON with: summary, priority_actions (array), recommendations (array)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert SEO analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      // If not valid JSON, structure it
      return {
        summary: content.substring(0, 500),
        priority_actions: [
          'Improve meta descriptions',
          'Add more internal links',
          'Optimize for target keywords',
          'Improve page speed',
          'Fix technical issues'
        ],
        recommendations: [content]
      };
    }
  } catch (error) {
    console.error('AI insights error:', error);
    return {
      summary: 'Analysis in progress...',
      priority_actions: [],
      recommendations: []
    };
  }
}

function analyzeTechnicalIssues(crawlData: any) {
  const issues: any = {
    broken_links: 0,
    missing_meta: 0,
    duplicate_titles: 0,
    thin_content: 0,
    issues_found: []
  };

  if (!crawlData.success) {
    issues.issues_found.push({ type: 'crawl_error', severity: 'high', message: 'Failed to crawl site' });
    return issues;
  }

  // Check meta description
  if (!crawlData.description || crawlData.description.length < 50) {
    issues.missing_meta++;
    issues.issues_found.push({
      type: 'meta_description',
      severity: 'medium',
      message: 'Meta description is missing or too short'
    });
  }

  // Check title
  if (!crawlData.title || crawlData.title.length < 30 || crawlData.title.length > 60) {
    issues.issues_found.push({
      type: 'title',
      severity: 'medium',
      message: 'Title tag length not optimal (should be 30-60 characters)'
    });
  }

  // Check H1
  if (!crawlData.h1) {
    issues.issues_found.push({
      type: 'heading',
      severity: 'high',
      message: 'Missing H1 tag'
    });
  }

  // Check content length
  if (crawlData.content && crawlData.content.length < 300) {
    issues.thin_content++;
    issues.issues_found.push({
      type: 'content',
      severity: 'medium',
      message: 'Content is thin (less than 300 words)'
    });
  }

  return issues;
}
