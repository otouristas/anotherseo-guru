import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for trying out the platform",
    credits: "2 posts/month",
    features: [
      "2 content generations per month",
      "2 platform exports",
      "Basic SEO preview",
      "Community support",
    ],
    limitations: ["Limited to 2 posts monthly", "No keyword research"],
    cta: "Start Free",
    popular: false,
    priceId: null,
  },
  {
    name: "Basic",
    price: "€49",
    period: "per month",
    description: "For regular content creators",
    credits: "100 credits/month",
    features: [
      "100 credits per month",
      "All platforms (10+)",
      "Real-time keyword research",
      "SEO preview + link suggestions",
      "Export formats (.docx, .html, .md)",
      "Priority support",
      "Trends analysis",
    ],
    limitations: [],
    cta: "Start 1-Day Trial",
    popular: false,
    priceId: "price_basic",
  },
  {
    name: "Pro",
    price: "€79",
    period: "per month",
    description: "For power users and teams",
    credits: "300 credits/month",
    features: [
      "300 credits per month",
      "Everything in Basic",
      "Advanced SERP analysis",
      "Custom prompt builder",
      "API integrations",
      "Team collaboration (up to 5 seats)",
      "Advanced analytics dashboard",
      "Priority support + chat",
    ],
    limitations: [],
    cta: "Start 1-Day Trial",
    popular: true,
    priceId: "price_pro",
  },
  {
    name: "Enterprise",
    price: "€299",
    period: "per month",
    description: "For agencies and large teams",
    credits: "Unlimited",
    features: [
      "Unlimited content generation",
      "Everything in Pro",
      "White-label options",
      "Unlimited team seats",
      "Dedicated account manager",
      "Custom integrations",
      "SLA support",
      "Training & onboarding",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    priceId: "price_enterprise",
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
            Choose the plan that fits your content creation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
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

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{plan.description}</p>
                  <p className="text-xs font-medium text-primary">{plan.credits}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>

                <Button
                  className="w-full"
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                >
                  {plan.cta}
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
