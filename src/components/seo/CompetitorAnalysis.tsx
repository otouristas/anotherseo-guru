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
  BarChart3, 
  TrendingUp, 
  Users, 
  Link as LinkIcon, 
  Target, 
  Activity, 
  Zap, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Globe,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
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
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface CompetitorAnalysisProps {
  projectId: string;
}

export const CompetitorAnalysis = ({ projectId }: CompetitorAnalysisProps) => {
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [project, setProject] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const { data } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    setProject(data);
  };

  const analyzeCompetitors = async () => {
    if (!project) return;

    setLoading(true);
    try {
      const competitors = competitorDomain.split(',').map(d => d.trim()).filter(Boolean);
      
      const { data, error } = await supabase.functions.invoke('competitor-analyzer', {
        body: {
          domain: project.domain,
          competitors
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis complete",
        description: `Analyzed ${data.results.length} domains`
      });
    } catch (error) {
      console.error('Competitor analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze competitors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Competitor Analysis
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Analyze your competitors with advanced SEO intelligence and competitive insights
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
                placeholder="Enter competitor domains (comma-separated)"
                value={competitorDomain}
                onChange={(e) => setCompetitorDomain(e.target.value)}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={analyzeCompetitors} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Analyze Competitors
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Competitive Intelligence Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis of {analysis.results.length} domains with advanced metrics
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Competitor Cards */}
                <div className="grid gap-6">
                  {analysis.results.map((result: any, idx: number) => {
                    const isYourDomain = idx === 0;
                    
                    return (
                      <Card key={result.domain} className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 ${
                        isYourDomain 
                          ? "bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/30" 
                          : "bg-gradient-to-br from-background via-background to-secondary/5"
                      }`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="relative p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${isYourDomain ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                <Globe className={`w-6 h-6 ${isYourDomain ? 'text-primary' : 'text-secondary'}`} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{result.domain}</h3>
                                {isYourDomain && (
                                  <Badge variant="default" className="mt-2 bg-primary text-white">
                                    Your Domain
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{result.domainRating}</div>
                              <div className="text-xs text-muted-foreground">Domain Rating</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {[
                              {
                                title: "Organic Traffic",
                                value: formatNumber(result.organicTraffic),
                                icon: TrendingUp,
                                color: "text-blue-500",
                                bgColor: "bg-blue-500/10"
                              },
                              {
                                title: "Keywords",
                                value: formatNumber(result.organicKeywords),
                                icon: Search,
                                color: "text-green-500",
                                bgColor: "bg-green-500/10"
                              },
                              {
                                title: "Backlinks",
                                value: formatNumber(result.backlinks),
                                icon: LinkIcon,
                                color: "text-purple-500",
                                bgColor: "bg-purple-500/10"
                              },
                              {
                                title: "Ref. Domains",
                                value: formatNumber(result.referringDomains),
                                icon: BarChart3,
                                color: "text-orange-500",
                                bgColor: "bg-orange-500/10"
                              }
                            ].map((metric, metricIdx) => {
                              const Icon = metric.icon;
                              return (
                                <div key={metricIdx} className="text-center">
                                  <div className={`p-3 rounded-xl ${metric.bgColor} inline-flex mb-3`}>
                                    <Icon className={`w-5 h-5 ${metric.color}`} />
                                  </div>
                                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                                  <div className="text-sm text-muted-foreground">{metric.title}</div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Traffic Comparison Chart */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Organic Traffic Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analysis.results}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="domain" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="organicTraffic" fill="#3b82f6" name="Organic Traffic" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Comparison */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="w-5 h-5 text-green-500" />
                        Keywords Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analysis.results}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="domain" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="organicKeywords" fill="#10b981" name="Keywords" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Competitive Insights */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Competitive Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.results.slice(1).map((competitor: any, idx: number) => {
                          const yourDomain = analysis.results[0];
                          const trafficGap = competitor.organicTraffic - yourDomain.organicTraffic;
                          const keywordGap = competitor.organicKeywords - yourDomain.organicKeywords;
                          
                          return (
                            <div key={idx} className="p-4 rounded-lg bg-background/50 border border-border/50">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">{competitor.domain}</h4>
                                <Badge variant={trafficGap > 0 ? "destructive" : "default"}>
                                  {trafficGap > 0 ? "Stronger" : "Weaker"}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Traffic Gap</span>
                                  <span className={trafficGap > 0 ? "text-red-600" : "text-green-600"}>
                                    {trafficGap > 0 ? "+" : ""}{formatNumber(trafficGap)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Keywords Gap</span>
                                  <span className={keywordGap > 0 ? "text-red-600" : "text-green-600"}>
                                    {keywordGap > 0 ? "+" : ""}{formatNumber(keywordGap)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Items */}
                  <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            title: "Focus on High-Volume Keywords",
                            description: "Target keywords your competitors rank for but you don't",
                            icon: Target,
                            priority: "high"
                          },
                          {
                            title: "Improve Backlink Profile",
                            description: "Acquire links from similar domains to your competitors",
                            icon: LinkIcon,
                            priority: "medium"
                          },
                          {
                            title: "Content Gap Analysis",
                            description: "Create content for topics competitors cover",
                            icon: Eye,
                            priority: "high"
                          }
                        ].map((action, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className={`p-2 rounded-lg ${
                              action.priority === 'high' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                            }`}>
                              <action.icon className={`w-4 h-4 ${
                                action.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{action.title}</h4>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};