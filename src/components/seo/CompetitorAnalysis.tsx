import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, Link as LinkIcon } from "lucide-react";

interface CompetitorAnalysisProps {
  projectId: string;
}

export const CompetitorAnalysis = ({ projectId }: CompetitorAnalysisProps) => {
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [project, setProject] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const { data } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    setProject(data);
  };

  const analyzeCompetitors = async () => {
    if (!project) return;

    setLoading(true);
    try {
      const competitors = competitorDomain.split(',').map(d => d.trim()).filter(Boolean);
      
      const { data, error } = await supabase.functions.invoke('competitor-analyzer', {
        body: {
          domain: project.domain,
          competitors
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis complete",
        description: `Analyzed ${data.results.length} domains`
      });
    } catch (error) {
      console.error('Competitor analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze competitors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Competitor Analysis</h3>
        <div className="flex gap-4">
          <Input
            placeholder="Enter competitor domains (comma-separated)"
            value={competitorDomain}
            onChange={(e) => setCompetitorDomain(e.target.value)}
          />
          <Button onClick={analyzeCompetitors} disabled={loading} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyze
          </Button>
        </div>
      </Card>

      {analysis && (
        <div className="grid gap-4">
          {analysis.results.map((result: any, idx: number) => {
            const isYourDomain = idx === 0;
            
            return (
              <Card key={result.domain} className={isYourDomain ? "p-6 border-2 border-primary" : "p-6"}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{result.domain}</h3>
                    {isYourDomain && <Badge variant="default" className="mt-1">Your Domain</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Organic Traffic
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(result.organicTraffic)}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Users className="w-4 h-4" />
                      Keywords
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(result.organicKeywords)}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <LinkIcon className="w-4 h-4" />
                      Backlinks
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(result.backlinks)}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <BarChart3 className="w-4 h-4" />
                      Ref. Domains
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(result.referringDomains)}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};