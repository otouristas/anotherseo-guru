import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  userId: string;
  projectId?: string;
  content: string;
  url?: string;
  keywords?: string[];
  llmModel?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body: AnalysisRequest = await req.json();
    const { userId, projectId, content, url, keywords = [], llmModel = "gemini-2.5-flash" } = body;

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting comprehensive SEO analysis for user:", userId);

    // Step 1: Fetch GSC Data if URL is provided
    let gscData: any = {};
    let algorithmDrops: any[] = [];

    if (url && projectId) {
      console.log("Fetching GSC data for URL:", url);

      const { data: gscAnalytics, error: gscError } = await supabase
        .from("gsc_analytics")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: false })
        .limit(90);

      if (!gscError && gscAnalytics && gscAnalytics.length > 0) {
        gscData = processGSCData(gscAnalytics);
        algorithmDrops = detectAlgorithmDrops(gscAnalytics);

        console.log("GSC data processed:", {
          totalRecords: gscAnalytics.length,
          dropsDetected: algorithmDrops.length
        });
      }
    }

    // Step 2: Fetch DataForSEO Intelligence (simplified for MVP)
    let dataforSeoData: any = {};
    let competitorData: any[] = [];

    // For now, skip external API calls that might fail
    // We'll generate recommendations based on GSC data and content analysis
    console.log("Skipping external API calls, using GSC data and content analysis");

    // Step 3: Identify Keyword Opportunities
    const keywordOpportunities = identifyKeywordOpportunities(
      gscData,
      dataforSeoData,
      competitorData
    );

    console.log("Identified keyword opportunities:", keywordOpportunities.length);

    // Step 4: AI-Powered Analysis
    const aiAnalysis = await performAIAnalysis(
      content,
      gscData,
      dataforSeoData,
      competitorData,
      keywordOpportunities,
      llmModel
    );

    console.log("AI analysis completed");

    // Step 5: Generate Detailed Recommendations
    const recommendations = generateDetailedRecommendations(
      aiAnalysis,
      gscData,
      keywordOpportunities,
      algorithmDrops
    );

    console.log("Generated recommendations:", recommendations.length);

    // Step 6: Calculate Optimization Score
    const optimizationScore = calculateOptimizationScore(
      content,
      gscData,
      keywordOpportunities,
      aiAnalysis
    );

    // Step 7: Store Results in Database
    const { data: analysisResult, error: insertError } = await supabase
      .from("seo_analysis_results")
      .insert({
        user_id: userId,
        project_id: projectId,
        url: url || null,
        content_hash: hashContent(content),
        analysis_type: "comprehensive",
        llm_model: llmModel,
        gsc_data: gscData,
        dataforseo_data: dataforSeoData,
        competitor_data: competitorData,
        analysis_summary: aiAnalysis.summary,
        optimization_score: optimizationScore,
        estimated_traffic_impact: aiAnalysis.trafficImpact,
        processing_time_ms: Date.now() - startTime,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing analysis:", insertError);
    }

    const analysisId = analysisResult?.id;

    // Store algorithm drops
    if (algorithmDrops.length > 0 && projectId) {
      await supabase.from("algorithm_drops").insert(
        algorithmDrops.map((drop) => ({
          user_id: userId,
          project_id: projectId,
          url: url || "",
          detected_date: drop.date,
          drop_severity: drop.severity,
          affected_keywords: drop.keywords,
          position_drop_avg: drop.avgDrop,
          traffic_loss_estimate: drop.trafficLoss,
          likely_algorithm: drop.algorithm,
          ai_diagnosis: drop.diagnosis,
          recommended_actions: drop.actions,
        }))
      );
    }

    // Store keyword opportunities
    if (keywordOpportunities.length > 0 && analysisId) {
      await supabase.from("keyword_opportunities").insert(
        keywordOpportunities.map((opp) => ({
          user_id: userId,
          project_id: projectId,
          analysis_id: analysisId,
          keyword: opp.keyword,
          current_position: opp.currentPosition,
          target_position: opp.targetPosition,
          search_volume: opp.searchVolume,
          keyword_difficulty: opp.difficulty,
          ctr_estimate: opp.ctrEstimate,
          traffic_potential: opp.trafficPotential,
          opportunity_type: opp.type,
          priority_score: opp.priorityScore,
          quick_win: opp.quickWin,
          recommended_actions: opp.actions,
          gsc_data: opp.gscData || {},
          dataforseo_data: opp.dataforSeoData || {},
        }))
      );
    }

    // Store AI recommendations
    if (recommendations.length > 0 && analysisId) {
      await supabase.from("ai_recommendations").insert(
        recommendations.map((rec) => ({
          user_id: userId,
          project_id: projectId,
          analysis_id: analysisId,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          detailed_steps: rec.steps,
          impact_score: rec.impactScore,
          effort_level: rec.effortLevel,
          priority_level: rec.priorityLevel,
          estimated_traffic_lift: rec.trafficLift,
          implementation_time_hours: rec.timeHours,
          code_examples: rec.codeExamples || [],
          before_after_examples: rec.examples || {},
          related_keywords: rec.relatedKeywords || [],
        }))
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`Analysis completed in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        analysisId,
        optimizationScore,
        gscData,
        algorithmDrops,
        keywordOpportunities,
        recommendations,
        aiAnalysis,
        competitorData,
        processingTime,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("SEO Intelligence Analysis error:", error);

    let errorMessage = "Unknown error occurred";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("Error details:", errorDetails);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails.substring(0, 500),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function processGSCData(analytics: any[]): any {
  const keywordMap = new Map();

  analytics.forEach((row) => {
    const keyword = row.keyword;
    if (!keywordMap.has(keyword)) {
      keywordMap.set(keyword, []);
    }
    keywordMap.get(keyword).push({
      date: row.date,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    });
  });

  const keywordStats = Array.from(keywordMap.entries()).map(([keyword, data]) => {
    const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, 7);
    const previous = sorted.slice(7, 14);

    const recentAvgPosition = recent.reduce((sum: number, d: any) => sum + d.position, 0) / recent.length;
    const previousAvgPosition = previous.length > 0
      ? previous.reduce((sum: number, d: any) => sum + d.position, 0) / previous.length
      : recentAvgPosition;

    return {
      keyword,
      currentPosition: recentAvgPosition,
      previousPosition: previousAvgPosition,
      positionChange: previousAvgPosition - recentAvgPosition,
      clicks: recent.reduce((sum: number, d: any) => sum + d.clicks, 0),
      impressions: recent.reduce((sum: number, d: any) => sum + d.impressions, 0),
      avgCtr: recent.reduce((sum: number, d: any) => sum + d.ctr, 0) / recent.length,
      trend: recentAvgPosition < previousAvgPosition ? "up" : recentAvgPosition > previousAvgPosition ? "down" : "stable",
      data: sorted,
    };
  });

  return {
    totalKeywords: keywordMap.size,
    totalClicks: analytics.reduce((sum, row) => sum + (row.clicks || 0), 0),
    totalImpressions: analytics.reduce((sum, row) => sum + (row.impressions || 0), 0),
    avgPosition: analytics.reduce((sum, row) => sum + (row.position || 0), 0) / analytics.length,
    keywordStats,
  };
}

function detectAlgorithmDrops(analytics: any[]): any[] {
  const drops: any[] = [];
  const keywordsByDate = new Map();

  analytics.forEach((row) => {
    const date = row.date;
    if (!keywordsByDate.has(date)) {
      keywordsByDate.set(date, []);
    }
    keywordsByDate.get(date).push(row);
  });

  const dates = Array.from(keywordsByDate.keys()).sort();

  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i];
    const previousDate = dates[i - 1];

    const currentData = keywordsByDate.get(currentDate);
    const previousData = keywordsByDate.get(previousDate);

    const avgCurrentPosition = currentData.reduce((sum: number, r: any) => sum + r.position, 0) / currentData.length;
    const avgPreviousPosition = previousData.reduce((sum: number, r: any) => sum + r.position, 0) / previousData.length;

    const positionDrop = avgCurrentPosition - avgPreviousPosition;

    if (positionDrop > 5) {
      const affectedKeywords = currentData
        .filter((r: any) => {
          const prev = previousData.find((p: any) => p.keyword === r.keyword);
          return prev && (r.position - prev.position) > 3;
        })
        .map((r: any) => r.keyword);

      drops.push({
        date: currentDate,
        severity: positionDrop > 15 ? "severe" : positionDrop > 10 ? "high" : "moderate",
        avgDrop: positionDrop,
        keywords: affectedKeywords,
        trafficLoss: affectedKeywords.length * 50,
        algorithm: identifyLikelyAlgorithm(currentDate),
        diagnosis: `Detected ${positionDrop.toFixed(1)} position drop affecting ${affectedKeywords.length} keywords`,
        actions: generateDropRecoveryActions(positionDrop, affectedKeywords),
      });
    }
  }

  return drops;
}

function identifyLikelyAlgorithm(date: string): string {
  const algorithms = [
    { name: "Core Update", months: [3, 6, 9, 11] },
    { name: "Helpful Content Update", months: [4, 8, 12] },
    { name: "Spam Update", months: [1, 5, 10] },
  ];

  const month = new Date(date).getMonth() + 1;
  const match = algorithms.find((algo) => algo.months.includes(month));
  return match?.name || "Unknown Update";
}

function generateDropRecoveryActions(drop: number, keywords: string[]): any[] {
  return [
    { action: "Review content quality and E-E-A-T signals", priority: "high" },
    { action: "Check for thin or duplicate content issues", priority: "high" },
    { action: "Analyze top-ranking competitors for these keywords", priority: "medium" },
    { action: "Update content with fresh information and data", priority: "medium" },
    { action: "Improve internal linking to affected pages", priority: "low" },
  ];
}

function processCompetitorData(serpData: any): any[] {
  return (serpData.organic || []).slice(0, 10).map((result: any, index: number) => ({
    position: index + 1,
    url: result.url,
    domain: new URL(result.url).hostname,
    title: result.title,
    description: result.description,
    contentLength: result.description?.length || 0,
  }));
}

function identifyKeywordOpportunities(gscData: any, dataforSeoData: any, competitorData: any[]): any[] {
  const opportunities: any[] = [];

  if (gscData.keywordStats) {
    gscData.keywordStats.forEach((stat: any) => {
      if (stat.currentPosition >= 11 && stat.currentPosition <= 20) {
        opportunities.push({
          keyword: stat.keyword,
          currentPosition: stat.currentPosition,
          targetPosition: 10,
          searchVolume: 0,
          difficulty: 0,
          ctrEstimate: estimateCTR(10),
          trafficPotential: Math.round(stat.impressions * (estimateCTR(10) - stat.avgCtr)),
          type: "quick_win",
          priorityScore: calculatePriorityScore(stat, 0, 0),
          quickWin: true,
          actions: generateOpportunityActions(stat),
          gscData: stat,
        });
      }

      if (stat.trend === "down" && stat.positionChange < -3) {
        opportunities.push({
          keyword: stat.keyword,
          currentPosition: stat.currentPosition,
          targetPosition: stat.previousPosition,
          searchVolume: 0,
          difficulty: 0,
          ctrEstimate: estimateCTR(stat.previousPosition),
          trafficPotential: Math.round(stat.impressions * 0.2),
          type: "recovery",
          priorityScore: calculatePriorityScore(stat, 0, 0),
          quickWin: false,
          actions: [
            { action: "Review recent content changes", priority: "high" },
            { action: "Restore ranking factors that may have changed", priority: "high" },
          ],
          gscData: stat,
        });
      }
    });
  }

  return opportunities.sort((a, b) => b.priorityScore - a.priorityScore);
}

function estimateCTR(position: number): number {
  const ctrCurve: { [key: number]: number } = {
    1: 0.318, 2: 0.158, 3: 0.104, 4: 0.072, 5: 0.055,
    6: 0.044, 7: 0.037, 8: 0.031, 9: 0.027, 10: 0.024,
  };
  return ctrCurve[position] || 0.01;
}

function calculatePriorityScore(stat: any, volume: number, difficulty: number): number {
  let score = 0;
  score += (21 - stat.currentPosition) * 5;
  score += stat.clicks * 2;
  score += stat.impressions * 0.01;
  if (stat.trend === "up") score += 20;
  if (stat.trend === "down") score += 30;
  return Math.round(score);
}

function generateOpportunityActions(stat: any): any[] {
  return [
    { action: "Add more comprehensive content for this keyword", priority: "high" },
    { action: "Improve internal linking with relevant anchor text", priority: "medium" },
    { action: "Optimize meta title and description for CTR", priority: "medium" },
    { action: "Add schema markup if not present", priority: "low" },
  ];
}

async function performAIAnalysis(
  content: string,
  gscData: any,
  dataforSeoData: any,
  competitorData: any[],
  opportunities: any[],
  model: string
): Promise<any> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      // Generate basic analysis without AI API
      const wordCount = content.split(/\s+/).length;
      const hasKeywords = opportunities.length > 0;
      const hasGSC = gscData.totalKeywords > 0;

      return {
        summary: `Content Analysis: ${wordCount} words analyzed. ${hasGSC ? `Found ${gscData.totalKeywords} keywords in GSC data.` : 'No GSC data available.'} ${hasKeywords ? `Identified ${opportunities.length} optimization opportunities.` : ''}`,
        trafficImpact: opportunities.reduce((sum: number, o: any) => sum + (o.trafficPotential || 0), 0),
        recommendations: opportunities.slice(0, 3).map((o: any) => `Optimize for "${o.keyword}" (Position ${o.currentPosition})`),
        keyIssues: [
          wordCount < 1000 ? "Content length below recommended 1000 words" : null,
          !hasGSC ? "No GSC data connected - connect for better insights" : null,
        ].filter(Boolean),
      };
    }

    const prompt = buildAnalysisPrompt(content, gscData, dataforSeoData, competitorData, opportunities);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model === "gpt-4" ? "gpt-4o" : model,
        messages: [
          {
            role: "system",
            content: `You are an expert SEO analyst trained on 2025 Google algorithms. Provide detailed, actionable SEO recommendations based on real performance data.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return {
        summary: "AI analysis failed",
        trafficImpact: 0,
        recommendations: [],
      };
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "";

    return parseAIAnalysis(analysisText);
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      summary: "AI analysis encountered an error",
      trafficImpact: 0,
      recommendations: [],
    };
  }
}

