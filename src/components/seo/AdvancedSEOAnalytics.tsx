import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Target,
  FileText,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Calculator,
  Cpu,
  Layers,
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface AdvancedSEOAnalyticsProps {
  projectId: string;
}

interface AnalysisResult {
  ranking?: {
    predictedRank: number;
    confidence: number;
    factors: {
      content: number;
      technical: number;
      authority: number;
      engagement: number;
      competitive: number;
    };
    recommendations: string[];
  };
  conversion?: {
    conversionProbability: number;
    confidence: number;
    factors: {
      trafficQuality: number;
      pagePerformance: number;
      userExperience: number;
      conversionElements: number;
    };
    optimizationSuggestions: string[];
  };
  keyword?: {
    difficulty: number;
    recommendation: 'easy' | 'medium' | 'hard' | 'very-hard';
    breakdown: {
      volume: number;
      competition: number;
      authority: number;
      content: number;
    };
  };
  serp?: {
    score: number;
    priority: 'high' | 'medium' | 'low';
    strategy: string[];
  };
}

export const AdvancedSEOAnalytics = ({ projectId }: AdvancedSEOAnalyticsProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>("comprehensive");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult>({});
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [rankingFactors, setRankingFactors] = useState({
    contentQuality: 75,
    keywordDensity: 2.5,
    contentLength: 1200,
    readabilityScore: 68,
    semanticRelevance: 80,
    pageSpeed: 85,
    mobileFriendliness: 95,
    coreWebVitals: 78,
    internalLinks: 5,
    externalLinks: 3,
    domainAuthority: 65,
    pageAuthority: 72,
    backlinkCount: 150,
    backlinkQuality: 85,
    clickThroughRate: 3.2,
    bounceRate: 45,
    dwellTime: 180,
    pogoSticking: 25,
    competitorStrength: 70,
    keywordCompetition: 65,
    serpFeatures: 3
  });
  const [conversionFactors, setConversionFactors] = useState({
    trafficSource: 'organic' as const,
    keywordIntent: 'commercial' as const,
    userSegment: 'new' as const,
    pageLoadTime: 2.8,
    pageRelevance: 85,
    contentMatch: 80,
    navigationClarity: 75,
    formUsability: 70,
    trustSignals: 80,
    urgencyIndicators: 60,
    ctaVisibility: 85,
    ctaRelevance: 75,
    valueProposition: 80,
    socialProof: 70
  });
  const { toast } = useToast();

  const runAdvancedAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults({});

    try {
      const steps = [
        'Initializing advanced algorithms...',
        'Analyzing ranking factors...',
        'Calculating conversion probabilities...',
        'Assessing keyword difficulty...',
        'Optimizing SERP features...',
        'Generating recommendations...',
        'Finalizing analysis...'
      ];

      // Simulate progress
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Call the SEO analysis engine
      const { data, error } = await supabase.functions.invoke('seo-analysis-engine', {
        body: {
          projectId,
          analysisType,
          data: {
            rankingFactors,
            conversionFactors,
            keywordFactors: {
              searchVolume: 5000,
              competitionIndex: 65,
              cpc: 2.50,
              serpFeatures: 3,
              domainAuthority: 65,
              backlinkGap: 25,
              contentGap: 30
            },
            feature: {
              type: 'featured_snippet',
              opportunity: 75,
              difficulty: 45,
              impact: 80
            },
            currentRank: 12,
            baselineRate: 2.5
          }
        }
      });

      if (error) {
        throw error;
      }

      setAnalysisResults(data.results);
      
      toast({
        title: "Analysis Complete! 🚀",
        description: "Advanced SEO analysis completed successfully. Review the results below.",
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to complete advanced SEO analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'very-hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Advanced SEO Analytics Engine
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  AI-powered algorithms for ranking prediction, conversion optimization, and SERP feature analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Cpu className="w-3 h-3 text-blue-500" />
                ML-Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Configuration */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranking_prediction">Ranking Prediction</SelectItem>
                    <SelectItem value="cro_analysis">Conversion Rate Analysis</SelectItem>
                    <SelectItem value="keyword_difficulty">Keyword Difficulty</SelectItem>
                    <SelectItem value="serp_optimization">SERP Optimization</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={runAdvancedAnalysis}
                disabled={isAnalyzing}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Run Advanced Analysis
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {(Object.keys(analysisResults).length > 0 || isAnalyzing) && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Analysis Results
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered insights and optimization recommendations
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {isAnalyzing ? "Processing" : "Complete"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ranking" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger value="conversion" className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4" />
                  Conversion
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Optimization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {analysisResults.ranking && [
                    {
                      title: "Predicted Rank",
                      value: `#${analysisResults.ranking.predictedRank}`,
                      icon: TrendingUp,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: `${Math.round((12 - analysisResults.ranking.predictedRank) * 100) / 100} positions`
                    },
                    {
                      title: "Confidence Score",
                      value: `${Math.round(analysisResults.ranking.confidence * 100)}%`,
                      icon: Target,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "High accuracy"
                    }
                  ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                              <Icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <div className="flex items-center gap-1">
                              <ArrowUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs font-medium text-green-600">{metric.change}</span>
                            </div>
                          </div>
                          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            {metric.value}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {analysisResults.conversion && [
                    {
                      title: "Conversion Rate",
                      value: `${analysisResults.conversion.conversionProbability.toFixed(2)}%`,
                      icon: MousePointerClick,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "Predicted"
                    },
                    {
                      title: "Optimization Score",
                      value: `${Math.round((analysisResults.conversion.factors.trafficQuality + analysisResults.conversion.factors.userExperience) / 2)}%`,
                      icon: Zap,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: "Combined"
                    }
                  ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                              <Icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-500" />
                              <span className="text-xs font-medium text-blue-600">{metric.change}</span>
                            </div>
                          </div>
                          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            {metric.value}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Factor Analysis Radar Chart */}
                {analysisResults.ranking && (
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-500" />
                        SEO Factor Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={[
                            {
                              factor: 'Content',
                              score: analysisResults.ranking.factors.content,
                              fullMark: 100
                            },
                            {
                              factor: 'Technical',
                              score: analysisResults.ranking.factors.technical,
                              fullMark: 100
                            },
                            {
                              factor: 'Authority',
                              score: analysisResults.ranking.factors.authority,
                              fullMark: 100
                            },
                            {
                              factor: 'Engagement',
                              score: analysisResults.ranking.factors.engagement,
                              fullMark: 100
                            },
                            {
                              factor: 'Competitive',
                              score: analysisResults.ranking.factors.competitive,
                              fullMark: 100
                            }
                          ]}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="factor" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name="SEO Factors"
                              dataKey="score"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.3}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="ranking" className="space-y-6">
                {analysisResults.ranking && (
                  <>
                    {/* Ranking Prediction Details */}
                    <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Ranking Prediction Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-background/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Predicted Position</span>
                                <Badge className="bg-green-100 text-green-800">
                                  #{analysisResults.ranking.predictedRank}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Confidence Level</span>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {Math.round(analysisResults.ranking.confidence * 100)}%
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold">Factor Breakdown</h4>
                              {Object.entries(analysisResults.ranking.factors).map(([factor, score]) => (
                                <div key={factor} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{factor}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={score} className="w-20 h-2" />
                                    <span className="text-sm font-medium w-12">{Math.round(score)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold">Optimization Recommendations</h4>
                            <div className="space-y-2">
                              {analysisResults.ranking.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="conversion" className="space-y-6">
                {analysisResults.conversion && (
                  <>
                    {/* Conversion Analysis */}
                    <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MousePointerClick className="w-5 h-5 text-purple-500" />
                          Conversion Rate Optimization Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-background/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Predicted Conversion Rate</span>
                                <Badge className="bg-purple-100 text-purple-800">
                                  {analysisResults.conversion.conversionProbability.toFixed(2)}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Analysis Confidence</span>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {Math.round(analysisResults.conversion.confidence * 100)}%
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold">Conversion Factors</h4>
                              {Object.entries(analysisResults.conversion.factors).map(([factor, score]) => (
                                <div key={factor} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={score} className="w-20 h-2" />
                                    <span className="text-sm font-medium w-12">{Math.round(score)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold">CRO Recommendations</h4>
                            <div className="space-y-2">
                              {analysisResults.conversion.optimizationSuggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border">
                                  <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="optimization" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Keyword Difficulty Analysis */}
                  {analysisResults.keyword && (
                    <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-500" />
                          Keyword Difficulty Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-background/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Difficulty Score</span>
                            <Badge className={`${getDifficultyColor(analysisResults.keyword.recommendation)}`}>
                              {analysisResults.keyword.difficulty.toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Recommendation</span>
                            <Badge className={`${getDifficultyColor(analysisResults.keyword.recommendation)}`}>
                              {analysisResults.keyword.recommendation.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">Difficulty Breakdown</h4>
                          {Object.entries(analysisResults.keyword.breakdown).map(([factor, score]) => (
                            <div key={factor} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{factor}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={score} className="w-20 h-2" />
                                <span className="text-sm font-medium w-12">{Math.round(score)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* SERP Feature Optimization */}
                  {analysisResults.serp && (
                    <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-500" />
                          SERP Feature Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-background/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Optimization Score</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {analysisResults.serp.score.toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Priority Level</span>
                            <Badge className={`${getPriorityColor(analysisResults.serp.priority)}`}>
                              {analysisResults.serp.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">Optimization Strategy</h4>
                          <div className="space-y-2">
                            {analysisResults.serp.strategy.map((strategy, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-background/50 rounded border">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-xs">{strategy}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
