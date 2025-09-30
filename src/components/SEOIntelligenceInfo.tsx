import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Search, Target, Zap } from "lucide-react";

export const SEOIntelligenceInfo = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1">Advanced SEO Intelligence Enabled</h3>
            <p className="text-sm text-muted-foreground">
              Powered by enterprise-grade APIs and AI for data-driven content optimization
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Keyword Research</p>
                <p className="text-xs text-muted-foreground">Real-time search volume & competition data</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Trends Analysis</p>
                <p className="text-xs text-muted-foreground">Identify hot topics & seasonal opportunities</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Smart Targeting</p>
                <p className="text-xs text-muted-foreground">AI selects optimal keywords per platform</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">2025 Algorithms</p>
                <p className="text-xs text-muted-foreground">Optimized for latest platform algorithms</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              E-E-A-T Optimized
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Featured Snippets
            </Badge>
            <Badge variant="secondary" className="text-xs">
              LSI Keywords
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Schema Suggestions
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
