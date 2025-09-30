import { useState } from "react";
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
import { Sparkles, Zap, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContent {
  platform: string;
  content: string;
}

const Repurpose = () => {
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
  const { toast } = useToast();

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
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

      toast({
        title: "Content Generated! ✨",
        description: `Successfully created ${selectedPlatforms.length} platform version${selectedPlatforms.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
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
            Transform your original content into platform-optimized versions with AI-powered rewriting, SEO optimization, and anchor link integration
          </p>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="p-8 md:p-12 shadow-strong">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Input & Controls */}
              <div className="space-y-6">
                <Tabs defaultValue="type" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="type">
                      <FileText className="w-4 h-4 mr-2" />
                      Type Content
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="type" className="mt-4">
                    <ContentInput value={content} onChange={setContent} />
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
                  disabled={content.length < 100 || selectedPlatforms.length === 0 || isGenerating}
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? "Generating..." : "Generate Optimized Content"}
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
};

export default Repurpose;
