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
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Activity, 
  Zap, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  MousePointerClick,
  Calendar,
  Globe,
  Sparkles
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
  ComposedChart
} from 'recharts';
import { ExportMenu } from "@/components/ExportMenu";

interface SERPTrackerProps {
  projectId: string;
}

export const SERPTracker = ({ projectId }: SERPTrackerProps) => {
  const [keyword, setKeyword] = useState("");
  const [rankings, setRankings] = useState<unknown[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<unknown>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
    loadRankings();
    loadSavedKeywords();
  }, [projectId]);

  const loadProject = async () => {
    const { data } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    setProject(data);
  };

  const loadRankings = async () => {
    const { data } = await supabase
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId)
      .order('checked_at', { ascending: false })
      .limit(50);
    setRankings(data || []);
  };

  const loadSavedKeywords = async () => {
    const { data } = await supabase
      .from('keyword_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('potential_score', { ascending: false });
    setSavedKeywords(data || []);
  };

  const trackKeyword = async () => {
    if (!keyword.trim() || !project) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('serp-tracker', {
        body: {
          keyword,
          domain: project.domain,
          location: project.target_location || 'United States'
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));

      // Save ranking
      await supabase.from('serp_rankings').insert({
        project_id: projectId,
        keyword,
        position: data.position,
        url: data.url,
        featured_snippet: data.featuredSnippet,
        local_pack: data.localPack
      });

      toast({
        title: "Ranking tracked",
        description: data.position 
          ? `You rank #${data.position} for "${keyword}"`
          : `Not ranking in top 100 for "${keyword}"`
      });

      loadRankings();
      setKeyword("");
    } catch (error) {
      console.error('SERP tracking error:', error);
      toast({
        title: "Tracking failed",
        description: "Data source not connected or unavailable. Open Settings > Integrations to connect and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionTrend = (currentKeyword: string) => {
    const keywordRankings = rankings
      .filter(r => r.keyword === currentKeyword)
      .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime());
    
    if (keywordRankings.length < 2) return null;
    
    const latest = keywordRankings[keywordRankings.length - 1];
    const previous = keywordRankings[keywordRankings.length - 2];
    
    if (!latest.position || !previous.position) return null;
    
    const change = previous.position - latest.position; // Lower is better
    return change;
  };

  const uniqueKeywords = Array.from(new Set(rankings.map(r => r.keyword)));

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SERP Position Tracker
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Monitor your keyword rankings with advanced analytics and real-time insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Live Tracking
              </Badge>
              <ExportMenu data={rankings} filename="serp-rankings" type="ranking" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter keyword to track..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && trackKeyword()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={trackKeyword} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Search className="w-5 h-5" />
              Track Keyword
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SERP Analytics Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive insights into your keyword performance and ranking trends
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              {uniqueKeywords.length} Keywords Tracked
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
                    title: "Keywords Tracked",
                    value: uniqueKeywords.length,
                    icon: Search,
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10",
                    change: "+12%"
                  },
                  {
                    title: "Avg Position",
                    value: rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + (r.position || 0), 0) / rankings.length) : 0,
                    icon: Target,
                    color: "text-orange-500",
                    bgColor: "bg-orange-500/10",
                    change: "-3"
                  },
                  {
                    title: "Top 10 Rankings",
                    value: rankings.filter(r => r.position && r.position <= 10).length,
                    icon: TrendingUp,
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    change: "+5"
                  },
                  {
                    title: "Opportunities",
                    value: savedKeywords.filter(kw => kw.opportunity_type === 'high_potential_low_competition').length,
                    icon: Zap,
                    color: "text-purple-500",
                    bgColor: "bg-purple-500/10",
                    change: "+8"
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

              {/* Saved Keywords from GSC */}
              {savedKeywords.length > 0 && (
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Keywords from Google Search Console ({savedKeywords.length})
                    </CardTitle>
                    <CardDescription>
                      Quick-track keywords already identified in your GSC data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedKeywords.slice(0, 12).map((kw, idx) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer bg-background/50 hover:bg-background/80 border-border/50"
                          onClick={() => {
                            setKeyword(kw.keyword);
                            trackKeyword();
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="font-semibold text-sm truncate mb-2">{kw.keyword}</div>
                              <Badge variant="outline" className="text-xs">
                                {kw.cluster_name || 'Unclustered'}
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-primary">#{Math.round(kw.position)}</div>
                              <div className="text-xs text-muted-foreground">{kw.impressions} imp</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Score: {(kw.potential_score * 100).toFixed(0)}
                            </span>
                            <Badge 
                              variant={kw.opportunity_type === 'high_potential_low_competition' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {kw.opportunity_type?.replace(/_/g, ' ').toUpperCase() || 'Track'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-500" />
                    Tracked Keywords Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uniqueKeywords.slice(0, 10).map((keyword, idx) => {
                      const keywordRankings = rankings.filter(r => r.keyword === keyword);
                      const latestRanking = keywordRankings[keywordRankings.length - 1];
                      const trend = getPositionTrend(keyword);
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{keyword}</h4>
                              <p className="text-sm text-muted-foreground">
                                {keywordRankings.length} data points
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-primary">#{latestRanking?.position || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">Current</p>
                            </div>
                            {trend !== null && (
                              <div className="text-center">
                                <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {trend > 0 ? <ArrowUp className="w-4 h-4" /> : trend < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                  <span className="text-sm font-medium">{Math.abs(trend)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Change</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Ranking Trends Chart */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      Ranking Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rankings.slice(0, 20)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="keyword" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="position" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Position Distribution */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-500" />
                      Position Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Top 3', value: rankings.filter(r => r.position && r.position <= 3).length, color: '#10b981' },
                              { name: 'Top 10', value: rankings.filter(r => r.position && r.position > 3 && r.position <= 10).length, color: '#3b82f6' },
                              { name: 'Top 50', value: rankings.filter(r => r.position && r.position > 10 && r.position <= 50).length, color: '#f59e0b' },
                              { name: 'Below 50', value: rankings.filter(r => r.position && r.position > 50).length, color: '#ef4444' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {[
                              { name: 'Top 3', value: rankings.filter(r => r.position && r.position <= 3).length, color: '#10b981' },
                              { name: 'Top 10', value: rankings.filter(r => r.position && r.position > 3 && r.position <= 10).length, color: '#3b82f6' },
                              { name: 'Top 50', value: rankings.filter(r => r.position && r.position > 10 && r.position <= 50).length, color: '#f59e0b' },
                              { name: 'Below 50', value: rankings.filter(r => r.position && r.position > 50).length, color: '#ef4444' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
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

      <div className="grid gap-4">
        {uniqueKeywords.map((kw) => {
          const latest = rankings.find(r => r.keyword === kw && r.position);
          const trend = getPositionTrend(kw);
          const keywordHistory = rankings
            .filter(r => r.keyword === kw && r.position)
            .reverse()
            .slice(0, 10)
            .map((r, i) => ({
              date: new Date(r.checked_at).toLocaleDateString(),
              position: r.position
            }));

          return (
            <Card key={kw} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{kw}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {latest?.position ? `#${latest.position}` : 'Not ranked'}
                      </span>
                    </div>
                    {trend !== null && (
                      <Badge variant={trend > 0 ? "default" : trend < 0 ? "destructive" : "secondary"} className="gap-1">
                        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(trend)} positions
                      </Badge>
                    )}
                  </div>
                  {latest?.featured_snippet && (
                    <Badge variant="default" className="mt-2">Featured Snippet</Badge>
                  )}
                  {latest?.local_pack && (
                    <Badge variant="secondary" className="mt-2 ml-2">Local Pack</Badge>
                  )}
                </div>
              </div>

              {keywordHistory.length > 1 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={keywordHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis reversed domain={[1, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="position" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {uniqueKeywords.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Keywords Tracked</h3>
          <p className="text-muted-foreground">Start tracking your keyword rankings above</p>
        </Card>
      )}
    </div>
  );
};