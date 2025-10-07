import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenizationResult {
  keyword: string;
  tfIdfScore: number;
  termFrequency: number;
  documentFrequency: number;
}

interface KeywordMetrics {
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition_index: number;
}

interface GSCMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface LinkOpportunity {
  source_page_id: string;
  source_url: string;
  target_page_id: string;
  target_url: string;
  keyword: string;
  keyword_score: number;
  page_score: number;
  priority_score: number;
  suggested_anchor_text: string;
  estimated_traffic_lift: number;
}

// Simple TF-IDF implementation
class TFIDFCalculator {
  private documents: string[] = [];
  private documentCount: number = 0;

  addDocument(content: string) {
    this.documents.push(content);
    this.documentCount = this.documents.length;
  }

  private tokenize(text: string): string[] {
    // Advanced tokenization with stop word removal
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its',
      'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'i', 'you', 'we', 'they', 'this', 'these',
      'those', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'do', 'does', 'did',
      'have', 'had', 'having', 'been', 'being', 'am', 'are', 'is', 'was', 'were', 'be', 'being', 'been'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(token => 
        token.length > 3 && 
        !stopWords.has(token) && 
        !/^\d+$/.test(token) && // Remove pure numbers
        !/^[a-z]{1,2}$/.test(token) // Remove single/double letters
      );
  }

  private calculateTermFrequency(term: string, documentIndex: number): number {
    const tokens = this.tokenize(this.documents[documentIndex]);
    const termCount = tokens.filter(token => token === term).length;
    return tokens.length > 0 ? termCount / tokens.length : 0;
  }

  private calculateDocumentFrequency(term: string): number {
    return this.documents.filter(doc => 
      this.tokenize(doc).includes(term)
    ).length;
  }

  private calculateInverseDocumentFrequency(term: string): number {
    const df = this.calculateDocumentFrequency(term);
    return df > 0 ? Math.log(this.documentCount / df) : 0;
  }

  calculateTFIDF(documentIndex: number): TokenizationResult[] {
    const tokens = this.tokenize(this.documents[documentIndex]);
    const uniqueTokens = [...new Set(tokens)];
    const results: TokenizationResult[] = [];

    for (const token of uniqueTokens) {
      const tf = this.calculateTermFrequency(token, documentIndex);
      const df = this.calculateDocumentFrequency(token);
      const idf = this.calculateInverseDocumentFrequency(token);
      const tfIdf = tf * idf;

      if (tfIdf > 0.1) { // Threshold for relevance
        results.push({
          keyword: token,
          tfIdfScore: tfIdf,
          termFrequency: Math.round(tf * tokens.length),
          documentFrequency: df
        });
      }
    }

    return results.sort((a, b) => b.tfIdfScore - a.tfIdfScore);
  }
}

// DataForSEO Keywords API integration
async function fetchKeywordMetrics(keywords: string[]): Promise<Map<string, KeywordMetrics>> {
  const username = Deno.env.get('DATAFORSEO_USERNAME');
  const password = Deno.env.get('DATAFORSEO_PASSWORD');

  if (!username || !password) {
    console.warn('DataForSEO credentials not found');
    return new Map();
  }

  try {
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [{
          keywords: keywords.slice(0, 100), // Limit to 100 keywords per request
          location_name: 'United States',
          language_name: 'English'
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    const metricsMap = new Map<string, KeywordMetrics>();

    if (data.tasks && data.tasks[0] && data.tasks[0].result) {
      for (const result of data.tasks[0].result) {
        metricsMap.set(result.keyword, {
          search_volume: result.search_volume || 0,
          keyword_difficulty: result.competition_index || 0,
          cpc: result.cpc || 0,
          competition_index: result.competition_index || 0
        });
      }
    }

    return metricsMap;
  } catch (error) {
    console.error('DataForSEO API error:', error);
    return new Map();
  }
}

// Google Search Console API integration
async function fetchGSCMetrics(siteUrl: string, accessToken: string): Promise<Map<string, GSCMetrics>> {
  try {
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
    const endDate = new Date();

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['query', 'page'],
          rowLimit: 1000,
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'country',
              operator: 'equals',
              expression: 'usa'
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`GSC API error: ${response.status}`);
    }

    const data = await response.json();
    const metricsMap = new Map<string, GSCMetrics>();

    if (data.rows) {
      for (const row of data.rows) {
        const [query, page] = row.keys;
        const key = `${query}|${page}`;
        
        if (!metricsMap.has(key)) {
          metricsMap.set(key, {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            position: 100
          });
        }

        const existing = metricsMap.get(key)!;
        existing.impressions += row.impressions || 0;
        existing.clicks += row.clicks || 0;
        existing.ctr = existing.clicks / Math.max(existing.impressions, 1);
        existing.position = Math.min(existing.position, row.position || 100);
      }
    }

    return metricsMap;
  } catch (error) {
    console.error('GSC API error:', error);
    return new Map();
  }
}

