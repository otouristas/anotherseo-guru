import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, TrendingUp, Target, Link as LinkIcon } from "lucide-react";

interface ContentScoringProps {
  projectId: string;
}

export const ContentScoring = ({ projectId }: ContentScoringProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-content-analyzer', {
        body: {
          content,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
        }
      });

      if (error) throw error;

      setScore(data);

      // Save to database
      await supabase.from('content_scores').insert({
        user_id: user?.id,
        readability_score: data.readabilityScore,
        seo_score: data.seoScore,
        engagement_score: data.engagementScore,
        keyword_density: data.keywordDensity,
        word_count: data.wordCount,
        entities: data.entities,
        topics: data.topics,
        recommendations: data.recommendations
      });

      toast({
        title: "Content analyzed",
        description: `Overall score: ${((data.seoScore + data.readabilityScore + data.engagementScore) / 3).toFixed(1)}/100`
      });
    } catch (error) {
      console.error('Content analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Content Scoring & Analysis</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Target Keywords (comma-separated)</label>
            <Input
              placeholder="e.g., SEO tools, content marketing, digital strategy"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Content to Analyze</label>
            <Textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
          </div>
          <Button onClick={analyzeContent} disabled={loading} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Analyze Content
          </Button>
        </div>
      </Card>

      {score && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">SEO Score</h4>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(score.seoScore)}`}>
                {score.seoScore}/100
              </div>
              <Progress value={score.seoScore} className="mt-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Readability</h4>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(score.readabilityScore)}`}>
                {score.readabilityScore}/100
              </div>
              <Progress value={score.readabilityScore} className="mt-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Engagement</h4>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(score.engagementScore)}`}>
                {score.engagementScore}/100
              </div>
              <Progress value={score.engagementScore} className="mt-2" />
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="font-semibold mb-4">Content Insights</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Word Count</p>
                <p className="text-2xl font-bold">{score.wordCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Keyword Density</p>
                <p className="text-2xl font-bold">{score.keywordDensity}%</p>
              </div>
            </div>

            {score.entities && score.entities.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Key Entities</p>
                <div className="flex flex-wrap gap-2">
                  {score.entities.map((entity: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{entity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {score.topics && score.topics.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Main Topics</p>
                <div className="flex flex-wrap gap-2">
                  {score.topics.map((topic: string, idx: number) => (
                    <Badge key={idx} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {score.recommendations && score.recommendations.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Recommendations</h4>
              <ul className="space-y-2">
                {score.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {score.internalLinkSuggestions && score.internalLinkSuggestions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Internal Link Suggestions</h4>
              </div>
              <ul className="space-y-2">
                {score.internalLinkSuggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {score.eeatSignals && score.eeatSignals.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">E-E-A-T Signals Detected</h4>
              <div className="flex flex-wrap gap-2">
                {score.eeatSignals.map((signal: string, idx: number) => (
                  <Badge key={idx} variant="default">{signal}</Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};