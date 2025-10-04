import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Layers,
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
  Brain,
  FileText,
  Link as LinkIcon
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface ContentGapAnalysisProps {
  projectId: string;
}

export const ContentGapAnalysis = ({ projectId }: ContentGapAnalysisProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<unknown>(null);

  const analyzeGaps = async () => {
    if (!keyword.trim() || !competitorUrls.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both keyword and competitor URLs",
        variant: "destructive"
      });
      return;
    }

    const urls = competitorUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length < 2) {
      toast({
        title: "Not Enough Competitors",
        description: "Please provide at least 2 competitor URLs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-gap-analyzer', {
        body: { 
          projectId, 
          keyword: keyword.trim(),
          competitorUrls: urls
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Content gap analysis generated successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                  Content Gap Analysis
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced AI-powered content gap analysis with competitive intelligence and strategic recommendations
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              AI Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Keyword</label>
                <Input
                  placeholder="Enter target keyword for analysis..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-12 text-base bg-background/50 border-border/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Competitor URLs (one per line, minimum 2)
                </label>
                <Textarea
                  placeholder="https://competitor1.com/article&#10;https://competitor2.com/guide&#10;https://competitor3.com/blog"
                  value={competitorUrls}
                  onChange={(e) => setCompetitorUrls(e.target.value)}
                  rows={4}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>

            <Button 
              onClick={analyzeGaps} 
              disabled={loading} 
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Brain className="w-5 h-5" />
              {loading ? "Analyzing Content Gaps..." : "Analyze Content Gaps"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Content Gap Intelligence Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis of content opportunities and competitive gaps with AI-powered insights
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Analysis Complete
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
                <TabsTrigger value="gaps" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Gaps
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Strategy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Missing Topics",
                      value: analysis.missing_topics?.length || 0,
                      icon: Layers,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "+15%"
                    },
                    {
                      title: "Keyword Gaps",
                      value: analysis.keyword_gaps?.length || 0,
                      icon: Search,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "+8%"
                    },
                    {
                      title: "Content Ideas",
                      value: analysis.content_suggestions?.length || 0,
                      icon: Lightbulb,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: "+12%"
                    },
                    {
                      title: "Opportunity Score",
                      value: 85,
                      icon: TrendingUp,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "+5%",
                      unit: "/100"
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
                            {metric.value}{metric.unit || ''}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Gap Analysis Summary */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-500" />
                      Gap Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Content Opportunities",
                          value: analysis.missing_topics?.length || 0,
                          icon: FileText,
                          description: "Topics competitors cover that you don't",
                          color: "text-blue-500"
                        },
                        {
                          title: "Keyword Opportunities",
                          value: analysis.keyword_gaps?.length || 0,
                          icon: Search,
                          description: "Keywords to target for better ranking",
                          color: "text-green-500"
                        },
                        {
                          title: "Strategic Content",
                          value: analysis.content_suggestions?.length || 0,
                          icon: Target,
                          description: "AI-generated content ideas",
                          color: "text-orange-500"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{item.value}</div>
                              <Progress value={(item.value / 20) * 100} className="w-16 h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Missing Topics */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-500" />
                        Missing Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.missing_topics?.map((topic: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <AlertTriangle className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="secondary" className="text-xs mb-1">
                                MISSING TOPIC
                              </Badge>
                              <p className="text-sm">{topic}</p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <Layers className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                            <h3 className="text-lg font-semibold mb-2">No Missing Topics</h3>
                            <p className="text-muted-foreground">Your content coverage is comprehensive.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keyword Gaps */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="w-5 h-5 text-green-500" />
                        Keyword Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.keyword_gaps?.map((keyword: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="outline" className="text-xs mb-1">
                                KEYWORD GAP
                              </Badge>
                              <p className="text-sm">{keyword}</p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <Search className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-semibold mb-2">No Keyword Gaps</h3>
                            <p className="text-muted-foreground">Your keyword coverage is optimal.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-6">
                {/* Content Suggestions */}
                <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-orange-500" />
                      Content Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.content_suggestions?.map((suggestion: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Lightbulb className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <Badge variant="default" className="text-xs mb-2">
                              CONTENT IDEA
                            </Badge>
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                          <h3 className="text-lg font-semibold mb-2">No Content Suggestions</h3>
                          <p className="text-muted-foreground">No additional content opportunities identified.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {/* AI Strategic Recommendations */}
                {analysis.ai_recommendations && (
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        AI Strategic Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <FileText className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Target Word Count</h4>
                              <p className="text-xs text-muted-foreground">Optimal length for ranking</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary">{analysis.ai_recommendations.wordCountTarget}</div>
                          <Progress value={85} className="mt-2" />
                        </div>

                        <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <Eye className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Readability Level</h4>
                              <p className="text-xs text-muted-foreground">Target readability score</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary">{analysis.ai_recommendations.readabilityScore}</div>
                          <Progress value={90} className="mt-2" />
                        </div>

                        <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Globe className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Multimedia Elements</h4>
                              <p className="text-xs text-muted-foreground">Recommended content types</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {analysis.ai_recommendations.multimediaRecommended?.map((type: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Implementation Roadmap */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-500" />
                      Implementation Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          step: "Phase 1",
                          title: "Content Planning",
                          description: "Create content calendar based on identified gaps",
                          icon: FileText,
                          priority: "high"
                        },
                        {
                          step: "Phase 2",
                          title: "Keyword Optimization",
                          description: "Implement missing keywords in existing content",
                          icon: Search,
                          priority: "medium"
                        },
                        {
                          step: "Phase 3",
                          title: "Content Creation",
                          description: "Develop new content for identified opportunities",
                          icon: Lightbulb,
                          priority: "high"
                        },
                        {
                          step: "Phase 4",
                          title: "Performance Tracking",
                          description: "Monitor rankings and traffic improvements",
                          icon: TrendingUp,
                          priority: "medium"
                        }
                      ].map((phase, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className={`p-3 rounded-lg ${
                            phase.priority === 'high' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                          }`}>
                            <phase.icon className={`w-5 h-5 ${
                              phase.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={phase.priority === 'high' ? "destructive" : "default"} className="text-xs">
                                {phase.step}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {phase.priority === 'high' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-sm mb-1">{phase.title}</h4>
                            <p className="text-xs text-muted-foreground">{phase.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
