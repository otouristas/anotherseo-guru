import { Helmet } from "react-helmet-async";
import { memo, useMemo, useCallback, useState, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Crown, Activity, Calendar, Rocket, Settings, CircleAlert as AlertCircle, TrendingUp, Search } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { SEOProjectsGrid } from "@/components/dashboard/SEOProjectsGrid";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { DashboardFilters, FilterOptions } from "@/components/dashboard/DashboardFilters";
import { ExportData } from "@/components/dashboard/ExportData";

const DashboardCharts = lazy(() => import("@/components/dashboard/DashboardCharts").then(m => ({ default: m.DashboardCharts })));

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

const DashboardContent = memo(() => {
  const { user, profile, subscription } = useAuth();
  const { usageData, seoProjects, apiKeys, recommendations, recentActivity, isLoading } = useDashboardData(user);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    dateRange: "7days",
    projectStatus: "all",
    sortBy: "recent",
  });
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    let filtered = [...seoProjects];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.domain?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.projectStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filters.projectStatus);
    }

    if (filters.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [seoProjects, filters]);

  const planType = profile?.plan_type || "free";
  const credits = profile?.credits || 0;

  const planLimits = useMemo(() => ({
    free: { maxCredits: 20, name: "Free", price: "€0" },
    starter: { maxCredits: 50, name: "Starter", price: "€49" },
    professional: { maxCredits: 200, name: "Professional", price: "€99" },
    agency: { maxCredits: Infinity, name: "Agency", price: "€249" }
  }), []);

  const currentPlan = useMemo(() =>
    planLimits[planType as keyof typeof planLimits] || planLimits.free,
    [planType, planLimits]
  );

  const isUnlimited = useMemo(() =>
    planType === "enterprise" || planType === "agency",
    [planType]
  );

  const creditsPercentage = useMemo(() =>
    isUnlimited ? 100 : (credits / currentPlan.maxCredits) * 100,
    [isUnlimited, credits, currentPlan.maxCredits]
  );

  const healthScore = useMemo(() =>
    Math.round((creditsPercentage + (seoProjects.length * 10) + (apiKeys.length * 5)) / 3),
    [creditsPercentage, seoProjects.length, apiKeys.length]
  );

  const usageChartData = useMemo(() => [
    { day: "Mon", credits: 5 },
    { day: "Tue", credits: 8 },
    { day: "Wed", credits: 12 },
    { day: "Thu", credits: 7 },
    { day: "Fri", credits: 15 },
    { day: "Sat", credits: 10 },
    { day: "Sun", credits: 6 },
  ], []);

  const handleManageSubscription = useCallback(async () => {
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
  }, [toast]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - AnotherSEOGuru</title>
          <meta name="description" content="Your comprehensive SEO command center" />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <DashboardSkeleton />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - AnotherSEOGuru</title>
        <meta name="description" content="Your comprehensive SEO command center" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" style={{ backgroundSize: '30px 30px' }} />

          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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

              <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                <NotificationCenter />
                <ExportData
                  data={{
                    projects: seoProjects,
                    usage: usageData,
                    recommendations,
                    activity: recentActivity,
                  }}
                />
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

        <div className="flex-1">
          <section className="container mx-auto px-4 py-12 md:py-16">
          <DashboardFilters onFilterChange={setFilters} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-8 space-y-6">
              <MetricsCards
                credits={credits}
                isUnlimited={isUnlimited}
                creditsPercentage={creditsPercentage}
                seoProjectsCount={filteredProjects.length}
                contentGeneratedCount={usageData?.content_generated_count || 0}
                apiKeysCount={apiKeys.length}
              />

              <Suspense fallback={<Card className="shadow-md h-[300px] animate-pulse" />}>
                <DashboardCharts usageChartData={usageChartData} />
              </Suspense>

              <SEOProjectsGrid projects={filteredProjects} />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <AIInsights recommendations={recommendations} />
              <RecentActivity activities={recentActivity} />

              <Card className="shadow-md border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Subscription</h3>
                  </div>
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

              <Card className="shadow-md">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
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
        </div>

        <Footer />
      </div>
    </>
  );
});

DashboardContent.displayName = "DashboardContent";
