import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  CreditCard,
  TrendingUp,
  FileText,
  Zap,
  Crown,
  BarChart3,
  Target,
  Activity,
  Search,
  Globe,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Plus,
  TrendingDown,
  Clock,
  ExternalLink,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Settings,
  Download
} from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, profile, subscription } = useAuth();
  const [usageData, setUsageData] = useState<any>(null);
  const [seoProjects, setSeoProjects] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const { toast } = useToast();

  const planType = profile?.plan_type || "free";
  const isUnlimited = planType === "enterprise" || planType === "agency";
  const credits = profile?.credits || 0;

  const planLimits = {
    free: { maxCredits: 20, name: "Free", price: "€0" },
    starter: { maxCredits: 50, name: "Starter", price: "€49" },
    professional: { maxCredits: 200, name: "Professional", price: "€99" },
    agency: { maxCredits: Infinity, name: "Agency", price: "€249" }
  };

  const currentPlan = planLimits[planType as keyof typeof planLimits] || planLimits.free;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Fetch usage data
    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", user?.id)
      .eq("month_year", currentMonth)
      .maybeSingle();
    setUsageData(usage);

    // Fetch SEO projects
    const { data: projects } = await supabase
      .from("seo_projects")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    setSeoProjects(projects || []);

    // Fetch API keys
    const { data: keys } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user?.id);
    setApiKeys(keys || []);

    // Fetch AI recommendations
    const { data: recs } = await supabase
      .from("ai_recommendations")
      .select("*")
      .eq("user_id", user?.id)
      .eq("status", "pending")
      .order("priority", { ascending: true })
      .limit(5);
    setRecommendations(recs || []);

    // Mock recent activity
    setRecentActivity([
      { type: "project", action: "Created SEO project", time: "2 hours ago", icon: Search },
      { type: "content", action: "Generated blog post", time: "5 hours ago", icon: FileText },
      { type: "api", action: "Added OpenAI API key", time: "1 day ago", icon: Zap },
      { type: "recommendation", action: "Accepted AI suggestion", time: "2 days ago", icon: CheckCircle2 },
    ]);
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Billing Portal",
          description: "Manage your subscription in the new tab...",
        });
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setIsManagingSubscription(false);
    }
  };

  // Mock chart data
  const usageChartData = [
    { day: "Mon", credits: 5 },
    { day: "Tue", credits: 8 },
    { day: "Wed", credits: 12 },
    { day: "Thu", credits: 7 },
    { day: "Fri", credits: 15 },
    { day: "Sat", credits: 10 },
    { day: "Sun", credits: 6 },
  ];

  const projectDistribution = [
    { name: "Active", value: seoProjects.filter(p => p.status !== 'archived').length, color: "#8b5cf6" },
    { name: "Archived", value: seoProjects.filter(p => p.status === 'archived').length, color: "#6b7280" },
  ];

  const creditsPercentage = isUnlimited ? 100 : (credits / currentPlan.maxCredits) * 100;
  const healthScore = Math.round((creditsPercentage + (seoProjects.length * 10) + (apiKeys.length * 5)) / 3);

  return (
    <>
      <Helmet>
        <title>Dashboard - AnotherSEOGuru</title>
        <meta name="description" content="Your comprehensive SEO command center" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Stunning Hero Header */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" style={{ backgroundSize: '30px 30px' }} />

          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* User Profile Section */}
              <div className="flex items-center gap-4 md:gap-6">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-primary/20 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl md:text-3xl font-bold">
                    {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome back, {profile?.first_name || "Creator"}!
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Here's what's happening with your SEO empire today
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={planType === "free" ? "secondary" : "default"} className="gap-1">
                      <Crown className="w-3 h-3" />
                      {currentPlan.name}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      Member since {new Date(user?.created_at || "").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Button asChild variant="default" size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Link to="/repurpose">
                    <Rocket className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Content</span>
                    <span className="sm:hidden">Create</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/seo">
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">SEO Suite</span>
                    <span className="sm:hidden">SEO</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/settings">
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Health Score Banner */}
            <Card className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Account Health Score</h3>
                        <p className="text-sm text-muted-foreground">Based on your activity and resource utilization</p>
                      </div>
                    </div>
                    <Progress value={healthScore} className="h-3 mt-3" />
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {healthScore}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <section className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Stats & Charts */}
            <div className="lg:col-span-8 space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <Zap className="w-8 h-8 text-primary" />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold">{isUnlimited ? "∞" : credits}</div>
                    <p className="text-xs text-muted-foreground mt-1">Credits Available</p>
                    {!isUnlimited && (
                      <Progress value={creditsPercentage} className="h-1.5 mt-3" />
                    )}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <Search className="w-8 h-8 text-blue-500" />
                      <Badge variant="outline" className="text-xs">{seoProjects.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold">{seoProjects.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">SEO Projects</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <FileText className="w-8 h-8 text-green-500" />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold">{usageData?.content_generated_count || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Content Generated</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-8 h-8 text-orange-500" />
                      <Badge variant="outline" className="text-xs">{apiKeys.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold">{apiKeys.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">API Keys</p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Chart */}
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Weekly Credits Usage
                      </CardTitle>
                      <CardDescription className="mt-1">Your credit consumption over the last 7 days</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={usageChartData}>
                      <defs>
                        <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="credits"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCredits)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* SEO Projects Grid */}
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        SEO Projects
                      </CardTitle>
                      <CardDescription className="mt-1">Active projects and their status</CardDescription>
                    </div>
                    <Button asChild size="sm" className="gap-2">
                      <Link to="/seo">
                        <Plus className="w-4 h-4" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {seoProjects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {seoProjects.slice(0, 4).map((project) => (
                        <Card key={project.id} className="group hover:shadow-md transition-all duration-300 hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{project.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">{project.domain}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Tracking
                              </span>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                              <Link to="/seo" className="gap-2">
                                View Project
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold mb-2">No SEO Projects Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking rankings</p>
                      <Button asChild>
                        <Link to="/seo" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Project
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Insights & Activity */}
            <div className="lg:col-span-4 space-y-6">
              {/* AI Recommendations */}
              <Card className="shadow-md border-primary/20">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>Personalized recommendations</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, idx) => (
                        <div key={rec.id} className="p-3 rounded-lg border hover:border-primary/50 transition-colors group cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-md mt-0.5 ${
                              rec.priority === 'high' ? 'bg-red-500/10' :
                              rec.priority === 'medium' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                            }`}>
                              <Sparkles className={`w-3 h-3 ${
                                rec.priority === 'high' ? 'text-red-500' :
                                rec.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{rec.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {(rec.confidence_score * 100).toFixed(0)}%
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full" size="sm">
                        <Link to="/seo" className="gap-2">
                          View All Insights
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mb-3">No AI insights yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/seo">Generate Insights</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest actions</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => {
                      const Icon = activity.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Card */}
              <Card className="shadow-md border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Plan</span>
                      <Badge className="text-sm">{currentPlan.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Cost</span>
                      <span className="text-lg font-bold">{currentPlan.price}</span>
                    </div>
                    {subscription?.subscribed && subscription?.subscription_end && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Active until {new Date(subscription.subscription_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="pt-3 border-t space-y-2">
                      {subscription?.subscribed ? (
                        <Button
                          onClick={handleManageSubscription}
                          variant="outline"
                          className="w-full"
                          size="sm"
                          disabled={isManagingSubscription}
                        >
                          {isManagingSubscription ? "Opening..." : "Manage Subscription"}
                        </Button>
                      ) : (
                        <Button asChild className="w-full" size="sm">
                          <Link to="/pricing" className="gap-2">
                            <Rocket className="w-4 h-4" />
                            Upgrade Plan
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start" size="sm">
                      <Link to="/settings" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start" size="sm">
                      <Link to="/help" className="gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Help & Support
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start" size="sm">
                      <Link to="/pricing" className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        View Plans
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
