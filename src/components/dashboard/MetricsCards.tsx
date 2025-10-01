import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Search, FileText, Sparkles, TrendingUp } from "lucide-react";

interface MetricsCardsProps {
  credits: number;
  isUnlimited: boolean;
  creditsPercentage: number;
  seoProjectsCount: number;
  contentGeneratedCount: number;
  apiKeysCount: number;
}

export const MetricsCards = memo(({
  credits,
  isUnlimited,
  creditsPercentage,
  seoProjectsCount,
  contentGeneratedCount,
  apiKeysCount,
}: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <Zap className="w-8 h-8 text-primary" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{isUnlimited ? "∞" : credits}</div>
          <p className="text-xs text-muted-foreground mt-1">Credits Available</p>
          {!isUnlimited && (
            <Progress value={creditsPercentage} className="h-1.5 mt-3" />
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <Search className="w-8 h-8 text-blue-500" />
            <Badge variant="outline" className="text-xs">{seoProjectsCount}</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{seoProjectsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">SEO Projects</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <FileText className="w-8 h-8 text-green-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{contentGeneratedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Content Generated</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <Badge variant="outline" className="text-xs">{apiKeysCount}</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{apiKeysCount}</div>
          <p className="text-xs text-muted-foreground mt-1">API Keys</p>
        </CardContent>
      </Card>
    </div>
  );
});

MetricsCards.displayName = "MetricsCards";
