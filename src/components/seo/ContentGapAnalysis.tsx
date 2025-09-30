import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, TrendingUp, Target, Layers } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ContentGapAnalysisProps {
  projectId: string;
}

export const ContentGapAnalysis = ({ projectId }: ContentGapAnalysisProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeGaps = async () => {
    if (!keyword.trim() || !competitorUrls.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both keyword and competitor URLs",
        variant: "destructive"
      });
      return;
    }

    const urls = competitorUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length < 2) {
      toast({
        title: "Not Enough Competitors",
        description: "Please provide at least 2 competitor URLs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-gap-analyzer', {
        body: { 
          projectId, 
          keyword: keyword.trim(),
          competitorUrls: urls
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Content gap analysis generated successfully",
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">AI Content Gap Analysis</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Analyze top competitors to identify content opportunities and gaps
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Target Keyword</label>
            <Input
              placeholder="Enter target keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Competitor URLs (one per line, minimum 2)
            </label>
            <Textarea
              placeholder="https://competitor1.com/article&#10;https://competitor2.com/guide&#10;https://competitor3.com/blog"
              value={competitorUrls}
              onChange={(e) => setCompetitorUrls(e.target.value)}
              rows={5}
            />
          </div>

          <Button onClick={analyzeGaps} disabled={loading} className="w-full">
            <Target className="w-4 h-4 mr-2" />
            {loading ? "Analyzing..." : "Analyze Content Gaps"}
          </Button>
        </div>
      </Card>

      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h4 className="font-bold">Missing Topics</h4>
            </div>
            <div className="space-y-2">
              {analysis.missing_topics.map((topic: string, i: number) => (
                <Badge key={i} variant="secondary" className="mr-2">
                  {topic}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h4 className="font-bold">Keyword Gaps</h4>
            </div>
            <div className="space-y-2">
              {analysis.keyword_gaps.map((kw: string, i: number) => (
                <Badge key={i} variant="outline" className="mr-2">
                  {kw}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h4 className="font-bold">Content Suggestions</h4>
            </div>
            <ul className="space-y-2">
              {analysis.content_suggestions.map((suggestion: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </Card>

          {analysis.ai_recommendations && (
            <Card className="p-6 md:col-span-2 bg-muted/50">
              <h4 className="font-bold mb-4">AI Strategic Recommendations</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Target Word Count</p>
                  <p className="text-2xl font-bold">{analysis.ai_recommendations.wordCountTarget}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Readability Level</p>
                  <p className="text-lg font-semibold">{analysis.ai_recommendations.readabilityScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Multimedia</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.ai_recommendations.multimediaRecommended.map((type: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
