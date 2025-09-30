import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Globe, Zap, Smartphone, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface TechnicalAuditProps {
  projectId: string;
}

export const TechnicalAudit = ({ projectId }: TechnicalAuditProps) => {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Simulated audit data - in production, this would call PageSpeed Insights API
      // or similar service
      const mockAudit = {
        pageSpeed: 85,
        mobileFriendly: true,
        hasSSL: url.startsWith('https://'),
        coreWebVitals: {
          lcp: 2.1, // Largest Contentful Paint
          fid: 85, // First Input Delay
          cls: 0.08 // Cumulative Layout Shift
        },
        schemaMarkup: ['Organization', 'WebPage'],
        issues: [
          { severity: 'warning', message: 'Images not optimized for web' },
          { severity: 'info', message: 'Consider lazy loading for images' }
        ],
        recommendations: [
          'Optimize image sizes',
          'Enable browser caching',
          'Minify CSS and JavaScript',
          'Implement lazy loading'
        ]
      };

      setAudit(mockAudit);
      
      toast({
        title: "Audit complete",
        description: "Technical SEO analysis finished"
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit failed",
        description: "Could not complete technical audit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getCWVStatus = (metric: string, value: number) => {
    const thresholds: any = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    const t = thresholds[metric];
    if (value <= t.good) return { status: 'Good', color: 'text-success' };
    if (value <= t.poor) return { status: 'Needs Improvement', color: 'text-warning' };
    return { status: 'Poor', color: 'text-destructive' };
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Technical SEO Audit</h3>
        <div className="flex gap-4">
          <Input
            placeholder="Enter URL to audit..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && runAudit()}
          />
          <Button onClick={runAudit} disabled={loading} className="gap-2">
            <Globe className="w-4 h-4" />
            Audit
          </Button>
        </div>
      </Card>

      {audit && (
        <>
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Performance Scores</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium">Page Speed</span>
                </div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(audit.pageSpeed)}`}>
                  {audit.pageSpeed}/100
                </div>
                <Progress value={audit.pageSpeed} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Mobile Friendly</span>
                  </div>
                  {audit.mobileFriendly ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">SSL Certificate</span>
                  </div>
                  {audit.hasSSL ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold mb-4">Core Web Vitals</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">LCP (Largest Contentful Paint)</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{audit.coreWebVitals.lcp}s</span>
                  <Badge variant={getCWVStatus('lcp', audit.coreWebVitals.lcp).status === 'Good' ? 'default' : 'destructive'}>
                    {getCWVStatus('lcp', audit.coreWebVitals.lcp).status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">FID (First Input Delay)</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{audit.coreWebVitals.fid}ms</span>
                  <Badge variant={getCWVStatus('fid', audit.coreWebVitals.fid).status === 'Good' ? 'default' : 'destructive'}>
                    {getCWVStatus('fid', audit.coreWebVitals.fid).status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">CLS (Cumulative Layout Shift)</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{audit.coreWebVitals.cls}</span>
                  <Badge variant={getCWVStatus('cls', audit.coreWebVitals.cls).status === 'Good' ? 'default' : 'destructive'}>
                    {getCWVStatus('cls', audit.coreWebVitals.cls).status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {audit.schemaMarkup && audit.schemaMarkup.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Schema Markup Detected</h4>
              <div className="flex flex-wrap gap-2">
                {audit.schemaMarkup.map((schema: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{schema}</Badge>
                ))}
              </div>
            </Card>
          )}

          {audit.issues && audit.issues.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Issues Found</h4>
              <div className="space-y-2">
                {audit.issues.map((issue: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      issue.severity === 'error' ? 'text-destructive' : 
                      issue.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm">{issue.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {audit.recommendations && audit.recommendations.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Recommendations</h4>
              <ul className="space-y-2">
                {audit.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {!audit && (
        <Card className="p-12 text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Audit Yet</h3>
          <p className="text-muted-foreground">Enter a URL above to run technical audit</p>
        </Card>
      )}
    </div>
  );
};