function buildAnalysisPrompt(
  content: string,
  gscData: any,
  dataforSeoData: any,
  competitorData: any[],
  opportunities: any[]
): string {
  return `Analyze this content for SEO optimization:

CONTENT PREVIEW:
${content.substring(0, 2000)}...

CURRENT PERFORMANCE (from Google Search Console):
- Total Keywords Ranking: ${gscData.totalKeywords || 0}
- Total Clicks (Last 30 days): ${gscData.totalClicks || 0}
- Total Impressions: ${gscData.totalImpressions || 0}
- Average Position: ${gscData.avgPosition?.toFixed(1) || "N/A"}

TOP KEYWORD OPPORTUNITIES:
${opportunities.slice(0, 5).map((opp: any) =>
  `- "${opp.keyword}" (Position ${opp.currentPosition}, ${opp.type})`
).join("\n")}

COMPETITOR ANALYSIS:
${competitorData.slice(0, 3).map((comp: any) =>
  `- Position ${comp.position}: ${comp.domain} (${comp.contentLength} chars)`
).join("\n")}

Provide:
1. Overall SEO health assessment
2. Key issues impacting rankings
3. Content gaps vs competitors
4. Specific optimization recommendations
5. Estimated traffic impact if recommendations are implemented

Format as JSON with: summary, keyIssues[], recommendations[], trafficImpact`;
}

