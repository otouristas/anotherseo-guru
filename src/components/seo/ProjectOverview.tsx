import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Link2, 
  FileText, 
  Globe,
  Target,
  BarChart3,
  MousePointerClick,
  Eye,
  Calendar,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectOverviewProps {
  projectId: string;
}

// Google Core Updates with dates
const googleCoreUpdates = [
  { date: '2025-03-13', name: 'March 2025 Core Update', impact: 'high' },
  { date: '2025-01-09', name: 'January 2025 Core Update', impact: 'medium' },
  { date: '2024-11-11', name: 'November 2024 Core Update', impact: 'high' },
  { date: '2024-08-15', name: 'August 2024 Core Update', impact: 'high' },
  { date: '2024-06-20', name: 'June 2024 Core Update', impact: 'medium' },
  { date: '2024-03-05', name: 'March 2024 Core Update', impact: 'high' },
];

export const ProjectOverview = ({ projectId }: ProjectOverviewProps) => {
  const [project, setProject] = useState<any>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [gscData, setGscData] = useState<any[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    clicks: 0,
    impressions: 0,
    avgPosition: 0,
    ctr: 0,
    keywords: 0,
    pages: 0,
    clusters: 0,
    opportunities: 0,
    prevClicks: 0,
    prevImpressions: 0,
    prevPosition: 0,
    prevCtr: 0,
  });

  useEffect(() => {
    loadData();
  }, [projectId, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load project
      const { data: projectData } = await supabase
        .from('seo_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      setProject(projectData);

      // Load GSC data
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: gscStats } = await supabase
        .from('gsc_analytics')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Calculate comparison period stats
      const compStartDate = new Date(startDate);
      compStartDate.setDate(compStartDate.getDate() - days);
      
      const { data: prevGscStats } = await supabase
        .from('gsc_analytics')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', compStartDate.toISOString().split('T')[0])
        .lt('date', startDate.toISOString().split('T')[0]);

      setGscData(gscStats || []);

      // Calculate current period metrics
      const totalClicks = gscStats?.reduce((sum, d) => sum + (d.clicks || 0), 0) || 0;
      const totalImpressions = gscStats?.reduce((sum, d) => sum + (d.impressions || 0), 0) || 0;
      const avgPos = gscStats?.length ? gscStats.reduce((sum, d) => sum + (d.position || 0), 0) / gscStats.length : 0;
      const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Calculate previous period metrics
      const prevClicks = prevGscStats?.reduce((sum, d) => sum + (d.clicks || 0), 0) || 0;
      const prevImpressions = prevGscStats?.reduce((sum, d) => sum + (d.impressions || 0), 0) || 0;
      const prevPos = prevGscStats?.length ? prevGscStats.reduce((sum, d) => sum + (d.position || 0), 0) / prevGscStats.length : 0;
      const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;

      // Load keyword analysis data
      const { data: kwAnalysis } = await supabase
        .from('keyword_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('potential_score', { ascending: false });

      setKeywordAnalysis(kwAnalysis || []);

      // Count unique pages, clusters, and opportunities
      const uniquePages = new Set(kwAnalysis?.map(k => k.page_url)).size;
      const uniqueClusters = new Set(kwAnalysis?.map(k => k.cluster_name).filter(Boolean)).size;
      const opportunities = kwAnalysis?.filter(k => k.opportunity_type === 'high_potential_low_competition').length || 0;

      setStats({
        clicks: totalClicks,
        impressions: totalImpressions,
        avgPosition: Math.round(avgPos * 10) / 10,
        ctr: Math.round(avgCtr * 100) / 100,
        keywords: kwAnalysis?.length || 0,
        pages: uniquePages,
        clusters: uniqueClusters,
        opportunities,
        prevClicks,
        prevImpressions,
        prevPosition: Math.round(prevPos * 10) / 10,
        prevCtr: Math.round(prevCtr * 100) / 100,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number, inverse = false) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return inverse ? -change : change;
  };

  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    return change > 0 ? `+${absChange.toFixed(1)}%` : `-${absChange.toFixed(1)}%`;
  };

  // Aggregate daily data for chart
  const chartData = gscData.reduce((acc: any[], item) => {
    const existingDate = acc.find(d => d.date === item.date);
    if (existingDate) {
      existingDate.clicks += item.clicks || 0;
      existingDate.impressions += item.impressions || 0;
    } else {
      acc.push({
        date: item.date,
        clicks: item.clicks || 0,
        impressions: item.impressions || 0,
      });
    }
    return acc;
  }, []);

  const metricCards = [
    {
      title: "Total Clicks",
      value: stats.clicks,
      icon: MousePointerClick,
      change: calculateChange(stats.clicks, stats.prevClicks),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Impressions",
      value: stats.impressions,
      icon: Eye,
      change: calculateChange(stats.impressions, stats.prevImpressions),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg Position",
      value: stats.avgPosition,
      icon: Target,
      change: calculateChange(stats.avgPosition, stats.prevPosition, true),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Average CTR",
      value: `${stats.ctr}%`,
      icon: BarChart3,
      change: calculateChange(stats.ctr, stats.prevCtr),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  const secondaryMetrics = [
    {
      title: "Keywords Tracked",
      value: stats.keywords,
      icon: Search,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Pages Indexed",
      value: stats.pages,
      icon: FileText,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Keyword Clusters",
      value: stats.clusters,
      icon: Link2,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "High Opportunities",
      value: stats.opportunities,
      icon: Sparkles,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Project Header with Period Selector */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{project?.name}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="break-all">{project?.domain}</span>
              </div>
              <Badge variant="outline" className="text-xs sm:text-sm">{project?.target_location}</Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">SEO Health Score</div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {Math.min(100, Math.round((stats.clicks / 100 + stats.ctr) * 10))}
              </div>
              <Progress value={Math.min(100, Math.round((stats.clicks / 100 + stats.ctr) * 10))} className="w-full lg:w-32 mt-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((metric, idx) => {
          const Icon = metric.icon;
          const isPositive = metric.change > 0;
          return (
            <Card key={idx} className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${metric.color}`} />
                </div>
                <Badge variant={isPositive ? "default" : "secondary"} className="gap-1 text-xs">
                  {isPositive ? <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3" />}
                  {formatChange(metric.change)}
                </Badge>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{metric.title}</div>
            </Card>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clicks & Impressions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} name="Clicks" />
                  <Line type="monotone" dataKey="impressions" stroke="hsl(var(--secondary))" strokeWidth={2} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Google Core Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {googleCoreUpdates.map((update, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{update.name}</div>
                    <div className="text-xs text-muted-foreground">{update.date}</div>
                  </div>
                  <Badge variant={update.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {update.impact.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {secondaryMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="p-3 sm:p-4 md:p-6">
              <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor} inline-flex mb-3`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">{metric.value.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{metric.title}</div>
            </Card>
          );
        })}
      </div>

      {/* Top Pages & Keywords with AI Recommendations */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Top Pages
              </CardTitle>
              <Badge>{stats.pages}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keywordAnalysis
                .reduce((acc: any[], item) => {
                  const existing = acc.find(p => p.page === item.page_url);
                  if (existing) {
                    existing.clicks += item.clicks || 0;
                    existing.keywords++;
                  } else {
                    acc.push({
                      page: item.page_url,
                      clicks: item.clicks || 0,
                      keywords: 1,
                      cluster: item.cluster_name,
                    });
                  }
                  return acc;
                }, [])
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5)
                .map((page, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium text-sm truncate">{page.page}</div>
                        {page.cluster && (
                          <Badge variant="outline" className="text-xs mt-1">{page.cluster}</Badge>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold">{page.clicks}</div>
                        <div className="text-xs text-muted-foreground">clicks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span>{page.keywords} keywords tracked</span>
                    </div>
                  </div>
                ))}
              {keywordAnalysis.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No page data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Opportunities
              </CardTitle>
              <Badge variant="default">{stats.opportunities}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keywordAnalysis
                .filter(k => k.opportunity_type === 'high_potential_low_competition')
                .slice(0, 5)
                .map((kw, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium text-sm">{kw.keyword}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{kw.cluster_name}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {(kw.potential_score * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold">#{Math.round(kw.position)}</div>
                        <div className="text-xs text-muted-foreground">{kw.impressions} imp</div>
                      </div>
                    </div>
                    {kw.ai_recommendations && (
                      <div className="mt-2 p-2 bg-primary/5 rounded text-xs">
                        <div className="flex items-start gap-1">
                          <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground line-clamp-2">
                            {JSON.parse(kw.ai_recommendations).recommendations?.[0] || 'Optimize content'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              {stats.opportunities === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No opportunities identified yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={loadData}>
                    Analyze Keywords
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}