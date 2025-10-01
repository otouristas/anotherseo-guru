import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  History,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ContentHistory } from "@/components/ContentHistory";
import { NewsAndTrends } from "@/components/dashboard/NewsAndTrends";

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
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const { toast } = useToast();

  const planType = profile?.plan_type || "free";
  const isUnlimited = planType === "enterprise";
  const credits = profile?.credits || 0;

  const planLimits = {
    free: { maxCredits: 20, name: "Free", price: "€0" },
    starter: { maxCredits: 50, name: "Starter", price: "€49" },
    professional: { maxCredits: 200, name: "Professional", price: "€99" },
    agency: { maxCredits: Infinity, name: "Agency", price: "€249" }
  };

  const currentPlan = planLimits[planType as keyof typeof planLimits] || planLimits.free;

  useEffect(() => {
    async function fetchUsage() {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user?.id)
        .eq("month_year", currentMonth)
        .maybeSingle();

      setUsageData(data);
    }

    async function fetchSeoProjects() {
      const { data } = await supabase
        .from("seo_projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      setSeoProjects(data || []);
    }

    if (user) {
      fetchUsage();
      fetchSeoProjects();
    }
  }, [user]);

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

  return (
    <>
      <Helmet>
        <title>Dashboard - AnotherSEOGuru</title>
        <meta name="description" content="Manage your SEO projects, track content generation, and monitor your account performance." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 px-4 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 truncate">Welcome back, {profile?.first_name || "Creator"}! 👋</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track your performance and manage your account</p>
            </div>
            <Badge variant={planType === "free" ? "secondary" : "default"} className="text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {currentPlan.name.toUpperCase()}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="py-6 sm:py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-6 sm:space-y-8">
          {/* CRM-Style Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Credits</CardTitle>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">{isUnlimited ? "∞" : credits}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                {!isUnlimited && <Progress value={(credits/currentPlan.maxCredits)*100} className="h-1.5 sm:h-2" />}
                <p className="text-xs text-muted-foreground mt-2">of {isUnlimited ? "unlimited" : currentPlan.maxCredits} available</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Posts</CardTitle>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.content_generated_count || 0}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-blue-500/10">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <p className="text-xs text-muted-foreground">Created this month</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Platforms</CardTitle>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.platforms_used_count || 0}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-green-500/10">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <p className="text-xs text-muted-foreground">Actively used</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Used</CardTitle>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.credits_used || 0}</div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-orange-500/10">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <p className="text-xs text-muted-foreground">Credits consumed</p>
              </CardContent>
            </Card>
          </div>

          {/* CRM-Style Tabs */}
          <Card className="shadow-lg">
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b px-4 sm:px-6">
                <TabsList className="h-auto p-0 bg-transparent border-0 flex-wrap justify-start gap-0">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="seo" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trends" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger 
                    value="billing" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                  >
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>
              </div>
            <TabsContent value="overview" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <Button asChild variant="hero" className="w-full h-auto py-3 sm:py-4" size="lg">
                      <Link to="/repurpose" className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Create New Content</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-auto py-3 sm:py-4" size="lg">
                      <Link to="/seo" className="flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Open SEO Suite</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      Recent SEO Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {seoProjects.length > 0 ? (
                      <div className="space-y-2">
                        {seoProjects.map((project) => (
                          <Link
                            key={project.id}
                            to="/seo"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                          >
                            <div className="font-medium text-sm sm:text-base truncate">{project.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{project.domain}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">No SEO projects yet</p>
                        <Button asChild variant="link" size="sm" className="text-xs sm:text-sm">
                          <Link to="/seo">Create your first project</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">SEO Projects</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your SEO projects and tracking</p>
              </div>
              {seoProjects.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {seoProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                        <CardDescription className="truncate text-xs sm:text-sm">{project.domain}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
                          <Link to="/seo">Open Project</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 sm:p-12 text-center">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No SEO Projects</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Create your first SEO project to start tracking rankings</p>
                  <Button asChild size="lg">
                    <Link to="/seo">Create SEO Project</Link>
                  </Button>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Content History</h3>
                <p className="text-sm sm:text-base text-muted-foreground">View, manage, and reuse your generated content</p>
              </div>
              <ContentHistory />
            </TabsContent>
            <TabsContent value="account" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                    <p className="text-sm sm:text-base font-medium break-all">{user?.email}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                    <p className="text-sm sm:text-base font-medium">{new Date(user?.created_at || "").toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trends" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">News & Insights</h3>
                <p className="text-sm sm:text-base text-muted-foreground">SEO trends and personalized recommendations for your projects</p>
              </div>
              <NewsAndTrends projectId={seoProjects[0]?.id} />
            </TabsContent>
            <TabsContent value="billing" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Billing & Subscription</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your plan and payment details</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">{currentPlan.name}</Badge>
                      <p className="text-xl sm:text-2xl font-bold">{currentPlan.price}<span className="text-xs sm:text-sm text-muted-foreground">/mo</span></p>
                    </div>
                    
                    {subscription?.subscribed && subscription?.subscription_end && (
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-xs sm:text-sm text-success font-medium">
                          Active until {new Date(subscription.subscription_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Credits per month</span>
                        <span className="font-medium">{isUnlimited ? "Unlimited" : currentPlan.maxCredits}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">SEO Projects</span>
                        <span className="font-medium">{planType === "free" ? "1" : "Unlimited"}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Priority Support</span>
                        <span className="font-medium">{planType === "agency" || planType === "professional" ? "✓" : "—"}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {subscription?.subscribed ? (
                        <Button 
                          onClick={handleManageSubscription}
                          variant="outline"
                          className="w-full"
                          disabled={isManagingSubscription}
                        >
                          {isManagingSubscription ? "Opening..." : "Manage Subscription"}
                        </Button>
                      ) : (
                        <Button asChild className="w-full">
                          <Link to="/pricing">Upgrade Plan</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Usage This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span className="text-muted-foreground">Credits Used</span>
                          <span className="font-medium">{usageData?.credits_used || 0} / {isUnlimited ? "∞" : currentPlan.maxCredits}</span>
                        </div>
                        {!isUnlimited && (
                          <Progress value={((usageData?.credits_used || 0) / currentPlan.maxCredits) * 100} className="h-2" />
                        )}
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Content Generated</span>
                          <span className="font-medium">{usageData?.content_generated_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Platforms Used</span>
                          <span className="font-medium">{usageData?.platforms_used_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">SEO Projects</span>
                          <span className="font-medium">{seoProjects.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        </div>
      </section>
      <Footer />
    </div>
    </>
  );
}
