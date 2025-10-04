import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Cluster {
  name: string;
  label: string;
  keywords: string[];
  centerKeyword: string;
}

interface KeywordClusteringProps {
  projectId: string;
}

export const KeywordClustering = ({ projectId }: KeywordClusteringProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleCluster = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use keyword clustering.",
      });
      return;
    }

    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Empty input",
        description: "Please provide keywords to cluster.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Parse keywords (one per line)
      const keywords = inputText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (keywords.length < 2) {
        throw new Error("Please provide at least 2 keywords to cluster");
      }

      toast({
        title: "Clustering started",
        description: `Processing ${keywords.length} keywords with AI...`,
      });

      const { data, error } = await supabase.functions.invoke("keyword-clustering", {
        body: {
          keywords,
          projectId,
        },
      });

      if (error) throw error;

      setClusters(data.clusters);

      toast({
        title: "Clustering complete!",
        description: `Created ${data.totalClusters} semantic clusters`,
      });
    } catch (error: unknown) {
      console.error("Clustering error:", error);
      toast({
        variant: "destructive",
        title: "Clustering failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getClusterColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-300",
      "bg-green-100 text-green-800 border-green-300",
      "bg-purple-100 text-purple-800 border-purple-300",
      "bg-orange-100 text-orange-800 border-orange-300",
      "bg-pink-100 text-pink-800 border-pink-300",
      "bg-cyan-100 text-cyan-800 border-cyan-300",
      "bg-yellow-100 text-yellow-800 border-yellow-300",
      "bg-indigo-100 text-indigo-800 border-indigo-300",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Semantic Keyword Clustering
          </CardTitle>
          <CardDescription>
            Group keywords by semantic similarity using AI embeddings. Perfect for content
            planning and topic discovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Keywords (one per line)</Label>
            <Textarea
              placeholder="seo tools&#10;keyword research&#10;backlink checker&#10;rank tracker&#10;seo audit&#10;link building&#10;content optimization"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              {inputText.split("\n").filter((l) => l.trim()).length} keywords
            </p>
          </div>

          <div className="space-y-2">
            <Label>Or Upload TXT/CSV File</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="cluster-file-upload"
              />
              <Button variant="outline" asChild className="w-full">
                <label htmlFor="cluster-file-upload" className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </Button>
            </div>
          </div>

          <Button onClick={handleCluster} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Clustering with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Semantic Clustering
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI generates semantic embeddings for each keyword</li>
              <li>Keywords are grouped by similarity (cosine distance)</li>
              <li>Each cluster gets an AI-generated descriptive label</li>
              <li>Results are saved to your project for future reference</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {clusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clustering Results</CardTitle>
            <CardDescription>
              {clusters.length} semantic clusters discovered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {clusters.map((cluster, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${getClusterColor(index)} font-semibold`}
                    >
                      {cluster.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {cluster.keywords.length} keywords
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.keywords.map((keyword, kidx) => (
                      <Badge
                        key={kidx}
                        variant={keyword === cluster.centerKeyword ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {keyword}
                        {keyword === cluster.centerKeyword && " ⭐"}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
