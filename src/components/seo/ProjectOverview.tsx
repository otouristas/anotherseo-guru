import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart 
} from 'recharts';

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
    <div className="space-y-6">
      {/* Enhanced Project Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {project?.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">{project?.domain}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {project?.target_location}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                  <SelectTrigger className="w-36 bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-sm text-muted-foreground mb-2">SEO Health Score</div>
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {Math.min(100, Math.round((stats.clicks / 100 + stats.ctr) * 10))}
                </div>
                <Progress 
                  value={Math.min(100, Math.round((stats.clicks / 100 + stats.ctr) * 10))} 
                  className="w-full lg:w-40 h-3 bg-background/50" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {metricCards.map((metric, idx) => {
          const Icon = metric.icon;
          const isPositive = metric.change > 0;
          const isPositionMetric = metric.title === "Avg Position";
          
          return (
            <Card key={idx} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{metric.title}</h3>
                      <p className="text-xs text-muted-foreground">Current period</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatChange(metric.change)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <div className={`text-3xl font-bold ${isPositionMetric ? 'text-orange-600' : 'bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent'}`}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </div>
                  {isPositionMetric && (
                    <div className="text-xs text-muted-foreground">position</div>
                  )}
                </div>

                {/* Mini Chart Placeholder */}
                <div className="h-12 flex items-center justify-center">
                  <div className="w-full h-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-end justify-between px-2">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-primary/60 rounded-t-sm transition-all duration-300 hover:bg-primary"
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          width: '8px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Performance Analytics */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Performance Analytics
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive insights into your SEO performance trends
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Updates
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Clicks & Impressions Chart */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Clicks & Impressions Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="clicks"
                            stroke="#3b82f6"
                            fill="url(#colorClicks)"
                            strokeWidth={2}
                            name="Clicks"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="impressions"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            name="Impressions"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Position & CTR Chart */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Position & CTR Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="position"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            name="Avg Position"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="ctr"
                            stroke="#10b981"
                            strokeWidth={3}
                            name="CTR %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Google Core Updates Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {googleCoreUpdates.map((update, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${update.impact === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <div>
                            <div className="font-semibold text-sm">{update.name}</div>
                            <div className="text-xs text-muted-foreground">{update.date}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={update.impact === 'high' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {update.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-purple-500" />
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Organic', value: 65, color: '#3b82f6' },
                              { name: 'Direct', value: 20, color: '#10b981' },
                              { name: 'Social', value: 10, color: '#f59e0b' },
                              { name: 'Referral', value: 5, color: '#ef4444' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {[
                              { name: 'Organic', value: 65, color: '#3b82f6' },
                              { name: 'Direct', value: 20, color: '#10b981' },
                              { name: 'Social', value: 10, color: '#f59e0b' },
                              { name: 'Referral', value: 5, color: '#ef4444' },
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

                {/* Performance Summary */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-500" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Growth Rate</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-700">+24.5%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Top Keywords</span>
                        </div>
                        <Badge variant="secondary">156</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Search Visibility</span>
                        </div>
                        <Badge variant="default" className="bg-purple-100 text-purple-700">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {secondaryMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-secondary/5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                  {metric.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{metric.title}</div>
                
                {/* Mini Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-secondary/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (metric.value / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
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