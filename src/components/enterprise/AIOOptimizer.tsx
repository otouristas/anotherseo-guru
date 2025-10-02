import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onSnippetGenerated?: (snippet: string) => void;
}

export function AIOOptimizer({ onSnippetGenerated }: Props) {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizedSnippet, setOptimizedSnippet] = useState("");
  const [entities, setEntities] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const optimizeForAIO = async () => {
    if (!content.trim() || !query.trim()) {
      toast({
        title: "Content and query required",
        description: "Please provide both content and target query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("seo-ai-chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Optimize this content for Google AI Overview (Gemini) for the query: "${query}"

Content:
${content}

Create an optimized snippet that:
1. Directly answers the query in the first sentence
2. Uses conversational, natural language
3. Includes key entities and facts
4. Is 2-3 sentences, 40-60 words
5. Uses structured, scannable format
6. Includes relevant context

Also extract 5-8 key entities that should be emphasized.

Respond with JSON: { snippet: "...", entities: ["entity1", "entity2", ...] }`,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data.message || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let result = {
        snippet: "",
        entities: [] as string[],
      };

      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          result.snippet = responseText;
          result.entities = [];
        }
      } else {
        result.snippet = responseText;
        result.entities = [];
      }

      setOptimizedSnippet(result.snippet);
      setEntities(result.entities);

      if (onSnippetGenerated) {
        onSnippetGenerated(result.snippet);
      }

      toast({
        title: "AI Overview Snippet Generated!",
        description: "Optimized for Google Gemini AI Overview",
      });
    } catch (error) {
      console.error("AIO optimization error:", error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize for AI Overview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Optimized snippet copied to clipboard",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Overview Optimizer
          </h2>
          <p className="text-sm text-muted-foreground">
            Optimize your content for Google AI Overview (powered by Gemini) to increase visibility in AI-generated
            search results.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Query</label>
            <Input
              placeholder="e.g., 'What are the best AI tools for SEO?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Content</label>
            <Textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <Button onClick={optimizeForAIO} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate AI Overview Snippet
        </Button>

        {optimizedSnippet && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Optimized Snippet</h3>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm leading-relaxed">{optimizedSnippet}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{optimizedSnippet.split(" ").length} words</Badge>
                <Badge variant="secondary">{optimizedSnippet.length} characters</Badge>
              </div>
            </div>

            {entities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Key Entities to Emphasize</h3>
                <div className="flex flex-wrap gap-2">
                  {entities.map((entity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Make sure these entities are prominent in your content with clear context and definitions.
                </p>
              </div>
            )}

            <div className="space-y-2 p-4 rounded-lg bg-accent/5 border">
              <h4 className="font-medium text-sm">AI Overview Best Practices</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Direct answer in first sentence</li>
                <li>• Conversational, natural language</li>
                <li>• Clear entity definitions and context</li>
                <li>• Structured with lists or steps when applicable</li>
                <li>• Scannable format with short paragraphs</li>
                <li>• E-E-A-T signals (expertise, authoritativeness, trustworthiness)</li>
              </ul>
            </div>
          </div>
        )}

        {!optimizedSnippet && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter your content and query to optimize for AI Overview</p>
          </div>
        )}
      </div>
    </Card>
  );
}
