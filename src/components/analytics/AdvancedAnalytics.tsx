import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCard, MetricCard, StatCard } from '@/components/ui/enhanced-card';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useSEOStore } from '@/stores/seoStore';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdvancedAnalyticsProps {
  projectId: string;
}

const COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export function AdvancedAnalytics({ projectId }: AdvancedAnalyticsProps) {
  const { data: keywords, loading: keywordsLoading } = useRealTimeData({
    table: 'serp_rankings',
    projectId,
    cacheKey: `keywords:${projectId}`,
  });

  const { data: analytics, loading: analyticsLoading } = useRealTimeData({
    table: 'gsc_analytics',
    projectId,
    cacheKey: `analytics:${projectId}`,
  });

  const { data: competitors, loading: competitorsLoading } = useRealTimeData({
    table: 'competitor_analysis',
    projectId,
    cacheKey: `competitors:${projectId}`,
  });

  const { data: recommendations, loading: recommendationsLoading } = useRealTimeData({
    table: 'ai_recommendations',
    projectId,
    cacheKey: `recommendations:${projectId}`,
  });

  // Process data for charts
  const chartData = useMemo(() => {
    // Keyword trends over time
    const keywordTrends = keywords.map(k => ({
      date: new Date(k.checked_at).toLocaleDateString(),
      position: k.position,
      keyword: k.keyword,
      volume: k.volume || 0,
      difficulty: k.difficulty || 0,
    }));

    // Traffic data
    const trafficData = analytics.map(a => ({
      date: new Date(a.date).toLocaleDateString(),
      clicks: a.clicks || 0,
      impressions: a.impressions || 0,
      ctr: a.ctr || 0,
      position: a.avg_position || 0,
    }));

    // Position distribution
    const positionDistribution = [
      { name: 'Top 3', value: keywords.filter(k => k.position <= 3).length, color: COLORS.success },
      { name: '4-10', value: keywords.filter(k => k.position > 3 && k.position <= 10).length, color: COLORS.warning },
      { name: '11-20', value: keywords.filter(k => k.position > 10 && k.position <= 20).length, color: COLORS.danger },
      { name: '20+', value: keywords.filter(k => k.position > 20).length, color: '#6b7280' },
    ];

    // Volume vs Difficulty scatter
    const volumeDifficultyData = keywords.map(k => ({
      volume: k.volume || 0,
      difficulty: k.difficulty || 0,
      position: k.position,
      keyword: k.keyword,
    }));

    // Competitor analysis radar
    const competitorRadarData = competitors.map(c => ({
      domain: c.domain,
      avgPosition: c.avg_position || 0,
      totalKeywords: c.total_keywords || 0,
      backlinks: c.backlinks_count || 0,
      domainAuthority: c.domain_authority || 0,
      traffic: c.estimated_traffic || 0,
    }));

    // Trend analysis
    const trendData = keywords.reduce((acc, k) => {
      const trend = k.trend || 'stable';
      acc[trend] = (acc[trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      keywordTrends,
      trafficData,
      positionDistribution,
      volumeDifficultyData,
      competitorRadarData,
      trendData,
    };
  }, [keywords, analytics, competitors]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalKeywords = keywords.length;
    const avgPosition = totalKeywords > 0 
      ? keywords.reduce((sum, k) => sum + k.position, 0) / totalKeywords 
      : 0;
    const top10Keywords = keywords.filter(k => k.position <= 10).length;
    const totalTraffic = analytics.reduce((sum, a) => sum + (a.clicks || 0), 0);
    const improvingKeywords = keywords.filter(k => k.trend === 'up').length;
    const decliningKeywords = keywords.filter(k => k.trend === 'down').length;
    const pendingRecommendations = recommendations.filter(r => r.status === 'pending').length;

    return {
      totalKeywords,
      avgPosition: Math.round(avgPosition * 10) / 10,
      top10Keywords,
      totalTraffic,
      improvingKeywords,
      decliningKeywords,
      pendingRecommendations,
    };
  }, [keywords, analytics, recommendations]);

  if (keywordsLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} title="Loading..." loading />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Keywords"
          description="Tracked keywords"
          value={metrics.totalKeywords}
          icon={<Eye className="h-4 w-4" />}
          change={{
            value: 12,
            type: 'increase'
          }}
        />
        
        <MetricCard
          title="Avg Position"
          description="Average ranking position"
          value={metrics.avgPosition}
          icon={<Target className="h-4 w-4" />}
          change={{
            value: -2.3,
            type: 'increase'
          }}
        />
        
        <MetricCard
          title="Top 10 Keywords"
          description="Keywords ranking in top 10"
          value={metrics.top10Keywords}
          icon={<CheckCircle className="h-4 w-4" />}
          change={{
            value: 8.5,
            type: 'increase'
          }}
        />
        
        <MetricCard
          title="Total Traffic"
          description="Estimated monthly traffic"
          value={metrics.totalTraffic.toLocaleString()}
          icon={<MousePointer className="h-4 w-4" />}
          change={{
            value: 18.5,
            type: 'increase'
          }}
        />

        <MetricCard
          title="Improving"
          description="Keywords trending up"
          value={metrics.improvingKeywords}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
        />
        
        <MetricCard
          title="Declining"
          description="Keywords trending down"
          value={metrics.decliningKeywords}
          icon={<TrendingDown className="h-4 w-4" />}
          variant="danger"
        />
        
        <MetricCard
          title="Pending Actions"
          description="AI recommendations"
          value={metrics.pendingRecommendations}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Position Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.keywordTrends.slice(0, 30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="position" 
                      stroke={COLORS.primary} 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume vs Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={chartData.volumeDifficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="volume" name="Search Volume" />
                    <YAxis dataKey="difficulty" name="Difficulty" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      dataKey="difficulty" 
                      fill={COLORS.secondary}
                      name="Keywords"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.positionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.positionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stackId="1" 
                    stroke={COLORS.primary} 
                    fill={COLORS.primary} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stackId="1" 
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CTR Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ctr" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(chartData.trendData).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData.competitorRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Metrics"
                    dataKey="avgPosition"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((rec, index) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm">{rec.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      rec.priority_level === 'high' ? 'destructive' :
                      rec.priority_level === 'medium' ? 'default' : 'secondary'
                    }>
                      {rec.priority_level}
                    </Badge>
                    <Badge variant="outline">
                      {rec.impact_score}/10
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
