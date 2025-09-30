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
  Search
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
  const { user, profile } = useAuth();
  const [usageData, setUsageData] = useState<any>(null);
  const [seoProjects, setSeoProjects] = useState<any[]>([]);

  const planType = profile?.plan_type || "free";
  const isUnlimited = planType === "enterprise";
  const credits = profile?.credits || 0;

  const planLimits = {
    free: { maxCredits: 2, name: "Free", price: "€0" },
    basic: { maxCredits: 100, name: "Basic", price: "€49" },
    pro: { maxCredits: 300, name: "Pro", price: "€79" },
    enterprise: { maxCredits: Infinity, name: "Enterprise", price: "€299" }
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

  return (
    <>
      <Helmet>
        <title>Dashboard - AnotherSEOGuru</title>
        <meta name="description" content="Manage your SEO projects, track content generation, and monitor your account performance." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="py-12 px-4 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.first_name || "Creator"}! 👋</h1>
              <p className="text-muted-foreground">Track your performance and manage your account</p>
            </div>
            <Badge variant={planType === "free" ? "secondary" : "default"} className="text-lg px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              {currentPlan.name.toUpperCase()}
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Credits</CardTitle>
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{isUnlimited ? "∞" : credits}</div>
                {!isUnlimited && <Progress value={(credits/currentPlan.maxCredits)*100} className="mt-2" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Posts</CardTitle>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.content_generated_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Platforms</CardTitle>
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.platforms_used_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Used</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{usageData?.credits_used || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full max-w-full lg:max-w-3xl grid-cols-3 sm:grid-cols-6 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">Projects</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">Content</TabsTrigger>
              <TabsTrigger value="trends" className="text-xs sm:text-sm">Insights</TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
              <TabsTrigger value="billing" className="text-xs sm:text-sm">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="hero" className="w-full" size="lg">
                      <Link to="/repurpose"><Zap className="w-4 h-4 mr-2" />Create New Content</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link to="/seo"><Search className="w-4 h-4 mr-2" />Open SEO Suite</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent SEO Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {seoProjects.length > 0 ? (
                      <div className="space-y-2">
                        {seoProjects.map((project) => (
                          <Link
                            key={project.id}
                            to="/seo"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground">{project.domain}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No SEO projects yet</p>
                        <Button asChild variant="link" size="sm" className="mt-2">
                          <Link to="/seo">Create your first project</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-6 mt-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">SEO Projects</h3>
                <p className="text-muted-foreground">Manage your SEO projects and tracking</p>
              </div>
              {seoProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {seoProjects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.domain}</CardDescription>
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
                <Card className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No SEO Projects</h3>
                  <p className="text-muted-foreground mb-6">Create your first SEO project to start tracking rankings</p>
                  <Button asChild size="lg">
                    <Link to="/seo">Create SEO Project</Link>
                  </Button>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="history" className="space-y-6 mt-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Content History</h3>
                <p className="text-muted-foreground">View, manage, and reuse your generated content</p>
              </div>
              <ContentHistory />
            </TabsContent>
            <TabsContent value="account" className="space-y-6 mt-6">
              <Card>
                <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><p className="text-sm font-medium">Email</p><p className="text-muted-foreground">{user?.email}</p></div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trends" className="space-y-6 mt-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">News & Insights</h3>
                <p className="text-muted-foreground">SEO trends and personalized recommendations for your projects</p>
              </div>
              <NewsAndTrends projectId={seoProjects[0]?.id} />
            </TabsContent>
            <TabsContent value="billing" className="space-y-6 mt-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Billing & Subscription</h3>
                <p className="text-muted-foreground">Manage your plan and payment details</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="text-lg px-4 py-2">{currentPlan.name}</Badge>
                      <p className="text-2xl font-bold">{currentPlan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Credits per month</span>
                        <span className="font-medium">{isUnlimited ? "Unlimited" : currentPlan.maxCredits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">SEO Projects</span>
                        <span className="font-medium">{planType === "free" ? "1" : "Unlimited"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Priority Support</span>
                        <span className="font-medium">{planType === "enterprise" ? "✓" : "—"}</span>
                      </div>
                    </div>
                    {planType !== "enterprise" && (
                      <Button asChild className="w-full mt-4">
                        <Link to="/pricing">Upgrade Plan</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Usage This Month</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Credits Used</span>
                          <span className="font-medium">{usageData?.credits_used || 0} / {isUnlimited ? "∞" : currentPlan.maxCredits}</span>
                        </div>
                        {!isUnlimited && (
                          <Progress value={((usageData?.credits_used || 0) / currentPlan.maxCredits) * 100} />
                        )}
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Content Generated</span>
                          <span className="font-medium">{usageData?.content_generated_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Platforms Used</span>
                          <span className="font-medium">{usageData?.platforms_used_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
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
        </div>
      </section>
      <Footer />
    </div>
    </>
  );
}
