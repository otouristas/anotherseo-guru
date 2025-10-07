import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { motion } from 'framer-motion';
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
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Target,
  Eye,
  MousePointer,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Users,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    overall: 'good' | 'needs-improvement' | 'poor';
  };
  trafficMetrics: {
    totalSessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    pagesPerSession: number;
    newUsers: number;
    returningUsers: number;
  };
  deviceMetrics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicMetrics: Array<{
    country: string;
    sessions: number;
    bounceRate: number;
    conversionRate: number;
  }>;
  pagePerformance: Array<{
    page: string;
    loadTime: number;
    bounceRate: number;
    traffic: number;
    score: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    severity: number;
    action: string;
  }>;
}

export function AdvancedPerformanceDashboard({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const { data: analytics } = useRealTimeData({
    table: 'gsc_analytics',
    projectId,
    cacheKey: `performance:${projectId}`,
  });

  useEffect(() => {
    loadPerformanceData();
  }, [projectId, selectedTimeframe]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockMetrics: PerformanceMetrics = {
      coreWebVitals: {
        lcp: 2.1,
        fid: 85,
        cls: 0.08,
        overall: 'good'
      },
      trafficMetrics: {
        totalSessions: 45678,
        bounceRate: 42.3,
        avgSessionDuration: 156,
        pagesPerSession: 2.8,
        newUsers: 32456,
        returningUsers: 13222
      },
      deviceMetrics: {
        desktop: 58.2,
        mobile: 38.1,
        tablet: 3.7
      },
      geographicMetrics: [
        { country: 'United States', sessions: 18234, bounceRate: 38.2, conversionRate: 3.2 },
        { country: 'United Kingdom', sessions: 8934, bounceRate: 41.5, conversionRate: 2.8 },
        { country: 'Canada', sessions: 6745, bounceRate: 44.1, conversionRate: 2.5 },
        { country: 'Germany', sessions: 5432, bounceRate: 45.8, conversionRate: 2.1 },
        { country: 'Australia', sessions: 4333, bounceRate: 39.7, conversionRate: 2.9 }
      ],
      pagePerformance: [
        { page: '/', loadTime: 1.8, bounceRate: 35.2, traffic: 12345, score: 95 },
        { page: '/blog', loadTime: 2.1, bounceRate: 42.8, traffic: 8765, score: 88 },
        { page: '/services', loadTime: 2.5, bounceRate: 38.9, traffic: 6543, score: 92 },
        { page: '/about', loadTime: 1.9, bounceRate: 45.2, traffic: 4321, score: 90 },
        { page: '/contact', loadTime: 2.3, bounceRate: 41.7, traffic: 3456, score: 87 }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Mobile bounce rate increased by 15% this week',
          severity: 6,
          action: 'Optimize mobile experience'
        },
        {
          type: 'error',
          message: 'Page load time exceeded 3 seconds on /blog',
          severity: 8,
          action: 'Optimize images and scripts'
        },
        {
          type: 'info',
          message: 'Core Web Vitals improved by 12%',
          severity: 2,
          action: 'Continue current optimization'
        }
      ]
    };

    setMetrics(mockMetrics);
    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const deviceData = [
    { name: 'Desktop', value: metrics?.deviceMetrics.desktop || 0, color: '#8884d8' },
    { name: 'Mobile', value: metrics?.deviceMetrics.mobile || 0, color: '#82ca9d' },
    { name: 'Tablet', value: metrics?.deviceMetrics.tablet || 0, color: '#ffc658' }
  ];

  const cwvData = [
    { metric: 'LCP', value: metrics?.coreWebVitals.lcp || 0, threshold: 2.5, unit: 's' },
    { metric: 'FID', value: metrics?.coreWebVitals.fid || 0, threshold: 100, unit: 'ms' },
    { metric: 'CLS', value: metrics?.coreWebVitals.cls || 0, threshold: 0.1, unit: '' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Advanced Performance Dashboard
                </CardTitle>
                <p className="text-base text-muted-foreground mt-1">
                  Real-time performance monitoring with advanced analytics and insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {['7d', '30d', '90d'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={selectedTimeframe === timeframe ? 'bg-gradient-to-r from-primary to-secondary' : ''}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {metrics?.trafficMetrics.totalSessions.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <MousePointer className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">-3.2%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {metrics?.trafficMetrics.bounceRate}%
            </div>
            <div className="text-sm text-muted-foreground">Bounce Rate</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">+8.1%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {Math.floor((metrics?.trafficMetrics.avgSessionDuration || 0) / 60)}m
            </div>
            <div className="text-sm text-muted-foreground">Avg. Session</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Globe className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">+2.3%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {metrics?.trafficMetrics.pagesPerSession}
            </div>
            <div className="text-sm text-muted-foreground">Pages/Session</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < alert.severity ? 'bg-red-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="devices">Device Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cwvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative w-32 h-32">
                    <Progress 
                      value={85} 
                      className="w-full h-full transform -rotate-90" 
                      style={{ 
                        background: 'conic-gradient(from 0deg, #10b981 0deg 306deg, #e5e7eb 306deg 360deg)',
                        borderRadius: '50%'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">85</div>
                        <div className="text-sm text-muted-foreground">Good</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Desktop</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">2.1s</div>
                      <div className="text-sm text-muted-foreground">avg load time</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Mobile</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">3.2s</div>
                      <div className="text-sm text-muted-foreground">avg load time</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Tablet</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">2.8s</div>
                      <div className="text-sm text-muted-foreground">avg load time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.geographicMetrics.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{country.country}</div>
                      <div className="text-sm text-muted-foreground">
                        {country.sessions.toLocaleString()} sessions
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{country.bounceRate}%</div>
                        <div className="text-xs text-muted-foreground">Bounce Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{country.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.pagePerformance.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{page.page}</div>
                      <div className="text-sm text-muted-foreground">
                        {page.traffic.toLocaleString()} sessions
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold">{page.loadTime}s</div>
                        <div className="text-xs text-muted-foreground">Load Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{page.bounceRate}%</div>
                        <div className="text-xs text-muted-foreground">Bounce Rate</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(page.score)}`}>{page.score}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
