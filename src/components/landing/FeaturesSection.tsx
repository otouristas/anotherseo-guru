import { Search, Link2, Sparkles, BarChart3, Globe, Users, Zap, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Rewriting",
    description: "Advanced prompts trained on 2025 platform algorithms for maximum engagement",
    tier: "free"
  },
  {
    icon: Search,
    title: "Real-Time SEO Intelligence",
    description: "DataForSEO integration provides live keyword data, search volumes, and competition analysis",
    tier: "free"
  },
  {
    icon: Link2,
    title: "Smart Anchor Link Optimization",
    description: "Automatically suggests and places internal/external links for maximum SEO impact",
    tier: "free"
  },
  {
    icon: Target,
    title: "SERP Preview & Testing",
    description: "See exactly how your content will appear in Google search results",
    tier: "free"
  },
  {
    icon: BarChart3,
    title: "Keyword Research Dashboard",
    description: "Find high-value keywords with search volume, difficulty, and trend data",
    tier: "basic"
  },
  {
    icon: Globe,
    title: "Multi-Platform Export",
    description: "Download in .docx, .html, .md, or copy directly to clipboard",
    tier: "basic"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share workspaces, review content, and manage workflows together",
    tier: "pro"
  },
  {
    icon: Zap,
    title: "API Access & Integrations",
    description: "Connect to your CMS, scheduling tools, and analytics platforms",
    tier: "pro"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features, Simple Interface
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to dominate content marketing across every platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                {feature.tier !== "free" && (
                  <Badge variant={feature.tier === "pro" ? "default" : "secondary"}>
                    {feature.tier.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Analytics tracking, multi-language support, custom AI prompt builder, and direct scheduling
            </p>
            <Badge variant="outline">In Development</Badge>
          </Card>
        </div>
      </div>
    </section>
  );
};
