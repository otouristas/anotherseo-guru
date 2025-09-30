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
  History
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ContentHistory } from "@/components/ContentHistory";

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

    if (user) {
      fetchUsage();
    }
  }, [user]);

  return (
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
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isUnlimited ? "∞" : credits}</div>
                {!isUnlimited && <Progress value={(credits/currentPlan.maxCredits)*100} className="mt-2" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{usageData?.content_generated_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{usageData?.platforms_used_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{usageData?.credits_used || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Content History</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="hero" className="w-full" size="lg">
                    <Link to="/repurpose"><Zap className="w-4 h-4 mr-2" />Create New Content</Link>
                  </Button>
                </CardContent>
              </Card>
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
            <TabsContent value="billing" className="space-y-6 mt-6">
              <Card>
                <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
                <CardContent>
                  <Badge>{currentPlan.name}</Badge>
                  <p className="mt-2">{currentPlan.price}/month</p>
                  {planType !== "enterprise" && <Button asChild className="w-full mt-4"><Link to="/pricing">Upgrade</Link></Button>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
}
