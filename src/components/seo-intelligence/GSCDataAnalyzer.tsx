import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface GSCDataAnalyzerProps {
  gscData: any;
  className?: string;
}

export function GSCDataAnalyzer({ gscData, className = "" }: GSCDataAnalyzerProps) {
  if (!gscData || !gscData.keywordStats) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No Google Search Console data available</p>
          <p className="text-xs mt-1">Connect GSC in the SEO Dashboard to see performance metrics</p>
        </div>
      </Card>
    );
  }

  const topKeywords = gscData.keywordStats
    .sort((a: any, b: any) => b.clicks - a.clicks)
    .slice(0, 10);

  const trendingUp = gscData.keywordStats.filter((k: any) => k.trend === "up").length;
  const trendingDown = gscData.keywordStats.filter((k: any) => k.trend === "down").length;
  const stable = gscData.keywordStats.filter((k: any) => k.trend === "stable").length;

  const chartData = topKeywords[0]?.data?.slice(0, 30).reverse().map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    position: d.position,
    clicks: d.clicks,
  })) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Keywords</div>
          <div className="text-2xl font-bold">{gscData.totalKeywords}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Clicks</div>
          <div className="text-2xl font-bold">{gscData.totalClicks.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Impressions</div>
          <div className="text-2xl font-bold">{gscData.totalImpressions.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Position</div>
          <div className="text-2xl font-bold">{gscData.avgPosition.toFixed(1)}</div>
        </Card>
      </div>

      {/* Trend Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Keyword Trends</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{trendingUp}</div>
              <div className="text-xs text-muted-foreground">Improving</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{trendingDown}</div>
              <div className="text-xs text-muted-foreground">Declining</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Minus className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stable}</div>
              <div className="text-xs text-muted-foreground">Stable</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Position History Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Position History: "{topKeywords[0].keyword}"
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPosition" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis reversed domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="position"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorPosition)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Lower positions are better (closer to #1)
          </p>
        </Card>
      )}

      {/* Top Keywords Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Keywords</h3>
        <div className="space-y-3">
          {topKeywords.map((keyword: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{keyword.keyword}</span>
                  {keyword.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  {keyword.trend === "down" && (
                    <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Pos: {keyword.currentPosition.toFixed(1)}</span>
                  {keyword.positionChange !== 0 && (
                    <span className={keyword.positionChange > 0 ? "text-green-600" : "text-red-600"}>
                      {keyword.positionChange > 0 ? "+" : ""}
                      {keyword.positionChange.toFixed(1)}
                    </span>
                  )}
                  <span>{keyword.clicks} clicks</span>
                  <span>{keyword.impressions.toLocaleString()} impr</span>
                  <span>CTR: {(keyword.avgCtr * 100).toFixed(2)}%</span>
                </div>
              </div>
              <Badge variant={keyword.trend === "up" ? "default" : keyword.trend === "down" ? "destructive" : "secondary"}>
                {keyword.trend}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
