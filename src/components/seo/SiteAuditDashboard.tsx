import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  FileText,
  Link,
  Image,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
} from "lucide-react";

interface SiteAuditDashboardProps {
  projectId: string;
  domain: string;
}

interface CrawlJob {
  id: string;
  status: string;
  progress: number;
  pages_crawled: number;
  pages_discovered: number;
  max_pages: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}

interface AuditScore {
  overall_score: number;
  technical_score: number;
  onpage_score: number;
  content_score: number;
  performance_score: number;
  mobile_score: number;
  total_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  pages_analyzed: number;
}

interface PageIssue {
  id: string;
  issue_type: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  affected_element?: string;
  page: {
    url: string;
    title: string;
  };
}

interface Recommendation {
  id: string;
  priority: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  affected_pages_count: number;
  estimated_improvement: string;
  implementation_guide: string;
}

export const SiteAuditDashboard = ({ projectId, domain }: SiteAuditDashboardProps) => {
  const [crawling, setCrawling] = useState(false);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlJob | null>(null);
  const [auditScore, setAuditScore] = useState<AuditScore | null>(null);
  const [issues, setIssues] = useState<PageIssue[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [crawlHistory, setCrawlHistory] = useState<CrawlJob[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();

  const getPlanMaxPages = () => {
    const planType = profile?.plan_type || "free";
    const limits: Record<string, number> = {
      free: 10,
      starter: 100,
      professional: 500,
      agency: 2000,
    };
    return limits[planType] || 10;
  };

  useEffect(() => {
    loadCrawlHistory();
    loadLatestAudit();
  }, [projectId]);

  useEffect(() => {
    if (currentCrawl && currentCrawl.status === "crawling") {
      const interval = setInterval(() => {
        refreshCrawlStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentCrawl]);

  const loadCrawlHistory = async () => {
    const { data, error } = await supabase
      .from("crawl_jobs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setCrawlHistory(data);
      if (data.length > 0 && data[0].status !== "completed" && data[0].status !== "failed") {
        setCurrentCrawl(data[0]);
      }
    }
  };

  const loadLatestAudit = async () => {
    const { data: latestCrawl } = await supabase
      .from("crawl_jobs")
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestCrawl) {
      await loadAuditData(latestCrawl.id);
    }
  };

  const loadAuditData = async (crawlJobId: string) => {
    const { data: score } = await supabase
      .from("site_audit_scores")
      .select("*")
      .eq("crawl_job_id", crawlJobId)
      .maybeSingle();

    if (score) {
      setAuditScore(score);
    }

    const { data: issuesData } = await supabase
      .from("page_seo_issues")
      .select(`
        *,
        page:crawled_pages(url, title)
      `)
      .eq("crawl_job_id", crawlJobId)
      .order("severity", { ascending: true })
      .limit(50);

    if (issuesData) {
      setIssues(issuesData as any);
    }

    const { data: recsData } = await supabase
      .from("audit_recommendations")
      .select("*")
      .eq("crawl_job_id", crawlJobId)
      .order("priority", { ascending: true });

    if (recsData) {
      setRecommendations(recsData);
    }
  };

  const refreshCrawlStatus = async () => {
    if (!currentCrawl) return;

    const { data, error } = await supabase
      .from("crawl_jobs")
      .select("*")
      .eq("id", currentCrawl.id)
      .maybeSingle();

    if (!error && data) {
      setCurrentCrawl(data);
      if (data.status === "completed") {
        await loadAuditData(data.id);
        toast({
          title: "Audit Complete!",
          description: `Successfully analyzed ${data.pages_crawled} pages`,
        });
      } else if (data.status === "failed") {
        toast({
          title: "Audit Failed",
          description: data.error_message || "An error occurred during the crawl",
          variant: "destructive",
        });
      }
    }
  };

  const startCrawl = async () => {
    setCrawling(true);
    try {
      const maxPages = getPlanMaxPages();

      const { data, error } = await supabase.functions.invoke("website-crawler", {
        body: {
          projectId,
          domain,
          maxPages,
        },
      });

      if (error) throw error;

      if (data.success) {
        setCurrentCrawl({
          id: data.crawlJobId,
          status: "crawling",
          progress: 0,
          pages_crawled: 0,
          pages_discovered: 0,
          max_pages: maxPages,
          started_at: new Date().toISOString(),
          completed_at: "",
          created_at: new Date().toISOString(),
        });
        toast({
          title: "Crawl Started",
          description: `Analyzing up to ${maxPages} pages...`,
        });
      }
    } catch (error) {
      console.error("Crawl error:", error);
      toast({
        title: "Failed to Start Crawl",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCrawling(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Audit & Crawler</h2>
          <p className="text-muted-foreground">
            Comprehensive SEO analysis powered by Firecrawl - {getPlanMaxPages()} pages max
          </p>
        </div>
        <Button onClick={startCrawl} disabled={crawling || (currentCrawl?.status === "crawling")} size="lg" className="gap-2">
          {crawling || currentCrawl?.status === "crawling" ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Crawling...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Start New Audit
            </>
          )}
        </Button>
      </div>

      {currentCrawl && (currentCrawl.status === "crawling" || currentCrawl.status === "analyzing") && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {currentCrawl.status === "crawling" ? "Crawling Website..." : "Analyzing Results..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentCrawl.pages_crawled} of {currentCrawl.max_pages} pages crawled
                  </p>
                </div>
                <span className="text-2xl font-bold">{currentCrawl.progress}%</span>
              </div>
              <Progress value={currentCrawl.progress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Discovered {currentCrawl.pages_discovered} pages total
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {auditScore && (
        <>
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall SEO Health Score</span>
                <Badge variant={auditScore.overall_score >= 80 ? "default" : auditScore.overall_score >= 60 ? "secondary" : "destructive"} className="text-2xl px-4 py-2">
                  {auditScore.overall_score}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(auditScore.technical_score)}`}>
                    {auditScore.technical_score}
                  </div>
                  <div className="text-sm text-muted-foreground">Technical</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(auditScore.onpage_score)}`}>
                    {auditScore.onpage_score}
                  </div>
                  <div className="text-sm text-muted-foreground">On-Page</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(auditScore.content_score)}`}>
                    {auditScore.content_score}
                  </div>
                  <div className="text-sm text-muted-foreground">Content</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(auditScore.performance_score)}`}>
                    {auditScore.performance_score}
                  </div>
                  <div className="text-sm text-muted-foreground">Performance</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(auditScore.mobile_score)}`}>
                    {auditScore.mobile_score}
                  </div>
                  <div className="text-sm text-muted-foreground">Mobile</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{auditScore.critical_issues}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{auditScore.high_issues}</div>
                  <div className="text-xs text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{auditScore.medium_issues}</div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{auditScore.low_issues}</div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="issues">Issues ({auditScore.total_issues})</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              {issues.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">No Issues Found!</h3>
                  <p className="text-muted-foreground">Your website is in great shape.</p>
                </Card>
              ) : (
                issues.map((issue) => (
                  <Card key={issue.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertTriangle
                            className={`w-5 h-5 mt-1 ${
                              issue.severity === "critical"
                                ? "text-red-500"
                                : issue.severity === "high"
                                ? "text-orange-500"
                                : issue.severity === "medium"
                                ? "text-yellow-500"
                                : "text-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{issue.title}</h4>
                              <Badge variant={getSeverityColor(issue.severity) as any}>{issue.severity}</Badge>
                              <Badge variant="outline">{issue.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                            {issue.affected_element && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Affected element:</span> {issue.affected_element}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-3">
                              <span className="font-medium">Page:</span> {issue.page?.url || "N/A"}
                            </p>
                            <div className="bg-accent/10 p-3 rounded-lg">
                              <p className="text-sm">
                                <span className="font-semibold text-primary">💡 Recommendation:</span> {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{rec.title}</h4>
                          <Badge variant={rec.impact === "high" ? "default" : rec.impact === "medium" ? "secondary" : "outline"}>
                            {rec.impact} impact
                          </Badge>
                          <Badge variant="outline">{rec.effort} effort</Badge>
                          <Badge>{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="text-muted-foreground">
                            📄 Affects <span className="font-semibold">{rec.affected_pages_count}</span> pages
                          </span>
                          <span className="text-green-600 font-medium">📈 {rec.estimated_improvement}</span>
                        </div>
                        <div className="bg-accent/10 p-4 rounded-lg">
                          <p className="font-semibold text-sm mb-2">Implementation Guide:</p>
                          <pre className="text-xs whitespace-pre-wrap">{rec.implementation_guide}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {crawlHistory.map((crawl) => (
                <Card key={crawl.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={crawl.status === "completed" ? "default" : crawl.status === "failed" ? "destructive" : "secondary"}>
                            {crawl.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(crawl.created_at).toLocaleDateString()} at {new Date(crawl.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          Crawled {crawl.pages_crawled} pages of {crawl.max_pages} max
                        </p>
                      </div>
                      {crawl.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => loadAuditData(crawl.id)}>
                          View Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!auditScore && !currentCrawl && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Audits Yet</h3>
          <p className="text-muted-foreground mb-6">Run your first comprehensive site audit to discover SEO issues and opportunities.</p>
          <Button onClick={startCrawl} size="lg" className="gap-2">
            <Zap className="w-4 h-4" />
            Start First Audit
          </Button>
        </Card>
      )}
    </div>
  );
};
