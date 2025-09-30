import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, TrendingUp, Link2, BarChart3, Target, Globe, Zap, Users, Layers } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/Footer";

const categories = [
  {
    icon: Search,
    title: "Keyword Research",
    articles: [
      {
        title: "Getting Started with Keyword Research",
        content: "Access our database of 9 billion keywords. Use Google/Bing Autocomplete with 200+ modifiers to discover high-intent long-tail keywords."
      },
      {
        title: "Bulk Autocomplete Keywords",
        content: "Enter multiple seed keywords into our tool to generate thousands of high-intent keyword ideas instantly."
      },
      {
        title: "Understanding Search Intent",
        content: "Learn how to classify keywords by search intent (informational, navigational, commercial, transactional) for better targeting."
      }
    ]
  },
  {
    icon: Layers,
    title: "Keyword Clustering",
    articles: [
      {
        title: "SERP Clustering",
        content: "Run SERP clustering on unlimited keywords. Our tool analyzes search results to group keywords that can target the same page."
      },
      {
        title: "Semantic Clustering",
        content: "Use semantic analysis to group related keywords based on meaning and context, not just SERP overlap."
      },
      {
        title: "SERP Similarity Tool",
        content: "Quickly check the overlap between two keywords to determine if they should be targeted together on the same page."
      }
    ]
  },
  {
    icon: Link2,
    title: "Backlink Analysis",
    articles: [
      {
        title: "Understanding Backlink Metrics",
        content: "Learn about Domain Authority, Page Authority, dofollow/nofollow links, and anchor text analysis."
      },
      {
        title: "Backlink Gap Analysis",
        content: "Compare your backlink profile with competitors to discover new link-building opportunities."
      },
      {
        title: "Monitoring Toxic Links",
        content: "Identify and monitor potentially harmful backlinks that could impact your SEO performance."
      }
    ]
  },
  {
    icon: BarChart3,
    title: "Traffic Analytics",
    articles: [
      {
        title: "Competitor Traffic Analysis",
        content: "Uncover your competitors' traffic stats, top pages, and traffic sources to identify growth opportunities."
      },
      {
        title: "Exporting Competitor Keywords",
        content: "Export your competitors' organic keywords to analyze their content strategy and find gaps."
      },
      {
        title: "Traffic Trends and Patterns",
        content: "Analyze traffic trends over time to understand seasonality and growth patterns."
      }
    ]
  },
  {
    icon: TrendingUp,
    title: "Rank Tracking",
    articles: [
      {
        title: "Setting Up Rank Tracking",
        content: "Monitor unlimited keywords for desktop and mobile across multiple locations and search engines."
      },
      {
        title: "Google My Business Tracking",
        content: "Track your GMB profile's ranking on Google Maps for specific locations and keywords."
      },
      {
        title: "Competitor Rank Comparison",
        content: "Compare your rankings with competitors to identify opportunities for improvement."
      }
    ]
  },
  {
    icon: Zap,
    title: "Technical SEO",
    articles: [
      {
        title: "Running a Site Audit",
        content: "Crawl unlimited URLs to identify technical issues, broken links, missing meta tags, and more."
      },
      {
        title: "Core Web Vitals Analysis",
        content: "Monitor page speed, LCP, FID, and CLS scores to ensure optimal user experience."
      },
      {
        title: "Schema Markup Validation",
        content: "Check and validate structured data to improve rich snippets in search results."
      }
    ]
  },
  {
    icon: Globe,
    title: "Google Integrations",
    articles: [
      {
        title: "Connecting Google Search Console",
        content: "Integrate GSC to access real SERP data, indexing status, and search analytics. Pull unlimited keywords without the 1K/25K limits."
      },
      {
        title: "Google Analytics 4 Integration",
        content: "Connect GA4 for traffic analysis, conversion tracking, and comprehensive audience insights."
      },
      {
        title: "Bulk Indexing",
        content: "Auto-index URLs on Google and Bing automatically, running on autopilot for your entire site."
      }
    ]
  },
  {
    icon: Target,
    title: "Content Optimization",
    articles: [
      {
        title: "Content Gap Analysis",
        content: "Find topics and keywords your competitors cover that you don't, helping you fill content gaps."
      },
      {
        title: "AI Content Generation",
        content: "Generate unlimited SEO-optimized content using local AI models without additional API costs."
      },
      {
        title: "NLP Text Analysis",
        content: "Extract key topics and entities from content using Google NLP in 20+ languages."
      }
    ]
  },
  {
    icon: Users,
    title: "Account & Billing",
    articles: [
      {
        title: "Managing Your Subscription",
        content: "Update your plan, manage credits, and handle billing information from your account dashboard."
      },
      {
        title: "Understanding Credits",
        content: "Learn how credits work and what operations consume credits in your account."
      },
      {
        title: "White-Label Reports",
        content: "Create custom reports with your logo and domain for client presentations."
      }
    ]
  }
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(
      article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <>
      <Helmet>
        <title>Help Center - AnotherSEOGuru</title>
        <meta name="description" content="Comprehensive help center and documentation for AnotherSEOGuru SEO platform. Learn about keyword research, rank tracking, backlink analysis, and more." />
        <link rel="canonical" href="https://anotherseoguru.com/help" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know about using AnotherSEOGuru
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search help articles..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {(searchQuery ? filteredCategories : categories).map((category, idx) => {
              const Icon = category.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{category.title}</h2>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.articles.map((article, articleIdx) => (
                      <AccordionItem key={articleIdx} value={`item-${idx}-${articleIdx}`}>
                        <AccordionTrigger className="text-sm hover:text-primary">
                          {article.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {article.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              );
            })}
          </div>

          {/* Contact Support */}
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="mailto:support@anotherseoguru.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;
