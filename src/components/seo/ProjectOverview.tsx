import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Link2, 
  FileText, 
  Globe,
  Target,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectOverviewProps {
  projectId: string;
}

export const ProjectOverview = ({ projectId }: ProjectOverviewProps) => {
  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState({
    keywords: 0,
    rankings: 0,
    backlinks: 0,
    content: 0,
    avgPosition: 0,
    topRankings: 0,
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    // Load project
    const { data: projectData } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    setProject(projectData);

    // Load stats
    const { data: keywords } = await supabase
      .from('keyword_tracking')
      .select('*')
      .eq('project_id', projectId);

    const { data: rankings } = await supabase
      .from('serp_rankings')
      .select('*')
      .eq('project_id', projectId);

    const { data: backlinks } = await supabase
      .from('backlink_analysis')
      .select('*')
      .eq('project_id', projectId);

    const { data: content } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('project_id', projectId);

    const topRankings = rankings?.filter(r => r.position && r.position <= 10).length || 0;
    const avgPosition = rankings?.length 
      ? rankings.reduce((sum, r) => sum + (r.position || 0), 0) / rankings.length 
      : 0;

    setStats({
      keywords: keywords?.length || 0,
      rankings: rankings?.length || 0,
      backlinks: backlinks?.length || 0,
      content: content?.length || 0,
      avgPosition: Math.round(avgPosition),
      topRankings,
    });
  };

  const metricCards = [
    {
      title: "Keywords Tracked",
      value: stats.keywords,
      icon: Target,
      trend: "+12%",
      trendUp: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Top 10 Rankings",
      value: stats.topRankings,
      icon: TrendingUp,
      trend: "+8%",
      trendUp: true,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Backlinks",
      value: stats.backlinks,
      icon: Link2,
      trend: "+5%",
      trendUp: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg Position",
      value: stats.avgPosition,
      icon: BarChart3,
      trend: "-3 pos",
      trendUp: true,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{project?.name}</h2>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{project?.domain}</span>
              </div>
              <Badge variant="outline">{project?.target_location}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">SEO Health Score</div>
            <div className="text-4xl font-bold text-primary">82</div>
            <Progress value={82} className="w-32 mt-2" />
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <Badge variant={metric.trendUp ? "default" : "secondary"} className="gap-1">
                  {metric.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.trend}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{metric.value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent SERP Changes</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-sm">Keyword #{i}</div>
                  <div className="text-xs text-muted-foreground">example.com/page</div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  +{i}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Content Calendar</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <Badge>{stats.content}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Published This Month</span>
              <Badge variant="outline">0</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
