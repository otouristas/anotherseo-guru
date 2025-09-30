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
    features: [
      "1 blog post input",
      "2 platform exports",
      "Basic SEO preview",
      "Community support",
    ],
    limitations: ["Limited content generation", "No custom platforms"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Basic",
    price: "€39",
    period: "per month",
    description: "For regular content creators",
    features: [
      "Unlimited posts",
      "5 platforms",
      "SEO preview + link suggestions",
      "Export formats (.docx, .html, .md)",
      "Priority support",
      "Analytics dashboard",
    ],
    limitations: [],
    cta: "Start Basic Plan",
    popular: true,
  },
  {
    name: "Pro",
    price: "€59",
    period: "per month",
    description: "For power users and teams",
    features: [
      "Everything in Basic",
      "Unlimited platforms",
      "Custom prompt builder",
      "Full SEO suite with SERP testing",
      "API integrations",
      "Team collaboration",
      "Advanced analytics",
      "White-label options",
    ],
    limitations: [],
    cta: "Start Pro Plan",
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
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
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
