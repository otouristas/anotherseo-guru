import { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Search, FileText, Sparkles, TrendingUp, ArrowUp, ArrowDown, Activity, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricsCardsProps {
  credits: number;
  isUnlimited: boolean;
  creditsPercentage: number;
  seoProjectsCount: number;
  contentGeneratedCount: number;
  apiKeysCount: number;
}

export const MetricsCards = memo(({
  credits,
  isUnlimited,
  creditsPercentage,
  seoProjectsCount,
  contentGeneratedCount,
  apiKeysCount,
}: MetricsCardsProps) => {
  const [animatedCredits, setAnimatedCredits] = useState(0);
  const [animatedProjects, setAnimatedProjects] = useState(0);
  const [animatedContent, setAnimatedContent] = useState(0);

  // Animation effect for numbers
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimatedCredits(credits), 100);
    const timer2 = setTimeout(() => setAnimatedProjects(seoProjectsCount), 200);
    const timer3 = setTimeout(() => setAnimatedContent(contentGeneratedCount), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [credits, seoProjectsCount, contentGeneratedCount]);

  // Mock data for charts
  const creditUsageData = [
    { name: 'Mon', usage: 20 },
    { name: 'Tue', usage: 35 },
    { name: 'Wed', usage: 45 },
    { name: 'Thu', usage: 60 },
    { name: 'Fri', usage: 75 },
    { name: 'Sat', usage: 85 },
    { name: 'Sun', usage: 90 },
  ];

  const projectGrowthData = [
    { name: 'Week 1', projects: 2 },
    { name: 'Week 2', projects: 3 },
    { name: 'Week 3', projects: 5 },
    { name: 'Week 4', projects: 8 },
  ];

  const contentData = [
    { name: 'Blogs', value: 45, color: '#3b82f6' },
    { name: 'Social', value: 30, color: '#10b981' },
    { name: 'SEO', value: 25, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Credits Card with Usage Chart */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Credits</h3>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isUnlimited ? "∞" : animatedCredits.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
          </div>
          {!isUnlimited && (
            <div className="space-y-2">
              <Progress value={creditsPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{creditsPercentage}% used this month</p>
            </div>
          )}
          {/* Mini Chart */}
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={creditUsageData}>
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3b82f6" 
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SEO Projects Card with Growth Chart */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/5 via-background to-blue-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Projects</h3>
                <p className="text-xs text-muted-foreground">SEO Active</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {seoProjectsCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-blue-600">
              {animatedProjects.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+25%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Growing steadily</p>
          {/* Mini Line Chart */}
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectGrowthData}>
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Content Generated Card with Pie Chart */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500/5 via-background to-green-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Content</h3>
                <p className="text-xs text-muted-foreground">Generated</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">AI</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-green-600">
              {animatedContent.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+18%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
          {/* Mini Pie Chart */}
          <div className="h-16 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={25}
                  dataKey="value"
                >
                  {contentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Card with Status */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500/5 via-background to-orange-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Sparkles className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
                <p className="text-xs text-muted-foreground">API Keys</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-600">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-orange-600">
              {apiKeysCount}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+3</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Connected services</p>
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <span className="text-xs text-muted-foreground">Status</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

MetricsCards.displayName = "MetricsCards";
