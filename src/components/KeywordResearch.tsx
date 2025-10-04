import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, Target, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KeywordData {
  keyword: string;
  search_volume: number;
  competition: number;
  cpc: number;
  trend?: number[];
}

interface KeywordResearchProps {
  onKeywordSelect: (keyword: string, data: KeywordData) => void;
}

export const KeywordResearch = ({ onKeywordSelect }: KeywordResearchProps) => {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!seedKeyword.trim()) {
      toast({
        title: "Enter a keyword",
        description: "Please enter a seed keyword to start research",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Starting keyword research for:', seedKeyword);

    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: { 
          action: 'keyword_suggestions',
          keyword: seedKeyword 
        }
      });

      if (error) throw error;

      if (error) throw error;

      if (data?.error) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      }

      if (data?.tasks?.[0]?.result?.[0]?.items) {
        const items = data.tasks[0].result[0].items;
        const formattedKeywords: KeywordData[] = items.map((item: { keyword: string; keyword_info?: { search_volume?: number; competition?: number; cpc?: number } }) => ({
          keyword: item.keyword,
          search_volume: item.keyword_info?.search_volume || 0,
          competition: item.keyword_info?.competition || 0,
          cpc: item.keyword_info?.cpc || 0,
        }));

        setKeywords(formattedKeywords.slice(0, 20));
        toast({
          title: "Research complete",
          description: `Found ${formattedKeywords.length} keyword opportunities`,
        });
      } else {
        toast({
          title: "No data yet",
          description: "Connect your data sources in Settings > Integrations, then try again.",
        });
      }
    } catch (error) {
      console.error('Keyword research error:', error);
      toast({
        title: "Research failed",
        description: "Could not fetch keyword data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (competition: number) => {
    if (competition < 0.3) return "text-success";
    if (competition < 0.7) return "text-warning";
    return "text-destructive";
  };

  const getDifficultyLabel = (competition: number) => {
    if (competition < 0.3) return "Easy";
    if (competition < 0.7) return "Medium";
    return "Hard";
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Keyword Research</h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter seed keyword (e.g., 'digital marketing')"
          value={seedKeyword}
          onChange={(e) => setSeedKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
        />
        <Button onClick={handleResearch} disabled={loading}>
          {loading ? "Researching..." : "Research"}
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
            <div className="col-span-5">Keyword</div>
            <div className="col-span-2 text-right">Volume</div>
            <div className="col-span-2 text-right">CPC</div>
            <div className="col-span-2 text-right">Difficulty</div>
            <div className="col-span-1"></div>
          </div>
          {keywords.map((kw, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
            >
              <div className="col-span-5 font-medium text-sm truncate">
                {kw.keyword}
              </div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1">
                <BarChart className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">{kw.search_volume.toLocaleString()}</span>
              </div>
              <div className="col-span-2 text-right text-sm">
                ${kw.cpc.toFixed(2)}
              </div>
              <div className="col-span-2 text-right">
                <Badge variant="outline" className={getDifficultyColor(kw.competition)}>
                  {getDifficultyLabel(kw.competition)}
                </Badge>
              </div>
              <div className="col-span-1 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onKeywordSelect(kw.keyword, kw)}
                  className="h-7 px-2"
                >
                  <Target className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {keywords.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Enter a seed keyword to discover opportunities</p>
        </div>
      )}
    </Card>
  );
};
