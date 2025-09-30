import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, TrendingUp, DollarSign } from "lucide-react";

interface KeywordMatrixProps {
  projectId: string;
}

export const KeywordMatrix = ({ projectId }: KeywordMatrixProps) => {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKeywords();
  }, [projectId]);

  const loadKeywords = async () => {
    const { data } = await supabase
      .from('keyword_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('search_volume', { ascending: false });
    setKeywords(data || []);
  };

  const researchKeyword = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'keyword_suggestions',
          keyword,
          location: 'United States'
        }
      });

      if (error) throw error;

      const results = data?.tasks?.[0]?.result?.[0]?.items || [];
      
      // Save top keywords
      const keywordsToSave = results.slice(0, 20).map((item: any) => ({
        project_id: projectId,
        keyword: item.keyword,
        search_volume: item.search_volume || 0,
        difficulty: item.competition_level === 'LOW' ? 30 : item.competition_level === 'MEDIUM' ? 60 : 90,
        cpc: item.cpc || 0,
        search_intent: item.keyword_info?.search_intent || 'informational'
      }));

      await supabase.from('keyword_tracking').upsert(keywordsToSave, {
        onConflict: 'project_id,keyword'
      });

      toast({
        title: "Keywords researched",
        description: `Found ${results.length} related keywords`
      });

      loadKeywords();
      setKeyword("");
    } catch (error) {
      console.error('Keyword research error:', error);
      toast({
        title: "Research failed",
        description: "Could not research keywords",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "bg-success";
    if (difficulty <= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return "Easy";
    if (difficulty <= 60) return "Medium";
    return "Hard";
  };

  const getIntentBadge = (intent: string) => {
    const colors: Record<string, string> = {
      informational: "secondary",
      commercial: "default",
      transactional: "destructive",
      navigational: "outline"
    };
    return colors[intent] || "secondary";
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Keyword Research & Difficulty Matrix</h3>
        <div className="flex gap-4">
          <Input
            placeholder="Enter seed keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && researchKeyword()}
          />
          <Button onClick={researchKeyword} disabled={loading} className="gap-2">
            <Target className="w-4 h-4" />
            Research
          </Button>
        </div>
      </Card>

      {keywords.length > 0 && (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Keyword</th>
                  <th className="text-left py-3 px-2">Volume</th>
                  <th className="text-left py-3 px-2">Difficulty</th>
                  <th className="text-left py-3 px-2">CPC</th>
                  <th className="text-left py-3 px-2">Intent</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        {kw.search_volume?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(kw.difficulty || 0)}`} />
                        {getDifficultyLabel(kw.difficulty || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        {kw.cpc?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={getIntentBadge(kw.search_intent || 'informational') as any}>
                        {kw.search_intent || 'informational'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {keywords.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Keywords Tracked</h3>
          <p className="text-muted-foreground">Research keywords to build your matrix</p>
        </Card>
      )}
    </div>
  );
};