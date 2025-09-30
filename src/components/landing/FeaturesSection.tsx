import { Search, Link2, Sparkles, BarChart3, Globe, Users, Zap, Target, FileText, TrendingUp, Code, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const seoFeatures = [
  {
    icon: Search,
    title: "SERP Position Tracking",
    description: "Monitor keyword rankings in real-time with historical data, competitor comparison, and featured snippet tracking",
    tier: "starter"
  },
  {
    icon: BarChart3,
    title: "Competitor Analysis",
    description: "Analyze competitor strategies, backlink profiles, content gaps, and identify opportunities to outrank them",
    tier: "starter"
  },
  {
    icon: Target,
    title: "Advanced Keyword Research",
    description: "Find high-value keywords with search volume, difficulty, CPC, search intent, and LSI suggestions",
    tier: "starter"
  },
  {
    icon: Link2,
    title: "Backlink Monitoring",
    description: "Track backlink profile, discover opportunities, monitor toxic links, and analyze competitor link building",
    tier: "professional"
  },
  {
    icon: Code,
    title: "Technical SEO Audit",
    description: "Comprehensive site crawl, Core Web Vitals, page speed, schema markup, and technical issue identification",
    tier: "professional"
  },
  {
    icon: FileText,
    title: "Content Scoring & Analysis",
    description: "Analyze readability, SEO optimization, keyword density, E-E-A-T signals, and get actionable recommendations",
    tier: "professional"
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Plan, schedule, and manage content strategy with team collaboration, briefs, and performance tracking",
    tier: "agency"
  },
  {
    icon: TrendingUp,
    title: "Local SEO Tools",
    description: "Track local pack rankings, GMB performance, citation consistency, and geographic performance analysis",
    tier: "agency"
  },
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Create SEO-optimized content for 15+ platforms with AI trained on 2025 ranking factors",
    tier: "all"
  },
  {
    icon: Globe,
    title: "Google Analytics & GSC Integration",
    description: "Connect GA4 and Search Console for comprehensive insights and AI-powered recommendations",
    tier: "professional"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-user workspaces, role-based permissions, shared projects, and team workflow management",
    tier: "agency"
  },
  {
    icon: Zap,
    title: "API Access & White-Label",
    description: "Full API access for custom integrations and white-label reporting for agency clients",
    tier: "agency"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <Badge className="mb-4">COMPLETE SEO SUITE</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dominate Search Rankings</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade SEO tools combined with AI-powered content generation. 
            From SERP tracking to technical audits, we've got every aspect of SEO covered.
          </p>
        </div>

        {/* Main SEO Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {seoFeatures.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all group hover:border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                {feature.tier !== "all" && (
                  <Badge variant={
                    feature.tier === "starter" ? "outline" :
                    feature.tier === "professional" ? "secondary" :
                    "default"
                  }>
                    {feature.tier}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Key Benefits Highlight */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <h4 className="font-semibold mb-2">Keywords Tracked</h4>
            <p className="text-sm text-muted-foreground">
              Monitor unlimited keywords across multiple search engines and locations
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <h4 className="font-semibold mb-2">Real-Time Monitoring</h4>
            <p className="text-sm text-muted-foreground">
              Automated tracking and alerts for ranking changes, backlinks, and issues
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="text-3xl font-bold text-purple-600 mb-2">AI-Powered</div>
            <h4 className="font-semibold mb-2">Smart Recommendations</h4>
            <p className="text-sm text-muted-foreground">
              Get actionable insights based on 2025 SEO best practices and algorithm updates
            </p>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="text-center">
            <Badge className="mb-4">COMING SOON</Badge>
            <h3 className="text-2xl font-bold mb-3">Even More Powerful Features On The Way</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're constantly innovating to bring you the most advanced SEO tools
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-background rounded-lg">
                <span className="font-medium">Multi-language Support</span>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <span className="font-medium">Voice Search Optimization</span>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <span className="font-medium">Video SEO Analytics</span>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <span className="font-medium">AI Content Hub Builder</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
