import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { ContentInput } from "@/components/ContentInput";
import { PlatformSelector } from "@/components/PlatformSelector";
import { ToneStyleSelector } from "@/components/ToneStyleSelector";
import { SEOSettings, SEOData } from "@/components/SEOSettings";
import { SERPPreview } from "@/components/SERPPreview";
import { FileUpload } from "@/components/FileUpload";
import { PreviewPane } from "@/components/PreviewPane";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, FileText, Upload, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Link } from "react-router-dom";
import { platforms } from "@/components/PlatformSelector";
import { CreditDisplay } from "@/components/CreditDisplay";
import { URLScraper } from "@/components/URLScraper";
import { KeywordResearch } from "@/components/KeywordResearch";
import { TrendsAnalysis } from "@/components/TrendsAnalysis";
import { SEOIntelligenceInfo } from "@/components/SEOIntelligenceInfo";
import { ContentReview } from "@/components/ContentReview";
import { ContentTips } from "@/components/ContentTips";
import { DataForSEOContentTools } from "@/components/DataForSEOContentTools";
import { SERPAnalyzer } from "@/components/SERPAnalyzer";
import { OnPageAnalyzer } from "@/components/OnPageAnalyzer";
import { Footer } from "@/components/Footer";
import { SEOIntelligenceDashboard } from "@/components/seo-intelligence/SEOIntelligenceDashboard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GeneratedContent {
  platform: string;
  content: string;
}

export default function Repurpose() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Content Generator - AnotherSEOGuru</title>
        <meta name="description" content="Create SEO-optimized content for multiple platforms" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <RepurposeContent />
    </ProtectedRoute>
  );
}

