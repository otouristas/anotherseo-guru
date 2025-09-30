import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VoiceSearchOptimizerProps {
  projectId: string;
}

export const VoiceSearchOptimizer = ({ projectId }: VoiceSearchOptimizerProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const analyzeVoiceSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('voice-search-optimizer', {
        body: { projectId, keyword: keyword.trim() }
      });

      if (error) throw error;

      setData(result.data);
      toast({
        title: "Analysis Complete",
        description: "Voice search optimization report is ready",
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Voice & AI Search Optimization</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Optimize for ChatGPT, Gemini, and voice assistants
        </p>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter keyword to analyze..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeVoiceSearch()}
          />
          <Button onClick={analyzeVoiceSearch} disabled={loading}>
            <Mic className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </Card>

      {data && (
        <>
          <Card className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Voice Search Readiness Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(data.voice_search_score)}`}>
                {data.voice_search_score}
              </p>
              <Progress value={data.voice_search_score} className="mt-4" />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Featured Snippet</h4>
                {data.has_featured_snippet ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              {data.snippet_content && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {data.snippet_content}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">People Also Ask</h4>
                <Badge variant="secondary">{data.people_also_ask?.length || 0}</Badge>
              </div>
              <div className="space-y-2">
                {data.people_also_ask?.slice(0, 3).map((q: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <HelpCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="line-clamp-2">{q}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Answer Box</h4>
                {data.answer_box_present ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.answer_box_present 
                  ? 'Answer box captured for this keyword'
                  : 'No answer box present'}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="font-bold mb-4">Optimization Recommendations</h4>
            <div className="space-y-3">
              {data.optimization_tips?.map((tip: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge variant={tip.startsWith('✓') ? 'default' : 'secondary'} className="mt-0.5">
                    {i + 1}
                  </Badge>
                  <p className="text-sm flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
