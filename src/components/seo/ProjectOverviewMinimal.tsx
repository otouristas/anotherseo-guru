import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  TrendingUp, 
  Eye,
  MousePointerClick,
  Search,
  Globe,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface ProjectOverviewProps {
  projectId: string;
}

interface ProjectData {
  id: string;
  name: string;
  url: string;
  created_at: string;
  keywords_count: number;
  avg_position: number;
  total_clicks: number;
  total_impressions: number;
  ctr: number;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project info
      const { data: project, error: projectError } = await supabase
        .from('seo_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Load keywords count
      const { count: keywordsCount } = await supabase
        .from('keyword_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Load rankings data
      const { data: rankings } = await supabase
        .from('serp_rankings')
        .select('*')
        .eq('project_id', projectId);

      // Calculate metrics
      const avgPosition = rankings?.length ? 
        rankings.reduce((sum, r) => sum + (r.position || 0), 0) / rankings.length : 0;

      const totalClicks = rankings?.reduce((sum, r) => sum + (r.clicks || 0), 0) || 0;
      const totalImpressions = rankings?.reduce((sum, r) => sum + (r.impressions || 0), 0) || 0;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      setProjectData({
        id: project.id,
        name: project.name,
        url: project.url,
        created_at: project.created_at,
        keywords_count: keywordsCount || 0,
        avg_position: Math.round(avgPosition),
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        ctr: Math.round(ctr * 100) / 100
      });

      // Load recent activity
      const { data: activity } = await supabase
        .from('serp_rankings')
        .select('*')
        .eq('project_id', projectId)
        .order('checked_at', { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

    } catch (error: any) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error loading project data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionChange = (keyword: string) => {
    // This would need to be implemented with historical data
    return null;
  };

  const getChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600">The requested project could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{projectData.name}</h1>
          <p className="text-gray-600 mt-1">{projectData.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">Active</Badge>
          <span className="text-sm text-gray-600">
            Created {new Date(projectData.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Minimal Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Keywords Tracked</div>
          <div className="text-2xl font-semibold text-gray-900">{projectData.keywords_count}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Avg. Position</div>
          <div className="text-2xl font-semibold text-gray-900">{projectData.avg_position}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Clicks</div>
          <div className="text-2xl font-semibold text-gray-900">{projectData.total_clicks.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">CTR</div>
          <div className="text-2xl font-semibold text-gray-900">{projectData.ctr}%</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Search className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.keyword}</div>
                      <div className="text-sm text-gray-600">
                        Position {activity.position} • {new Date(activity.checked_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getChangeIcon(getPositionChange(activity.keyword))}
                    <span className="text-sm text-gray-600">
                      {activity.clicks || 0} clicks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No recent activity</h3>
              <p className="text-gray-600">Start tracking keywords to see activity here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Search className="w-5 h-5" />
              <span className="text-sm">Track Keywords</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Site Audit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">AI Insights</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
