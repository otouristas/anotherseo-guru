import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Copy, Calendar, Tag, FileText } from "lucide-react";
import { BlogIcon, MediumIcon, LinkedInIcon, RedditIcon, QuoraIcon, TwitterIcon, InstagramIcon, TikTokIcon } from "@/components/PlatformLogos";
import { PlatformMockup } from "@/components/PlatformMockups";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentItem {
  id: string;
  platform: string;
  generated_content: string;
  tone: string | null;
  style: string | null;
  keywords: string[] | null;
  created_at: string;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "seo-blog": BlogIcon,
  "medium": MediumIcon,
  "linkedin": LinkedInIcon,
  "reddit": RedditIcon,
  "quora": QuoraIcon,
  "twitter": TwitterIcon,
  "instagram": InstagramIcon,
  "tiktok": TikTokIcon,
};

export const ContentHistory = () => {
  const [history, setHistory] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to load content history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(history.filter(item => item.id !== id));
      toast({
        title: "Deleted! 🗑️",
        description: "Content removed from history",
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const copyContent = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied! ✨",
      description: `${platform} content copied to clipboard`,
    });
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Content History</h3>
        <p className="text-muted-foreground">
          Generated content will appear here for future reference
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => {
        const IconComponent = platformIcons[item.platform];
        const platformName = item.platform.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        return (
          <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    {platformName}
                  </Badge>
                  {item.tone && (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {item.tone}
                    </Badge>
                  )}
                  {item.style && (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {item.style}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground line-clamp-2">
                  {item.generated_content.substring(0, 150)}...
                </div>

                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {item.keywords.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{item.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedContent(item)}
                    >
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                        {platformName} Content
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                      {selectedContent && (
                        <PlatformMockup 
                          platform={selectedContent.platform} 
                          content={selectedContent.generated_content} 
                        />
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyContent(item.generated_content, platformName)}
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteContent(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
