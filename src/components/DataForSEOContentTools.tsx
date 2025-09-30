import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Tags, FileText, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataForSEOContentToolsProps {
  content: string;
  onMetaGenerated?: (title: string, description: string) => void;
  onSubtopicsGenerated?: (subtopics: string[]) => void;
  onContentGenerated?: (text: string) => void;
}

export function DataForSEOContentTools({ 
  content, 
  onMetaGenerated,
  onSubtopicsGenerated,
  onContentGenerated 
}: DataForSEOContentToolsProps) {
  const [loading, setLoading] = useState(false);
  const [generatedMeta, setGeneratedMeta] = useState<{ title: string; description: string } | null>(null);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  
  // Parameters
  const [topic, setTopic] = useState("");
  const [textToParaphrase, setTextToParaphrase] = useState("");
  const [creativity, setCreativity] = useState([0.8]);
  const [wordCount, setWordCount] = useState(300);
  
  const { toast } = useToast();

  const generateMetaTags = async () => {
    if (!content || content.length < 50) {
      toast({
        title: "Content too short",
        description: "Please provide at least 50 characters to generate meta tags",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'generate_meta_tags',
          text: content.slice(0, 500), // Limit to 500 characters
          creativity_index: creativity[0]
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result?.title && result?.description) {
        setGeneratedMeta({ title: result.title, description: result.description });
        if (onMetaGenerated) {
          onMetaGenerated(result.title, result.description);
        }
        toast({
          title: "Meta tags generated!",
          description: "SEO-optimized title and description created"
        });
      }
    } catch (error) {
      console.error('Meta generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate meta tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSubtopics = async () => {
    if (!topic || topic.length < 3) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate subtopics",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'generate_sub_topics',
          topic: topic,
          creativity_index: creativity[0]
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result?.sub_topics && Array.isArray(result.sub_topics)) {
        setSubtopics(result.sub_topics);
        if (onSubtopicsGenerated) {
          onSubtopicsGenerated(result.sub_topics);
        }
        toast({
          title: "Subtopics generated!",
          description: `Generated ${result.sub_topics.length} subtopic ideas`
        });
      }
    } catch (error) {
      console.error('Subtopics generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate subtopics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const paraphraseText = async () => {
    if (!textToParaphrase || textToParaphrase.length < 20) {
      toast({
        title: "Text too short",
        description: "Please provide at least 20 characters to paraphrase",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'paraphrase',
          text: textToParaphrase.slice(0, 500),
          creativity_index: creativity[0]
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result?.generated_text) {
        setParaphrasedText(result.generated_text);
        if (onContentGenerated) {
          onContentGenerated(result.generated_text);
        }
        toast({
          title: "Text paraphrased!",
          description: "Generated alternative version"
        });
      }
    } catch (error) {
      console.error('Paraphrase error:', error);
      toast({
        title: "Paraphrasing failed",
        description: error instanceof Error ? error.message : "Failed to paraphrase text",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!topic || topic.length < 3) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate content",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'generate_text',
          topic: topic,
          word_count: wordCount,
          sub_topics: subtopics.slice(0, 3),
          creativity_index: creativity[0],
          include_conclusion: true
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result?.generated_text) {
        setGeneratedText(result.generated_text);
        if (onContentGenerated) {
          onContentGenerated(result.generated_text);
        }
        toast({
          title: "Content generated!",
          description: `Generated ${wordCount} words of content`
        });
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
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
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">DataForSEO AI Content Tools</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate meta tags, subtopics, and paraphrase content using DataForSEO's AI
          </p>
        </div>

        {/* Creativity Slider - Global */}
        <div className="space-y-2">
          <Label className="text-sm">Creativity Level: {creativity[0].toFixed(1)}</Label>
          <Slider
            value={creativity}
            onValueChange={setCreativity}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher values = more creative but less predictable output
          </p>
        </div>

        <Tabs defaultValue="meta" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meta">
              <Tags className="w-4 h-4 mr-1" />
              Meta
            </TabsTrigger>
            <TabsTrigger value="subtopics">
              <FileText className="w-4 h-4 mr-1" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="paraphrase">
              <RefreshCw className="w-4 h-4 mr-1" />
              Rewrite
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Wand2 className="w-4 h-4 mr-1" />
              Create
            </TabsTrigger>
          </TabsList>

          {/* Meta Tags Generation */}
          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Generate SEO-optimized meta title and description from your content
              </p>
              <Button
                onClick={generateMetaTags}
                disabled={loading || !content}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Tags className="w-4 h-4 mr-2" />}
                Generate Meta Tags
              </Button>
            </div>

            {generatedMeta && (
              <div className="space-y-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Title ({generatedMeta.title.length} chars)</Label>
                  <p className="text-sm">{generatedMeta.title}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Description ({generatedMeta.description.length} chars)</Label>
                  <p className="text-sm text-muted-foreground">{generatedMeta.description}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Subtopics Generation */}
          <TabsContent value="subtopics" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., SEO strategies for 2025"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              onClick={generateSubtopics}
              disabled={loading || !topic}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Subtopics
            </Button>

            {subtopics.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Generated Subtopics:</Label>
                <div className="flex flex-wrap gap-2">
                  {subtopics.map((subtopic, idx) => (
                    <Badge key={idx} variant="secondary">
                      {subtopic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Paraphrase */}
          <TabsContent value="paraphrase" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paraphrase-text">Text to Paraphrase</Label>
              <Textarea
                id="paraphrase-text"
                placeholder="Paste the text you want to rewrite..."
                value={textToParaphrase}
                onChange={(e) => setTextToParaphrase(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={paraphraseText}
              disabled={loading || !textToParaphrase}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Paraphrase Text
            </Button>

            {paraphrasedText && (
              <div className="space-y-2 p-4 bg-success/10 border border-success/20 rounded-lg">
                <Label className="text-sm font-semibold">Paraphrased Version:</Label>
                <p className="text-sm">{paraphrasedText}</p>
              </div>
            )}
          </TabsContent>

          {/* Generate Content */}
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gen-topic">Content Topic</Label>
              <Input
                id="gen-topic"
                placeholder="e.g., Benefits of AI in content marketing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Word Count: {wordCount}</Label>
              <Slider
                value={[wordCount]}
                onValueChange={(val) => setWordCount(val[0])}
                min={50}
                max={1000}
                step={50}
                className="w-full"
              />
            </div>

            <Button
              onClick={generateContent}
              disabled={loading || !topic}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Generate Content
            </Button>

            {generatedText && (
              <div className="space-y-2 p-4 bg-success/10 border border-success/20 rounded-lg">
                <Label className="text-sm font-semibold">Generated Content:</Label>
                <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
