import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const planDetails: Record<string, any> = {
    starter: {
      name: "Starter",
      price: 49,
      features: [
        "1 SEO Project",
        "50 AI content generations/month",
        "Basic SERP tracking (10 keywords)",
        "Keyword research tool",
        "Content scoring & optimization",
        "Technical SEO audit",
        "Email support",
      ],
    },
    professional: {
      name: "Professional",
      price: 99,
      features: [
        "5 SEO Projects",
        "200 AI content generations/month",
        "Advanced SERP tracking (100 keywords)",
        "Competitor analysis suite",
        "Backlink monitoring",
        "Content calendar & workflow",
        "Technical SEO + Core Web Vitals",
        "Team collaboration (3 seats)",
        "Priority support",
      ],
    },
    agency: {
      name: "Agency",
      price: 249,
      features: [
        "20 SEO Projects",
        "Unlimited AI content generation",
        "SERP tracking (500 keywords)",
        "Full competitor intelligence",
        "Advanced backlink analysis",
        "Link opportunity finder",
        "White-label reporting",
        "API access",
        "Team collaboration (10 seats)",
        "Dedicated account manager",
      ],
    },
  };

  const selectedPlan = planDetails[plan as keyof typeof planDetails];

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Opening secure checkout in a new tab...",
        });
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlan) {
    navigate("/pricing");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - AnotherSEOGuru</title>
        <meta name="description" content="Complete your purchase and start your 1-day free trial." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
              <p className="text-muted-foreground">1-day free trial, cancel anytime</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPlan.name} Plan</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">€{selectedPlan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPlan.features.map((feature: string) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>€{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>1-day trial</span>
                      <span>€0</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Due Today</span>
                        <span>€0</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        You'll be charged €{selectedPlan.price} after your trial ends
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleCheckout} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
