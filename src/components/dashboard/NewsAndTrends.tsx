import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";

interface NewsAndTrendsProps {
  projectId?: string;
}

export const NewsAndTrends = ({ projectId }: NewsAndTrendsProps) => {
  // Mock data - would be fetched from backend in real app
  const trends = [
    {
      id: 1,
      title: "Google Core Update Detected",
      description: "Recent algorithm changes may affect your rankings. Monitor your positions closely.",
      type: "alert",
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Competitor Gained 5 New Backlinks",
      description: "Your competitor example.com acquired 5 high-quality backlinks this week.",
      type: "info",
      date: "3 days ago",
    },
    {
      id: 3,
      title: "Mobile Speed Score Improved",
      description: "Your mobile page speed increased by 15 points. Great progress!",
      type: "success",
      date: "5 days ago",
    },
  ];

  const recommendations = [
    {
      id: 1,
      title: "Optimize Meta Descriptions",
      description: "12 pages have missing or short meta descriptions",
      priority: "high",
      impact: "High SEO Impact",
    },
    {
      id: 2,
      title: "Build Internal Links",
      description: "5 orphan pages detected with no internal links",
      priority: "medium",
      impact: "Medium SEO Impact",
    },
    {
      id: 3,
      title: "Update Content Freshness",
      description: "8 pages haven't been updated in over 12 months",
      priority: "medium",
      impact: "Medium SEO Impact",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
      {/* News & Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            News & Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {getTypeIcon(trend.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight">{trend.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{trend.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm leading-tight">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
                {getPriorityBadge(rec.priority)}
              </div>
              <Badge variant="outline" className="text-xs">
                {rec.impact}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
