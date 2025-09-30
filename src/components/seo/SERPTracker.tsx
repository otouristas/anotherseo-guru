import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SERPTrackerProps {
  projectId: string;
}

export const SERPTracker = ({ projectId }: SERPTrackerProps) => {
  const [keyword, setKeyword] = useState("");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
    loadRankings();
  }, [projectId]);

  const loadProject = async () => {
    const { data } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    setProject(data);
  };

  const loadRankings = async () => {
    const { data } = await supabase
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId)
      .order('checked_at', { ascending: false })
      .limit(50);
    setRankings(data || []);
  };

  const trackKeyword = async () => {
    if (!keyword.trim() || !project) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('serp-tracker', {
        body: {
          keyword,
          domain: project.domain,
          location: project.target_location || 'United States'
        }
      });

      if (error) throw error;

      // Save ranking
      await supabase.from('serp_rankings').insert({
        project_id: projectId,
        keyword,
        position: data.position,
        url: data.url,
        featured_snippet: data.featuredSnippet,
        local_pack: data.localPack
      });

      toast({
        title: "Ranking tracked",
        description: data.position 
          ? `You rank #${data.position} for "${keyword}"`
          : `Not ranking in top 100 for "${keyword}"`
      });

      loadRankings();
      setKeyword("");
    } catch (error) {
      console.error('SERP tracking error:', error);
      toast({
        title: "Tracking failed",
        description: "Could not track keyword ranking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionTrend = (currentKeyword: string) => {
    const keywordRankings = rankings
      .filter(r => r.keyword === currentKeyword)
      .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime());
    
    if (keywordRankings.length < 2) return null;
    
    const latest = keywordRankings[keywordRankings.length - 1];
    const previous = keywordRankings[keywordRankings.length - 2];
    
    if (!latest.position || !previous.position) return null;
    
    const change = previous.position - latest.position; // Lower is better
    return change;
  };

  const uniqueKeywords = Array.from(new Set(rankings.map(r => r.keyword)));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex gap-4">
          <Input
            placeholder="Enter keyword to track..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && trackKeyword()}
          />
          <Button onClick={trackKeyword} disabled={loading} className="gap-2">
            <Search className="w-4 h-4" />
            Track
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {uniqueKeywords.map((kw) => {
          const latest = rankings.find(r => r.keyword === kw && r.position);
          const trend = getPositionTrend(kw);
          const keywordHistory = rankings
            .filter(r => r.keyword === kw && r.position)
            .reverse()
            .slice(0, 10)
            .map((r, i) => ({
              date: new Date(r.checked_at).toLocaleDateString(),
              position: r.position
            }));

          return (
            <Card key={kw} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{kw}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {latest?.position ? `#${latest.position}` : 'Not ranked'}
                      </span>
                    </div>
                    {trend !== null && (
                      <Badge variant={trend > 0 ? "default" : trend < 0 ? "destructive" : "secondary"} className="gap-1">
                        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(trend)} positions
                      </Badge>
                    )}
                  </div>
                  {latest?.featured_snippet && (
                    <Badge variant="default" className="mt-2">Featured Snippet</Badge>
                  )}
                  {latest?.local_pack && (
                    <Badge variant="secondary" className="mt-2 ml-2">Local Pack</Badge>
                  )}
                </div>
              </div>

              {keywordHistory.length > 1 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={keywordHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis reversed domain={[1, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="position" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {uniqueKeywords.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Keywords Tracked</h3>
          <p className="text-muted-foreground">Start tracking your keyword rankings above</p>
        </Card>
      )}
    </div>
  );
};