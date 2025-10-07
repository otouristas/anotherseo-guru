import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Link2, 
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Target,
  Brain,
  MessageSquare,
  Clock,
  TrendingUp,
  Database,
  Layers,
  Filter,
  Download,
  ExternalLink,
  Hash,
  FileText,
  BookOpen,
  Link as LinkIcon,
  TrendingDown,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface InternalLinkingAnalyzerProps {
  projectId: string;
}

interface AnalysisData {
  id: string;
  analysis_name: string;
  total_pages_crawled: number;
  total_keywords_extracted: number;
  total_opportunities_found: number;
  analysis_date: string;
  status: string;
  results_summary: any;
}

interface PageKeyword {
  keyword: string;
  tf_idf_score: number;
  term_frequency: number;
  search_volume: number;
  keyword_difficulty: number;
}

interface LinkOpportunity {
  id: string;
  source_url: string;
  target_url: string;
  keyword: string;
  keyword_score: number;
  page_score: number;
  priority_score: number;
  suggested_anchor_text: string;
  estimated_traffic_lift: number;
  implementation_status: string;
}

export const InternalLinkingAnalyzer = ({ projectId }: InternalLinkingAnalyzerProps) => {
  const [siteUrl, setSiteUrl] = useState("");
  const [analysisName, setAnalysisName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [pageKeywords, setPageKeywords] = useState<PageKeyword[]>([]);
  const [opportunities, setOpportunities] = useState<LinkOpportunity[]>([]);
  const [crawledPages, setCrawledPages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, [projectId]);

  useEffect(() => {
    if (selectedAnalysis) {
      loadAnalysisData();
    }
  }, [selectedAnalysis, projectId]);

  useEffect(() => {
    if (selectedPage && selectedAnalysis) {
      loadPageKeywords();
    }
  }, [selectedPage, selectedAnalysis]);

  const loadAnalyses = async () => {
    const { data, error } = await supabase
      .from('internal_linking_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('analysis_date', { ascending: false });

    if (error) {
      console.error('Error loading analyses:', error);
      return;
    }

    setAnalyses(data || []);
  };

  const loadAnalysisData = async () => {
    if (!selectedAnalysis) return;

    // Load opportunities
    const { data: oppsData, error: oppsError } = await supabase
      .from('internal_linking_opportunities')
      .select(`
        *,
        source_page:internal_linking_pages!source_page_id(url),
        target_page:internal_linking_pages!target_page_id(url)
      `)
      .eq('project_id', projectId)
      .order('priority_score', { ascending: false })
      .limit(50);

    if (oppsError) {
      console.error('Error loading opportunities:', oppsError);
    } else {
      setOpportunities(oppsData || []);
    }

    // Load crawled pages
    const { data: pagesData, error: pagesError } = await supabase
      .from('internal_linking_pages')
      .select('*')
      .eq('project_id', projectId)
      .order('url');

    if (pagesError) {
      console.error('Error loading pages:', pagesError);
    } else {
      setCrawledPages(pagesData || []);
    }
  };

  const loadPageKeywords = async () => {
    if (!selectedPage) return;

    const { data, error } = await supabase
      .rpc('get_page_keywords', {
        p_project_id: projectId,
        p_page_id: selectedPage,
        p_limit: 20
      });

    if (error) {
      console.error('Error loading page keywords:', error);
      return;
    }

    setPageKeywords(data || []);
  };

  const startAnalysis = async () => {
    if (!siteUrl.trim()) {
      toast({
        title: "Site URL Required",
        description: "Please enter a website URL to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('internal-linking-analyzer', {
        body: {
          projectId,
          siteUrl: siteUrl.trim(),
          analysisName: analysisName.trim() || `Analysis - ${new Date().toLocaleDateString()}`
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Analysis Started! 🚀",
        description: `Crawling ${data.pages_crawled} pages and extracting keywords. Check back in a few minutes.`,
      });

      // Refresh analyses list
      await loadAnalyses();
      
      // Clear form
      setSiteUrl("");
      setAnalysisName("");

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start internal linking analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score > 1000000) return "bg-red-500/10 text-red-600 border-red-200";
    if (score > 100000) return "bg-orange-500/10 text-orange-600 border-orange-200";
    if (score > 10000) return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    return "bg-green-500/10 text-green-600 border-green-200";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-500/10 text-green-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SEO-Optimized Internal Linking Analyzer
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced tokenization, TF-IDF analysis, and mathematical scoring for intelligent internal linking recommendations
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Brain className="w-3 h-3 text-blue-500" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Configuration */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Start New Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                placeholder="https://example.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Name (Optional)</label>
              <Input
                placeholder="Q4 Internal Linking Analysis"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <Button 
            onClick={startAnalysis}
            disabled={isAnalyzing || !siteUrl.trim()}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Website...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start Internal Linking Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Selection */}
      {analyses.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Select Analysis to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose an analysis..." />
              </SelectTrigger>
              <SelectContent>
                {analyses.map((analysis) => (
                  <SelectItem key={analysis.id} value={analysis.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{analysis.analysis_name}</span>
                      <Badge variant="outline" className="ml-2">
                        {analysis.total_opportunities_found} opportunities
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Dashboard */}
      {selectedAnalysis && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Internal Linking Analysis Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Advanced tokenization results, keyword scoring, and link opportunity recommendations
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Target className="w-3 h-3 text-green-500" />
                {opportunities.length} Opportunities
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="tokenization" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tokenization
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Analysis Summary */}
                {analyses.find(a => a.id === selectedAnalysis) && (
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Analysis Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          {
                            title: "Pages Crawled",
                            value: analyses.find(a => a.id === selectedAnalysis)?.total_pages_crawled || 0,
                            icon: Globe,
                            color: "text-blue-500",
                            bgColor: "bg-blue-500/10"
                          },
                          {
                            title: "Keywords Extracted",
                            value: analyses.find(a => a.id === selectedAnalysis)?.total_keywords_extracted || 0,
                            icon: Hash,
                            color: "text-purple-500",
                            bgColor: "bg-purple-500/10"
                          },
                          {
                            title: "Link Opportunities",
                            value: analyses.find(a => a.id === selectedAnalysis)?.total_opportunities_found || 0,
                            icon: Link2,
                            color: "text-green-500",
                            bgColor: "bg-green-500/10"
                          },
                          {
                            title: "Analysis Date",
                            value: new Date(analyses.find(a => a.id === selectedAnalysis)?.analysis_date || '').toLocaleDateString(),
                            icon: Clock,
                            color: "text-orange-500",
                            bgColor: "bg-orange-500/10"
                          }
                        ].map((metric, idx) => {
                          const Icon = metric.icon;
                          return (
                            <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                                  <Icon className={`w-5 h-5 ${metric.color}`} />
                                </div>
                                <span className="font-semibold text-sm">{metric.title}</span>
                              </div>
                              <div className="text-2xl font-bold text-primary">{metric.value}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Opportunities Preview */}
                <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Top Link Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {opportunities.slice(0, 5).map((opp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPriorityColor(opp.priority_score)} border`}>
                                #{idx + 1}
                              </Badge>
                              <span className="font-medium">{opp.keyword}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate max-w-xs">
                              {opp.target_url}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-primary">
                                {opp.priority_score.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Priority Score</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                +{opp.estimated_traffic_lift}
                              </div>
                              <div className="text-xs text-muted-foreground">Est. Traffic</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tokenization" className="space-y-6">
                {/* Page Selection for Tokenization */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-500" />
                      Keyword Tokenization Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Page to Analyze Keywords</label>
                      <Select value={selectedPage} onValueChange={setSelectedPage}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choose a page..." />
                        </SelectTrigger>
                        <SelectContent>
                          {crawledPages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate max-w-xs">{page.url}</span>
                                <Badge variant="outline" className="ml-2">
                                  {page.word_count} words
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPage && pageKeywords.length > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-sm">Total Keywords</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">{pageKeywords.length}</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-green-500" />
                              <span className="font-semibold text-sm">Avg TF-IDF</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {(pageKeywords.reduce((sum, kw) => sum + kw.tf_idf_score, 0) / pageKeywords.length).toFixed(3)}
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                              <span className="font-semibold text-sm">High Volume</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {pageKeywords.filter(kw => kw.search_volume > 1000).length}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Tokenized Keywords (TF-IDF Analysis)</h4>
                          <div className="max-h-96 overflow-y-auto border rounded-lg bg-background/50">
                            <div className="divide-y divide-border/50">
                              {pageKeywords.map((keyword, idx) => (
                                <div key={idx} className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="gap-1">
                                        <Hash className="w-3 h-3" />
                                        #{idx + 1}
                                      </Badge>
                                      <span className="font-medium">{keyword.keyword}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <div className="text-sm font-semibold text-primary">
                                          {keyword.tf_idf_score.toFixed(4)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">TF-IDF</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-semibold text-blue-600">
                                          {keyword.search_volume.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Volume</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-semibold text-orange-600">
                                          {keyword.keyword_difficulty}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">KD</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Frequency: {keyword.term_frequency}</span>
                                    <span>•</span>
                                    <span>TF-IDF: {keyword.tf_idf_score.toFixed(4)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-6">
                {/* Link Opportunities */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-green-500" />
                      Internal Link Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {opportunities.map((opp, idx) => (
                        <div key={idx} className="p-6 border rounded-lg bg-background/50 border-border/50 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getPriorityColor(opp.priority_score)} border`}>
                                Priority #{idx + 1}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(opp.implementation_status)}>
                                {opp.implementation_status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {opp.priority_score.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Priority Score</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-primary">{opp.keyword}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Link Opportunity</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <ExternalLink className="w-3 h-3 text-blue-500" />
                                  <span className="font-medium">Source:</span>
                                  <span className="text-muted-foreground truncate">{opp.source_url}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Target className="w-3 h-3 text-green-500" />
                                  <span className="font-medium">Target:</span>
                                  <span className="text-muted-foreground truncate">{opp.target_url}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Keyword Score:</span>
                                  <Badge variant="secondary">{opp.keyword_score.toFixed(0)}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Page Score:</span>
                                  <Badge variant="secondary">{opp.page_score.toFixed(2)}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                <span className="font-medium text-sm">Suggested Anchor Text:</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{opp.suggested_anchor_text}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    +{opp.estimated_traffic_lift}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Est. Traffic Lift</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Implemented
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3 mr-1" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Priority Score Distribution */}
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Priority Score Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { range: '0-10K', count: opportunities.filter(o => o.priority_score < 10000).length },
                            { range: '10K-100K', count: opportunities.filter(o => o.priority_score >= 10000 && o.priority_score < 100000).length },
                            { range: '100K-1M', count: opportunities.filter(o => o.priority_score >= 100000 && o.priority_score < 1000000).length },
                            { range: '1M+', count: opportunities.filter(o => o.priority_score >= 1000000).length }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Status */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Implementation Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Pending', value: opportunities.filter(o => o.implementation_status === 'pending').length, fill: '#f59e0b' },
                                { name: 'Implemented', value: opportunities.filter(o => o.implementation_status === 'implemented').length, fill: '#10b981' },
                                { name: 'Rejected', value: opportunities.filter(o => o.implementation_status === 'rejected').length, fill: '#ef4444' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {[
                                { name: 'Pending', value: opportunities.filter(o => o.implementation_status === 'pending').length, fill: '#f59e0b' },
                                { name: 'Implemented', value: opportunities.filter(o => o.implementation_status === 'implemented').length, fill: '#10b981' },
                                { name: 'Rejected', value: opportunities.filter(o => o.implementation_status === 'rejected').length, fill: '#ef4444' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
