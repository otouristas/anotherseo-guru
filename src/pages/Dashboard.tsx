import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, CreditCard, BarChart3, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { profile, user } = useAuth();
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("month_year", currentMonth)
        .maybeSingle()
        .then(({ data }) => setUsage(data));
    }
  }, [user]);

  const subscription = profile?.subscriptions?.[0];
  const planType = subscription?.plan_type || "free";

  const planLimits = {
    free: { posts: 1, platforms: 2 },
    basic: { posts: Infinity, platforms: 5 },
    pro: { posts: Infinity, platforms: Infinity },
  };

  const limits = planLimits[planType as keyof typeof planLimits];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your account and view your usage</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={planType === "free" ? "secondary" : "default"} className="text-lg">
                      {planType.toUpperCase()}
                    </Badge>
                    {planType === "free" && (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/pricing">Upgrade</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{usage?.content_generated_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {planType === "free" ? `Limit: ${limits.posts} this month` : "Unlimited"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Platforms Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{usage?.platforms_used_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {limits.platforms === Infinity ? "All" : limits.platforms}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your content creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full" size="lg">
                  <Link to="/repurpose">
                    <FileText className="mr-2 h-5 w-5" />
                    Create New Content
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">First Name</p>
                    <p className="text-sm text-muted-foreground">{profile?.first_name || "Not set"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Last Name</p>
                    <p className="text-sm text-muted-foreground">{profile?.last_name || "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your billing and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Plan</p>
                  <Badge variant={planType === "free" ? "secondary" : "default"}>
                    {planType.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline">{subscription?.status || "Active"}</Badge>
                </div>
                {planType === "free" ? (
                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <Link to="/pricing">Upgrade Your Plan</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.current_period_end
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