// Firecrawl integration for page crawling
async function crawlWebsite(siteUrl: string): Promise<any[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!apiKey) {
    throw new Error('Firecrawl API key not found');
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v0/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: siteUrl,
        crawlerOptions: {
          includes: ['*'],
          excludes: ['/admin/*', '/wp-admin/*', '/api/*']
        },
        maxDepth: 3,
        limit: 100,
        extractorOptions: {
          mode: 'llm-extraction',
          extractionPrompt: 'Extract the main content, title, and key topics from this page for SEO analysis.',
          extractionSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              topics: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Firecrawl API error:', error);
    throw error;
  }
}

// Mathematical scoring functions
function calculateKeywordScore(
  searchVolume: number,
  impressions: number,
  keywordDifficulty: number,
  relevanceScore: number = 1.0
): number {
  return (searchVolume * impressions) / (keywordDifficulty + 1) * relevanceScore;
}

function calculatePageScore(
  impressions: number,
  avgPosition: number,
  incomingLinks: number
): number {
  // Estimate CTR potential based on position (simplified curve)
  const ctrPotential = Math.max(0.3 - (avgPosition * 0.002), 0.01);
  
  // Rank factor (lower position = better)
  const rankFactor = Math.max(1 - (avgPosition / 100), 0.1);
  
  return (impressions * ctrPotential) / (Math.max(incomingLinks, 1) + 1) * rankFactor;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { projectId, siteUrl, analysisName = 'Internal Linking Analysis' } = await req.json();

    if (!projectId || !siteUrl) {
      throw new Error('Project ID and site URL are required');
    }

    console.log(`Starting internal linking analysis for ${siteUrl}`);

    // 1. Create analysis record
    const { data: analysisRecord, error: analysisError } = await supabaseClient
      .from('internal_linking_analyses')
      .insert({
        project_id: projectId,
        analysis_name: analysisName,
        status: 'running'
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // 2. Crawl website with Firecrawl
    console.log('Crawling website...');
    const crawledPages = await crawlWebsite(siteUrl);
    
    if (crawledPages.length === 0) {
      throw new Error('No pages found during crawling');
    }

    // 3. Store crawled pages
    const pageRecords = [];
    for (const page of crawledPages) {
      const { data: pageRecord, error: pageError } = await supabaseClient
        .from('internal_linking_pages')
        .upsert({
          project_id: projectId,
          url: page.url,
          title: page.metadata?.title || '',
          content: page.extract?.content || page.markdown || '',
          markdown_content: page.markdown || '',
          word_count: (page.extract?.content || page.markdown || '').split(/\s+/).length,
          status: 'active'
        })
        .select()
        .single();

      if (pageError) {
        console.error(`Error storing page ${page.url}:`, pageError);
        continue;
      }

      pageRecords.push(pageRecord);
    }

    console.log(`Stored ${pageRecords.length} pages`);

    // 4. Tokenization and TF-IDF calculation
    console.log('Performing tokenization and TF-IDF analysis...');
    const tfidfCalculator = new TFIDFCalculator();
    
    // Add all documents to TF-IDF calculator
    for (const pageRecord of pageRecords) {
      const content = pageRecord.content || pageRecord.markdown_content || '';
      tfidfCalculator.addDocument(content);
    }

    // Extract keywords for each page
    const allKeywords = new Set<string>();
    for (let i = 0; i < pageRecords.length; i++) {
      const pageRecord = pageRecords[i];
      const tfidfResults = tfidfCalculator.calculateTFIDF(i);
      
      // Store top 20 keywords per page
      const topKeywords = tfidfResults.slice(0, 20);
      
      for (const result of topKeywords) {
        allKeywords.add(result.keyword);
        
        const { error: keywordError } = await supabaseClient
          .from('internal_linking_keywords')
          .upsert({
            project_id: projectId,
            page_id: pageRecord.id,
            keyword: result.keyword,
            tf_idf_score: result.tfIdfScore,
            term_frequency: result.termFrequency,
            document_frequency: result.documentFrequency,
            total_frequency: result.termFrequency,
            is_relevant: result.tfIdfScore > 0.2
          });

        if (keywordError) {
          console.error(`Error storing keyword ${result.keyword}:`, keywordError);
        }
      }
    }

    console.log(`Extracted ${allKeywords.size} unique keywords`);

    // 5. Fetch keyword metrics from DataForSEO
    console.log('Fetching keyword metrics from DataForSEO...');
    const keywordMetrics = await fetchKeywordMetrics(Array.from(allKeywords));
    
    // Store keyword metrics
    for (const [keyword, metrics] of keywordMetrics) {
      const { error: metricsError } = await supabaseClient
        .from('keyword_metrics')
        .upsert({
          project_id: projectId,
          keyword,
          search_volume: metrics.search_volume,
          keyword_difficulty: metrics.keyword_difficulty,
          cpc: metrics.cpc,
          competition_index: metrics.competition_index
        });

      if (metricsError) {
        console.error(`Error storing metrics for ${keyword}:`, metricsError);
      }
    }

    // 6. Fetch GSC metrics (if access token available)
    let gscMetrics = new Map<string, GSCMetrics>();
    const gscAccessToken = Deno.env.get('GSC_ACCESS_TOKEN');
    
    if (gscAccessToken) {
      console.log('Fetching GSC metrics...');
      gscMetrics = await fetchGSCMetrics(siteUrl, gscAccessToken);
      
      // Store GSC metrics
      for (const [key, metrics] of gscMetrics) {
        const [query, page] = key.split('|');
        const { error: gscError } = await supabaseClient
          .from('gsc_page_metrics')
          .upsert({
            project_id: projectId,
            page_url: page,
            query,
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            ctr: metrics.ctr,
            position: metrics.position,
            date: new Date().toISOString().split('T')[0]
          });

        if (gscError) {
          console.error(`Error storing GSC metrics:`, gscError);
        }
      }
    }

    // 7. Calculate link opportunities
    console.log('Calculating link opportunities...');
    const opportunities: LinkOpportunity[] = [];

    for (const sourcePage of pageRecords) {
      // Get keywords for this source page
      const { data: sourceKeywords } = await supabaseClient
        .from('internal_linking_keywords')
        .select('keyword, tf_idf_score')
        .eq('page_id', sourcePage.id)
        .eq('is_relevant', true)
        .order('tf_idf_score', { ascending: false })
        .limit(10);

      if (!sourceKeywords) continue;

      for (const sourceKeyword of sourceKeywords) {
        // Get keyword metrics
        const { data: keywordMetric } = await supabaseClient
          .from('keyword_metrics')
          .select('*')
          .eq('project_id', projectId)
          .eq('keyword', sourceKeyword.keyword)
          .single();

        if (!keywordMetric) continue;

        // Calculate keyword score
        const gscKey = `${sourceKeyword.keyword}|${sourcePage.url}`;
        const gscMetric = gscMetrics.get(gscKey);
        const impressions = gscMetric?.impressions || 0;
        const relevanceScore = impressions > 0 ? 1.0 : 0.5;
        
        const keywordScore = calculateKeywordScore(
          keywordMetric.search_volume,
          impressions,
          keywordMetric.keyword_difficulty,
          relevanceScore
        );

        if (keywordScore < 100) continue; // Skip low-opportunity keywords

        // Find best target pages
        for (const targetPage of pageRecords) {
          if (targetPage.id === sourcePage.id) continue;

          // Check if target page content contains the keyword
          const targetContent = targetPage.content || targetPage.markdown_content || '';
          if (!targetContent.toLowerCase().includes(sourceKeyword.keyword.toLowerCase())) {
            continue;
          }

          // Calculate page score
          const targetGscKey = `|${targetPage.url}`;
          let targetImpressions = 0;
          let targetPosition = 100;
          
          for (const [key, metric] of gscMetrics) {
            if (key.endsWith(targetGscKey)) {
              targetImpressions += metric.impressions;
              targetPosition = Math.min(targetPosition, metric.position);
            }
          }

          // Count incoming links to target page
          const { count: incomingLinks } = await supabaseClient
            .from('internal_links')
            .select('*', { count: 'exact', head: true })
            .eq('target_page_id', targetPage.id);

          const pageScore = calculatePageScore(
            targetImpressions,
            targetPosition,
            incomingLinks || 0
          );

          if (pageScore > 0) {
            const priorityScore = keywordScore * pageScore;
            const estimatedTrafficLift = Math.round(targetImpressions * 0.1); // Estimate 10% lift

            opportunities.push({
              source_page_id: sourcePage.id,
              source_url: sourcePage.url,
              target_page_id: targetPage.id,
              target_url: targetPage.url,
              keyword: sourceKeyword.keyword,
              keyword_score: keywordScore,
              page_score: pageScore,
              priority_score: priorityScore,
              suggested_anchor_text: `Learn more about ${sourceKeyword.keyword}`,
              estimated_traffic_lift: estimatedTrafficLift
            });
          }
        }
      }
    }

    // Sort opportunities by priority score
    opportunities.sort((a, b) => b.priority_score - a.priority_score);

    // 8. Store opportunities (top 50)
    console.log(`Found ${opportunities.length} opportunities, storing top 50...`);
    for (const opportunity of opportunities.slice(0, 50)) {
      const { error: oppError } = await supabaseClient
        .from('internal_linking_opportunities')
        .insert({
          project_id: projectId,
          source_page_id: opportunity.source_page_id,
          target_page_id: opportunity.target_page_id,
          keyword: opportunity.keyword,
          keyword_score: opportunity.keyword_score,
          page_score: opportunity.page_score,
          priority_score: opportunity.priority_score,
          suggested_anchor_text: opportunity.suggested_anchor_text,
          estimated_traffic_lift: opportunity.estimated_traffic_lift,
          implementation_status: 'pending'
        });

      if (oppError) {
        console.error('Error storing opportunity:', oppError);
      }
    }

    // 9. Update analysis record
    const { error: updateError } = await supabaseClient
      .from('internal_linking_analyses')
      .update({
        total_pages_crawled: pageRecords.length,
        total_keywords_extracted: allKeywords.size,
        total_opportunities_found: opportunities.length,
        status: 'completed',
        results_summary: {
          top_opportunities: opportunities.slice(0, 10).map(opp => ({
            keyword: opp.keyword,
            priority_score: opp.priority_score,
            estimated_traffic_lift: opp.estimated_traffic_lift
          })),
          analysis_date: new Date().toISOString()
        }
      })
      .eq('id', analysisRecord.id);

    if (updateError) {
      console.error('Error updating analysis record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisRecord.id,
        pages_crawled: pageRecords.length,
        keywords_extracted: allKeywords.size,
        opportunities_found: opportunities.length,
        top_opportunities: opportunities.slice(0, 10),
        message: 'Internal linking analysis completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Internal linking analysis error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
