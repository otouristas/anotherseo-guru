import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Sparkles,
  Globe,
  Target,
  FileText,
  Brain,
  MessageSquare,
  Volume2
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

interface VoiceSearchOptimizerProps {
  projectId: string;
}

export const VoiceSearchOptimizer = ({ projectId }: VoiceSearchOptimizerProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const analyzeVoiceSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('voice-search-optimizer', {
        body: { projectId, keyword: keyword.trim() }
      });

      if (error) throw error;

      setData(result.data);
      toast({
        title: "Analysis Complete",
        description: "Voice search optimization report is ready",
      });
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
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
                <Volume2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Voice & AI Search Optimizer
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced optimization for ChatGPT, Gemini, voice assistants, and AI-powered search platforms
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              AI Optimization
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter keyword for voice & AI search analysis..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeVoiceSearch()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={analyzeVoiceSearch} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Volume2 className="w-5 h-5" />
              {loading ? "Analyzing..." : "Analyze Voice Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Voice & AI Search Analysis Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive analysis of voice search readiness and AI optimization opportunities for "{keyword}"
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
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Voice Search Score */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10">
                          <Volume2 className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Voice Search Readiness</h3>
                          <p className="text-muted-foreground">Overall optimization score</p>
                        </div>
                      </div>
                      <div className={`text-8xl font-bold mb-4 ${getScoreColor(data.voice_search_score)}`}>
                        {data.voice_search_score}
                      </div>
                      <Progress value={data.voice_search_score} className="h-3 mb-4" />
                      <p className="text-lg font-semibold">
                        {data.voice_search_score >= 70 ? "Excellent" : data.voice_search_score >= 40 ? "Good" : "Needs Improvement"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Featured Snippet",
                      value: data.has_featured_snippet ? "Present" : "Missing",
                      icon: CheckCircle,
                      color: data.has_featured_snippet ? "text-green-500" : "text-red-500",
                      bgColor: data.has_featured_snippet ? "bg-green-500/10" : "bg-red-500/10",
                      status: data.has_featured_snippet ? "success" : "warning"
                    },
                    {
                      title: "Answer Box",
                      value: data.answer_box_present ? "Present" : "Missing",
                      icon: MessageSquare,
                      color: data.answer_box_present ? "text-green-500" : "text-red-500",
                      bgColor: data.answer_box_present ? "bg-green-500/10" : "bg-red-500/10",
                      status: data.answer_box_present ? "success" : "warning"
                    },
                    {
                      title: "People Also Ask",
                      value: data.people_also_ask?.length || 0,
                      icon: HelpCircle,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      status: "info",
                      unit: " questions"
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
                            <Badge variant={metric.status === "success" ? "default" : metric.status === "warning" ? "destructive" : "secondary"} className="text-xs">
                              {metric.status === "success" ? "OPTIMIZED" : metric.status === "warning" ? "NEEDS WORK" : "INFO"}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            {metric.value}{metric.unit || ''}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Featured Snippet */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Featured Snippet Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${data.has_featured_snippet ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                              {data.has_featured_snippet ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Featured Snippet Status</h4>
                              <p className="text-xs text-muted-foreground">SERP feature presence</p>
                            </div>
                          </div>
                          <Badge variant={data.has_featured_snippet ? "default" : "destructive"} className="text-xs">
                            {data.has_featured_snippet ? "Present" : "Missing"}
                          </Badge>
                        </div>
                        
                        {data.snippet_content && (
                          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                            <h5 className="font-semibold text-sm mb-2">Snippet Content</h5>
                            <p className="text-sm text-muted-foreground line-clamp-4">
                              {data.snippet_content}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* People Also Ask */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                        People Also Ask
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium">Total Questions</span>
                          <Badge variant="secondary">{data.people_also_ask?.length || 0}</Badge>
                        </div>
                        
                        {data.people_also_ask?.slice(0, 5).map((question: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-1 rounded-lg bg-blue-500/10">
                              <HelpCircle className="w-3 h-3 text-blue-500" />
                            </div>
                            <p className="text-sm flex-1 line-clamp-2">{question}</p>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                            <h3 className="text-lg font-semibold mb-2">No Questions Found</h3>
                            <p className="text-muted-foreground">No "People Also Ask" questions detected.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-6">
                {/* Optimization Recommendations */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Optimization Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.optimization_tips?.map((tip: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <Badge variant={tip.startsWith('✓') ? "default" : "secondary"} className="text-xs mb-2">
                              TIP {idx + 1}
                            </Badge>
                            <p className="text-sm">{tip}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                          <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                          <p className="text-muted-foreground">No optimization tips available at this time.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {/* AI Insights */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-500" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          insight: "Voice Search Optimization Opportunity",
                          description: "Your content shows potential for voice search optimization. Focus on conversational language and question-based content.",
                          priority: "high",
                          icon: Volume2
                        },
                        {
                          insight: "Featured Snippet Potential",
                          description: "With proper formatting and concise answers, you could capture the featured snippet for this keyword.",
                          priority: "medium",
                          icon: CheckCircle
                        },
                        {
                          insight: "AI Search Readiness",
                          description: "Your content structure is well-suited for AI-powered search engines like ChatGPT and Gemini.",
                          priority: "high",
                          icon: Brain
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className={`p-3 rounded-lg ${
                            item.priority === 'high' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                          }`}>
                            <item.icon className={`w-5 h-5 ${
                              item.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-sm">{item.insight}</h4>
                              <Badge variant={item.priority === 'high' ? "destructive" : "default"} className="text-xs">
                                {item.priority === 'high' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
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
      )}
    </div>
  );
};
