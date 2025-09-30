import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RankingPredictorProps {
  projectId: string;
}

export const RankingPredictor = ({ projectId }: RankingPredictorProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

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
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Predictive Ranking Forecaster</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ML-powered predictions based on historical ranking data
        </p>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter keyword to predict..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && predictRankings()}
          />
          <Button onClick={predictRankings} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Predict
          </Button>
        </div>
      </Card>

      {prediction && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Current Position</p>
              <p className="text-3xl font-bold">{prediction.current_position}</p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">7 Days</p>
              <p className="text-3xl font-bold">{prediction.predicted_position_7d}</p>
              <Badge variant="outline" className="mt-2">
                {Math.abs(prediction.current_position - prediction.predicted_position_7d)} positions
              </Badge>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">30 Days</p>
              <p className="text-3xl font-bold">{prediction.predicted_position_30d}</p>
              <Badge variant="outline" className="mt-2">
                {Math.abs(prediction.current_position - prediction.predicted_position_30d)} positions
              </Badge>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">90 Days</p>
              <p className="text-3xl font-bold">{prediction.predicted_position_90d}</p>
              <Badge variant="outline" className="mt-2">
                {Math.abs(prediction.current_position - prediction.predicted_position_90d)} positions
              </Badge>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">Ranking Forecast</h4>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getTrendIcon(prediction.trend);
                  return (
                    <div className={`flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{prediction.trend}</span>
                    </div>
                  );
                })()}
                <Badge variant="secondary">
                  {prediction.confidence_score}% confidence
                </Badge>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis reversed domain={[1, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="position" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {prediction.factors && (
            <Card className="p-6 bg-muted/50">
              <h4 className="font-bold mb-4">AI Analysis Factors</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Ranking Velocity</p>
                  <p className="font-semibold">{prediction.factors.rankingVelocity?.toFixed(2)} pos/day</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="font-semibold">{prediction.factors.volatility} positions</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Featured Snippet</p>
                  <Badge variant={prediction.factors.hasFeaturedSnippet ? 'default' : 'outline'}>
                    {prediction.factors.hasFeaturedSnippet ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Historical Data Points</p>
                  <p className="font-semibold">{prediction.factors.dataPoints}</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
