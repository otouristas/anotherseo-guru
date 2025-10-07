import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced SEO Analysis Engine
// Implements sophisticated algorithms for ranking prediction, CRO analysis, and keyword optimization

interface SEOAnalysisRequest {
  projectId: string;
  analysisType: 'ranking_prediction' | 'cro_analysis' | 'keyword_difficulty' | 'serp_optimization' | 'comprehensive';
  data: any;
}

interface RankingFactors {
  contentQuality: number;
  keywordDensity: number;
  contentLength: number;
  readabilityScore: number;
  semanticRelevance: number;
  pageSpeed: number;
  mobileFriendliness: number;
  coreWebVitals: number;
  internalLinks: number;
  externalLinks: number;
  domainAuthority: number;
  pageAuthority: number;
  backlinkCount: number;
  backlinkQuality: number;
  clickThroughRate: number;
  bounceRate: number;
  dwellTime: number;
  pogoSticking: number;
  competitorStrength: number;
  keywordCompetition: number;
  serpFeatures: number;
}

interface ConversionFactors {
  trafficSource: 'organic' | 'paid' | 'social' | 'direct' | 'email' | 'referral';
  keywordIntent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  userSegment: 'new' | 'returning' | 'high-value' | 'mobile' | 'desktop';
  pageLoadTime: number;
  pageRelevance: number;
  contentMatch: number;
  navigationClarity: number;
  formUsability: number;
  trustSignals: number;
  urgencyIndicators: number;
  ctaVisibility: number;
  ctaRelevance: number;
  valueProposition: number;
  socialProof: number;
}

