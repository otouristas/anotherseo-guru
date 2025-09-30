import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Users, Zap, TrendingUp, Search, BarChart3, LinkIcon } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About AnotherSEOGuru - Our Mission to Democratize Professional SEO</title>
        <meta name="description" content="Learn about AnotherSEOGuru's mission to provide enterprise-grade SEO tools to everyone. Discover our comprehensive suite including SERP tracking, competitor analysis, keyword research, and AI content creation." />
        <meta name="keywords" content="about AnotherSEOGuru, SEO company, professional SEO tools, SEO mission, enterprise SEO platform" />
        <link rel="canonical" href="https://anotherseo.guru/about" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-20 px-4 border-b">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <Badge variant="secondary" className="mb-4">About AnotherSEOGuru</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              We're Building the Future of{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Professional SEO
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AnotherSEOGuru combines enterprise-grade SEO analytics with AI-powered content creation to help businesses dominate search rankings and scale their content strategy.
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
                  Professional SEO shouldn't be reserved for enterprises with massive budgets. Every business deserves access to powerful SEO intelligence and content optimization tools.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  That's why we built AnotherSEOGuru: to democratize professional-grade SEO tools and AI-powered content creation for businesses of all sizes.
                </p>
                <p className="text-lg text-muted-foreground">
                  Our platform provides real-time SERP tracking, in-depth competitor analysis, advanced keyword research, backlink monitoring, technical SEO audits, and intelligent content generation—all powered by cutting-edge AI technology.
                </p>
              </div>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Data-Driven SEO Intelligence</h3>
                      <p className="text-sm text-muted-foreground">
                        Every insight is backed by real-time data from search engines, giving you accurate, actionable intelligence to outrank competitors.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">AI-Powered Content Engine</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate SEO-optimized content for any platform with AI trained on 2025 algorithm best practices and ranking factors.
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
                        From solo consultants to enterprise SEO teams, our platform scales with multi-project management and team collaboration.
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
            <h2 className="text-4xl font-bold text-center mb-12">Impact By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  5,000+
                </div>
                <p className="text-muted-foreground">Active SEO Professionals</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  200K+
                </div>
                <p className="text-muted-foreground">Keywords Tracked</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  85%
                </div>
                <p className="text-muted-foreground">Avg Ranking Improvement</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  2.5M+
                </div>
                <p className="text-muted-foreground">Content Pieces Generated</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Comprehensive SEO Suite</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to dominate search rankings in one powerful platform
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Search className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">SERP Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your keyword rankings in real-time with historical data and position tracking across multiple locations.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Competitor Analysis</h3>
                <p className="text-muted-foreground">
                  Discover competitor strategies, analyze their backlink profiles, and identify content gaps to exploit.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keyword Research</h3>
                <p className="text-muted-foreground">
                  Find high-value keywords with search volume, difficulty scores, CPC data, and search intent classification.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <LinkIcon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Backlink Monitoring</h3>
                <p className="text-muted-foreground">
                  Track your backlink profile, discover new link opportunities, and monitor competitor link building strategies.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Technical SEO Audit</h3>
                <p className="text-muted-foreground">
                  Identify and fix technical issues with page speed analysis, mobile optimization, and Core Web Vitals tracking.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Scoring</h3>
                <p className="text-muted-foreground">
                  Analyze content quality with readability scores, SEO optimization metrics, and actionable improvement recommendations.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Sparkles className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Content Generator</h3>
                <p className="text-muted-foreground">
                  Create SEO-optimized content for any platform with AI trained on ranking factors and platform-specific best practices.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Calendar</h3>
                <p className="text-muted-foreground">
                  Plan, schedule, and manage your content strategy with collaborative tools and workflow management.
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
              We're constantly innovating to bring you the most powerful SEO tools. Coming soon:
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">🤖 AI-Powered SEO Automation</h3>
                <p className="text-sm text-muted-foreground">
                  Automated technical audits, content optimization suggestions, and link building recommendations powered by machine learning.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">📊 Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Forecast ranking changes, traffic trends, and ROI with advanced predictive modeling and historical data analysis.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">🌍 Local SEO Suite</h3>
                <p className="text-sm text-muted-foreground">
                  Complete local SEO toolkit with Google Business Profile management, citation tracking, and local pack monitoring.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">🔗 Link Building Automation</h3>
                <p className="text-sm text-muted-foreground">
                  Automated outreach campaigns, broken link detection, and link opportunity discovery with CRM integration.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
