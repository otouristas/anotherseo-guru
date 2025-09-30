import { useState, useEffect } from "react";
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

interface GeneratedContent {
  platform: string;
  content: string;
}

export default function Repurpose() {
  return (
    <ProtectedRoute>
      <RepurposeContent />
    </ProtectedRoute>
  );
}

function RepurposeContent() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("narrative");
  const [seoData, setSeoData] = useState<SEOData>({
    primaryKeyword: "",
    secondaryKeywords: [],
    targetWordCount: 1000,
    anchors: []
  });
  const [serpMeta, setSerpMeta] = useState({ title: "", description: "" });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
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
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      {/* Hero Section */}
      <section className="py-12 px-4 border-b">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Zap className="w-4 h-4" />
            AI-Powered Content Transformation with SEO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Repurpose Your Content
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your original content into platform-optimized versions with AI-powered rewriting, SEO optimization, and smart web scraping
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
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="p-8 md:p-12 shadow-strong">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Input & Controls */}
              <div className="space-y-6">
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

                <SEOSettings value={seoData} onChange={setSeoData} />

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

                <Button
                  size="lg"
                  variant="hero"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={content.length < 100 || selectedPlatforms.length === 0 || isGenerating || (!isUnlimited && credits < totalCreditsNeeded)}
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? "Generating..." : (!isUnlimited && credits < totalCreditsNeeded) ? `Need ${totalCreditsNeeded} Credits` : `Generate Content (${totalCreditsNeeded} credits)`}
                </Button>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <SERPPreview
                  title={serpMeta.title}
                  description={serpMeta.description}
                />
                
                <div>
                  <h3 className="text-2xl font-bold mb-4">Generated Content</h3>
                  <PreviewPane
                    generatedContent={generatedContent}
                    isGenerating={isGenerating}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
