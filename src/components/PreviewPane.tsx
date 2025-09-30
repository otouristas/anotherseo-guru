import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download, Check, Sparkles, TrendingUp, BarChart3, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogIcon, MediumIcon, LinkedInIcon, RedditIcon, QuoraIcon, TwitterIcon, InstagramIcon, YoutubeIcon, NewsletterIcon, TikTokIcon } from "@/components/PlatformLogos";
import { PlatformMockup } from "@/components/PlatformMockups";
import { useState } from "react";

interface GeneratedContent {
  platform: string;
  content: string;
}

interface PreviewPaneProps {
  generatedContent: GeneratedContent[];
  isGenerating: boolean;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "seo-blog": BlogIcon,
  "medium": MediumIcon,
  "linkedin": LinkedInIcon,
  "reddit": RedditIcon,
  "quora": QuoraIcon,
  "twitter": TwitterIcon,
  "instagram": InstagramIcon,
  "youtube": YoutubeIcon,
  "newsletter": NewsletterIcon,
  "tiktok": TikTokIcon,
};

const platformColors: Record<string, string> = {
  "linkedin": "bg-[hsl(201,100%,35%)] dark:bg-[hsl(201,100%,45%)]",
  "twitter": "bg-[hsl(203,89%,53%)] dark:bg-[hsl(203,89%,63%)]",
  "instagram": "bg-gradient-to-br from-purple-500 to-pink-500",
  "reddit": "bg-[hsl(16,100%,50%)] dark:bg-[hsl(16,100%,60%)]",
  "medium": "bg-[hsl(0,0%,0%)] dark:bg-[hsl(0,0%,90%)]",
  "quora": "bg-[hsl(357,75%,53%)] dark:bg-[hsl(357,75%,63%)]",
  "youtube": "bg-[hsl(0,100%,50%)] dark:bg-[hsl(0,100%,60%)]",
  "tiktok": "bg-[hsl(349,100%,50%)] dark:bg-[hsl(349,100%,60%)]",
  "newsletter": "bg-primary dark:bg-primary",
  "seo-blog": "bg-primary dark:bg-primary",
};

export const PreviewPane = ({ generatedContent, isGenerating }: PreviewPaneProps) => {
  const { toast } = useToast();
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const copyToClipboard = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
    toast({
      title: "Copied!",
      description: `${platform} content copied to clipboard`,
    });
  };

  const downloadContent = (content: string, platform: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${platform} content saved`,
    });
  };

  const copyAllContent = () => {
    const allContent = generatedContent
      .map(item => {
        const platformName = item.platform.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return `=== ${platformName} ===\n\n${item.content}\n\n`;
      })
      .join('\n');
    
    navigator.clipboard.writeText(allContent);
    toast({
      title: "All content copied!",
      description: `${generatedContent.length} platform versions copied`,
    });
  };

  const getTotalCharacters = () => {
    return generatedContent.reduce((sum, item) => sum + item.content.length, 0);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="p-12 flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted/20 border-primary/20">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Generating Your Content
          </h3>
          <p className="text-muted-foreground text-center max-w-md text-lg">
            Our AI is crafting platform-optimized versions...
          </p>
          <div className="mt-6 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </Card>
      </div>
    );
  }

  if (generatedContent.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="p-12 flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted/20">
          <div className="text-7xl mb-6 animate-bounce">✨</div>
          <h3 className="text-2xl font-bold mb-3">Ready to Transform</h3>
          <p className="text-muted-foreground text-center max-w-md text-lg">
            Your repurposed content will appear here. Select platforms and click Generate to start.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Results Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Sparkles className="w-6 h-6 text-success" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Content Generated Successfully!
                </h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Your content has been optimized for {generatedContent.length} platform{generatedContent.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <Button onClick={copyAllContent} size="lg" className="gap-2">
              <Copy className="w-5 h-5" />
              Copy All Content
            </Button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{generatedContent.length}</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-secondary/10">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{getTotalCharacters().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Characters</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Optimized</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {generatedContent.map((content) => {
          const IconComponent = platformIcons[content.platform];
          const platformName = content.platform.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          const isCopied = copiedPlatform === content.platform;
          const isExpanded = expandedPlatform === content.platform;
          const platformColor = platformColors[content.platform] || "bg-primary";
          
          return (
            <Card 
              key={content.platform} 
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            >
              {/* Platform Header */}
              <div className={`${platformColor} p-4 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{platformName}</h3>
                      <p className="text-white/80 text-sm">{content.content.length} characters</p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                    Ready
                  </Badge>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-6 space-y-4">
                {/* Character Count Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Character Count</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-success via-success to-primary transition-all duration-300"
                        style={{ width: `${Math.min((content.content.length / 2000) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-medium">{content.content.length}</span>
                  </div>
                </div>

                {/* Platform Mockup */}
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <PlatformMockup platform={content.platform} content={content.content} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={isCopied ? "default" : "outline"}
                    onClick={() => copyToClipboard(content.content, platformName)}
                    className="flex-1 gap-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadContent(content.content, platformName)}
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                {/* Engagement Metrics Simulation */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary">4.2K</div>
                    <div className="text-xs text-muted-foreground">Est. Reach</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-secondary">89%</div>
                    <div className="text-xs text-muted-foreground">Quality</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-accent">High</div>
                    <div className="text-xs text-muted-foreground">SEO Score</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