// Advanced Ranking Prediction Algorithm
function predictRanking(factors: RankingFactors, currentRank: number, timeHorizon: number = 30) {
  // Content scoring with advanced algorithms
  const contentScore = (
    Math.min(1, factors.contentQuality / 100) * 0.30 +
    Math.exp(-Math.pow((factors.keywordDensity - 2.5) / 1.5, 2)) * 0.20 +
    Math.exp(-Math.pow((factors.contentLength - 1400) / 600, 2)) * 0.20 +
    Math.exp(-Math.pow((factors.readabilityScore - 65) / 15, 2)) * 0.15 +
    Math.min(1, factors.semanticRelevance / 100) * 0.15
  ) * 100;

  // Technical scoring with performance optimization
  const technicalScore = (
    Math.min(1, factors.pageSpeed / 100) * 0.25 +
    (factors.mobileFriendliness > 0.9 ? 1 : 0.5) * 0.25 +
    Math.min(1, factors.coreWebVitals / 100) * 0.25 +
    Math.exp(-Math.pow((factors.internalLinks - 4) / 3, 2)) * 0.15 +
    Math.exp(-Math.pow((factors.externalLinks - 3) / 2, 2)) * 0.10
  ) * 100;

  // Authority scoring with logarithmic scaling
  const authorityScore = (
    Math.log(factors.domainAuthority + 1) / Math.log(101) * 0.40 +
    factors.pageAuthority / 100 * 0.30 +
    (1 - Math.exp(-factors.backlinkCount / 1000)) * 0.20 +
    factors.backlinkQuality / 100 * 0.10
  ) * 100;

  // Engagement scoring with behavioral analysis
  const engagementScore = (
    Math.exp(-Math.pow((factors.clickThroughRate - 4) / 2, 2)) * 0.30 +
    Math.max(0, (100 - factors.bounceRate) / 100) * 0.25 +
    Math.exp(-Math.pow((factors.dwellTime - 150) / 60, 2)) * 0.25 +
    Math.max(0, (100 - factors.pogoSticking) / 100) * 0.20
  ) * 100;

  // Competitive scoring with market analysis
  const competitiveScore = (
    Math.max(0, (100 - factors.competitorStrength) / 100) * 0.40 +
    Math.max(0, (100 - factors.keywordCompetition) / 100) * 0.40 +
    (factors.serpFeatures > 0 ? 0.7 : 1.0) * 0.20
  ) * 100;

  // Advanced prediction calculation with time decay
  const baseImprovement = (
    contentScore * 0.25 +
    technicalScore * 0.20 +
    authorityScore * 0.30 +
    engagementScore * 0.15 +
    competitiveScore * 0.10
  );

  const timeDecayFactor = Math.exp(-timeHorizon / 90);
  const predictedImprovement = baseImprovement * timeDecayFactor;
  const predictedRank = Math.max(1, Math.min(100, currentRank - predictedImprovement));

  // Confidence calculation
  const factorCount = Object.values(factors).filter(v => v > 0).length;
  const completenessScore = factorCount / Object.keys(factors).length;
  const rankChange = Math.abs(predictedRank - currentRank);
  const volatilityScore = Math.max(0, 1 - rankChange / 50);
  const confidence = (completenessScore * 0.40 + volatilityScore * 0.30 + 0.8 * 0.30);

  // Generate recommendations
  const recommendations = [];
  if (factors.contentQuality < 70) recommendations.push("Improve content quality with comprehensive, authoritative information");
  if (factors.pageSpeed < 80) recommendations.push("Optimize page speed by compressing images and minifying CSS/JS");
  if (factors.domainAuthority < 50) recommendations.push("Build domain authority through high-quality backlinks");
  if (factors.clickThroughRate < 3) recommendations.push("Optimize title tags and meta descriptions for higher CTR");
  if (factors.competitorStrength > 80) recommendations.push("Focus on long-tail keywords with lower competition");

  return {
    predictedRank: Math.round(predictedRank * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    factors: {
      content: Math.round(contentScore * 100) / 100,
      technical: Math.round(technicalScore * 100) / 100,
      authority: Math.round(authorityScore * 100) / 100,
      engagement: Math.round(engagementScore * 100) / 100,
      competitive: Math.round(competitiveScore * 100) / 100
    },
    recommendations: recommendations.slice(0, 5)
  };
}

// Advanced CRO Analysis Algorithm
function analyzeConversionRate(factors: ConversionFactors, baselineRate: number = 2.5) {
  // Traffic quality scoring with intent analysis
  const sourceScores = {
    'direct': 90, 'email': 85, 'organic': 75, 'referral': 70, 'paid': 65, 'social': 55
  };
  const intentScores = {
    'transactional': 95, 'commercial': 80, 'navigational': 70, 'informational': 45
  };
  
  const trafficQualityScore = (
    sourceScores[factors.trafficSource] * 0.40 +
    intentScores[factors.keywordIntent] * 0.35 +
    70 * 0.25 // User segment placeholder
  );

  // Page performance scoring with technical optimization
  const pagePerformanceScore = (
    Math.max(0, 100 - (factors.pageLoadTime - 3) * 10) * 0.40 +
    factors.pageRelevance * 0.30 +
    factors.contentMatch * 0.30
  );

  // User experience scoring with behavioral analysis
  const userExperienceScore = (
    factors.navigationClarity * 0.25 +
    factors.formUsability * 0.30 +
    factors.trustSignals * 0.25 +
    factors.urgencyIndicators * 0.20
  );

  // Conversion elements scoring with optimization focus
  const conversionElementsScore = (
    factors.ctaVisibility * 0.25 +
    factors.ctaRelevance * 0.30 +
    factors.valueProposition * 0.25 +
    factors.socialProof * 0.20
  );

  // Advanced conversion probability calculation
  const baseScore = (
    trafficQualityScore * 0.25 +
    pagePerformanceScore * 0.20 +
    userExperienceScore * 0.30 +
    conversionElementsScore * 0.25
  );

  // Apply traffic source and intent multipliers
  const sourceMultipliers = {
    'direct': 1.4, 'email': 1.3, 'organic': 1.1, 'referral': 1.0, 'paid': 0.9, 'social': 0.8
  };
  const intentMultipliers = {
    'transactional': 1.8, 'commercial': 1.4, 'navigational': 1.1, 'informational': 0.6
  };

  const adjustedScore = baseScore * sourceMultipliers[factors.trafficSource] * intentMultipliers[factors.keywordIntent];
  const conversionProbability = Math.min(0.5, baselineRate * (adjustedScore / 50));

  // Generate CRO recommendations
  const suggestions = [];
  if (factors.trafficSource === 'social') suggestions.push("Focus on higher-intent traffic sources like organic search");
  if (factors.pageLoadTime > 3) suggestions.push("Optimize page load speed to under 3 seconds");
  if (factors.navigationClarity < 70) suggestions.push("Simplify navigation and improve site structure");
  if (factors.ctaVisibility < 70) suggestions.push("Make CTAs more prominent and visible");
  if (factors.trustSignals < 70) suggestions.push("Add trust signals like testimonials and security badges");

  return {
    conversionProbability: Math.round(conversionProbability * 10000) / 100,
    confidence: 0.85, // Placeholder confidence
    factors: {
      trafficQuality: Math.round(trafficQualityScore * 100) / 100,
      pagePerformance: Math.round(pagePerformanceScore * 100) / 100,
      userExperience: Math.round(userExperienceScore * 100) / 100,
      conversionElements: Math.round(conversionElementsScore * 100) / 100
    },
    optimizationSuggestions: suggestions.slice(0, 5)
  };
}

// Advanced Keyword Difficulty Algorithm
function calculateKeywordDifficulty(factors: {
  searchVolume: number;
  competitionIndex: number;
  cpc: number;
  serpFeatures: number;
  domainAuthority: number;
  backlinkGap: number;
  contentGap: number;
}) {
  const volumeScore = Math.min(100, factors.searchVolume / 100);
  const competitionScore = factors.competitionIndex;
  const authorityScore = Math.min(100, Math.max(0, factors.backlinkGap) * 2);
  const contentScore = Math.min(100, factors.contentGap * 1.5);
  const serpPenalty = factors.serpFeatures * 5;

  const difficulty = (
    volumeScore * 0.20 +
    competitionScore * 0.35 +
    authorityScore * 0.25 +
    contentScore * 0.20
  ) + serpPenalty;

  let recommendation: 'easy' | 'medium' | 'hard' | 'very-hard';
  if (difficulty < 30) recommendation = 'easy';
  else if (difficulty < 60) recommendation = 'medium';
  else if (difficulty < 80) recommendation = 'hard';
  else recommendation = 'very-hard';

  return {
    difficulty: Math.min(100, Math.max(0, difficulty)),
    breakdown: {
      volume: volumeScore,
      competition: competitionScore,
      authority: authorityScore,
      content: contentScore
    },
    recommendation
  };
}

// SERP Feature Optimization Algorithm
function optimizeSERPFeatures(feature: {
  type: 'featured_snippet' | 'people_also_ask' | 'related_searches' | 'image_pack' | 'video_carousel' | 'local_pack';
  opportunity: number;
  difficulty: number;
  impact: number;
}) {
  const opportunityRatio = feature.opportunity / Math.max(1, feature.difficulty);
  const impactScore = feature.impact / 100;
  const score = (opportunityRatio * 0.6 + impactScore * 0.4) * 100;

  let priority: 'high' | 'medium' | 'low';
  if (score > 70) priority = 'high';
  else if (score > 40) priority = 'medium';
  else priority = 'low';

  const strategies = {
    'featured_snippet': [
      'Structure content with clear headings and bullet points',
      'Provide direct answers to common questions',
      'Use schema markup for better understanding',
      'Keep answers concise (40-60 words)'
    ],
    'people_also_ask': [
      'Research related questions thoroughly',
      'Create comprehensive FAQ sections',
      'Use question-based headings'
    ],
    'image_pack': [
      'Optimize image alt text with target keywords',
      'Use high-quality, relevant images',
      'Implement proper image schema markup'
    ],
    'video_carousel': [
      'Create engaging video content',
      'Optimize video titles and descriptions',
      'Use relevant thumbnails'
    ],
    'local_pack': [
      'Claim and optimize Google My Business',
      'Build local citations',
      'Encourage customer reviews'
    ]
  };

  return {
    score: Math.min(100, score),
    priority,
    strategy: strategies[feature.type] || []
  };
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

    const { projectId, analysisType, data } = await req.json() as SEOAnalysisRequest;

    if (!projectId || !analysisType) {
      throw new Error('Project ID and analysis type are required');
    }

    let analysisResult: any = {};

    switch (analysisType) {
      case 'ranking_prediction':
        analysisResult = predictRanking(data.factors, data.currentRank, data.timeHorizon);
        break;

      case 'cro_analysis':
        analysisResult = analyzeConversionRate(data.factors, data.baselineRate);
        break;

      case 'keyword_difficulty':
        analysisResult = calculateKeywordDifficulty(data.factors);
        break;

      case 'serp_optimization':
        analysisResult = optimizeSERPFeatures(data.feature);
        break;

      case 'comprehensive':
        // Run all analyses
        const rankingAnalysis = predictRanking(data.rankingFactors, data.currentRank);
        const croAnalysis = analyzeConversionRate(data.conversionFactors);
        const keywordAnalysis = calculateKeywordDifficulty(data.keywordFactors);
        
        analysisResult = {
          ranking: rankingAnalysis,
          conversion: croAnalysis,
          keyword: keywordAnalysis,
          overallScore: (
            rankingAnalysis.confidence * 0.40 +
            croAnalysis.confidence * 0.30 +
            0.8 * 0.30 // Keyword analysis confidence placeholder
          )
        };
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    // Store analysis results in database
    const { error: storeError } = await supabaseClient
      .from('seo_analysis_results')
      .insert({
        project_id: projectId,
        analysis_type: analysisType,
        input_data: data,
        results: analysisResult,
        confidence_score: analysisResult.confidence || analysisResult.overallScore || 0.8,
        created_at: new Date().toISOString()
      });

    if (storeError) {
      console.warn('Failed to store analysis results:', storeError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysisType,
        results: analysisResult,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('SEO Analysis Engine error:', error);
    
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
