import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "basic";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const planDetails = {
    basic: {
      name: "Basic",
      price: 39,
      features: [
        "Unlimited content generation",
        "5 platforms",
        "Advanced SEO optimization",
        "Keyword & anchor mapping",
        "SERP preview",
        "Priority email support",
      ],
    },
    pro: {
      name: "Pro",
      price: 59,
      features: [
        "Everything in Basic",
        "Unlimited platforms",
        "Custom platform templates",
        "WordPress integration",
        "Medium API integration",
        "LinkedIn API integration",
        "Advanced analytics",
        "Priority support + onboarding",
      ],
    },
  };

  const selectedPlan = planDetails[plan as keyof typeof planDetails];

  const handleCheckout = async () => {
    setIsLoading(true);
    
    toast({
      title: "Payment Coming Soon",
      description: "Stripe integration will be completed shortly. You'll be notified when payments are live.",
    });
    
    setIsLoading(false);
  };

  if (!selectedPlan) {
    navigate("/pricing");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">14-day free trial, cancel anytime</p>
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
                  {selectedPlan.features.map((feature) => (
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
                    <span>14-day trial</span>
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
    </div>
  );
}
