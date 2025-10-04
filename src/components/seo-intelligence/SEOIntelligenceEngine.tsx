import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSEOStore } from '@/stores/seoStore';
import { apiClient } from '@/lib/api';
import { errorHandler } from '@/lib/errorHandler';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Zap,
  BarChart3,
  FileText,
  Link2,
  Search,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SEOIntelligenceEngineProps {
  projectId: string;
  url?: string;
  keywords?: string[];
}

interface AnalysisResult {
  optimizationScore: number;
  gscData: unknown;
  algorithmDrops: unknown[];
  keywordOpportunities: unknown[];
  recommendations: unknown[];
  competitorData: unknown[];
  processingTime: number;
  aiAnalysis: {
    summary: string;
    trafficImpact: number;
    recommendations: string[];
  };
}

export function SEOIntelligenceEngine({ 
  projectId, 
  url, 
  keywords = [] 
}: SEOIntelligenceEngineProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const { setAnalytics } = useSEOStore();

  const analysisSteps = [
    { id: 'gsc', label: 'Fetching GSC Data', icon: BarChart3 },
    { id: 'algorithm', label: 'Detecting Algorithm Drops', icon: AlertTriangle },
    { id: 'keywords', label: 'Analyzing Keywords', icon: Search },
    { id: 'competitors', label: 'Competitor Analysis', icon: Target },
    { id: 'ai', label: 'AI Analysis', icon: Brain },
    { id: 'recommendations', label: 'Generating Recommendations', icon: Sparkles },
  ];

  const runAnalysis = async () => {
    if (!projectId || !url) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both project ID and URL for analysis.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Update current step
      const stepInterval = setInterval(() => {
        const currentIndex = Math.floor(progress / 15);
        if (currentIndex < analysisSteps.length) {
          setCurrentStep(analysisSteps[currentIndex].label);
        }
      }, 1500);

      const result = await apiClient.analyzeSEO(projectId, url, {
        keywords,
        llmModel: 'gemini-2.5-flash',
        includeCompetitors: true,
        includeBacklinks: true,
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);
      
      setProgress(100);
      setCurrentStep('Analysis Complete');
      
      setAnalysisResult(result);
      
      // Update store with new analytics
      setAnalytics({
        totalKeywords: result.keywordOpportunities.length,
        avgPosition: result.gscData?.avgPosition || 0,
        totalTraffic: result.aiAnalysis.trafficImpact,
        trafficChange: result.aiAnalysis.trafficImpact,
      });

      toast({
        title: 'Analysis Complete! 🎉',
        description: `Found ${result.recommendations.length} actionable recommendations.`,
      });

    } catch (error) {
      errorHandler.handle(error, { projectId, url });
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOptimizationBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Needs Work' };
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            SEO Intelligence Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Project ID</label>
              <div className="text-sm text-muted-foreground">{projectId}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Target URL</label>
              <div className="text-sm text-muted-foreground break-all">{url || 'Not specified'}</div>
            </div>
          </div>
          
          {keywords.length > 0 && (
            <div>
              <label className="text-sm font-medium">Keywords ({keywords.length})</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.slice(0, 5).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {keywords.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{keywords.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || !url}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Comprehensive Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Progress</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{currentStep}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="gsc">GSC Data</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="recommendations">AI Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Optimization Score
                          </p>
                          <p className={`text-2xl font-bold ${getOptimizationColor(analysisResult.optimizationScore)}`}>
                            {analysisResult.optimizationScore}/100
                          </p>
                        </div>
                        <Badge {...getOptimizationBadge(analysisResult.optimizationScore)}>
                          {getOptimizationBadge(analysisResult.optimizationScore).label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Traffic Impact
                          </p>
                          <p className="text-2xl font-bold">
                            +{analysisResult.aiAnalysis.trafficImpact.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Processing Time
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(analysisResult.processingTime / 1000)}s
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {analysisResult.aiAnalysis.summary}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Findings:</h4>
                        <ul className="space-y-1 text-sm">
                          {analysisResult.aiAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Algorithm Drops:</h4>
                        <div className="space-y-1">
                          {analysisResult.algorithmDrops.length > 0 ? (
                            analysisResult.algorithmDrops.slice(0, 3).map((drop, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                {drop.severity} drop detected
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              No significant drops detected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gsc" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Google Search Console Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analysisResult.gscData?.totalKeywords || 0}</p>
                        <p className="text-sm text-muted-foreground">Keywords</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analysisResult.gscData?.totalClicks?.toLocaleString() || 0}</p>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analysisResult.gscData?.totalImpressions?.toLocaleString() || 0}</p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analysisResult.gscData?.avgPosition?.toFixed(1) || 0}</p>
                        <p className="text-sm text-muted-foreground">Avg Position</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Opportunities ({analysisResult.keywordOpportunities.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.keywordOpportunities.slice(0, 10).map((opp, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{opp.keyword}</p>
                            <p className="text-sm text-muted-foreground">
                              Position {opp.currentPosition} → {opp.targetPosition}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={opp.quickWin ? 'default' : 'secondary'}>
                              {opp.opportunityType}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              +{opp.trafficPotential} traffic
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations ({analysisResult.recommendations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.recommendations.slice(0, 5).map((rec, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant={
                                rec.priorityLevel === 'critical' ? 'destructive' :
                                rec.priorityLevel === 'high' ? 'default' : 'secondary'
                              }>
                                {rec.priorityLevel}
                              </Badge>
                              <Badge variant="outline">
                                {rec.impactScore}/10
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Implementation Steps:</h5>
                            <ol className="text-sm space-y-1">
                              {rec.detailedSteps.slice(0, 3).map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <span className="text-muted-foreground">{stepIndex + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