function parseAIAnalysis(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse AI response as JSON");
  }

  return {
    summary: text.substring(0, 500),
    trafficImpact: 100,
    recommendations: [],
  };
}

function generateDetailedRecommendations(
  aiAnalysis: any,
  gscData: any,
  opportunities: any[],
  drops: any[]
): any[] {
  const recommendations: any[] = [];

  if (drops.length > 0) {
    recommendations.push({
      category: "Algorithm Recovery",
      title: "Address Recent Ranking Drops",
      description: `Detected ${drops.length} algorithm-related ranking drops affecting key keywords.`,
      steps: drops[0].actions,
      impactScore: 95,
      effortLevel: "high",
      priorityLevel: "critical",
      trafficLift: drops.reduce((sum: number, d: any) => sum + d.trafficLoss, 0),
      timeHours: 8,
    });
  }

  if (opportunities.filter((o) => o.quickWin).length > 0) {
    const quickWins = opportunities.filter((o) => o.quickWin).slice(0, 5);
    recommendations.push({
      category: "Quick Wins",
      title: `Optimize ${quickWins.length} Keywords on Page 2`,
      description: "Target keywords currently ranking 11-20 that can quickly reach page 1.",
      steps: [
        { step: 1, action: "Add 500-1000 words of comprehensive content for each keyword" },
        { step: 2, action: "Improve internal linking from high-authority pages" },
        { step: 3, action: "Optimize meta titles for higher CTR" },
        { step: 4, action: "Add relevant schema markup" },
      ],
      impactScore: 85,
      effortLevel: "medium",
      priorityLevel: "high",
      trafficLift: quickWins.reduce((sum: number, o: any) => sum + o.trafficPotential, 0),
      timeHours: 4,
      relatedKeywords: quickWins.map((o: any) => o.keyword),
    });
  }

  if (gscData.avgPosition && gscData.avgPosition > 10) {
    recommendations.push({
      category: "Content Optimization",
      title: "Improve Overall Content Depth",
      description: "Average ranking position suggests content needs more comprehensive coverage.",
      steps: [
        { step: 1, action: "Expand thin content sections with detailed information" },
        { step: 2, action: "Add expert quotes and original research" },
        { step: 3, action: "Include more visual content (images, charts, videos)" },
        { step: 4, action: "Update outdated statistics and information" },
      ],
      impactScore: 75,
      effortLevel: "high",
      priorityLevel: "medium",
      trafficLift: Math.round(gscData.totalImpressions * 0.15),
      timeHours: 6,
    });
  }

  recommendations.push({
    category: "Technical SEO",
    title: "Optimize Page Experience Signals",
    description: "Ensure Core Web Vitals and technical factors are optimized.",
    steps: [
      { step: 1, action: "Improve page load speed (target < 2.5s LCP)" },
      { step: 2, action: "Reduce cumulative layout shift" },
      { step: 3, action: "Optimize images with modern formats (WebP, AVIF)" },
      { step: 4, action: "Implement proper mobile responsive design" },
    ],
    impactScore: 70,
    effortLevel: "medium",
    priorityLevel: "medium",
    trafficLift: Math.round(gscData.totalClicks * 0.1),
    timeHours: 3,
  });

  return recommendations;
}

