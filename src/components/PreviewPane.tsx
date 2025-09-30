import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogIcon, MediumIcon, LinkedInIcon, RedditIcon, QuoraIcon, TwitterIcon } from "@/components/PlatformLogos";

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
};

export const PreviewPane = ({ generatedContent, isGenerating }: PreviewPaneProps) => {
  const { toast } = useToast();

  const copyToClipboard = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
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
      description: `${platform} content downloaded`,
    });
  };
  if (isGenerating) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-card to-muted/20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">Generating Your Content</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Our AI is crafting platform-optimized versions of your content...
        </p>
      </Card>
    );
  }

  if (generatedContent.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-card to-muted/20">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold mb-2">Ready to Transform</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your repurposed content will appear here. Select platforms and click Generate to start.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 min-h-[400px]">
      <Tabs defaultValue={generatedContent[0]?.platform} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {generatedContent.map((content) => {
            const IconComponent = platformIcons[content.platform];
            return (
              <TabsTrigger key={content.platform} value={content.platform} className="gap-2">
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {content.platform.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {generatedContent.map((content) => {
          const IconComponent = platformIcons[content.platform];
          return (
            <TabsContent key={content.platform} value={content.platform} className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm flex items-center gap-2">
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  {content.platform.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')} Version
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {content.content.length} characters
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(content.content, content.platform)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadContent(content.content, content.platform)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed p-4 bg-muted/30 rounded-lg">
                  {content.content}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
};
