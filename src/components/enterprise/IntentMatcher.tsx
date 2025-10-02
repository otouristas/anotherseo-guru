import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, TrendingUp, ShoppingCart, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IntentMatch {
  query: string;
  score: number;
  type: "Informational" | "Navigational" | "Transactional" | "Commercial";
  confidence: number;
}

interface Props {
  onIntentsIdentified?: (intents: IntentMatch[]) => void;
}

export function IntentMatcher({ onIntentsIdentified }: Props) {
  const [content, setContent] = useState("");
  const [queries, setQueries] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<IntentMatch[]>([]);
  const { toast } = useToast();

  const analyzeIntent = async () => {
    if (!content.trim() || !queries.trim()) {
      toast({
        title: "Content and queries required",
        description: "Please provide both content and search queries to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const queryList = queries.split("\n").filter((q) => q.trim());

      const { data, error } = await supabase.functions.invoke("seo-ai-chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Analyze the search intent for these queries and match them with the provided content.

Content:
${content.substring(0, 1000)}

Queries:
${queryList.join("\n")}

For EACH query, determine:
1. Intent type (Informational, Navigational, Transactional, or Commercial)
2. Match score (0-1) indicating how well the content satisfies this query
3. Confidence level (0-1) in the intent classification

Respond with a JSON array with objects containing: query, score, type, confidence`,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data.message || "";
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      let intentMatches: IntentMatch[] = [];

      if (jsonMatch) {
        try {
          intentMatches = JSON.parse(jsonMatch[0]);
        } catch {
          intentMatches = queryList.map((query) => ({
            query,
            score: 0.5,
            type: "Informational" as const,
            confidence: 0.5,
          }));
        }
      } else {
        intentMatches = queryList.map((query) => ({
          query,
          score: 0.5,
          type: "Informational" as const,
          confidence: 0.5,
        }));
      }

      setMatches(intentMatches.sort((a, b) => b.score - a.score));

      if (onIntentsIdentified) {
        onIntentsIdentified(intentMatches);
      }

      toast({
        title: "Intent Analysis Complete",
        description: `Analyzed ${intentMatches.length} queries`,
      });
    } catch (error) {
      console.error("Intent matching error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze intent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIntentIcon = (type: string) => {
    switch (type) {
      case "Informational":
        return <Info className="w-4 h-4" />;
      case "Navigational":
        return <Target className="w-4 h-4" />;
      case "Transactional":
        return <ShoppingCart className="w-4 h-4" />;
      case "Commercial":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getIntentColor = (type: string) => {
    switch (type) {
      case "Informational":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Navigational":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Transactional":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Commercial":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Search Intent Matcher
          </h2>
          <p className="text-sm text-muted-foreground">
            Analyze how well your content matches different search queries and their intent types using
            semantic similarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Content</label>
            <Textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search Queries (one per line)</label>
            <Textarea
              placeholder="best AI tools for SEO&#10;how to use AI for content&#10;AI SEO software comparison"
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>

        <Button onClick={analyzeIntent} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
          Analyze Search Intent
        </Button>

        {matches.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Intent Analysis Results</h3>
            {matches.map((match, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium mb-2">{match.query}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={getIntentColor(match.type)} variant="outline">
                        {getIntentIcon(match.type)}
                        <span className="ml-1">{match.type}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Confidence: {(match.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{(match.score * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Content Relevance</span>
                    <span>{(match.score * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={match.score * 100} className="h-2" />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-4 gap-3 pt-4 border-t">
              {["Informational", "Navigational", "Transactional", "Commercial"].map((type) => {
                const count = matches.filter((m) => m.type === type).length;
                return (
                  <div key={type} className={`p-3 rounded-lg ${getIntentColor(type)}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs">{type}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter content and queries to analyze search intent</p>
          </div>
        )}
      </div>
    </Card>
  );
}
