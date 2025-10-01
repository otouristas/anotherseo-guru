import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    
    console.log('Analyzing keywords for project:', projectId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch GSC data for the project
    const { data: gscData, error: gscError } = await supabase
      .from('gsc_analytics')
      .select('*')
      .eq('project_id', projectId)
      .order('impressions', { ascending: false });

    if (gscError) throw gscError;
    if (!gscData || gscData.length === 0) {
      throw new Error('No GSC data found. Please sync your Google Search Console data first.');
    }

    console.log(`Processing ${gscData.length} keyword records`);

    // Group keywords by page
    const pageGroups = new Map<string, any[]>();
    gscData.forEach(record => {
      if (!pageGroups.has(record.page_url)) {
        pageGroups.set(record.page_url, []);
      }
      pageGroups.get(record.page_url)!.push(record);
    });

    console.log(`Grouped into ${pageGroups.size} pages`);

    // Calculate normalization bounds across all keywords
    const allImpressions = gscData.map(k => k.impressions || 0);
    const allPositions = gscData.map(k => k.position || 100);
    
    const svMin = Math.min(...allImpressions);
    const svMax = Math.max(...allImpressions);
    const posMin = Math.min(...allPositions);
    const posMax = Math.max(...allPositions);

    // Process each page cluster
    const analysisResults: Array<{
      project_id: string;
      page_url: string;
      keyword: string;
      cluster_name: string;
      search_volume: number;
      impressions: number;
      clicks: number;
      ctr: number;
      position: number;
      difficulty_score: number;
      potential_score: number;
      opportunity_type: string;
      ai_recommendations?: any;
    }> = [];
    let processedPages = 0;

    for (const [pageUrl, keywords] of pageGroups.entries()) {
      processedPages++;
      console.log(`Processing page ${processedPages}/${pageGroups.size}: ${pageUrl}`);
      
      // Calculate cluster name using AI (first 5 keywords)
      const topKeywords = keywords
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 5)
        .map(k => k.keyword);

      const clusterName = await generateClusterName(topKeywords, lovableApiKey);

      // Analyze each keyword
      for (const keyword of keywords) {
        // Use impressions as search volume proxy
        const searchVolume = keyword.impressions || 0;
        
        // Normalize search volume (0-1)
        const svNorm = svMax > svMin 
          ? (searchVolume - svMin) / (svMax - svMin) 
          : 0.5;

        // Calculate difficulty score from position
        // Lower position (higher rank) = lower difficulty = higher score
        // Position 1 = easiest (score 1), Position 100 = hardest (score 0)
        const positionNorm = posMax > posMin
          ? (keyword.position - posMin) / (posMax - posMin)
          : 0.5;
        
        // Invert so lower position = higher score
        const difficultyScore = 1 - positionNorm;

        // Calculate potential score (weighted average)
        const w1 = 0.5; // Weight for search volume
        const w2 = 0.5; // Weight for difficulty
        const potentialScore = w1 * svNorm + w2 * difficultyScore;

        // Classify opportunity type
        let opportunityType = 'low';
        if (potentialScore >= 0.7) {
          opportunityType = 'high_potential_low_competition';
        } else if (potentialScore >= 0.5) {
          opportunityType = 'medium_potential';
        }

        // Additional analysis flags
        if (keyword.position >= 4 && keyword.position <= 10 && searchVolume > 100) {
          opportunityType = 'quick_win'; // Page 1 but not top 3
        } else if (searchVolume > 500 && keyword.ctr < 0.02) {
          opportunityType = 'high_impressions_low_ctr'; // High visibility, low CTR
        } else if (keyword.position <= 3 && keyword.ctr < 0.05) {
          opportunityType = 'top_position_low_ctr'; // Top ranking but poor CTR
        }

        analysisResults.push({
          project_id: projectId,
          page_url: pageUrl,
          keyword: keyword.keyword,
          cluster_name: clusterName,
          search_volume: searchVolume,
          impressions: keyword.impressions,
          clicks: keyword.clicks,
          ctr: keyword.ctr,
          position: keyword.position,
          difficulty_score: difficultyScore,
          potential_score: potentialScore,
          opportunity_type: opportunityType,
        });
      }
    }

    console.log(`Analyzed ${analysisResults.length} keywords`);

    // Get AI recommendations for top opportunities
    const topOpportunities = analysisResults
      .filter(k => k.potential_score >= 0.5)
      .sort((a, b) => b.potential_score - a.potential_score)
      .slice(0, 20);

    console.log(`Getting AI recommendations for ${topOpportunities.length} top opportunities`);

    // Generate AI recommendations in batches
    for (let i = 0; i < topOpportunities.length; i += 5) {
      const batch = topOpportunities.slice(i, i + 5);
      const recommendations = await generateAIRecommendations(batch, lovableApiKey);
      
      // Attach recommendations to results
      batch.forEach((opp, index) => {
        const result = analysisResults.find(
          r => r.page_url === opp.page_url && r.keyword === opp.keyword
        );
        if (result && recommendations[index]) {
          result.ai_recommendations = recommendations[index];
        }
      });
    }

    // Store results in database
    console.log('Storing analysis results in database...');
    
    // Delete old analysis for this project
    await supabase
      .from('keyword_analysis')
      .delete()
      .eq('project_id', projectId);

    // Insert new analysis in batches
    const batchSize = 500;
    for (let i = 0; i < analysisResults.length; i += batchSize) {
      const batch = analysisResults.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('keyword_analysis')
        .insert(batch);
      
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    console.log('Analysis complete!');

    // Calculate summary statistics
    const summary = {
      totalKeywords: analysisResults.length,
      totalPages: pageGroups.size,
      highPotential: analysisResults.filter(k => k.opportunity_type === 'high_potential_low_competition').length,
      quickWins: analysisResults.filter(k => k.opportunity_type === 'quick_win').length,
      highImpressions: analysisResults.filter(k => k.opportunity_type === 'high_impressions_low_ctr').length,
      topPosition: analysisResults.filter(k => k.opportunity_type === 'top_position_low_ctr').length,
      avgPotentialScore: analysisResults.reduce((sum, k) => sum + k.potential_score, 0) / analysisResults.length,
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        summary,
        message: 'Keyword analysis completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Keyword analysis error:', error);
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

async function generateClusterName(keywords: string[], apiKey: string): Promise<string> {
  try {
    const prompt = `Given these top SEO keywords for a page: ${keywords.join(', ')}\n\nGenerate a short, descriptive cluster name (2-4 words) that represents the main topic. Just return the cluster name, nothing else.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert that creates concise cluster names for groups of keywords.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      console.error('AI cluster naming failed:', await response.text());
      return 'General Content';
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Cluster naming error:', error);
    return 'General Content';
  }
}

async function generateAIRecommendations(opportunities: any[], apiKey: string): Promise<any[]> {
  try {
    const context = opportunities.map((opp, i) => 
      `${i + 1}. Keyword: "${opp.keyword}"
   Page: ${opp.page_url}
   Position: #${opp.position.toFixed(1)}
   Impressions: ${opp.impressions}
   Clicks: ${opp.clicks}
   CTR: ${(opp.ctr * 100).toFixed(2)}%
   Potential Score: ${(opp.potential_score * 100).toFixed(1)}%
   Opportunity Type: ${opp.opportunity_type}`
    ).join('\n\n');

    const prompt = `As an expert SEO consultant, analyze these keyword opportunities and provide specific, actionable recommendations for each:

${context}

For EACH keyword above, provide:
1. Primary Action: One specific optimization to implement
2. Content Strategy: What to add/improve in the content
3. Technical SEO: Any technical improvements needed
4. Quick Win: The fastest way to improve rankings

Format your response as a JSON array with one object per keyword, with keys: primary_action, content_strategy, technical_seo, quick_win`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert SEO consultant who provides specific, actionable recommendations. Always respond with valid JSON arrays.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('AI recommendations failed:', await response.text());
      return opportunities.map(() => ({
        primary_action: 'Optimize content for target keyword',
        content_strategy: 'Add relevant content sections',
        technical_seo: 'Check page performance',
        quick_win: 'Improve meta title and description'
      }));
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return opportunities.map(() => ({
      primary_action: 'Optimize content for target keyword',
      content_strategy: 'Add relevant content sections',
      technical_seo: 'Check page performance',
      quick_win: 'Improve meta title and description'
    }));
  } catch (error) {
    console.error('AI recommendations error:', error);
    return opportunities.map(() => ({
      primary_action: 'Optimize content for target keyword',
      content_strategy: 'Add relevant content sections',
      technical_seo: 'Check page performance',
      quick_win: 'Improve meta title and description'
    }));
  }
}