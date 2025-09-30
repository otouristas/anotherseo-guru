import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Users, Zap, TrendingUp, Globe } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="secondary" className="mb-4">About Repurposfy</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            We're Building the Future of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Content Marketing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Repurposfy is transforming how marketers, agencies, and creators scale their content across platforms with AI-powered intelligence and real-time SEO data.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                We believe content creation shouldn't be a bottleneck. Every marketer, creator, and business deserves enterprise-level content capabilities without the enterprise-level team.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                That's why we built Repurposfy: to democratize high-quality, multi-platform content creation through AI, automation, and strategic intelligence.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform combines cutting-edge AI (Lovable AI + Gemini), real-time SEO data (DataForSEO), and intelligent web scraping (Firecrawl) to give you content that actually performs.
              </p>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Data-Driven Excellence</h3>
                    <p className="text-sm text-muted-foreground">
                      Every output is backed by real-time keyword research, SERP analysis, and platform algorithm insights from 2025.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI That Understands Context</h3>
                    <p className="text-sm text-muted-foreground">
                      Our prompts are trained on platform-specific best practices, not generic rewrites. LinkedIn vs Reddit? We know the difference.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Built for Teams & Agencies</h3>
                    <p className="text-sm text-muted-foreground">
                      From solo creators to 100+ person agencies, our platform scales with collaboration, workflows, and client management.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                1,000+
              </div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <p className="text-muted-foreground">Posts Generated</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                42%
              </div>
              <p className="text-muted-foreground">Avg Engagement Increase</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                70%
              </div>
              <p className="text-muted-foreground">Time Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powered by Best-in-Class Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We integrate the most powerful tools in AI, SEO, and web intelligence to deliver unmatched results
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lovable AI + Gemini 2.5</h3>
              <p className="text-muted-foreground">
                Cutting-edge language models trained on 2025 platform algorithms for authentic, engaging content that converts.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">DataForSEO Integration</h3>
              <p className="text-muted-foreground">
                Real-time keyword research, search volume data, competition analysis, and SERP feature insights from Google's API.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Globe className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Firecrawl Intelligence</h3>
              <p className="text-muted-foreground">
                Advanced web scraping to analyze competitor content, trending formats, and SERP meta data for strategic insights.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-4xl font-bold mb-6">Our Vision for the Future</h2>
          <p className="text-xl text-muted-foreground mb-8">
            We're just getting started. Our roadmap includes:
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">🚀 Direct Platform Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Publish directly to LinkedIn, Medium, WordPress, and more without copy-pasting.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">📊 Advanced Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Track performance, engagement, and ROI across all platforms in one place.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">🌍 Multi-Language Support</h3>
              <p className="text-sm text-muted-foreground">
                Expand globally with AI-powered translation and localization for 50+ languages.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">🤖 Custom AI Prompt Builder</h3>
              <p className="text-sm text-muted-foreground">
                Create your own platform templates, tone variations, and brand voice presets.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
