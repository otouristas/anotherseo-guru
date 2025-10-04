import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, TrendingUp, CircleAlert as AlertCircle, Loader as Loader2, Download } from "lucide-react";
import { GSCDataAnalyzer } from "./GSCDataAnalyzer";
import { AlgorithmDropDetector } from "./AlgorithmDropDetector";
import { KeywordOpportunities } from "./KeywordOpportunities";
import { AIRecommendations } from "./AIRecommendations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SEOIntelligenceDashboardProps {
  content: string;
  url?: string;
  keywords?: string[];
  projectId?: string;
  userId: string;
  onApplyRecommendations?: (recommendations: unknown[]) => void;
}

export function SEOIntelligenceDashboard({
  content,
  url,
  keywords = [],
  projectId,
  userId,
  onApplyRecommendations,
}: SEOIntelligenceDashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<unknown>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();

  const runAnalysis = async () => {
    if (content.length < 100) {
      toast({
        title: "Content too short",
        description: "Please provide at least 100 characters of content for analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log("Starting SEO intelligence analysis with:", {
        contentLength: content.length,
        hasUrl: !!url,
        keywordsCount: keywords.length,
        hasProjectId: !!projectId,
        hasUserId: !!userId,
      });

      const { data, error } = await supabase.functions.invoke("seo-intelligence-analyzer", {
        body: {
          userId,
          projectId,
          content,
          url,
          keywords,
          llmModel: "gemini-2.5-flash",
        },
      });

      console.log("Response received:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to invoke edge function");
      }

      if (!data) {
        throw new Error("No data returned from analysis");
      }

      if (!data.success) {
        const errorMsg = data.error || "Analysis failed";
        const details = data.details ? ` Details: ${data.details}` : "";
        throw new Error(errorMsg + details);
      }

      setAnalysisData(data);

      toast({
        title: "Analysis Complete!",
        description: `Generated ${data.recommendations?.length || 0} recommendations in ${(data.processingTime / 1000).toFixed(1)}s`,
      });

      setSelectedTab("recommendations");
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to complete analysis";

      toast({
        title: "Analysis Failed",
        description: errorMessage.length > 200 ? errorMessage.substring(0, 200) + "..." : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    if (!analysisData) return;

    const report = {
      generatedAt: new Date().toISOString(),
      url: url || "N/A",
      optimizationScore: analysisData.optimizationScore,
      gscData: analysisData.gscData,
      algorithmDrops: analysisData.algorithmDrops,
      keywordOpportunities: analysisData.keywordOpportunities,
      recommendations: analysisData.recommendations,
      aiAnalysis: analysisData.aiAnalysis,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url_blob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url_blob;
    a.download = `seo-intelligence-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url_blob);

    toast({
      title: "Report Exported",
      description: "SEO Intelligence report has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">SEO Intelligence Engine</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered analysis combining Google Search Console data, DataForSEO intelligence, and
              2025 algorithm insights
            </p>
          </div>
          {analysisData && (
            <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          )}
        </div>

        {!analysisData && (
          <div className="mt-6">
            <Button
              size="lg"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing... This may take 30-60 seconds
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run Comprehensive SEO Analysis
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Analyzes GSC data, detects algorithm impacts, identifies opportunities, and generates
              AI recommendations
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analyzing content and performance data...</span>
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}

        {analysisData && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-primary">
                {analysisData.optimizationScore}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Optimization Score</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-green-600">
                {analysisData.keywordOpportunities?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Opportunities</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-orange-600">
                {analysisData.algorithmDrops?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Drops Detected</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-blue-600">
                {analysisData.recommendations?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">AI Actions</div>
            </div>
          </div>
        )}
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gsc">
              GSC Data
              {analysisData.gscData?.totalKeywords > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {analysisData.gscData.totalKeywords}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="drops">
              Drops
              {analysisData.algorithmDrops?.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {analysisData.algorithmDrops.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              Opportunities
              <Badge variant="default" className="ml-2">
                {analysisData.keywordOpportunities?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              AI Actions
              <Badge variant="default" className="ml-2">
                {analysisData.recommendations?.length || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {analysisData.aiAnalysis?.summary || "Analysis completed successfully"}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Traffic Impact Potential</div>
                    <div className="text-2xl font-bold text-green-600">
                      +{analysisData.aiAnalysis?.trafficImpact?.toLocaleString() || 0} visits/month
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated traffic increase if all recommendations are implemented
                    </p>
                  </div>
                </div>

                {analysisData.algorithmDrops?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <div className="font-medium">Algorithm Impacts Detected</div>
                      <div className="text-2xl font-bold text-destructive">
                        {analysisData.algorithmDrops.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Significant ranking drops requiring immediate attention
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {analysisData.competitorData?.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Competitor Insights</h3>
                <div className="space-y-3">
                  {analysisData.competitorData.slice(0, 5).map((comp: unknown, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
                      <Badge variant="outline">#{comp.position}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{comp.domain}</div>
                        <div className="text-xs text-muted-foreground">
                          {comp.contentLength} chars
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gsc" className="mt-6">
            <GSCDataAnalyzer gscData={analysisData.gscData} />
          </TabsContent>

          <TabsContent value="drops" className="mt-6">
            <AlgorithmDropDetector drops={analysisData.algorithmDrops || []} />
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <KeywordOpportunities opportunities={analysisData.keywordOpportunities || []} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <AIRecommendations
              recommendations={analysisData.recommendations || []}
              onApplyRecommendation={(rec) => {
                toast({
                  title: "Recommendation Applied",
                  description: `"${rec.title}" has been marked as applied`,
                });
                if (onApplyRecommendations) {
                  onApplyRecommendations([rec]);
                }
              }}
              onDismissRecommendation={(rec) => {
                toast({
                  title: "Recommendation Dismissed",
                  description: `"${rec.title}" has been dismissed`,
                });
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
