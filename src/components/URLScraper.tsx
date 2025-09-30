import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface URLScraperProps {
  onContentScraped: (content: string, metadata?: { title?: string; description?: string }) => void;
}

export const URLScraper = ({ onContentScraped }: URLScraperProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedSuccess, setScrapedSuccess] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setScrapedSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.content) {
        onContentScraped(data.content, {
          title: data.title,
          description: data.description,
        });
        
        setScrapedSuccess(true);
        toast({
          title: "Content Scraped! ✨",
          description: `Successfully extracted ${data.content.length} characters from the URL`,
        });

        // Reset after a delay
        setTimeout(() => {
          setUrl("");
          setScrapedSuccess(false);
        }, 2000);
      } else {
        throw new Error("No content extracted from the URL");
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "Failed to scrape content from URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Scrape Content from URL</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Extract content from any public webpage using AI-powered web scraping
      </p>

      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleScrape();
            }
          }}
        />
        <Button
          onClick={handleScrape}
          disabled={isLoading || !url}
          className="whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : scrapedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Scraped!
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              Scrape
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Extracts main content automatically
        </p>
        <p className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Works with blogs, articles, and documentation
        </p>
        <p className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          May not work with dynamic or protected content
        </p>
      </div>
    </Card>
  );
};
