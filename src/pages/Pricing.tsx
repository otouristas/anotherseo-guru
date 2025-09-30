import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      description: "Perfect for trying out Amplify",
      features: [
        "20 credits (≈ 6-7 SEO blog posts)",
        "All platforms available",
        "AI-powered content generation",
        "Basic SEO optimization",
        "Email support",
      ],
      cta: "Get Started",
      link: user ? "/repurpose" : "/auth",
      popular: false,
    },
    {
      name: "Basic",
      price: "€39",
      period: "month",
      description: "For regular content creators",
      features: [
        "500 credits/month (≈ 150-250 posts)",
        "All platforms unlocked",
        "Advanced AI with Gemini Pro",
        "Advanced SEO optimization",
        "Keyword & anchor mapping",
        "SERP preview",
        "Priority email support",
      ],
      cta: "Start Free Trial",
      link: "/checkout?plan=basic",
      popular: true,
    },
    {
      name: "Pro",
      price: "€59",
      period: "month",
      description: "For agencies and teams",
      features: [
        "Unlimited credits",
        "All platforms unlocked",
        "Priority AI processing",
        "Custom platform templates",
        "Bulk content generation",
        "WordPress integration",
        "API access",
        "Advanced analytics",
        "Priority support + onboarding",
      ],
      cta: "Start Free Trial",
      link: "/checkout?plan=pro",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <Button asChild className="w-full mb-6" variant={plan.popular ? "default" : "outline"}>
                <Link to={plan.link}>{plan.cta}</Link>
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All paid plans come with a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
