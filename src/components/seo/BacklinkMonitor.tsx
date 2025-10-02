import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Link as LinkIcon, 
  TrendingUp, 
  ExternalLink, 
  Target, 
  Activity, 
  Zap, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Shield,
  Search
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

interface BacklinkMonitorProps {
  projectId: string;
}

export const BacklinkMonitor = ({ projectId }: BacklinkMonitorProps) => {
  const [backlinks, setBacklinks] = useState<any[]>([]);

  useEffect(() => {
    loadBacklinks();
  }, [projectId]);

  const loadBacklinks = async () => {
    const { data } = await supabase
      .from('backlink_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('domain_authority', { ascending: false })
      .limit(50);
    setBacklinks(data || []);
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return "default";
    if (status === 'lost') return "destructive";
    return "secondary";
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Backlink Intelligence Monitor
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced backlink monitoring and analysis with domain authority tracking and link quality insights
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              Live Monitoring
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {backlinks.length > 0 ? (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Backlink Analytics Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis of {backlinks.length} backlinks with domain authority and quality metrics
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {backlinks.length} Links
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
                <TabsTrigger value="backlinks" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Backlinks
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
                      title: "Total Backlinks",
                      value: backlinks.length,
                      icon: LinkIcon,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "+12%"
                    },
                    {
                      title: "Avg Domain Authority",
                      value: Math.round(backlinks.reduce((sum, link) => sum + (link.domain_authority || 0), 0) / backlinks.length),
                      icon: TrendingUp,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "+8"
                    },
                    {
                      title: "Active Links",
                      value: backlinks.filter(link => link.status === 'active').length,
                      icon: CheckCircle,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: "+5"
                    },
                    {
                      title: "High DA Links",
                      value: backlinks.filter(link => (link.domain_authority || 0) > 50).length,
                      icon: Shield,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: "+3"
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

                {/* Top Backlinks Grid */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      High-Quality Backlinks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {backlinks.slice(0, 9).map((backlink, idx) => (
                        <div key={backlink.id} className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer bg-background/50 hover:bg-background/80 border-border/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <a 
                                  href={`https://${backlink.source_domain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-semibold text-sm truncate hover:text-primary transition-colors"
                                >
                                  {backlink.source_domain}
                                </a>
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <Badge variant={getStatusColor(backlink.status)} className="text-xs">
                                {backlink.status || 'unknown'}
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-primary">{backlink.domain_authority || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">DA</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {backlink.anchor_text ? `Anchor: "${backlink.anchor_text}"` : `Type: ${backlink.link_type || 'standard'}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backlinks" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-blue-500" />
                      Complete Backlinks List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {backlinks.map((backlink) => (
                        <div key={backlink.id} className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 bg-background/50 hover:bg-background/80 border-border/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                <a 
                                  href={`https://${backlink.source_domain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-semibold hover:text-primary transition-colors"
                                >
                                  {backlink.source_domain}
                                </a>
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </div>
                              {backlink.anchor_text && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Anchor: "{backlink.anchor_text}"
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                  DA: {backlink.domain_authority || 'N/A'}
                                </div>
                                <div>
                                  Type: {backlink.link_type || 'standard'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(backlink.status)}>
                                {backlink.status || 'unknown'}
                              </Badge>
                              {backlink.is_dofollow && (
                                <Badge variant="default">DoFollow</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Domain Authority Distribution */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Domain Authority Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'High DA (50+)', value: backlinks.filter(link => (link.domain_authority || 0) >= 50).length, color: '#10b981' },
                                { name: 'Medium DA (30-49)', value: backlinks.filter(link => (link.domain_authority || 0) >= 30 && (link.domain_authority || 0) < 50).length, color: '#3b82f6' },
                                { name: 'Low DA (<30)', value: backlinks.filter(link => (link.domain_authority || 0) < 30).length, color: '#f59e0b' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {[
                                { name: 'High DA (50+)', value: backlinks.filter(link => (link.domain_authority || 0) >= 50).length, color: '#10b981' },
                                { name: 'Medium DA (30-49)', value: backlinks.filter(link => (link.domain_authority || 0) >= 30 && (link.domain_authority || 0) < 50).length, color: '#3b82f6' },
                                { name: 'Low DA (<30)', value: backlinks.filter(link => (link.domain_authority || 0) < 30).length, color: '#f59e0b' },
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

                  {/* Link Status Overview */}
                  <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-cyan-500" />
                        Link Status Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { status: 'Active', count: backlinks.filter(link => link.status === 'active').length, color: '#10b981' },
                            { status: 'Lost', count: backlinks.filter(link => link.status === 'lost').length, color: '#ef4444' },
                            { status: 'Pending', count: backlinks.filter(link => link.status === 'pending').length, color: '#f59e0b' },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5 p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Backlinks Tracked</h3>
          <p className="text-muted-foreground">
            Backlink data will appear here once analyzed with advanced analytics and insights.
          </p>
        </Card>
      )}
    </div>
  );
};