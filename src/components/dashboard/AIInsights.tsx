import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  title: string;
  priority: string;
  confidence_score: number;
}

interface AIInsightsProps {
  recommendations: Recommendation[];
}

export const AIInsights = memo(({ recommendations }: AIInsightsProps) => {
  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>Personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 rounded-lg border hover:border-primary/50 transition-colors group cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-md mt-0.5 ${
                    rec.priority === 'high' ? 'bg-red-500/10' :
                    rec.priority === 'medium' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                  }`}>
                    <Sparkles className={`w-3 h-3 ${
                      rec.priority === 'high' ? 'text-red-500' :
                      rec.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {(rec.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/seo" className="gap-2">
                View All Insights
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">No AI insights yet</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/seo">Generate Insights</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AIInsights.displayName = "AIInsights";
