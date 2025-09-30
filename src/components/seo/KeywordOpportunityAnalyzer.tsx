import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Eye, 
  Crown, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface KeywordOpportunityAnalyzerProps {
  projectId: string;
}

interface KeywordAnalysis {
  id: string;
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
  ai_recommendations: any;
}

export const KeywordOpportunityAnalyzer = ({ projectId }: KeywordOpportunityAnalyzerProps) => {
  const [keywords, setKeywords] = useState<KeywordAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalysis();
  }, [projectId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('keyword_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('potential_score', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setKeywords(data);
        calculateSummary(data);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
    setLoading(false);
  };

  const calculateSummary = (data: KeywordAnalysis[]) => {
    const summary = {
      totalKeywords: data.length,
      totalPages: new Set(data.map(k => k.page_url)).size,
      totalClusters: new Set(data.map(k => k.cluster_name)).size,
      highPotential: data.filter(k => k.opportunity_type === 'high-potential-low-competition').length,
      quickWins: data.filter(k => k.opportunity_type === 'quick-win').length,
      highImpressions: data.filter(k => k.opportunity_type === 'high-impressions-low-ctr').length,
      topPosition: data.filter(k => k.opportunity_type === 'top-position-low-ctr').length,
      avgPotentialScore: data.reduce((sum, k) => sum + k.potential_score, 0) / data.length,
    };
    setSummary(summary);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-opportunity-analyzer', {
        body: { projectId }
      });

      if (error) throw error;

      toast({
        title: "✅ Analysis Complete!",
        description: data.message,
      });

      await loadAnalysis();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze keywords",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'high-potential-low-competition':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'quick-win':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'high-impressions-low-ctr':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'top-position-low-ctr':
        return <Crown className="w-4 h-4 text-purple-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOpportunityLabel = (type: string) => {
    switch (type) {
      case 'high-potential-low-competition':
        return 'High Potential / Low Competition';
      case 'quick-win':
        return 'Quick Win';
      case 'high-impressions-low-ctr':
        return 'High Impressions / Low CTR';
      case 'top-position-low-ctr':
        return 'Top Position / Low CTR';
      case 'medium-potential':
        return 'Medium Potential';
      default:
        return 'Low Priority';
    }
  };

  const getPotentialColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 font-bold';
    if (score >= 0.5) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  // Filter keywords
  const filteredKeywords = keywords.filter(k => {
    if (selectedCluster !== 'all' && k.cluster_name !== selectedCluster) return false;
    if (selectedOpportunity !== 'all' && k.opportunity_type !== selectedOpportunity) return false;
    return true;
  });

  // Group by cluster
  const clusters = Array.from(new Set(filteredKeywords.map(k => k.cluster_name)))
    .map(clusterName => ({
      name: clusterName,
      keywords: filteredKeywords.filter(k => k.cluster_name === clusterName)
    }))
    .sort((a, b) => {
      const aAvg = a.keywords.reduce((sum, k) => sum + k.potential_score, 0) / a.keywords.length;
      const bAvg = b.keywords.reduce((sum, k) => sum + k.potential_score, 0) / b.keywords.length;
      return bAvg - aAvg;
    });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analysis...</div>;
  }

  if (keywords.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Keyword Analysis Yet</h3>
        <p className="text-muted-foreground mb-4">
          Run the analysis to discover high-potential keywords and optimization opportunities
        </p>
        <Button onClick={runAnalysis} disabled={analyzing}>
          {analyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Keyword Opportunity Analysis</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis using Ahrefs-style scoring methodology
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={analyzing} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">High Potential</span>
            </div>
            <div className="text-2xl font-bold">{summary.highPotential}</div>
            <div className="text-xs text-muted-foreground">Low competition</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Quick Wins</span>
            </div>
            <div className="text-2xl font-bold">{summary.quickWins}</div>
            <div className="text-xs text-muted-foreground">Page 1, position 4-10</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">High Impressions</span>
            </div>
            <div className="text-2xl font-bold">{summary.highImpressions}</div>
            <div className="text-xs text-muted-foreground">Low CTR opportunities</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <div className="text-2xl font-bold">{(summary.avgPotentialScore * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Potential score</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select 
          className="px-4 py-2 border rounded-lg bg-background"
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(e.target.value)}
        >
          <option value="all">All Clusters ({clusters.length})</option>
          {Array.from(new Set(keywords.map(k => k.cluster_name))).map(cluster => (
            <option key={cluster} value={cluster}>{cluster}</option>
          ))}
        </select>

        <select 
          className="px-4 py-2 border rounded-lg bg-background"
          value={selectedOpportunity}
          onChange={(e) => setSelectedOpportunity(e.target.value)}
        >
          <option value="all">All Opportunities</option>
          <option value="high-potential-low-competition">High Potential / Low Competition</option>
          <option value="quick-win">Quick Wins</option>
          <option value="high-impressions-low-ctr">High Impressions / Low CTR</option>
          <option value="top-position-low-ctr">Top Position / Low CTR</option>
        </select>
      </div>

      {/* Clustered Keywords */}
      <Accordion type="multiple" className="space-y-4">
        {clusters.map((cluster, idx) => {
          const avgScore = cluster.keywords.reduce((sum, k) => sum + k.potential_score, 0) / cluster.keywords.length;
          
          return (
            <AccordionItem key={idx} value={`cluster-${idx}`} className="border rounded-lg">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-left">{cluster.name}</h3>
                        <p className="text-sm text-muted-foreground text-left">
                          {cluster.keywords.length} keywords • Avg Score: {(avgScore * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cluster.keywords.some(k => k.opportunity_type === 'high-potential-low-competition') && (
                        <Badge variant="default" className="bg-green-500">
                          <Target className="w-3 h-3 mr-1" />
                          High Potential
                        </Badge>
                      )}
                      {cluster.keywords.some(k => k.opportunity_type === 'quick-win') && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Zap className="w-3 h-3 mr-1" />
                          Quick Wins
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-6 pb-4 space-y-3">
                    {cluster.keywords.map((keyword, kidx) => (
                      <Card key={kidx} className="p-4 bg-accent/5">
                        <div className="space-y-3">
                          {/* Keyword Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getOpportunityIcon(keyword.opportunity_type)}
                                <span className="font-semibold">{keyword.keyword}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getOpportunityLabel(keyword.opportunity_type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {keyword.page_url}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${getPotentialColor(keyword.potential_score)}`}>
                                {(keyword.potential_score * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Potential</div>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Position</div>
                              <div className="font-semibold">#{keyword.position.toFixed(1)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Impressions</div>
                              <div className="font-semibold">{keyword.impressions.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Clicks</div>
                              <div className="font-semibold">{keyword.clicks}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">CTR</div>
                              <div className="font-semibold">{(keyword.ctr * 100).toFixed(2)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Difficulty</div>
                              <div className="font-semibold">{(keyword.difficulty_score * 100).toFixed(0)}/100</div>
                            </div>
                          </div>

                          {/* AI Recommendations */}
                          {keyword.ai_recommendations && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-primary">AI Recommendations</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Primary Action:</span>{' '}
                                  <span className="text-muted-foreground">
                                    {keyword.ai_recommendations.primary_action}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Content Strategy:</span>{' '}
                                  <span className="text-muted-foreground">
                                    {keyword.ai_recommendations.content_strategy}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Technical SEO:</span>{' '}
                                  <span className="text-muted-foreground">
                                    {keyword.ai_recommendations.technical_seo}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Quick Win:</span>{' '}
                                  <span className="text-muted-foreground">
                                    {keyword.ai_recommendations.quick_win}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};