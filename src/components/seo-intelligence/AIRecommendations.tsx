import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ThumbsUp, ThumbsDown, Code, TrendingUp, Clock, Target, CircleCheck as CheckCircle2, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Recommendation {
  id?: string;
  category: string;
  title: string;
  description: string;
  steps?: any[];
  detailedSteps?: any[];
  impactScore: number;
  effortLevel: string;
  priorityLevel: string;
  trafficLift?: number;
  estimatedTrafficLift?: number;
  timeHours?: number;
  implementationTimeHours?: number;
  codeExamples?: any[];
  examples?: any;
  beforeAfterExamples?: any;
  relatedKeywords?: string[];
}

interface AIRecommendationsProps {
  recommendations: Recommendation[];
  onApplyRecommendation?: (rec: Recommendation) => void;
  onDismissRecommendation?: (rec: Recommendation) => void;
  className?: string;
}

export function AIRecommendations({
  recommendations,
  onApplyRecommendation,
  onDismissRecommendation,
  className = "",
}: AIRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-sm text-muted-foreground">
            Run an SEO intelligence analysis to get AI-powered recommendations
          </p>
        </div>
      </Card>
    );
  }

  const categories = Array.from(new Set(recommendations.map((r) => r.category)));
  const filteredRecs =
    selectedCategory === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === selectedCategory);

  const criticalRecs = recommendations.filter((r) => r.priorityLevel === "critical");
  const highRecs = recommendations.filter((r) => r.priorityLevel === "high");
  const totalTrafficPotential = recommendations.reduce(
    (sum, r) => sum + (r.trafficLift || r.estimatedTrafficLift || 0),
    0
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-500/10";
      case "medium":
        return "text-orange-600 bg-orange-500/10";
      case "high":
        return "text-red-600 bg-red-500/10";
      default:
        return "text-gray-600 bg-gray-500/10";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">AI-Powered SEO Recommendations</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Detailed, actionable recommendations based on your performance data and 2025 SEO best practices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-card border">
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Actions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">{criticalRecs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Critical</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-2xl font-bold text-primary">{highRecs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">High Priority</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">
              +{totalTrafficPotential.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Potential Traffic</div>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-auto-fit gap-2" style={{ gridTemplateColumns: `repeat(${categories.length + 1}, minmax(0, 1fr))` }}>
          <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat} ({recommendations.filter((r) => r.category === cat).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredRecs.map((rec, index) => (
              <AccordionItem
                key={index}
                value={`rec-${index}`}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className={`p-2 rounded-lg ${rec.category === "Algorithm Recovery" ? "bg-red-500/10" : rec.category === "Quick Wins" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                        <Target className={`w-5 h-5 ${rec.category === "Algorithm Recovery" ? "text-red-500" : rec.category === "Quick Wins" ? "text-green-500" : "text-blue-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant={getPriorityColor(rec.priorityLevel)}>
                            {rec.priorityLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          +{(rec.trafficLift || rec.estimatedTrafficLift || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">potential traffic</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(rec.effortLevel)}`}>
                        {rec.effortLevel} effort
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="px-6 py-4 space-y-4 bg-muted/30">
                    {/* Description */}
                    <div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Impact Score</div>
                          <div className="font-bold">{rec.impactScore}/100</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Time Needed</div>
                          <div className="font-bold">{rec.timeHours || rec.implementationTimeHours || 0}h</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                        <Target className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Priority</div>
                          <div className="font-bold capitalize">{rec.priorityLevel}</div>
                        </div>
                      </div>
                    </div>

                    {/* Implementation Steps */}
                    {(rec.steps || rec.detailedSteps) && (rec.steps?.length > 0 || rec.detailedSteps?.length > 0) && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Implementation Steps
                        </h4>
                        <div className="space-y-2">
                          {(rec.steps || rec.detailedSteps || []).map((step: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-card border"
                            >
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                                {step.step || idx + 1}
                              </div>
                              <div className="flex-1 text-sm">
                                {step.action || step}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Examples */}
                    {rec.codeExamples && rec.codeExamples.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Code Examples
                        </h4>
                        {rec.codeExamples.map((example: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            {example.title && (
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {example.title}
                              </div>
                            )}
                            <pre className="p-3 rounded-lg bg-card border text-xs overflow-x-auto">
                              <code>{example.code || example}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Related Keywords */}
                    {rec.relatedKeywords && rec.relatedKeywords.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Related Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.relatedKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t">
                      {onApplyRecommendation && (
                        <Button
                          onClick={() => onApplyRecommendation(rec)}
                          className="gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Apply Recommendation
                        </Button>
                      )}
                      {onDismissRecommendation && (
                        <Button
                          variant="outline"
                          onClick={() => onDismissRecommendation(rec)}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
