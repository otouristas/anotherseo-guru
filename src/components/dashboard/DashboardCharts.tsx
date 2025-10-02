import { memo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar as BarChart3, Download, TrendingUp, Activity, Target, BarChart } from "lucide-react";
import {
  Area,
  AreaChart,
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface DashboardChartsProps {
  usageChartData: Array<{ day: string; credits: number }>;
}

export const DashboardCharts = memo(({ usageChartData }: DashboardChartsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced data for multiple chart types
  const rankingData = [
    { month: 'Jan', position: 45, traffic: 1200, conversions: 45 },
    { month: 'Feb', position: 38, traffic: 1450, conversions: 52 },
    { month: 'Mar', position: 32, traffic: 1680, conversions: 61 },
    { month: 'Apr', position: 28, traffic: 1920, conversions: 72 },
    { month: 'May', position: 22, traffic: 2150, conversions: 85 },
    { month: 'Jun', position: 18, traffic: 2380, conversions: 94 },
  ];

  const trafficSourcesData = [
    { name: 'Organic', value: 65, color: '#3b82f6' },
    { name: 'Direct', value: 20, color: '#10b981' },
    { name: 'Social', value: 10, color: '#f59e0b' },
    { name: 'Referral', value: 5, color: '#ef4444' },
  ];

  const keywordPerformanceData = [
    { keyword: 'SEO Tools', volume: 12000, position: 3, cpc: 2.5 },
    { keyword: 'Content Marketing', volume: 8500, position: 7, cpc: 1.8 },
    { keyword: 'Keyword Research', volume: 6200, position: 5, cpc: 2.2 },
    { keyword: 'SEO Analytics', volume: 4800, position: 12, cpc: 1.5 },
    { keyword: 'Link Building', volume: 3600, position: 8, cpc: 1.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Main Analytics Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SEO Performance Analytics
                </CardTitle>
                <CardDescription className="mt-1">
                  Comprehensive insights into your SEO performance and growth
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Live Data
              </Badge>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="rankings" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="traffic" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Traffic
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Keywords
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credits Usage Chart */}
                <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Weekly Credits Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={usageChartData}>
                        <defs>
                          <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="credits"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorCredits)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Traffic Sources Pie Chart */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-blue-500" />
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={trafficSourcesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {trafficSourcesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rankings" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Ranking Trends & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rankingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip
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
                        stroke="#ef4444"
                        strokeWidth={3}
                        name="Avg Position"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="traffic"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Organic Traffic"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-purple-500" />
                    Traffic Growth Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={rankingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="traffic" fill="#8b5cf6" name="Organic Traffic" />
                      <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Top Performing Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keywordPerformanceData.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{keyword.keyword}</h4>
                            <p className="text-sm text-muted-foreground">Volume: {keyword.volume.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">#{keyword.position}</p>
                            <p className="text-xs text-muted-foreground">Position</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">${keyword.cpc}</p>
                            <p className="text-xs text-muted-foreground">CPC</p>
                          </div>
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
    </div>
  );
});

DashboardCharts.displayName = "DashboardCharts";
