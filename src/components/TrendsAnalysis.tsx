import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrendData {
  keyword: string;
  currentInterest: number;
  change: number;
  peakDate?: string;
}

interface TrendsAnalysisProps {
  keywords: string[];
}

export const TrendsAnalysis = ({ keywords }: TrendsAnalysisProps) => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeTrends = async () => {
    if (keywords.length === 0) {
      toast({
        title: "No keywords",
        description: "Add keywords to analyze trends",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Analyzing trends for:', keywords);

    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: { 
          action: 'trends',
          keyword: keywords.slice(0, 5) // Limit to 5 keywords
        }
      });

      if (error) throw error;

      if (error) throw error;

      if (data?.error) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      }

      if (data?.tasks?.[0]?.result?.[0]?.items) {
        const items = data.tasks[0].result[0].items;
        const formattedTrends: TrendData[] = items.map((item: any) => ({
          keyword: item.keyword,
          currentInterest: item.data?.[item.data.length - 1]?.values?.[0] || 0,
          change: calculateTrendChange(item.data),
        }));

        setTrends(formattedTrends);
        toast({
          title: "Trends analyzed",
          description: `Analyzed ${formattedTrends.length} keyword trends`,
        });
      } else {
        toast({
          title: "No data yet",
          description: "Connect your data sources in Settings > Integrations, then try again.",
        });
      }
    } catch (error) {
      console.error('Trends analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not fetch trend data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendChange = (data: any[]) => {
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-4);
    const older = data.slice(-8, -4);
    const recentAvg = recent.reduce((sum, d) => sum + (d.values?.[0] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d.values?.[0] || 0), 0) / older.length;
    return olderAvg === 0 ? 0 : ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const getTrendBadge = (change: number) => {
    if (change > 20) return { variant: "default" as const, label: "🔥 Hot", color: "text-success" };
    if (change > 0) return { variant: "secondary" as const, label: "📈 Rising", color: "text-success" };
    if (change > -20) return { variant: "secondary" as const, label: "📉 Declining", color: "text-warning" };
    return { variant: "outline" as const, label: "❄️ Cold", color: "text-muted-foreground" };
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Trends Analysis</h3>
        </div>
        <Button onClick={analyzeTrends} disabled={loading || keywords.length === 0} size="sm">
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.slice(0, 5).map((kw, idx) => (
            <Badge key={idx} variant="outline">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      {trends.length > 0 && (
        <div className="space-y-2">
          {trends.map((trend, idx) => {
            const badge = getTrendBadge(trend.change);
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{trend.keyword}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    <span>Interest: {trend.currentInterest}/100</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${badge.color}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(0)}%
                  </span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trends.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Add keywords and click analyze to see trends</p>
        </div>
      )}
    </Card>
  );
};
