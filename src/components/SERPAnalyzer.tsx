import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Image, Sparkles, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SERPAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("United States");
  const [results, setResults] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  
  const { toast } = useToast();

  const analyzeSERP = async (type: 'organic' | 'ai_mode' | 'maps' | 'images') => {
    if (!keyword || keyword.length < 2) {
      toast({
        title: "Keyword required",
        description: "Please enter a keyword to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const actionMap = {
        organic: 'google_organic',
        ai_mode: 'google_ai_mode',
        maps: 'google_maps',
        images: 'google_images'
      };

      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: actionMap[type],
          keyword: keyword,
          location: location,
          depth: type === 'organic' ? 10 : type === 'ai_mode' ? 20 : 100
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result) {
        setResults({ type, data: result });
        toast({
          title: "SERP analysis complete!",
          description: `Found ${result.items?.length || 0} results`
        });
      }
    } catch (error) {
      console.error('SERP analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze SERP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async (taskId: string) => {
    if (!aiPrompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for the AI summary",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'serp_ai_summary',
          task_id: taskId,
          prompt: aiPrompt,
          include_links: true,
          fetch_content: true
        }
      });

      if (error) throw error;

      const summary = data?.tasks?.[0]?.result?.[0]?.items?.[0]?.summary;
      if (summary) {
        setAiSummary(summary);
        toast({
          title: "AI summary generated!",
          description: "SERP content has been summarized"
        });
      }
    } catch (error) {
      console.error('AI summary error:', error);
      toast({
        title: "Summary failed",
        description: error instanceof Error ? error.message : "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Advanced SERP Analyzer</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyze Google search results with AI-powered insights
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serp-keyword">Keyword</Label>
            <Input
              id="serp-keyword"
              placeholder="e.g., content marketing tools"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serp-location">Location</Label>
            <Input
              id="serp-location"
              placeholder="e.g., United States"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Analysis Buttons */}
        <Tabs defaultValue="organic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organic">
              <Search className="w-4 h-4 mr-1" />
              Organic
            </TabsTrigger>
            <TabsTrigger value="ai_mode">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Mode
            </TabsTrigger>
            <TabsTrigger value="maps">
              <MapPin className="w-4 h-4 mr-1" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="w-4 h-4 mr-1" />
              Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organic" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze organic search results with complete SERP overview
            </p>
            <Button
              onClick={() => analyzeSERP('organic')}
              disabled={loading || !keyword}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Analyze Organic SERP
            </Button>
          </TabsContent>

          <TabsContent value="ai_mode" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get results from Google's AI-powered search mode (US, UK, India only)
            </p>
            <Button
              onClick={() => analyzeSERP('ai_mode')}
              disabled={loading || !keyword}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze AI Mode SERP
            </Button>
          </TabsContent>

          <TabsContent value="maps" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze local search results from Google Maps
            </p>
            <Button
              onClick={() => analyzeSERP('maps')}
              disabled={loading || !keyword}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
              Analyze Maps SERP
            </Button>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze image search results from Google Images
            </p>
            <Button
              onClick={() => analyzeSERP('images')}
              disabled={loading || !keyword}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Image className="w-4 h-4 mr-2" />}
              Analyze Images SERP
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        {results && (
          <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {results.type.toUpperCase()} Results
              </Label>
              <Badge variant="secondary">
                {results.data.items?.length || 0} items
              </Badge>
            </div>

            {/* AI Summary Option */}
            {results.data.id && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm">Generate AI Summary</Label>
                <Textarea
                  placeholder="Enter a prompt for AI summary (e.g., 'summarize the top results for this keyword')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={() => generateAISummary(results.data.id)}
                  disabled={loading || !aiPrompt}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate AI Summary
                </Button>
              </div>
            )}

            {aiSummary && (
              <div className="space-y-2 p-3 bg-primary/5 border border-primary/10 rounded">
                <Label className="text-xs font-semibold">AI Summary:</Label>
                <p className="text-sm whitespace-pre-wrap">{aiSummary}</p>
              </div>
            )}

            {/* Basic Results Preview */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.data.items?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="p-2 bg-background border rounded text-xs">
                  <div className="font-medium truncate">
                    {item.title || item.name || item.alt || 'Untitled'}
                  </div>
                  {item.url && (
                    <div className="text-muted-foreground truncate">{item.url}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
