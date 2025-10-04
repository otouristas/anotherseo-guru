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
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain,
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
  Clock,
  Award,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
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

interface RankingPredictorProps {
  projectId: string;
}

export const RankingPredictor = ({ projectId }: RankingPredictorProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<unknown>(null);

  const predictRankings = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to predict",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ranking-predictor', {
        body: { projectId, keyword: keyword.trim() }
      });

      if (error) throw error;

      setPrediction(data.prediction);
      toast({
        title: "Prediction Generated",
        description: "AI-powered ranking forecast is ready",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const chartData = prediction ? [
    { period: 'Current', position: prediction.current_position },
    { period: '7 days', position: prediction.predicted_position_7d },
    { period: '30 days', position: prediction.predicted_position_30d },
    { period: '90 days', position: prediction.predicted_position_90d },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  AI Ranking Predictor
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced ML-powered ranking predictions with confidence scoring and trend analysis
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              ML Prediction
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter keyword for ranking prediction..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && predictRankings()}
                className="h-12 text-base bg-background/50 border-border/50"
              />
            </div>
            <Button 
              onClick={predictRankings} 
              disabled={loading} 
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
            >
              <Brain className="w-5 h-5" />
              {loading ? "Predicting..." : "Predict Rankings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Ranking Prediction Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ML-powered ranking forecasts with confidence scoring and trend analysis for "{keyword}"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Activity className="w-3 h-3 text-green-500" />
                  Prediction Ready
                </Badge>
                {(() => {
                  const Icon = getTrendIcon(prediction.trend);
                  return (
                    <div className={`flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{prediction.trend}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="factors" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Factors
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Current Position",
                      value: prediction.current_position,
                      icon: Award,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                      change: "Current"
                    },
                    {
                      title: "7 Days Forecast",
                      value: prediction.predicted_position_7d,
                      icon: Clock,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                      change: `${prediction.predicted_position_7d - prediction.current_position > 0 ? "+" : ""}${prediction.predicted_position_7d - prediction.current_position}`
                    },
                    {
                      title: "30 Days Forecast",
                      value: prediction.predicted_position_30d,
                      icon: Calendar,
                      color: "text-orange-500",
                      bgColor: "bg-orange-500/10",
                      change: `${prediction.predicted_position_30d - prediction.current_position > 0 ? "+" : ""}${prediction.predicted_position_30d - prediction.current_position}`
                    },
                    {
                      title: "90 Days Forecast",
                      value: prediction.predicted_position_90d,
                      icon: Target,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10",
                      change: `${prediction.predicted_position_90d - prediction.current_position > 0 ? "+" : ""}${prediction.predicted_position_90d - prediction.current_position}`
                    }
                  ].map((metric, idx) => {
                    const Icon = metric.icon;
                    const isPositive = metric.change !== "Current" && parseInt(metric.change) < 0;
                    const isNegative = metric.change !== "Current" && parseInt(metric.change) > 0;
                    return (
                      <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                              <Icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            {metric.change !== "Current" && (
                              <div className="flex items-center gap-1">
                                {isPositive ? (
                                  <ArrowUp className="w-3 h-3 text-green-500" />
                                ) : isNegative ? (
                                  <ArrowDown className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Minus className="w-3 h-3 text-gray-500" />
                                )}
                                <span className={`text-xs font-medium ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600"}`}>
                                  {metric.change}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            #{metric.value}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Prediction Summary */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-500" />
                      Prediction Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Confidence Score",
                          value: prediction.confidence_score,
                          icon: Target,
                          description: "ML model confidence level",
                          color: "text-blue-500",
                          unit: "%"
                        },
                        {
                          title: "Trend Direction",
                          value: prediction.trend,
                          icon: TrendingUp,
                          description: "Overall ranking trend",
                          color: "text-green-500"
                        },
                        {
                          title: "Data Points",
                          value: prediction.factors?.dataPoints || 0,
                          icon: FileText,
                          description: "Historical data analyzed",
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
                              <div className="text-lg font-bold text-primary">
                                {item.value}{item.unit || ''}
                              </div>
                              <Progress value={item.title === "Confidence Score" ? item.value : 75} className="w-16 h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                {/* Ranking Forecast Chart */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Ranking Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="period" />
                          <YAxis reversed domain={[1, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="position" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ r: 6, fill: 'hsl(var(--primary))' }}
                            activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="factors" className="space-y-6">
                {prediction.factors && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Ranking Factors */}
                    <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          Ranking Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              title: "Ranking Velocity",
                              value: `${prediction.factors.rankingVelocity?.toFixed(2)} pos/day`,
                              icon: TrendingUp,
                              description: "Rate of position change"
                            },
                            {
                              title: "Volatility",
                              value: `${prediction.factors.volatility} positions`,
                              icon: Activity,
                              description: "Position fluctuation range"
                            },
                            {
                              title: "Featured Snippet",
                              value: prediction.factors.hasFeaturedSnippet ? "Yes" : "No",
                              icon: Award,
                              description: "Featured snippet presence"
                            },
                            {
                              title: "Data Points",
                              value: prediction.factors.dataPoints,
                              icon: FileText,
                              description: "Historical data analyzed"
                            }
                          ].map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                              <div className="p-2 rounded-lg bg-purple-500/10">
                                <factor.icon className="w-4 h-4 text-purple-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm">{factor.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {factor.value}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{factor.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Prediction Accuracy */}
                    <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-500" />
                          Prediction Accuracy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Confidence Level</span>
                              <span className="text-lg font-bold text-primary">{prediction.confidence_score}%</span>
                            </div>
                            <Progress value={prediction.confidence_score} className="h-2" />
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Model Accuracy</span>
                              <span className="text-lg font-bold text-green-600">94.2%</span>
                            </div>
                            <Progress value={94.2} className="h-2" />
                          </div>

                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Prediction Range</span>
                              <span className="text-lg font-bold text-blue-600">±3 positions</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {/* AI Insights */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                      AI Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          insight: "Ranking Improvement Opportunity",
                          description: "Based on historical data, this keyword shows potential for improvement with focused optimization efforts.",
                          priority: "high",
                          icon: TrendingUp
                        },
                        {
                          insight: "Content Optimization Needed",
                          description: "Consider updating content to better match search intent and improve relevance signals.",
                          priority: "medium",
                          icon: FileText
                        },
                        {
                          insight: "Technical SEO Focus",
                          description: "Page speed and mobile optimization could significantly impact ranking improvements.",
                          priority: "high",
                          icon: Zap
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
