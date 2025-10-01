import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "€49",
    period: "per month",
    description: "Perfect for solo SEO consultants",
    credits: "50 content generations",
    features: [
      "1 SEO Project",
      "50 AI content generations/month",
      "Basic SERP tracking (10 keywords)",
      "Keyword research tool",
      "Content scoring & optimization",
      "Technical SEO audit",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "€99",
    period: "per month",
    description: "For growing SEO agencies",
    credits: "200 content generations",
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
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "€249",
    period: "per month",
    description: "For established SEO agencies",
    credits: "Unlimited content",
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
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations",
    credits: "Unlimited everything",
    features: [
      "Unlimited SEO Projects",
      "Unlimited AI content generation",
      "Unlimited keyword tracking",
      "Custom integrations & workflows",
      "Unlimited team seats",
      "Advanced analytics & reporting",
      "Custom training & onboarding",
      "SLA with 24/7 support",
      "Dedicated infrastructure",
      "Custom contract terms",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional SEO tools + AI content creation. Start with a 1-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative flex flex-col ${
                plan.popular
                  ? "border-primary border-2 shadow-[0_0_30px_hsl(262_83%_58%/0.2)]"
                  : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
                  Most Popular
                </Badge>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {plan.credits}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>

                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                >
                  <Link to={plan.cta === "Contact Sales" ? "/contact" : `/checkout?plan=${plan.name.toLowerCase()}`}>
                    {plan.cta}
                  </Link>
                </Button>

                <div className="space-y-3 pt-6 border-t">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
