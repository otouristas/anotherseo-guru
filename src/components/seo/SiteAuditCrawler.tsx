import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, Zap, Smartphone, Shield, AlertTriangle, CheckCircle, 
  Link, Image, Code, FileText, Search, TrendingUp, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteAuditCrawlerProps {
  projectId: string;
}

interface AuditResult {
  score: number;
  issues: AuditIssue[];
  opportunities: AuditOpportunity[];
  technicalSEO: TechnicalSEOData;
  performance: PerformanceData;
  onPageSEO: OnPageSEOData;
}

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  affectedPages: number;
  recommendation: string;
}

interface AuditOpportunity {
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedGain: string;
}

interface TechnicalSEOData {
  crawlability: number;
  indexability: number;
  siteSpeed: number;
  mobileOptimization: number;
  securityScore: number;
  structuredData: number;
}

interface PerformanceData {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  speedIndex: number;
}

interface OnPageSEOData {
  titleTags: { optimized: number; total: number; };
  metaDescriptions: { optimized: number; total: number; };
  headingStructure: { correct: number; total: number; };
  imageAlt: { present: number; total: number; };
  internalLinks: { count: number; broken: number; };
  canonicals: { present: number; total: number; };
}

export const SiteAuditCrawler = ({ projectId }: SiteAuditCrawlerProps) => {
  const [url, setUrl] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const { toast } = useToast();

  const startAudit = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to audit",
        variant: "destructive",
      });
      return;
    }

    setCrawling(true);
    setProgress(0);

    // Simulate progressive crawling
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      // In a real implementation, this would call your crawling edge function
      // For now, simulating with mock data
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const mockResult: AuditResult = {
        score: 78,
        issues: [
          {
            severity: 'critical',
            category: 'Performance',
            title: 'Slow Server Response Time',
            description: 'Your server response time (TTFB) is above 600ms, which negatively impacts user experience.',
            affectedPages: 24,
            recommendation: 'Implement server-side caching, optimize database queries, and consider using a CDN.'
          },
          {
            severity: 'critical',
            category: 'SEO',
            title: 'Missing Meta Descriptions',
            description: '12 pages are missing meta descriptions, reducing click-through rates from search results.',
            affectedPages: 12,
            recommendation: 'Write unique, compelling meta descriptions for each page (150-160 characters).'
          },
          {
            severity: 'warning',
            category: 'Images',
            title: 'Images Without Alt Text',
            description: '47 images lack alt attributes, harming accessibility and image SEO.',
            affectedPages: 18,
            recommendation: 'Add descriptive alt text to all images, including keywords where relevant.'
          },
          {
            severity: 'warning',
            category: 'Links',
            title: 'Broken Internal Links',
            description: '8 broken internal links found across your site.',
            affectedPages: 6,
            recommendation: 'Fix or remove broken links to improve user experience and crawlability.'
          },
          {
            severity: 'info',
            category: 'Content',
            title: 'Thin Content Pages',
            description: '5 pages have less than 300 words, which may be considered thin content.',
            affectedPages: 5,
            recommendation: 'Expand content or consolidate pages to provide more value.'
          }
        ],
        opportunities: [
          {
            impact: 'high',
            title: 'Implement Schema Markup',
            description: 'Add structured data to help search engines understand your content better.',
            estimatedGain: '+15-20% rich snippet appearances'
          },
          {
            impact: 'high',
            title: 'Optimize Core Web Vitals',
            description: 'Improve LCP, FID, and CLS scores to benefit from Google page experience ranking factor.',
            estimatedGain: '+5-10 ranking positions'
          },
          {
            impact: 'medium',
            title: 'Create Content Hub',
            description: 'Build topical authority by creating interconnected content clusters.',
            estimatedGain: '+30% organic traffic potential'
          },
          {
            impact: 'medium',
            title: 'Optimize for Featured Snippets',
            description: 'Structure content with Q&A format and concise answers.',
            estimatedGain: '15 potential snippet opportunities identified'
          }
        ],
        technicalSEO: {
          crawlability: 85,
          indexability: 92,
          siteSpeed: 68,
          mobileOptimization: 88,
          securityScore: 95,
          structuredData: 45
        },
        performance: {
          lcp: 2.8,
          fid: 85,
          cls: 0.18,
          ttfb: 650,
          speedIndex: 3.2
        },
        onPageSEO: {
          titleTags: { optimized: 42, total: 50 },
          metaDescriptions: { optimized: 38, total: 50 },
          headingStructure: { correct: 45, total: 50 },
          imageAlt: { present: 103, total: 150 },
          internalLinks: { count: 287, broken: 8 },
          canonicals: { present: 48, total: 50 }
        }
      };

      setProgress(100);
      setAuditResult(mockResult);
      
      // Store audit in database
      const { error: insertError } = await supabase.from('technical_seo_audits').insert({
        project_id: projectId,
        page_url: url,
        page_speed_score: mockResult.technicalSEO.siteSpeed,
        mobile_friendly: mockResult.technicalSEO.mobileOptimization > 80,
        has_ssl: mockResult.technicalSEO.securityScore > 90,
        core_web_vitals: mockResult.performance as unknown,
        issues: mockResult.issues as unknown,
        recommendations: mockResult.opportunities.map(o => o.title)
      });

      if (insertError) {
        console.error('Failed to save audit:', insertError);
      }

      toast({
        title: "Audit Complete",
        description: `Found ${mockResult.issues.length} issues and ${mockResult.opportunities.length} opportunities`,
      });

    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit Failed",
        description: "Failed to complete site audit. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setCrawling(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Comprehensive Site Audit</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Crawl and analyze your website for SEO issues, performance problems, and optimization opportunities.
        </p>

        <div className="flex gap-4">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={crawling}
            className="flex-1"
          />
          <Button onClick={startAudit} disabled={crawling}>
            {crawling ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Crawling...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Audit
              </>
            )}
          </Button>
        </div>

        {crawling && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Crawling pages and analyzing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      {auditResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Overall SEO Health Score</h3>
                <p className="text-muted-foreground">Based on {auditResult.issues.length + auditResult.opportunities.length} factors analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{auditResult.score}</div>
                <Badge variant={auditResult.score >= 80 ? 'default' : auditResult.score >= 60 ? 'secondary' : 'destructive'}>
                  {auditResult.score >= 80 ? 'Good' : auditResult.score >= 60 ? 'Fair' : 'Needs Work'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.crawlability}</div>
                <div className="text-sm text-muted-foreground">Crawlability</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.siteSpeed}</div>
                <div className="text-sm text-muted-foreground">Site Speed</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.mobileOptimization}</div>
                <div className="text-sm text-muted-foreground">Mobile Score</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.indexability}</div>
                <div className="text-sm text-muted-foreground">Indexability</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.securityScore}</div>
                <div className="text-sm text-muted-foreground">Security</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">{auditResult.technicalSEO.structuredData}</div>
                <div className="text-sm text-muted-foreground">Schema Markup</div>
              </div>
            </div>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues">Issues ({auditResult.issues.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="on-page">On-Page SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              {auditResult.issues.map((issue, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-1 ${
                        issue.severity === 'critical' ? 'text-destructive' :
                        issue.severity === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge variant={getSeverityColor(issue.severity) as unknown}>
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        <p className="text-sm">
                          <span className="font-medium">Affected pages:</span> {issue.affectedPages}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold text-primary">💡 Recommendation:</span> {issue.recommendation}
                    </p>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              {auditResult.opportunities.map((opp, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold">{opp.title}</h4>
                    </div>
                    <Badge variant={getImpactColor(opp.impact) as unknown}>{opp.impact} impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{opp.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Potential gain: {opp.estimatedGain}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Largest Contentful Paint (LCP)</span>
                      <span className="text-sm font-medium">{auditResult.performance.lcp}s</span>
                    </div>
                    <Progress value={(4 - auditResult.performance.lcp) / 4 * 100} />
                    <p className="text-xs text-muted-foreground mt-1">Target: &lt; 2.5s (Good)</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">First Input Delay (FID)</span>
                      <span className="text-sm font-medium">{auditResult.performance.fid}ms</span>
                    </div>
                    <Progress value={(300 - auditResult.performance.fid) / 300 * 100} />
                    <p className="text-xs text-muted-foreground mt-1">Target: &lt; 100ms (Good)</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Cumulative Layout Shift (CLS)</span>
                      <span className="text-sm font-medium">{auditResult.performance.cls}</span>
                    </div>
                    <Progress value={(0.25 - auditResult.performance.cls) / 0.25 * 100} />
                    <p className="text-xs text-muted-foreground mt-1">Target: &lt; 0.1 (Good)</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Time to First Byte (TTFB)</span>
                      <span className="text-sm font-medium">{auditResult.performance.ttfb}ms</span>
                    </div>
                    <Progress value={(1000 - auditResult.performance.ttfb) / 1000 * 100} />
                    <p className="text-xs text-muted-foreground mt-1">Target: &lt; 600ms (Good)</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="on-page" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Title Tags</h4>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {auditResult.onPageSEO.titleTags.optimized}/{auditResult.onPageSEO.titleTags.total}
                  </div>
                  <Progress value={(auditResult.onPageSEO.titleTags.optimized / auditResult.onPageSEO.titleTags.total) * 100} />
                  <p className="text-sm text-muted-foreground mt-2">Pages with optimized title tags</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Meta Descriptions</h4>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {auditResult.onPageSEO.metaDescriptions.optimized}/{auditResult.onPageSEO.metaDescriptions.total}
                  </div>
                  <Progress value={(auditResult.onPageSEO.metaDescriptions.optimized / auditResult.onPageSEO.metaDescriptions.total) * 100} />
                  <p className="text-sm text-muted-foreground mt-2">Pages with meta descriptions</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Image className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Image Alt Text</h4>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {auditResult.onPageSEO.imageAlt.present}/{auditResult.onPageSEO.imageAlt.total}
                  </div>
                  <Progress value={(auditResult.onPageSEO.imageAlt.present / auditResult.onPageSEO.imageAlt.total) * 100} />
                  <p className="text-sm text-muted-foreground mt-2">Images with alt attributes</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Link className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Internal Links</h4>
                  </div>
                  <div className="text-2xl font-bold mb-2">{auditResult.onPageSEO.internalLinks.count}</div>
                  <p className="text-sm text-destructive mb-2">{auditResult.onPageSEO.internalLinks.broken} broken links found</p>
                  <p className="text-sm text-muted-foreground">Total internal links discovered</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
