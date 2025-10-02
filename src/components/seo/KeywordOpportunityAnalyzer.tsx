import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, TrendingUp, Target, Globe, Sparkles, FileText, BarChart3, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KeywordOpportunityAnalyzerProps {
  projectId: string;
}

interface KeywordAnalysis {
  id: string;
  page_url: string;
  keyword: string;
  cluster_name: string;
  search_volume: number;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  difficulty_score: number;
  potential_score: number;
  opportunity_type: string;
  ai_recommendations: any;
}

export const KeywordOpportunityAnalyzer = ({ projectId }: KeywordOpportunityAnalyzerProps) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<'keyword' | 'page'>('page');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadOpportunities();
  }, [projectId]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('keyword_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('potential_score', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error('Error loading opportunities:', error);
      toast({
        title: "Error loading opportunities",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-opportunity-analyzer', {
        body: { projectId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${data.summary?.totalKeywords || 0} keywords across ${data.summary?.totalPages || 0} pages`
      });

      await loadOpportunities();
    } catch (error: any) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze keywords. Please ensure GSC data is available.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const optimizeContent = async (pageUrl: string, keywords: string[]) => {
    navigate('/repurpose', { 
      state: { 
        url: pageUrl,
        keywords: keywords,
        mode: 'seo-optimization'
      }
    });
  };

  const auditUrl = async (pageUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('seo-content-analyzer', {
        body: { 
          url: pageUrl,
          project_id: projectId 
        }
      });

      if (error) throw error;

      toast({
        title: "URL Audit Complete",
        description: "Check the recommendations below"
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Audit Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Group data by page or keyword
  const groupedData = groupBy === 'page' 
    ? opportunities.reduce((acc: any, item) => {
        const page = item.page_url;
        if (!acc[page]) {
          acc[page] = {
            page_url: page,
            keywords: [],
            total_impressions: 0,
            total_clicks: 0,
            avg_position: 0,
            avg_potential_score: 0,
            clusters: new Set()
          };
        }
        acc[page].keywords.push(item);
        acc[page].total_impressions += item.impressions || 0;
        acc[page].total_clicks += item.clicks || 0;
        acc[page].avg_position += item.position || 0;
        acc[page].avg_potential_score += item.potential_score || 0;
        if (item.cluster_name) acc[page].clusters.add(item.cluster_name);
        return acc;
      }, {})
    : opportunities.reduce((acc: any, item) => {
        const kw = item.keyword;
        if (!acc[kw]) {
          acc[kw] = {
            keyword: kw,
            pages: [],
            total_impressions: item.impressions || 0,
            total_clicks: item.clicks || 0,
            avg_position: item.position || 0,
            potential_score: item.potential_score || 0,
            cluster_name: item.cluster_name
          };
        } else {
          acc[kw].total_impressions += item.impressions || 0;
          acc[kw].total_clicks += item.clicks || 0;
        }
        acc[kw].pages.push(item);
        return acc;
      }, {});

  Object.values(groupedData).forEach((group: any) => {
    if (groupBy === 'page') {
      const count = group.keywords.length;
      group.avg_position = count > 0 ? group.avg_position / count : 0;
      group.avg_potential_score = count > 0 ? group.avg_potential_score / count : 0;
      group.clusters = Array.from(group.clusters);
    }
  });

  const groupedArray = Object.values(groupedData);

  const totalKeywords = opportunities.length;
  const totalPages = new Set(opportunities.map(o => o.page_url)).size;
  const totalClusters = new Set(opportunities.map(o => o.cluster_name).filter(Boolean)).size;
  const highOpportunities = opportunities.filter(o => o.opportunity_type === 'high_potential_low_competition').length;
  const avgPotentialScore = opportunities.length > 0 
    ? (opportunities.reduce((sum, o) => sum + (o.potential_score || 0), 0) / opportunities.length * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Keyword Opportunities</h2>
          <p className="text-muted-foreground">AI-powered keyword clustering and optimization recommendations</p>
        </div>
        <Button onClick={runAnalysis} disabled={analyzing}>
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-blue-500" />
              <div className="text-2xl font-bold">{totalKeywords}</div>
            </div>
            <div className="text-xs text-muted-foreground">Total Keywords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <div className="text-2xl font-bold">{totalPages}</div>
            </div>
            <div className="text-xs text-muted-foreground">Pages Analyzed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-500" />
              <div className="text-2xl font-bold">{totalClusters}</div>
            </div>
            <div className="text-xs text-muted-foreground">Keyword Clusters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div className="text-2xl font-bold">{highOpportunities}</div>
            </div>
            <div className="text-xs text-muted-foreground">High Opportunities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <div className="text-2xl font-bold">{avgPotentialScore}</div>
            </div>
            <div className="text-xs text-muted-foreground">Avg Potential Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Group by:</span>
        <Tabs value={groupBy} onValueChange={(v: any) => setGroupBy(v)} className="w-auto">
          <TabsList>
            <TabsTrigger value="page">Page</TabsTrigger>
            <TabsTrigger value="keyword">Keyword</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : groupedArray.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No opportunities found yet. Run an analysis to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupBy === 'page' ? (
            groupedArray.map((group: any, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-primary shrink-0" />
                        <CardTitle className="text-lg break-all">{group.page_url}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{group.keywords.length} keywords</Badge>
                        <Badge variant="outline">Score: {(group.avg_potential_score * 100).toFixed(0)}</Badge>
                        <Badge variant="outline">Pos: {group.avg_position.toFixed(1)}</Badge>
                        <Badge variant="outline">{group.total_impressions.toLocaleString()} impressions</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => optimizeContent(group.page_url, group.keywords.map((k: any) => k.keyword))}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Optimize Content
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => auditUrl(group.page_url)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Audit URL
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {group.clusters.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Clusters:</div>
                      <div className="flex flex-wrap gap-2">
                        {group.clusters.map((cluster: string, i: number) => (
                          <Badge key={i} variant="secondary">{cluster}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Keyword</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-right py-2">Score</th>
                          <th className="text-right py-2">Position</th>
                          <th className="text-right py-2">Impressions</th>
                          <th className="text-right py-2">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.keywords.map((kw: any, i: number) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 font-medium">{kw.keyword}</td>
                            <td className="py-2">
                              <Badge variant={kw.opportunity_type === 'high_potential_low_competition' ? 'default' : 'secondary'} className="text-xs">
                                {kw.opportunity_type?.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="py-2 text-right">{(kw.potential_score * 100).toFixed(0)}</td>
                            <td className="py-2 text-right">{kw.position?.toFixed(1)}</td>
                            <td className="py-2 text-right">{kw.impressions?.toLocaleString()}</td>
                            <td className="py-2 text-right">{kw.clicks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {group.keywords[0]?.ai_recommendations && (() => {
                    try {
                      const recs = typeof group.keywords[0].ai_recommendations === 'string'
                        ? JSON.parse(group.keywords[0].ai_recommendations)
                        : group.keywords[0].ai_recommendations;
                      const recommendations = recs?.recommendations || Object.values(recs || {}).filter((v): v is string => typeof v === 'string');

                      if (recommendations.length > 0) {
                        return (
                          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">AI Recommendations</div>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {recommendations.map((rec: string, i: number) => (
                                    <li key={i}>• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error('Failed to parse AI recommendations:', e);
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            ))
          ) : (
            groupedArray.map((group: any, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{group.keyword}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.cluster_name && <Badge variant="secondary">{group.cluster_name}</Badge>}
                        <Badge variant="outline">Score: {(group.potential_score * 100).toFixed(0)}</Badge>
                        <Badge variant="outline">{group.total_impressions.toLocaleString()} impressions</Badge>
                        <Badge variant="outline">{group.pages.length} pages</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.pages.map((page: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate mb-1">{page.page_url}</div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>Position: {page.position?.toFixed(1)}</span>
                            <span>Impressions: {page.impressions?.toLocaleString()}</span>
                            <span>Clicks: {page.clicks}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => optimizeContent(page.page_url, [group.keyword])}>
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};