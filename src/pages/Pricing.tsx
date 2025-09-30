import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

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
    category: "seo-only"
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
    category: "seo-content"
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
    category: "seo-content"
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
    category: "enterprise"
  },
];

const addonPlans = [
  {
    name: "Content Only",
    price: "€29",
    period: "per month",
    description: "Just AI content generation",
    features: [
      "100 AI content generations/month",
      "All platform templates",
      "SEO optimization",
      "Export formats",
      "No SEO tools included",
    ],
  },
  {
    name: "SEO Tools Only",
    price: "€39",
    period: "per month",
    description: "Pure SEO analytics suite",
    features: [
      "3 SEO Projects",
      "50 keyword tracking",
      "Competitor analysis",
      "Backlink monitoring",
      "Technical audits",
      "No content generation",
    ],
  },
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Pricing Plans - AnotherSEOGuru SEO Tools & Content Creation</title>
        <meta name="description" content="Transparent pricing for professional SEO tools and AI content creation. Choose from Starter, Professional, Agency, or Enterprise plans. 14-day free trial available." />
        <meta name="keywords" content="SEO pricing, SEO tools cost, content creation pricing, SEO software plans, professional SEO packages" />
        <link rel="canonical" href="https://anotherseo.guru/pricing" />
      </Helmet>
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
                SEO Power Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional SEO tools + AI content creation. Start with a 14-day free trial, no credit card required.
            </p>
          </div>
        </section>

        {/* Main Pricing Cards */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">SEO Suite + Content Packages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
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

            {/* Individual Plans */}
            <h2 className="text-3xl font-bold text-center mb-12">Individual Add-Ons</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {addonPlans.map((plan) => (
                <Card key={plan.name} className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>

                    <Button asChild className="w-full" variant="outline" size="lg">
                      <Link to={user ? "/checkout" : "/auth"}>Get Started</Link>
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

            {/* FAQ Section */}
            <div className="mt-20 max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-8 text-center">Pricing FAQs</h3>
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-semibold mb-2">What's included in the free trial?</h4>
                  <p className="text-sm text-muted-foreground">
                    14-day full access to all features in your chosen plan. No credit card required. Cancel anytime before trial ends.
                  </p>
                </Card>
                <Card className="p-6">
                  <h4 className="font-semibold mb-2">Can I switch plans anytime?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Upgrade instantly for immediate access. Downgrades take effect at the end of your current billing cycle.
                  </p>
                </Card>
                <Card className="p-6">
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards (Visa, Mastercard, Amex) and PayPal for monthly subscriptions.
                  </p>
                </Card>
                <Card className="p-6">
                  <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer a 14-day money-back guarantee on all paid plans. Contact support if you're not satisfied.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
