import { Card } from "@/components/ui/card";
import { Search, TrendingUp, FileText, Zap, BarChart3, Globe, Link2, Users, Target, Database, Brain, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Search,
    title: "Advanced Keyword Research",
    description: "Access 9 billion keywords database. Discover high-intent long-tail keywords with Google/Bing Autocomplete and 200+ modifiers."
  },
  {
    icon: Layers,
    title: "Keyword Clustering & SERP Similarity",
    description: "Run unlimited SERP and Semantic clustering. Analyze keyword overlap to determine if keywords can target the same page."
  },
  {
    icon: TrendingUp,
    title: "Rank Tracking (Google & GMB)",
    description: "Monitor unlimited keywords with competitor analysis. Track Google My Business and organic rankings for desktop, mobile, and local results."
  },
  {
    icon: Link2,
    title: "Backlink Analysis & Gap Analysis",
    description: "Evaluate link profiles like a pro. Compare backlinks with competitors and discover new link-building opportunities."
  },
  {
    icon: BarChart3,
    title: "Traffic Analytics & Competitor Intelligence",
    description: "Uncover rivals' traffic stats, export their keywords, analyze top pages. Identify growth opportunities and lead the market."
  },
  {
    icon: Target,
    title: "Content Gap Analysis",
    description: "Find topics and keywords your competitors use but you don't. Fill content gaps to enhance SEO and cover all relevant areas."
  },
  {
    icon: Brain,
    title: "AI Content Writer & NLP Analysis",
    description: "Generate unlimited SEO-optimized content with local AI models. Extract topics and entities using Google NLP in 20+ languages."
  },
  {
    icon: Database,
    title: "Google Search Console Integration",
    description: "Advanced features: bulk indexing on autopilot, check keyword mentions, pull unlimited keywords (not limited to 1K or 25K)."
  },
  {
    icon: Globe,
    title: "Google Analytics Integration",
    description: "Connect GA4 for traffic analysis, conversion tracking, audience insights, and data-driven SEO recommendations."
  },
  {
    icon: Zap,
    title: "Technical SEO Audit & Site Crawler",
    description: "Automated crawling of unlimited URLs. Analyze technical issues, Core Web Vitals, mobile-friendliness, and schema markup."
  },
  {
    icon: Users,
    title: "White-Labeled Reports",
    description: "Create custom client reports with your logo and domain. Share links for clients to view their ranking data professionally."
  },
  {
    icon: FileText,
    title: "Bulk Operations & Automation",
    description: "Bulk check mentions, auto-index pages on Google/Bing, bulk analysis for multiple websites, and sitemap extraction."
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4">COMPLETE SEO SUITE</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-Level SEO Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Professional SEO suite with advanced analytics, competitor research, and AI-powered content generation
          </p>
          <p className="text-lg text-primary font-semibold">
            No expensive monthly subscriptions • Pay-as-you-go like OpenAI API
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-[0_0_30px_hsl(262_83%_58%/0.2)] transition-all duration-300 border-primary/10">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 w-fit mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">DataForSEO Integration</h3>
            <p className="text-muted-foreground mb-4">
              Plug in your DataForSEO API key to pull real-time organic traffic data, backlinks analytics, and comprehensive keyword research instantly.
            </p>
            <p className="text-sm text-muted-foreground">
              Pay-as-you-go pricing • No expensive monthly subscriptions • Just like OpenAI API
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