function calculateOptimizationScore(
  content: string,
  gscData: any,
  opportunities: any[],
  aiAnalysis: any
): number {
  let score = 0;

  if (content.length > 1500) score += 20;
  else if (content.length > 1000) score += 15;
  else if (content.length > 500) score += 10;

  if (gscData.avgPosition && gscData.avgPosition <= 10) score += 30;
  else if (gscData.avgPosition && gscData.avgPosition <= 20) score += 20;
  else if (gscData.avgPosition && gscData.avgPosition <= 50) score += 10;

  const quickWins = opportunities.filter((o) => o.quickWin).length;
  if (quickWins === 0) score += 20;
  else if (quickWins <= 3) score += 15;
  else if (quickWins <= 5) score += 10;

  const headingCount = (content.match(/#{1,6}\s/g) || []).length;
  if (headingCount >= 5) score += 15;
  else if (headingCount >= 3) score += 10;

  if (content.includes("http") || content.includes("www.")) score += 10;

  const keywordDensity = calculateKeywordDensity(content, gscData.keywordStats || []);
  if (keywordDensity >= 1 && keywordDensity <= 3) score += 15;
  else if (keywordDensity > 0) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateKeywordDensity(content: string, keywords: any[]): number {
  if (keywords.length === 0) return 0;

  const words = content.toLowerCase().split(/\s+/).length;
  const keywordMatches = keywords.reduce((sum, kw) => {
    const regex = new RegExp(kw.keyword.toLowerCase(), "gi");
    return sum + (content.toLowerCase().match(regex) || []).length;
  }, 0);

  return (keywordMatches / words) * 100;
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
