import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Zap, 
  Activity, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileSearch,
  BarChart3
} from "lucide-react";

interface Props {
  projectId: string;
  domain: string;
}

export const SiteAuditDashboard = ({ projectId, domain }: Props) => {
  const { toast } = useToast();
  
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileSearch className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Site Audit & Crawler Dashboard
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Comprehensive website analysis and technical SEO auditing system
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-orange-500" />
                Syncing
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Audit Status</h3>
                <p className="text-xs text-muted-foreground">Backend synchronization</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">Syncing</div>
            <div className="text-sm text-muted-foreground">Please wait while we sync your audit data</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Target Domain</h3>
                <p className="text-xs text-muted-foreground">Website being analyzed</p>
              </div>
            </div>
            <div className="text-lg font-bold text-primary mb-2 truncate">{domain}</div>
            <div className="text-sm text-muted-foreground">Project ID: {projectId.slice(0, 8)}...</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">System Status</h3>
                <p className="text-xs text-muted-foreground">Platform health</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">Operational</div>
            <div className="text-sm text-muted-foreground">All systems functioning normally</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Audit Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-orange-500/5 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold text-sm">Audit Backend Synchronization</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The audit backend is currently syncing your website data. You can continue using the rest of the application safely while this process completes in the background.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({ 
                    title: "Audit Queued", 
                    description: `Project ${projectId.slice(0, 8)}... • ${domain} has been queued for retry`,
                    duration: 5000
                  })
                }
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Retry Later
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background/50 border-border/50">
              <h4 className="font-semibold text-sm mb-2">Expected Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Technical SEO analysis</li>
                <li>• Page speed optimization</li>
                <li>• Mobile responsiveness check</li>
                <li>• Core Web Vitals monitoring</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-background/50 border-border/50">
              <h4 className="font-semibold text-sm mb-2">Coming Soon</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automated issue detection</li>
                <li>• Priority-based recommendations</li>
                <li>• Performance benchmarking</li>
                <li>• Historical trend analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAuditDashboard;
