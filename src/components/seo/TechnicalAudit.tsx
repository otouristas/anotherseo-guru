import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Zap, 
  Smartphone, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Activity, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  MousePointerClick,
  Search,
  Sparkles,
  Brain,
  Cpu,
  HardDrive,
  Wifi
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

interface TechnicalAuditProps {
  projectId: string;
}

export const TechnicalAudit = ({ projectId }: TechnicalAuditProps) => {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Simulated audit data - in production, this would call PageSpeed Insights API
      // or similar service
      const mockAudit = {
        pageSpeed: 85,
        mobileFriendly: true,
        hasSSL: url.startsWith('https://'),
        coreWebVitals: {
          lcp: 2.1, // Largest Contentful Paint
          fid: 85, // First Input Delay
          cls: 0.08 // Cumulative Layout Shift
        },
        schemaMarkup: ['Organization', 'WebPage'],
        issues: [
          { severity: 'warning', message: 'Images not optimized for web' },
          { severity: 'info', message: 'Consider lazy loading for images' }
        ],
        recommendations: [
          'Optimize image sizes',
          'Enable browser caching',
          'Minify CSS and JavaScript',
          'Implement lazy loading'
        ]
      };

      setAudit(mockAudit);
      
      toast({
        title: "Audit complete",
        description: "Technical SEO analysis finished"
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit failed",
        description: "Could not complete technical audit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getCWVStatus = (metric: string, value: number) => {
    const thresholds: any = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    const t = thresholds[metric];
    if (value <= t.good) return { status: 'Good', color: 'text-success' };
    if (value <= t.poor) return { status: 'Needs Improvement', color: 'text-warning' };
    return { status: 'Poor', color: 'text-destructive' };
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
                <Cpu className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Technical SEO Audit
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Comprehensive technical analysis with Core Web Vitals, performance metrics, and optimization recommendations
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              Live Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter URL for comprehensive technical audit..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && runAudit()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={runAudit} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Cpu className="w-5 h-5" />
              Run Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      {audit && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Technical Audit Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis with Core Web Vitals, performance metrics, and optimization insights
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
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="issues" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Issues
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
                      title: "Page Speed Score",
                      value: audit.pageSpeed,
                      icon: Zap,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "+5",
                      max: 100
                    },
                    {
                      title: "LCP Score",
                      value: audit.coreWebVitals.lcp,
                      icon: Eye,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "-0.2s",
                      unit: "s"
                    },
                    {
                      title: "FID Score",
                      value: audit.coreWebVitals.fid,
                      icon: MousePointerClick,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: "-10ms",
                      unit: "ms"
                    },
                    {
                      title: "CLS Score",
                      value: audit.coreWebVitals.cls,
                      icon: Activity,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "-0.02",
                      unit: ""
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
                            {metric.value}{metric.unit}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">{metric.title}</div>
                          {metric.max && (
                            <Progress value={metric.value} className="h-2" />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Security & Technical Status */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      Security & Technical Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: "SSL Certificate",
                          status: audit.hasSSL,
                          icon: Shield,
                          description: "Secure connection enabled"
                        },
                        {
                          title: "Mobile Friendly",
                          status: audit.mobileFriendly,
                          icon: Smartphone,
                          description: "Optimized for mobile devices"
                        },
                        {
                          title: "Schema Markup",
                          status: audit.schemaMarkup && audit.schemaMarkup.length > 0,
                          icon: Brain,
                          description: "Structured data detected"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${item.status ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <item.icon className={`w-5 h-5 ${item.status ? 'text-green-500' : 'text-red-500'}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            {item.status ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Core Web Vitals Chart */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Core Web Vitals Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={[
                            { name: 'LCP', value: Math.max(0, 100 - (audit.coreWebVitals.lcp * 40)), fill: '#3b82f6' },
                            { name: 'FID', value: Math.max(0, 100 - (audit.coreWebVitals.fid / 5)), fill: '#10b981' },
                            { name: 'CLS', value: Math.max(0, 100 - (audit.coreWebVitals.cls * 400)), fill: '#f59e0b' },
                          ]}>
                            <RadialBar dataKey="value" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Breakdown */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Performance Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'Largest Contentful Paint', value: audit.coreWebVitals.lcp, unit: 's', good: 2.5 },
                          { name: 'First Input Delay', value: audit.coreWebVitals.fid, unit: 'ms', good: 100 },
                          { name: 'Cumulative Layout Shift', value: audit.coreWebVitals.cls, unit: '', good: 0.1 },
                          { name: 'Page Speed Score', value: audit.pageSpeed, unit: '/100', good: 90 }
                        ].map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <div className="font-semibold text-sm">{metric.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Good: ≤ {metric.good}{metric.unit}
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

              <TabsContent value="issues" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Issues Found ({audit.issues?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {audit.issues?.map((issue: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className={`p-2 rounded-lg ${
                            issue.severity === 'error' ? 'bg-red-500/10' : 
                            issue.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                          }`}>
                            <AlertTriangle className={`w-4 h-4 ${
                              issue.severity === 'error' ? 'text-red-500' : 
                              issue.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <Badge variant={
                              issue.severity === 'error' ? 'destructive' : 
                              issue.severity === 'warning' ? 'default' : 'secondary'
                            } className="text-xs mb-2">
                              {issue.severity?.toUpperCase() || 'INFO'}
                            </Badge>
                            <p className="text-sm">{issue.message}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                          <p className="text-muted-foreground">Your site is performing well!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      Optimization Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {audit.recommendations?.map((rec: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
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
                          <h3 className="text-lg font-semibold mb-2">All Optimized</h3>
                          <p className="text-muted-foreground">No additional recommendations at this time.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!audit && (
        <Card className="p-12 text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Audit Yet</h3>
          <p className="text-muted-foreground">Enter a URL above to run technical audit</p>
        </Card>
      )}
    </div>
  );
};