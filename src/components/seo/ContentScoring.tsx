import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Link as LinkIcon, 
  Activity, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  MousePointerClick,
  Search,
  Brain,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle
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
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface ContentScoringProps {
  projectId: string;
}

export const ContentScoring = ({ projectId }: ContentScoringProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [score, setScore] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-content-analyzer', {
        body: {
          content,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
        }
      });

      if (error) throw error;

      setScore(data);

      // Save to database
      await supabase.from('content_scores').insert({
        user_id: user?.id,
        readability_score: data.readabilityScore,
        seo_score: data.seoScore,
        engagement_score: data.engagementScore,
        keyword_density: data.keywordDensity,
        word_count: data.wordCount,
        entities: data.entities,
        topics: data.topics,
        recommendations: data.recommendations
      });

      toast({
        title: "Content analyzed",
        description: `Overall score: ${((data.seoScore + data.readabilityScore + data.engagementScore) / 3).toFixed(1)}/100`
      });
    } catch (error) {
      console.error('Content analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
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
                  AI Content Scoring & Analysis
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced content optimization with AI-powered scoring, readability analysis, and SEO recommendations
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Keywords (comma-separated)</label>
              <Input
                placeholder="e.g., SEO tools, content marketing, digital strategy"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content to Analyze</label>
              <Textarea
                placeholder="Paste your content here for comprehensive AI analysis..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={analyzeContent} 
              disabled={loading} 
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Brain className="w-5 h-5" />
              Analyze Content with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {score && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Content Analysis Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive AI-powered content scoring with detailed insights and optimization recommendations
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
                <TabsTrigger value="scores" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Scores
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Overall Score",
                      value: Math.round((score.seoScore + score.readabilityScore + score.engagementScore) / 3),
                      icon: Target,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "+12%"
                    },
                    {
                      title: "Word Count",
                      value: score.wordCount,
                      icon: FileText,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "+5%"
                    },
                    {
                      title: "Keyword Density",
                      value: score.keywordDensity,
                      icon: Search,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: "+2%",
                      unit: "%"
                    },
                    {
                      title: "Readability Level",
                      value: score.readabilityScore,
                      icon: Eye,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "+8%"
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

                {/* Content Quality Overview */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-500" />
                      Content Quality Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: "SEO Score",
                          value: score.seoScore,
                          icon: Target,
                          description: "SEO optimization level"
                        },
                        {
                          title: "Readability",
                          value: score.readabilityScore,
                          icon: Eye,
                          description: "Content readability score"
                        },
                        {
                          title: "Engagement",
                          value: score.engagementScore,
                          icon: Sparkles,
                          description: "User engagement potential"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <item.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{item.value}/100</div>
                              <Progress value={item.value} className="w-16 h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scores" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Score Breakdown Chart */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Score Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'SEO', score: score.seoScore, fill: '#3b82f6' },
                            { name: 'Readability', score: score.readabilityScore, fill: '#10b981' },
                            { name: 'Engagement', score: score.engagementScore, fill: '#f59e0b' },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="score" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Metrics */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" />
                        Content Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'Word Count', value: score.wordCount, unit: 'words', good: 800 },
                          { name: 'Keyword Density', value: score.keywordDensity, unit: '%', good: 2 },
                          { name: 'Reading Time', value: Math.round(score.wordCount / 200), unit: 'min', good: 5 },
                          { name: 'Sentences', value: Math.round(score.wordCount / 15), unit: '', good: 40 }
                        ].map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <div className="font-semibold text-sm">{metric.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Optimal: {metric.good}{metric.unit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {metric.value}{metric.unit}
                              </div>
                              <Badge variant={metric.value <= metric.good ? "default" : "destructive"} className="text-xs">
                                {metric.value <= metric.good ? "Good" : "Needs Improvement"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Key Entities */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-green-500" />
                        Key Entities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {score.entities?.map((entity: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-sm">{entity}</Badge>
                        )) || (
                          <p className="text-muted-foreground text-sm">No entities detected</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main Topics */}
                  <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-500" />
                        Main Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {score.topics?.map((topic: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-sm">{topic}</Badge>
                        )) || (
                          <p className="text-muted-foreground text-sm">No topics identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Optimization Recommendations */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Optimization Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {score.recommendations?.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="default" className="text-xs mb-2">
                                OPTIMIZATION
                              </Badge>
                              <p className="text-sm">{rec}</p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-semibold mb-2">Content Optimized</h3>
                            <p className="text-muted-foreground">No additional recommendations at this time.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Internal Link Suggestions */}
                  <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-cyan-500" />
                        Internal Link Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {score.internalLinkSuggestions?.map((suggestion: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                              <LinkIcon className="w-4 h-4 text-cyan-500" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="secondary" className="text-xs mb-2">
                                INTERNAL LINK
                              </Badge>
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-cyan-500" />
                            <h3 className="text-lg font-semibold mb-2">No Link Suggestions</h3>
                            <p className="text-muted-foreground">No internal linking opportunities identified.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};