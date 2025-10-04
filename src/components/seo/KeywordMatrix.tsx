import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Activity, 
  Zap, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Brain
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
  Scatter
} from 'recharts';
import { ExportMenu } from "@/components/ExportMenu";

interface KeywordMatrixProps {
  projectId: string;
}

export const KeywordMatrix = ({ projectId }: KeywordMatrixProps) => {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKeywords();
  }, [projectId]);

  const loadKeywords = async () => {
    const { data } = await supabase
      .from('keyword_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('search_volume', { ascending: false });
    setKeywords(data || []);
  };

  const researchKeyword = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'keyword_suggestions',
          keyword,
          location: 'United States'
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      }

      const results = data?.tasks?.[0]?.result?.[0]?.items || [];

      if (results.length === 0) {
        toast({
          title: "No data yet",
          description: "Connect your data sources in Settings > Integrations, then try again.",
        });
        return;
      }
      
      // Save top keywords
      const keywordsToSave = results.slice(0, 20).map((item: unknown) => ({
        project_id: projectId,
        keyword: item.keyword,
        search_volume: item.keyword_info?.search_volume || item.search_volume || 0,
        difficulty: item.keyword_info?.competition < 0.33 ? 30 : item.keyword_info?.competition < 0.66 ? 60 : 90,
        cpc: item.keyword_info?.cpc || item.cpc || 0,
        search_intent: item.keyword_info?.search_intent || 'informational'
      }));

      await supabase.from('keyword_tracking').upsert(keywordsToSave, {
        onConflict: 'project_id,keyword'
      });

      toast({
        title: "Keywords researched",
        description: `Found ${results.length} related keywords`
      });

      loadKeywords();
      setKeyword("");
    } catch (error) {
      console.error('Keyword research error:', error);
      toast({
        title: "Research failed",
        description: "Could not research keywords",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "bg-success";
    if (difficulty <= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return "Easy";
    if (difficulty <= 60) return "Medium";
    return "Hard";
  };

  const getIntentBadge = (intent: string) => {
    const colors: Record<string, string> = {
      informational: "secondary",
      commercial: "default",
      transactional: "destructive",
      navigational: "outline"
    };
    return colors[intent] || "secondary";
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
                  Keyword Research Matrix
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced keyword research and analysis with AI-powered insights and competitive intelligence
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                AI Research
              </Badge>
              <ExportMenu data={keywords} filename="keywords" type="keyword" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter seed keyword for AI-powered research..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && researchKeyword()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={researchKeyword} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Brain className="w-5 h-5" />
              AI Research
            </Button>
          </div>
        </CardContent>
      </Card>

      {keywords.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Keyword Intelligence Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis of {keywords.length} keywords with advanced metrics and insights
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {keywords.length} Keywords
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="keywords" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Keywords
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Total Keywords",
                      value: keywords.length,
                      icon: Search,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "+12%"
                    },
                    {
                      title: "Avg Volume",
                      value: Math.round(keywords.reduce((sum, kw) => sum + (kw.search_volume || 0), 0) / keywords.length),
                      icon: TrendingUp,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "+8%"
                    },
                    {
                      title: "Avg Difficulty",
                      value: Math.round(keywords.reduce((sum, kw) => sum + (kw.difficulty || 0), 0) / keywords.length),
                      icon: Target,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: "-3"
                    },
                    {
                      title: "High Volume",
                      value: keywords.filter(kw => (kw.search_volume || 0) > 1000).length,
                      icon: Zap,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "+5"
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
                            {metric.value.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Top Keywords Grid */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      Top Performing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {keywords.slice(0, 9).map((kw, idx) => (
                        <div key={kw.id} className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer bg-background/50 hover:bg-background/80 border-border/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="font-semibold text-sm truncate mb-2">{kw.keyword}</div>
                              <Badge variant={getIntentBadge(kw.search_intent || 'informational') as unknown} className="text-xs">
                                {kw.search_intent || 'informational'}
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-primary">{(kw.search_volume || 0).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">volume</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getDifficultyColor(kw.difficulty || 0)}`} />
                              <span className="text-xs text-muted-foreground">
                                {getDifficultyLabel(kw.difficulty || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium">${(kw.cpc || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-500" />
                      Complete Keywords List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-semibold">Keyword</th>
                            <th className="text-left py-3 px-2 font-semibold">Volume</th>
                            <th className="text-left py-3 px-2 font-semibold">Difficulty</th>
                            <th className="text-left py-3 px-2 font-semibold">CPC</th>
                            <th className="text-left py-3 px-2 font-semibold">Intent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keywords.map((kw) => (
                            <tr key={kw.id} className="border-b hover:bg-background/50 transition-colors">
                              <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                  {(kw.search_volume || 0).toLocaleString()}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(kw.difficulty || 0)}`} />
                                  {getDifficultyLabel(kw.difficulty || 0)}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  ${(kw.cpc || 0).toFixed(2)}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant={getIntentBadge(kw.search_intent || 'informational') as unknown}>
                                  {kw.search_intent || 'informational'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Volume vs Difficulty Scatter */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Volume vs Difficulty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart data={keywords.map(kw => ({
                            volume: kw.search_volume || 0,
                            difficulty: kw.difficulty || 0,
                            keyword: kw.keyword
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="volume" name="Search Volume" />
                            <YAxis dataKey="difficulty" name="Difficulty" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Scatter dataKey="difficulty" fill="#8b5cf6" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Intent Distribution */}
                  <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-500" />
                        Search Intent Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                keywords.reduce((acc, kw) => {
                                  const intent = kw.search_intent || 'informational';
                                  acc[intent] = (acc[intent] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([intent, count]) => ({
                                name: intent,
                                value: count,
                                color: intent === 'informational' ? '#3b82f6' : 
                                       intent === 'commercial' ? '#10b981' : 
                                       intent === 'transactional' ? '#ef4444' : '#f59e0b'
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {Object.entries(
                                keywords.reduce((acc, kw) => {
                                  const intent = kw.search_intent || 'informational';
                                  acc[intent] = (acc[intent] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([intent, count], index) => (
                                <Cell key={`cell-${index}`} fill={
                                  intent === 'informational' ? '#3b82f6' : 
                                  intent === 'commercial' ? '#10b981' : 
                                  intent === 'transactional' ? '#ef4444' : '#f59e0b'
                                } />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {keywords.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Keywords Tracked</h3>
          <p className="text-muted-foreground">Research keywords to build your matrix</p>
        </Card>
      )}
    </div>
  );
};