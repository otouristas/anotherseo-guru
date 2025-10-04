import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, MousePointerClick, Clock, Target, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GoogleAnalyticsDashboardProps {
  projectId: string;
}

export const GoogleAnalyticsDashboard = ({ projectId }: GoogleAnalyticsDashboardProps) => {
  const [gscData, setGscData] = useState<unknown>(null);
  const [ga4Data, setGa4Data] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [projectId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch GSC data from database
      const { data: gscRecords } = await supabase
        .from('gsc_analytics')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })
        .limit(1000);

      // Fetch GA4 data from database
      const { data: ga4Records } = await supabase
        .from('ga4_analytics')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })
        .limit(1000);

      if (gscRecords && gscRecords.length > 0) {
        // Aggregate GSC data
        const totalClicks = gscRecords.reduce((sum, r) => sum + (r.clicks || 0), 0);
        const totalImpressions = gscRecords.reduce((sum, r) => sum + (r.impressions || 0), 0);
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const avgPosition = gscRecords.reduce((sum, r) => sum + (r.position || 0), 0) / gscRecords.length;

        // Get top keywords
        const keywordMap = new Map();
        gscRecords.forEach((r) => {
          if (!keywordMap.has(r.keyword)) {
            keywordMap.set(r.keyword, {
              keyword: r.keyword,
              clicks: 0,
              impressions: 0,
              position: 0
            });
          }
          const existing = keywordMap.get(r.keyword);
          existing.clicks += r.clicks || 0;
          existing.impressions += r.impressions || 0;
          existing.position = r.position;
        });

        const topKeywords = Array.from(keywordMap.values())
          .map(k => ({
            ...k,
            ctr: k.impressions > 0 ? (k.clicks / k.impressions) * 100 : 0
          }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 10);

        setGscData({
          totalClicks,
          totalImpressions,
          avgCTR,
          avgPosition,
          topKeywords,
        });
        
        setLastSync(new Date(gscRecords[0].created_at));
      }

      if (ga4Records && ga4Records.length > 0) {
        // Aggregate GA4 data
        const totalUsers = ga4Records.reduce((sum, r) => sum + (r.users || 0), 0);
        const totalSessions = ga4Records.reduce((sum, r) => sum + (r.sessions || 0), 0);
        const totalPageViews = ga4Records.reduce((sum, r) => sum + (r.page_views || 0), 0);
        const avgSessionDuration = ga4Records.reduce((sum, r) => sum + (r.avg_session_duration || 0), 0) / ga4Records.length;
        const avgBounceRate = ga4Records.reduce((sum, r) => sum + (r.bounce_rate || 0), 0) / ga4Records.length;

        // Get channel breakdown
        const channelMap = new Map();
        ga4Records.forEach((r) => {
          if (!channelMap.has(r.channel)) {
            channelMap.set(r.channel, {
              channel: r.channel,
              users: 0,
              sessions: 0
            });
          }
          const existing = channelMap.get(r.channel);
          existing.users += r.users || 0;
          existing.sessions += r.sessions || 0;
        });

        const channelBreakdown = Array.from(channelMap.values())
          .sort((a, b) => b.sessions - a.sessions);

        // Get top pages
        const pageMap = new Map();
        ga4Records.forEach((r) => {
          if (!pageMap.has(r.page_path)) {
            pageMap.set(r.page_path, {
              page: r.page_path,
              users: 0,
              pageViews: 0
            });
          }
          const existing = pageMap.get(r.page_path);
          existing.users += r.users || 0;
          existing.pageViews += r.page_views || 0;
        });

        const topPages = Array.from(pageMap.values())
          .sort((a, b) => b.pageViews - a.pageViews)
          .slice(0, 10);

        setGa4Data({
          totalUsers,
          totalSessions,
          totalPageViews,
          avgSessionDuration,
          avgBounceRate,
          channelBreakdown,
          topPages,
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
    setLoading(false);
  };

  const syncData = async () => {
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
          title: "Connection Required",
          description: "Please connect Google Search Console and Analytics first",
          variant: "destructive",
        });
        return;
      }

      // Fetch GSC data
      if (settings.google_search_console_site_url) {
        const { error: gscError } = await supabase.functions.invoke('fetch-gsc-data', {
          body: { 
            projectId,
            siteUrl: settings.google_search_console_site_url
          }
        });

        if (gscError) {
          console.error('GSC sync error:', gscError);
          toast({
            title: "GSC Sync Failed",
            description: gscError.message,
            variant: "destructive",
          });
        }
      }

      // Fetch GA4 data
      if (settings.google_analytics_property_id) {
        const { error: ga4Error } = await supabase.functions.invoke('fetch-ga4-data', {
          body: { 
            projectId,
            propertyId: settings.google_analytics_property_id
          }
        });

        if (ga4Error) {
          console.error('GA4 sync error:', ga4Error);
          toast({
            title: "GA4 Sync Failed",
            description: ga4Error.message,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "✅ Data Synced!",
        description: "Your analytics data has been updated",
      });

      // Reload data
      await loadAnalyticsData();
    } catch (error: unknown) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync analytics data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  if (!gscData && !ga4Data) {
    return (
      <Card className="p-8 text-center">
        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Google properties above and sync data to see your analytics dashboard
        </p>
        <Button onClick={syncData} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync Data Now'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          {lastSync && (
            <p className="text-sm text-muted-foreground">
              Last synced: {lastSync.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={syncData} disabled={syncing} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {/* Key Metrics */}
      {gscData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-5 h-5 text-blue-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{gscData.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Clicks (GSC)</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{gscData.totalImpressions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Impressions</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{gscData.avgCTR.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">Average CTR</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">#{gscData.avgPosition.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Average Position</div>
          </Card>
        </div>
      )}

      {ga4Data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{ga4Data.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Users (GA4)</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{ga4Data.totalSessions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{Math.floor(ga4Data.avgSessionDuration / 60)}m {Math.floor(ga4Data.avgSessionDuration % 60)}s</div>
            <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        {gscData && gscData.topKeywords && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Keywords by Clicks</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gscData.topKeywords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Channel Breakdown */}
        {ga4Data && ga4Data.channelBreakdown && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Traffic by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ga4Data.channelBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.channel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sessions"
                >
                  {ga4Data.channelBreakdown.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages (GSC) */}
        {gscData && gscData.topKeywords && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Keywords Details</h3>
            <div className="space-y-2">
              {gscData.topKeywords.map((keyword: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium truncate">{keyword.keyword}</p>
                    <p className="text-sm text-muted-foreground">
                      Position: #{keyword.position.toFixed(1)} | CTR: {keyword.ctr.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold">{keyword.clicks}</p>
                    <p className="text-sm text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Pages (GA4) */}
        {ga4Data && ga4Data.topPages && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Pages by Views</h3>
            <div className="space-y-2">
              {ga4Data.topPages.map((page: unknown, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium truncate">{page.page}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.users} users
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold">{page.pageViews.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};