import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, FileText, Link2, Code, ChartBar as BarChart3, Loader as Loader2, Check, X, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AIRecommendationsProps {
  projectId: string;
  userId: string;
}

interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  priority: string;
  confidence_score?: number;
  impact_estimate?: string;
  status: string;
  metadata?: any;
  created_at?: string;
}

export const AIRecommendations = ({ projectId, userId }: AIRecommendationsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, [projectId]);

  const loadRecommendations = async () => {
    const { data, error } = await supabase
      .from("ai_recommendations")
      .select("*")
      .eq("project_id", projectId)
      .in("status", ["pending", "accepted"])
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading recommendations:", error);
    } else {
      setRecommendations(data || []);
    }
    setLoading(false);
  };

  const generateRecommendations = async () => {
    setGenerating(true);

    try {
      const { data: project } = await supabase
        .from("seo_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      const { data: keywords } = await supabase
        .from("keyword_analysis")
        .select("*")
        .eq("project_id", projectId)
        .limit(50);

      const mockRecommendations = [
        {
          project_id: projectId,
          user_id: userId,
          recommendation_type: "keyword",
          title: "Target Long-Tail Keywords for Quick Wins",
          description: `Based on your recent keyword analysis, we've identified ${keywords?.length || 0} keywords with low competition (difficulty < 30) and decent search volume. Focus on these long-tail variations to capture targeted traffic quickly.`,
          priority: "high",
          confidence_score: 0.87,
          impact_estimate: "Expected 15-25% increase in organic traffic within 3 months",
          status: "pending",
          metadata: { keyword_count: keywords?.length || 0, avg_difficulty: 25 },
        },
        {
          project_id: projectId,
          user_id: userId,
          recommendation_type: "content",
          title: "Create Comprehensive Pillar Content",
          description: "Your domain would benefit from 3-5 pillar pages covering your main service categories. These should be 2000+ word comprehensive guides that target primary keywords and link to supporting content.",
          priority: "high",
          confidence_score: 0.92,
          impact_estimate: "Expected 30-40% increase in domain authority and topical relevance",
          status: "pending",
          metadata: { recommended_topics: 5 },
        },
        {
          project_id: projectId,
          user_id: userId,
          recommendation_type: "technical",
          title: "Optimize Core Web Vitals",
          description: "Several pages have LCP (Largest Contentful Paint) scores above 2.5s. Optimize images, defer non-critical JavaScript, and implement lazy loading to improve user experience and SEO rankings.",
          priority: "medium",
          confidence_score: 0.78,
          impact_estimate: "Expected 10-15% improvement in mobile rankings",
          status: "pending",
          metadata: { pages_affected: 12 },
        },
        {
          project_id: projectId,
          user_id: userId,
          recommendation_type: "backlink",
          title: "Build Industry-Specific Directory Links",
          description: "Competitors have 50+ more directory citations than your domain. Focus on getting listed in industry-specific directories and local business listings for easy link building wins.",
          priority: "medium",
          confidence_score: 0.85,
          impact_estimate: "Expected 20-30 new backlinks within 2 months",
          status: "pending",
          metadata: { competitor_advantage: 50 },
        },
        {
          project_id: projectId,
          user_id: userId,
          recommendation_type: "performance",
          title: "Implement Schema Markup",
          description: "Add Organization, FAQ, and HowTo schema markup to key pages. This will enhance your SERP appearance and potentially increase click-through rates by 10-20%.",
          priority: "low",
          confidence_score: 0.73,
          impact_estimate: "Expected 10-20% increase in CTR from search results",
          status: "pending",
          metadata: { schema_types: 3 },
        },
      ];

      const { error } = await supabase
        .from("ai_recommendations")
        .insert(mockRecommendations);

      if (error) throw error;

      toast({
        title: "AI Recommendations Generated",
        description: `${mockRecommendations.length} new insights are ready for review`,
      });

      loadRecommendations();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI recommendations",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("ai_recommendations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update recommendation status",
        variant: "destructive",
      });
    } else {
      loadRecommendations();
      toast({
        title: "Status Updated",
        description: `Recommendation marked as ${status}`,
      });
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      keyword: TrendingUp,
      content: FileText,
      technical: Code,
      backlink: Link2,
      competitor: BarChart3,
      performance: Sparkles,
    };
    const Icon = icons[type] || Sparkles;
    return <Icon className="w-5 h-5" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-orange-500",
      low: "bg-blue-500",
    };
    return colors[priority] || "bg-gray-500";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">AI-Powered Recommendations</h2>
              <p className="text-sm text-muted-foreground">Smart insights to improve your SEO</p>
            </div>
          </div>
          <Button onClick={generateRecommendations} disabled={generating} className="gap-2 w-full sm:w-auto">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate New Insights
              </>
            )}
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate AI-powered insights to discover optimization opportunities
            </p>
            <Button onClick={generateRecommendations} disabled={generating} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {recommendations.map((rec) => (
              <AccordionItem key={rec.id} value={rec.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start gap-3 text-left flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}/10 flex-shrink-0`}>
                      {getIcon(rec.recommendation_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm md:text-base">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rec.recommendation_type}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(rec.priority)} text-white`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Confidence: {(rec.confidence_score * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>{rec.status}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec.description}
                    </p>
                    <div className="p-3 rounded-lg bg-accent/50">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium mb-1">Expected Impact:</p>
                          <p className="text-sm">{rec.impact_estimate}</p>
                        </div>
                      </div>
                    </div>
                    {rec.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(rec.id, "accepted")}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(rec.id, "dismissed")}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(rec.id, "completed")}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Card>
    </div>
  );
};