function RepurposeContent() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const state = location.state as { url?: string; keywords?: string[]; mode?: string } | null;

  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("narrative");
  const [seoData, setSeoData] = useState<SEOData>({
    primaryKeyword: state?.keywords?.[0] || "",
    secondaryKeywords: state?.keywords?.slice(1, 5) || [],
    targetWordCount: 1000,
    anchors: []
  });
  const [serpMeta, setSerpMeta] = useState({ title: "", description: "" });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
  const [activeStep, setActiveStep] = useState<"input" | "review" | "intelligence" | "generate" | "results">("input");
  const [scrapedUrl, setScrapedUrl] = useState<string>(state?.url || "");
  const [autoTriggerScrape, setAutoTriggerScrape] = useState<boolean>(!!state?.url);
  const { toast } = useToast();

  const planType = profile?.plan_type || "free";
  const isUnlimited = planType === 'pro';
  
  // Calculate total credits needed for selected platforms
  const totalCreditsNeeded = selectedPlatforms.reduce((sum, platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    return sum + (platform?.credits || 1);
  }, 0);

  useEffect(() => {
    if (profile) {
      setCredits(profile.credits || 0);
    }
  }, [profile]);

  // Auto-trigger scrape when URL is provided from navigation state
  useEffect(() => {
    if (autoTriggerScrape && scrapedUrl && !content) {
      setAutoTriggerScrape(false);
      if (state?.mode === 'seo-optimization') {
        toast({
          title: "SEO Optimization Mode",
          description: `Pre-loaded URL and ${state.keywords?.length || 0} keywords. Scraping content...`,
        });
      }
    }
  }, [autoTriggerScrape, scrapedUrl, content, state, toast]);

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!isUnlimited && credits < totalCreditsNeeded) {
      toast({
        variant: "destructive",
        title: "Not enough credits",
        description: `You need ${totalCreditsNeeded} credits but only have ${credits}. Upgrade to get more.`,
        action: (
          <Link to="/pricing">
            <Button variant="outline" size="sm">Upgrade</Button>
          </Link>
        ),
      });
      return;
    }

    if (content.length < 100) {
      toast({
        title: "Content too short",
        description: "Please enter at least 100 characters",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Deduct credits first
      if (!isUnlimited) {
        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits', {
          user_id_param: user?.id,
          credits_to_deduct: totalCreditsNeeded
        });

        if (deductError || !deductResult) {
          throw new Error("Failed to deduct credits. Please try again.");
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          content,
          platforms: selectedPlatforms,
          tone,
          style,
          seoData
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(data.generatedContent);
      
      // Save to content history
      const historyPromises = data.generatedContent.map((item: GeneratedContent) => 
        supabase.from('content_history').insert({
          user_id: user?.id,
          original_content: content,
          platform: item.platform,
          generated_content: item.content,
          tone,
          style,
          keywords: [seoData.primaryKeyword, ...seoData.secondaryKeywords].filter(k => k)
        })
      );
      
      await Promise.all(historyPromises);
      
      // Move to results step
      setActiveStep("results");

      // Update credits locally
      if (!isUnlimited) {
        setCredits(credits - totalCreditsNeeded);
      }

      // Track usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: existingUsage } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user?.id)
        .eq("month_year", currentMonth)
        .maybeSingle();

      if (existingUsage) {
        await supabase
          .from("usage_tracking")
          .update({
            content_generated_count: existingUsage.content_generated_count + 1,
            platforms_used_count: Math.max(existingUsage.platforms_used_count, selectedPlatforms.length),
            credits_used: existingUsage.credits_used + totalCreditsNeeded,
          })
          .eq("id", existingUsage.id);
      } else {
        await supabase.from("usage_tracking").insert({
          user_id: user?.id,
          month_year: currentMonth,
          content_generated_count: 1,
          platforms_used_count: selectedPlatforms.length,
          credits_used: totalCreditsNeeded,
        });
      }

      toast({
        title: "Content Generated! ✨",
        description: `Successfully created ${selectedPlatforms.length} platform version${selectedPlatforms.length > 1 ? "s" : ""}. Used ${totalCreditsNeeded} credits.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
      
      // Refund credits on error if they were deducted
      if (!isUnlimited && credits < (profile?.credits || 0)) {
        await supabase
          .from("profiles")
          .update({ credits: (profile?.credits || 0) })
          .eq("id", user?.id);
        setCredits(profile?.credits || 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" style={{ backgroundSize: '30px 30px' }} />
        <div className="relative container mx-auto max-w-6xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-base font-medium text-primary">
            <Zap className="w-5 h-5" />
            AI-Powered SEO Intelligence Platform
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Repurpose Your Content with
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
              SEO Intelligence
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform content into platform-optimized versions powered by real-time keyword research, trends analysis, and advanced AI prompts engineered for 2025 algorithms
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Badge variant={planType === "free" ? "secondary" : "default"}>
              {planType.toUpperCase()} PLAN
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isUnlimited ? '∞' : credits} credits available
              {planType === "free" && (
                <>
                  {" "}·{" "}
                  <Link to="/pricing" className="text-primary hover:underline">
                    Upgrade for more
                  </Link>
                </>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <div className="flex-1">
        <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
            <Button
              variant={activeStep === "input" ? "default" : "outline"}
              onClick={() => setActiveStep("input")}
              className="gap-2 whitespace-nowrap"
              size="sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">1. Input</span>
              <span className="sm:hidden">1</span>
            </Button>
            <div className="w-8 md:w-12 h-0.5 bg-border flex-shrink-0" />
            <Button
              variant={activeStep === "review" ? "default" : "outline"}
              onClick={() => content.length > 0 && setActiveStep("review")}
              disabled={content.length === 0}
              className="gap-2 whitespace-nowrap"
              size="sm"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">2. Review</span>
              <span className="sm:hidden">2</span>
            </Button>
            <div className="w-8 md:w-12 h-0.5 bg-border flex-shrink-0" />
            <Button
              variant={activeStep === "intelligence" ? "default" : "outline"}
              onClick={() => content.length > 0 && setActiveStep("intelligence")}
              disabled={content.length === 0}
              className="gap-2 whitespace-nowrap"
              size="sm"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">3. AI Intelligence</span>
              <span className="sm:hidden">3</span>
            </Button>
            <div className="w-8 md:w-12 h-0.5 bg-border flex-shrink-0" />
            <Button
              variant={activeStep === "generate" ? "default" : "outline"}
              onClick={() => content.length > 0 && setActiveStep("generate")}
              disabled={content.length === 0}
              className="gap-2 whitespace-nowrap"
              size="sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">4. Generate</span>
              <span className="sm:hidden">4</span>
            </Button>
            <div className="w-8 md:w-12 h-0.5 bg-border flex-shrink-0" />
            <Button
              variant={activeStep === "results" ? "default" : "outline"}
              onClick={() => generatedContent.length > 0 && setActiveStep("results")}
              disabled={generatedContent.length === 0}
              className="gap-2 whitespace-nowrap"
              size="sm"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">5. Results</span>
              <span className="sm:hidden">5</span>
            </Button>
          </div>

          <Card className="p-8 md:p-12 shadow-strong">
            {activeStep === "input" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Input Your Content</h2>
                  <p className="text-muted-foreground">Type, scrape from URL, or upload a file to get started</p>
                </div>

                <SEOIntelligenceInfo />
                <CreditDisplay credits={credits} planType={planType} />
                
                <Tabs defaultValue="type" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="type">
                      <FileText className="w-4 h-4 mr-2" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="scrape">
                      <Globe className="w-4 h-4 mr-2" />
                      Scrape URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="type" className="mt-4">
                    <ContentInput value={content} onChange={setContent} />
                  </TabsContent>
                  
                  <TabsContent value="scrape" className="mt-4">
                    <URLScraper
                      onContentScraped={(scrapedContent, metadata) => {
                        setContent(scrapedContent);
                        if (metadata?.url) {
                          setScrapedUrl(metadata.url);
                        }
                        if (metadata?.title) {
                          setSerpMeta(prev => ({ ...prev, title: metadata.title || '' }));
                        }
                        if (metadata?.description) {
                          setSerpMeta(prev => ({ ...prev, description: metadata.description || '' }));
                        }
                      }}
                    />
                    {content && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm">
                        ✓ Content scraped: {content.length} characters
                        {scrapedUrl && <div className="mt-1 text-xs">URL: {scrapedUrl}</div>}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-4">
                    <FileUpload onFileContent={setContent} />
                    {content && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm">
                        ✓ File loaded: {content.length} characters
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {content.length > 0 && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setActiveStep("review")}
                  >
                    Next: Review Content
                  </Button>
                )}
              </div>
            )}

            {activeStep === "review" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Review Your Content</h2>
                  <p className="text-muted-foreground">Check the structure and get optimization tips</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <ContentReview content={content} />
                  <ContentTips />
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveStep("input")}
                  >
                    Back: Edit Content
                  </Button>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setActiveStep("intelligence")}
                  >
                    Next: SEO Intelligence Analysis
                  </Button>
                </div>
              </div>
            )}

            {activeStep === "intelligence" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">SEO Intelligence Analysis</h2>
                  <p className="text-muted-foreground">
                    AI-powered analysis with GSC data, algorithm detection, and optimization recommendations
                  </p>
                </div>

                <SEOIntelligenceDashboard
                  content={content}
                  url={scrapedUrl}
                  keywords={[seoData.primaryKeyword, ...seoData.secondaryKeywords].filter(k => k)}
                  projectId={undefined}
                  userId={user?.id || ""}
                  onApplyRecommendations={(recommendations) => {
                    recommendations.forEach((rec: any) => {
                      if (rec.relatedKeywords && rec.relatedKeywords.length > 0) {
                        setSeoData({
                          ...seoData,
                          secondaryKeywords: [...new Set([...seoData.secondaryKeywords, ...rec.relatedKeywords.slice(0, 3)])].slice(0, 5)
                        });
                      }
                    });
                    toast({
                      title: "Recommendations Applied",
                      description: "SEO recommendations have been integrated into your content settings",
                    });
                  }}
                />

                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setActiveStep("review")}
                  >
                    Back: Review Content
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setActiveStep("generate")}
                  >
                    Continue to Generate
                  </Button>
                </div>
              </div>
            )}

            {activeStep === "generate" && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Controls */}
                <div className="space-y-6">
                  <div className="text-center lg:text-left mb-6">
                    <h2 className="text-2xl font-bold mb-2">Configure & Generate</h2>
                    <p className="text-muted-foreground">Select platforms and customize your output</p>
                  </div>

                  <PlatformSelector
                    selected={selectedPlatforms}
                    onSelect={handlePlatformSelect}
                  />

                  <ToneStyleSelector
                    tone={tone}
                    style={style}
                    onToneChange={setTone}
                    onStyleChange={setStyle}
                  />

                  <KeywordResearch 
                    onKeywordSelect={(keyword, data) => {
                      setSeoData({
                        ...seoData,
                        primaryKeyword: keyword,
                        secondaryKeywords: [...new Set([...seoData.secondaryKeywords, keyword])].slice(0, 5)
                      });
                      toast({
                        title: "Keyword added",
                        description: `Added "${keyword}" with ${data.search_volume.toLocaleString()} monthly searches`,
                      });
                    }}
                  />

                  <TrendsAnalysis 
                    keywords={[seoData.primaryKeyword, ...seoData.secondaryKeywords].filter(k => k)}
                  />

                  <SEOSettings value={seoData} onChange={setSeoData} />

                  <DataForSEOContentTools
                    content={content}
                    onMetaGenerated={(title, description) => {
                      setSerpMeta({ title, description });
                      toast({
                        title: "Meta tags applied",
                        description: "SEO meta tags have been set from DataForSEO"
                      });
                    }}
                    onSubtopicsGenerated={(subtopics) => {
                      setSeoData({
                        ...seoData,
                        secondaryKeywords: [...new Set([...seoData.secondaryKeywords, ...subtopics.slice(0, 3)])].slice(0, 5)
                      });
                    }}
                    onContentGenerated={(text) => {
                      setContent(content + "\n\n" + text);
                    }}
                  />

                  <SERPAnalyzer />

                  <OnPageAnalyzer />

                  <div className="space-y-3">
                    <h4 className="font-semibold">SEO Meta Preview (Optional)</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Meta title for SEO preview..."
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        value={serpMeta.title}
                        onChange={(e) => setSerpMeta({ ...serpMeta, title: e.target.value })}
                      />
                      <textarea
                        placeholder="Meta description for SEO preview..."
                        className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
                        value={serpMeta.description}
                        onChange={(e) => setSerpMeta({ ...serpMeta, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveStep("intelligence")}
                    >
                      Back: SEO Intelligence
                    </Button>
                    <Button
                      size="lg"
                      variant="hero"
                      className="w-full"
                      onClick={handleGenerate}
                      disabled={content.length < 100 || selectedPlatforms.length === 0 || isGenerating || (!isUnlimited && credits < totalCreditsNeeded)}
                    >
                      <Sparkles className="w-5 h-5" />
                      {isGenerating ? "Generating..." : (!isUnlimited && credits < totalCreditsNeeded) ? `Need ${totalCreditsNeeded} Credits` : `Generate (${totalCreditsNeeded} credits)`}
                    </Button>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                  <SERPPreview
                    title={serpMeta.title}
                    description={serpMeta.description}
                  />
                  
                  <Card className="p-6">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">⚡</div>
                      <h3 className="text-lg font-semibold">Ready to Generate</h3>
                      <p className="text-sm text-muted-foreground">
                        Click Generate to create optimized content for all selected platforms
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeStep === "results" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success mb-4">
                    <Zap className="w-4 h-4" />
                    Content Generated Successfully!
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Your Platform-Optimized Content</h2>
                  <p className="text-muted-foreground">Ready to copy, download, and publish</p>
                </div>

                <PreviewPane
                  generatedContent={generatedContent}
                  isGenerating={isGenerating}
                />

                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setActiveStep("generate")}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate More
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      setContent("");
                      setGeneratedContent([]);
                      setSelectedPlatforms([]);
                      setActiveStep("input");
                    }}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Start New
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
