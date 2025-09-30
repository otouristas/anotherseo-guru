import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  FileText,
  Loader2
} from "lucide-react";

interface AuditReport {
  site: string;
  timestamp: string;
  technical: {
    broken_links: number;
    missing_meta: number;
    duplicate_titles: number;
    thin_content: number;
    issues_found: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
  };
  keywords: {
    ranking: any[];
    gaps: any[];
    opportunities: any[];
  };
  traffic: {
    gsc: any;
    ga4: any;
    core_web_vitals: any;
  };
  recommendations: string[];
  summary: string;
  priority_actions: string[];
}

interface ComprehensiveAuditProps {
  projectId: string;
  domain: string;
}

export const ComprehensiveAudit = ({ projectId, domain }: ComprehensiveAuditProps) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const { toast } = useToast();

  const startAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    setAuditReport(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('comprehensive-audit', {
        body: { projectId, domain }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data.success) {
        setAuditReport(data.audit);
        toast({
          title: "Audit Complete! ✅",
          description: "Comprehensive SEO audit finished successfully",
        });
      } else {
        throw new Error(data.error || 'Audit failed');
      }
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "Failed to complete audit",
        variant: "destructive",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive SEO Audit</h2>
          <p className="text-muted-foreground">
            Full site analysis with Firecrawl, DataForSEO, GSC, GA4, and AI insights
          </p>
        </div>
        <Button
          onClick={startAudit}
          disabled={isAuditing}
          size="lg"
          className="gap-2"
        >
          {isAuditing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Audit...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Start Audit
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {isAuditing && (
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Analyzing your website...</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress < 30 && "🔍 Crawling pages with Firecrawl..."}
              {progress >= 30 && progress < 50 && "📊 Fetching keyword data from DataForSEO..."}
              {progress >= 50 && progress < 70 && "📈 Analyzing GSC and GA4 data..."}
              {progress >= 70 && progress < 90 && "🤖 Generating AI insights..."}
              {progress >= 90 && "✅ Finalizing report..."}
            </p>
          </div>
        </Card>
      )}

      {/* Audit Report */}
      {auditReport && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <p className="text-muted-foreground">{auditReport.summary}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Audited: {new Date(auditReport.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Priority Actions */}
          {auditReport.priority_actions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Priority Actions</h3>
              </div>
              <div className="space-y-2">
                {auditReport.priority_actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                    <span className="font-bold text-primary">{index + 1}.</span>
                    <p className="flex-1 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Technical Issues */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Technical Issues</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{auditReport.technical.broken_links}</div>
                <div className="text-sm text-muted-foreground">Broken Links</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{auditReport.technical.missing_meta}</div>
                <div className="text-sm text-muted-foreground">Missing Meta</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{auditReport.technical.duplicate_titles}</div>
                <div className="text-sm text-muted-foreground">Duplicate Titles</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{auditReport.technical.thin_content}</div>
                <div className="text-sm text-muted-foreground">Thin Content</div>
              </div>
            </div>
            <div className="space-y-2">
              {auditReport.technical.issues_found.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant={getSeverityColor(issue.severity)} className="mt-0.5">
                    {issue.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.type}</p>
                    <p className="text-xs text-muted-foreground">{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Keyword Analysis</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold">{auditReport.keywords.ranking.length}</div>
                <div className="text-sm text-muted-foreground">Ranking Keywords</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold">{auditReport.keywords.gaps.length}</div>
                <div className="text-sm text-muted-foreground">Keyword Gaps</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold">{auditReport.keywords.opportunities.length}</div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
            </div>
          </Card>

          {/* Traffic & Performance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Traffic & Performance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Google Search Console</span>
                  {auditReport.traffic.gsc.available ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {auditReport.traffic.gsc.available 
                    ? 'Connected and analyzing data' 
                    : 'Not connected - connect for detailed insights'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Google Analytics 4</span>
                  {auditReport.traffic.ga4.available ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {auditReport.traffic.ga4.available 
                    ? 'Connected and analyzing data' 
                    : 'Not connected - connect for user behavior insights'}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          {auditReport.recommendations.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {auditReport.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <p className="flex-1 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
