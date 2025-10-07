import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Database,
  Search,
  BarChart,
  Globe,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface APIStatusMonitorProps {
  projectId: string;
}

interface APIStatus {
  name: string;
  connected: boolean;
  lastSync?: Date;
  dataCount?: number;
  error?: string;
  icon: any;
  description: string;
  actionRequired?: boolean;
}

export const APIStatusMonitor = ({ projectId }: APIStatusMonitorProps) => {
  const [statuses, setStatuses] = useState<APIStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAPIStatus();
  }, [projectId]);

  const checkAPIStatus = async () => {
    setLoading(true);
    try {
      // Check Google Search Console
      const { data: gscSettings } = await supabase
        .from('google_api_settings')
        .select('google_search_console_site_url, last_gsc_sync')
        .eq('project_id', projectId)
        .maybeSingle();

      const { data: gscData } = await supabase
        .from('gsc_analytics')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);

      // Check Google Analytics
      const { data: gaSettings } = await supabase
        .from('google_api_settings')
        .select('google_analytics_property_id, last_ga4_sync')
        .eq('project_id', projectId)
        .maybeSingle();

      const { data: gaData } = await supabase
        .from('ga4_analytics')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);

      // Check DataForSEO
      const { data: dataforseoSettings } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('provider', 'dataforseo')
        .eq('is_active', true)
        .maybeSingle();

      // Check Firecrawl
      const { data: firecrawlSettings } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('provider', 'firecrawl')
        .eq('is_active', true)
        .maybeSingle();

      const apiStatuses: APIStatus[] = [
        {
          name: "Google Search Console",
          connected: !!gscSettings?.google_search_console_site_url,
          lastSync: gscSettings?.last_gsc_sync ? new Date(gscSettings.last_gsc_sync) : undefined,
          dataCount: gscData?.[0]?.count || 0,
          icon: Search,
          description: "SERP rankings, clicks, impressions, and CTR data",
          actionRequired: !gscSettings?.google_search_console_site_url || (gscData?.[0]?.count || 0) === 0
        },
        {
          name: "Google Analytics 4",
          connected: !!gaSettings?.google_analytics_property_id,
          lastSync: gaSettings?.last_ga4_sync ? new Date(gaSettings.last_ga4_sync) : undefined,
          dataCount: gaData?.[0]?.count || 0,
          icon: BarChart,
          description: "Traffic, user behavior, and conversion data",
          actionRequired: !gaSettings?.google_analytics_property_id || (gaData?.[0]?.count || 0) === 0
        },
        {
          name: "DataForSEO",
          connected: !!dataforseoSettings?.encrypted_key,
          icon: Database,
          description: "Keyword research, SERP analysis, and competitor data",
          actionRequired: !dataforseoSettings?.encrypted_key
        },
        {
          name: "Firecrawl",
          connected: !!firecrawlSettings?.encrypted_key,
          icon: Globe,
          description: "Website crawling and content extraction",
          actionRequired: !firecrawlSettings?.encrypted_key
        }
      ];

      setStatuses(apiStatuses);
    } catch (error: any) {
      console.error('Error checking API status:', error);
      toast({
        title: "Error checking API status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAllData = async () => {
    setSyncing(true);
    try {
      // Get Google API settings
      const { data: settings } = await supabase
        .from('google_api_settings')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!settings) {
        toast({
          title: "Setup Required",
          description: "Please connect Google APIs first in the integrations section",
          variant: "destructive"
        });
        return;
      }

      let syncResults = [];

      // Sync GSC data
      if (settings.google_search_console_site_url) {
        try {
          const { error: gscError } = await supabase.functions.invoke('fetch-gsc-data', {
            body: { 
              projectId,
              siteUrl: settings.google_search_console_site_url
            }
          });
          syncResults.push({
            name: 'Google Search Console',
            success: !gscError,
            error: gscError?.message
          });
        } catch (error: any) {
          syncResults.push({
            name: 'Google Search Console',
            success: false,
            error: error.message
          });
        }
      }

      // Sync GA4 data
      if (settings.google_analytics_property_id) {
        try {
          const { error: ga4Error } = await supabase.functions.invoke('fetch-ga4-data', {
            body: { 
              projectId,
              propertyId: settings.google_analytics_property_id
            }
          });
          syncResults.push({
            name: 'Google Analytics 4',
            success: !ga4Error,
            error: ga4Error?.message
          });
        } catch (error: any) {
          syncResults.push({
            name: 'Google Analytics 4',
            success: false,
            error: error.message
          });
        }
      }

      // Show results
      const successCount = syncResults.filter(r => r.success).length;
      const failedResults = syncResults.filter(r => !r.success);

      if (successCount > 0) {
        toast({
          title: "✅ Data Synced!",
          description: `Successfully synced ${successCount} data source${successCount > 1 ? 's' : ''}`,
        });
      }

      if (failedResults.length > 0) {
        toast({
          title: "⚠️ Some syncs failed",
          description: failedResults.map(r => `${r.name}: ${r.error}`).join(', '),
          variant: "destructive"
        });
      }

      // Refresh status
      await checkAPIStatus();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: APIStatus) => {
    if (!status.connected) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (status.actionRequired) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (status: APIStatus) => {
    if (!status.connected) {
      return <Badge variant="destructive">Not Connected</Badge>;
    }
    if (status.actionRequired) {
      return <Badge variant="secondary">Needs Data</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Status Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Checking API status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedCount = statuses.filter(s => s.connected).length;
  const readyCount = statuses.filter(s => s.connected && !s.actionRequired).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Status Monitor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {connectedCount}/{statuses.length} APIs connected • {readyCount} ready for analysis
            </p>
          </div>
          <Button 
            onClick={syncAllData} 
            disabled={syncing}
            className="gap-2"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((status) => {
          const Icon = status.icon;
          return (
            <div key={status.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{status.name}</h3>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{status.description}</p>
                  {status.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {status.lastSync.toLocaleDateString()}
                    </p>
                  )}
                  {status.dataCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {status.dataCount.toLocaleString()} records
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(status)}
                {status.actionRequired && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Setup
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {readyCount === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No APIs are ready for analysis. Please connect and sync your data sources first.
              <br />
              <strong>Required:</strong> Google Search Console for keyword opportunities analysis.
            </AlertDescription>
          </Alert>
        )}

        {readyCount > 0 && readyCount < statuses.length && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some APIs need setup. Connect additional data sources for enhanced analysis capabilities.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
