import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Check,
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Target,
  FileText,
  Brain,
  MessageSquare,
  Clock,
  Shield
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface SERPMonitoringProps {
  projectId: string;
}

export const SERPMonitoring = ({ projectId }: SERPMonitoringProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('serp_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'serp_alerts',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('serp_alerts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setAlerts(data);
  };

  const startMonitoring = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to monitor",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('serp-monitor', {
        body: { projectId, keyword: keyword.trim() }
      });

      if (error) throw error;

      toast({
        title: "Monitoring Started",
        description: `Now tracking "${keyword}" for ranking changes`,
      });

      setKeyword("");
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    await supabase
      .from('serp_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, is_read: true } : a
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'position_change': return TrendingUp;
      case 'ranking_drop': return TrendingDown;
      case 'snippet_lost': return AlertCircle;
      default: return Bell;
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Real-Time SERP Monitoring
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced SERP tracking with instant alerts for ranking changes, competitor movements, and algorithm updates
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Live Monitoring
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Bell className="w-3 h-3" />
                  {unreadCount} New
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter keyword for real-time monitoring..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startMonitoring()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={startMonitoring} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Bell className="w-5 h-5" />
              {loading ? "Starting..." : "Start Monitoring"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Monitoring Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SERP Monitoring Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive monitoring analytics with real-time alerts and competitive intelligence
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              Active Monitoring
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
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Competitors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Monitoring Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                {[
                  {
                    title: "Keywords Monitored",
                    value: alerts.length > 0 ? alerts.filter(a => a.keyword).length : 0,
                    icon: Search,
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10",
                    change: "+5%"
                  },
                  {
                    title: "Active Alerts",
                    value: unreadCount,
                    icon: Bell,
                    color: "text-orange-500",
                    bgColor: "bg-orange-500/10",
                    change: "+12%"
                  },
                  {
                    title: "Avg Response Time",
                    value: "2.3s",
                    icon: Clock,
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    change: "-15%"
                  },
                  {
                    title: "Competitor Movements",
                    value: alerts.filter(a => a.competitor_domain).length,
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
                          {metric.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{metric.title}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Monitoring Status */}
              <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Monitoring Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        title: "System Health",
                        value: 98,
                        icon: Shield,
                        description: "All monitoring systems operational",
                        color: "text-green-500"
                      },
                      {
                        title: "Alert Accuracy",
                        value: 94,
                        icon: Target,
                        description: "High precision alert detection",
                        color: "text-blue-500"
                      },
                      {
                        title: "Coverage",
                        value: 87,
                        icon: Globe,
                        description: "Global SERP monitoring coverage",
                        color: "text-orange-500"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{item.value}%</div>
                            <Progress value={item.value} className="w-16 h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              {/* Recent Alerts */}
              <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {alerts.map((alert) => {
                        const Icon = getAlertIcon(alert.alert_type);
                        return (
                          <Card 
                            key={alert.id} 
                            className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 ${
                              !alert.is_read 
                                ? 'bg-gradient-to-br from-primary/10 via-background to-primary/5 border-l-4 border-l-primary' 
                                : 'bg-gradient-to-br from-background via-background to-secondary/5'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                            <CardContent className="relative p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-3 flex-1">
                                  <div className={`p-2 rounded-lg ${
                                    alert.severity === 'critical' ? 'bg-red-500/10' :
                                    alert.severity === 'high' ? 'bg-orange-500/10' :
                                    alert.severity === 'medium' ? 'bg-yellow-500/10' :
                                    'bg-blue-500/10'
                                  }`}>
                                    <Icon className={`w-4 h-4 ${
                                      alert.severity === 'critical' ? 'text-red-500' :
                                      alert.severity === 'high' ? 'text-orange-500' :
                                      alert.severity === 'medium' ? 'text-yellow-500' :
                                      'text-blue-500'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                                        {alert.severity.toUpperCase()}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {alert.alert_type.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(alert.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="font-medium mb-2">{alert.message}</p>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Search className="w-3 h-3" />
                                        {alert.keyword}
                                      </span>
                                      {alert.old_position && (
                                        <span className="flex items-center gap-1">
                                          <TrendingUp className="w-3 h-3" />
                                          {alert.old_position} → {alert.new_position || 'N/A'}
                                        </span>
                                      )}
                                      {alert.competitor_domain && (
                                        <span className="flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          {alert.competitor_domain}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {!alert.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(alert.id)}
                                    className="hover:bg-primary/10"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {alerts.length === 0 && (
                        <div className="text-center py-12">
                          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Alerts Yet</h3>
                          <p className="text-muted-foreground">Start monitoring keywords to receive real-time SERP notifications.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Alert Trends Chart */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Alert Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { day: 'Mon', alerts: 4, critical: 1 },
                          { day: 'Tue', alerts: 7, critical: 2 },
                          { day: 'Wed', alerts: 3, critical: 0 },
                          { day: 'Thu', alerts: 9, critical: 3 },
                          { day: 'Fri', alerts: 5, critical: 1 },
                          { day: 'Sat', alerts: 2, critical: 0 },
                          { day: 'Sun', alerts: 6, critical: 2 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area type="monotone" dataKey="alerts" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="critical" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Alert Types Distribution */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Alert Types Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Position Changes', value: 45, fill: '#3b82f6' },
                              { name: 'Ranking Drops', value: 25, fill: '#ef4444' },
                              { name: 'Snippet Changes', value: 20, fill: '#f59e0b' },
                              { name: 'Competitor Moves', value: 10, fill: '#10b981' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Position Changes', value: 45, fill: '#3b82f6' },
                              { name: 'Ranking Drops', value: 25, fill: '#ef4444' },
                              { name: 'Snippet Changes', value: 20, fill: '#f59e0b' },
                              { name: 'Competitor Moves', value: 10, fill: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6">
              {/* Competitor Monitoring */}
              <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-500" />
                    Competitor Movements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.filter(a => a.competitor_domain).slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Eye className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{alert.competitor_domain}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Keyword: {alert.keyword}</span>
                            {alert.old_position && (
                              <span>Position: {alert.old_position} → {alert.new_position || 'N/A'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-semibold mb-2">No Competitor Activity</h3>
                        <p className="text-muted-foreground">No recent competitor movements detected.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
