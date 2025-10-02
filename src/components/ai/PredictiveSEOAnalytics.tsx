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
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Zap,
  Brain,
  Calendar,
  BarChart3
} from 'lucide-react';

interface PredictiveData {
  rankingPredictions: Array<{
    keyword: string;
    currentPosition: number;
    predictedPosition: number;
    confidence: number;
    timeframe: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  trafficForecast: Array<{
    month: string;
    predicted: number;
    confidence: number;
    factors: string[];
  }>;
  algorithmRisks: Array<{
    risk: string;
    probability: number;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  competitorThreats: Array<{
    competitor: string;
    threat: string;
    severity: number;
    timeline: string;
  }>;
}

export function PredictiveSEOAnalytics({ projectId }: { projectId: string }) {
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6 months');

  const { data: keywords } = useRealTimeData({
    table: 'serp_rankings',
    projectId,
    cacheKey: `predictive:${projectId}`,
  });

  const generatePredictions = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockData: PredictiveData = {
      rankingPredictions: [
        {
          keyword: 'seo tools',
          currentPosition: 8,
          predictedPosition: 5,
          confidence: 85,
          timeframe: '3 months',
          trend: 'up'
        },
        {
          keyword: 'keyword research',
          currentPosition: 12,
          predictedPosition: 15,
          confidence: 70,
          timeframe: '2 months',
          trend: 'down'
        },
        {
          keyword: 'technical seo',
          currentPosition: 6,
          predictedPosition: 4,
          confidence: 90,
          timeframe: '4 months',
          trend: 'up'
        }
      ],
      trafficForecast: [
        { month: 'Jan', predicted: 12500, confidence: 85, factors: ['Content updates', 'Link building'] },
        { month: 'Feb', predicted: 15200, confidence: 80, factors: ['New content', 'Technical fixes'] },
        { month: 'Mar', predicted: 18900, confidence: 75, factors: ['Seasonal trends', 'Competitor analysis'] },
        { month: 'Apr', predicted: 22100, confidence: 70, factors: ['Algorithm updates', 'Content strategy'] },
        { month: 'May', predicted: 25600, confidence: 65, factors: ['Market changes', 'User behavior'] },
        { month: 'Jun', predicted: 28900, confidence: 60, factors: ['Industry trends', 'Competition'] }
      ],
      algorithmRisks: [
        {
          risk: 'Core Web Vitals Update',
          probability: 75,
          impact: 'high',
          mitigation: 'Optimize page speed and user experience metrics'
        },
        {
          risk: 'Content Quality Algorithm',
          probability: 60,
          impact: 'medium',
          mitigation: 'Improve content depth and user engagement'
        },
        {
          risk: 'E-A-T Algorithm Update',
          probability: 45,
          impact: 'medium',
          mitigation: 'Strengthen expertise, authority, and trust signals'
        }
      ],
      competitorThreats: [
        {
          competitor: 'competitor1.com',
          threat: 'Launching comprehensive SEO tool',
          severity: 8,
          timeline: '2 months'
        },
        {
          competitor: 'competitor2.com',
          threat: 'Aggressive content marketing campaign',
          severity: 6,
          timeline: '1 month'
        }
      ]
    };

    setPredictiveData(mockData);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (keywords.length > 0) {
      generatePredictions();
    }
  }, [keywords]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive SEO Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              AI-powered predictions for rankings, traffic, and algorithm changes
            </p>
            <Button onClick={generatePredictions} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {predictiveData && (
        <Tabs defaultValue="rankings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rankings">Ranking Predictions</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Forecast</TabsTrigger>
            <TabsTrigger value="risks">Algorithm Risks</TabsTrigger>
            <TabsTrigger value="competitors">Competitor Threats</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.rankingPredictions.map((prediction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{prediction.keyword}</h4>
                                {getTrendIcon(prediction.trend)}
                                <Badge variant="outline">{prediction.timeframe}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Current: #{prediction.currentPosition}</span>
                                <span>→</span>
                                <span className="font-medium">#{prediction.predictedPosition}</span>
                                <span className="text-muted-foreground">
                                  ({prediction.confidence}% confidence)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {prediction.currentPosition > prediction.predictedPosition ? '+' : ''}
                                {prediction.currentPosition - prediction.predictedPosition}
                              </div>
                              <div className="text-xs text-muted-foreground">position change</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictiveData.trafficForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {predictiveData.trafficForecast.slice(0, 3).map((forecast, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {forecast.predicted.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">{forecast.month}</div>
                          <div className="text-xs text-muted-foreground">
                            {forecast.confidence}% confidence
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.algorithmRisks.map((risk, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{risk.risk}</h4>
                              <Badge className={getImpactColor(risk.impact)}>
                                {risk.impact} impact
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {risk.mitigation}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Probability:</span>
                              <Progress value={risk.probability} className="flex-1" />
                              <span className="text-sm font-medium">{risk.probability}%</span>
                            </div>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-yellow-500 ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Threat Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.competitorThreats.map((threat, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{threat.competitor}</h4>
                              <Badge variant="outline">{threat.timeline}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {threat.threat}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Severity:</span>
                              <div className="flex">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full mr-1 ${
                                      i < threat.severity ? 'bg-red-500' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{threat.severity}/10</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
