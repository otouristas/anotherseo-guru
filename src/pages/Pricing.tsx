import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

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
  },
  {
    name: "Basic",
    price: "€49",
    period: "per month",
    description: "For regular content creators",
    credits: "100 credits/month",
    features: [
      "100 credits per month (~100 posts)",
      "All platforms (10+)",
      "Real-time keyword research",
      "SEO preview + link suggestions",
      "Export formats (.docx, .html, .md)",
      "Priority email support",
      "Trends analysis",
    ],
    limitations: [],
    cta: "Start 1-Day Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "€79",
    period: "per month",
    description: "For power users and teams",
    credits: "300 credits/month",
    features: [
      "300 credits per month (~300 posts)",
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
      "Custom integrations & workflows",
      "SLA support with 24/7 assistance",
      "Personalized training & onboarding",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Zap className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Content Power
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free, upgrade as you scale. All plans include platform-optimized content, SEO intelligence, and real-time keyword research.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
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
                    <Link to={user ? (plan.cta === "Contact Sales" ? "/contact" : "/checkout") : "/auth"}>
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

          {/* Credit System Explanation */}
          <Card className="mt-12 p-8 max-w-4xl mx-auto bg-muted/50">
            <h3 className="text-2xl font-bold mb-4 text-center">How Credits Work</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1 Credit</div>
                <p className="text-sm text-muted-foreground">
                  = 1 platform-optimized post generated
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100 Credits</div>
                <p className="text-sm text-muted-foreground">
                  ≈ 10 blog posts repurposed to 10 platforms each
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Enterprise</div>
                <p className="text-sm text-muted-foreground">
                  Unlimited generation for high-volume needs
                </p>
              </div>
            </div>
          </Card>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center">Pricing FAQs</h3>
            <div className="space-y-6">
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Can I switch plans anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Upgrade instantly or downgrade at the end of your billing cycle. No penalties or hidden fees.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Do unused credits roll over?</h4>
                <p className="text-sm text-muted-foreground">
                  No, credits reset monthly. However, Enterprise users get unlimited generation with no credit tracking.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">What's included in the 1-day trial?</h4>
                <p className="text-sm text-muted-foreground">
                  Full access to all plan features for 24 hours. No credit card required during trial. Cancel anytime.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer a 1-day money-back guarantee on all paid plans. Contact support within 24 hours of purchase.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
