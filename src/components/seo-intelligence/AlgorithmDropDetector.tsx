import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, Calendar, Target, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AlgorithmDrop {
  date: string;
  severity: string;
  avgDrop: number;
  keywords: string[];
  trafficLoss: number;
  algorithm: string;
  diagnosis: string;
  actions: any[];
}

interface AlgorithmDropDetectorProps {
  drops: AlgorithmDrop[];
  onApplyAction?: (dropId: string, actionIndex: number) => void;
  className?: string;
}

export function AlgorithmDropDetector({ drops, onApplyAction, className = "" }: AlgorithmDropDetectorProps) {
  if (!drops || drops.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">No Major Drops Detected</h3>
          <p className="text-sm text-muted-foreground">
            Your rankings appear stable with no significant algorithm-related drops in the last 90 days.
          </p>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return "destructive";
      case "high":
        return "destructive";
      case "moderate":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return "🔴";
      case "high":
        return "🟠";
      case "moderate":
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6 bg-destructive/5 border-destructive/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {drops.length} Algorithm Impact{drops.length > 1 ? "s" : ""} Detected
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Significant ranking changes detected that may be related to Google algorithm updates.
              Review and address these issues to recover lost traffic.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="font-medium">
                  {drops.reduce((sum, d) => sum + d.keywords.length, 0)} Keywords Affected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">
                  ~{drops.reduce((sum, d) => sum + d.trafficLoss, 0).toLocaleString()} Potential Traffic Loss
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Accordion type="single" collapsible className="space-y-3">
        {drops.map((drop, index) => (
          <AccordionItem key={index} value={`drop-${index}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSeverityIcon(drop.severity)}</span>
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      {drop.algorithm}
                      <Badge variant={getSeverityColor(drop.severity)}>
                        {drop.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(drop.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-bold text-destructive">
                      -{drop.avgDrop.toFixed(1)} positions
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {drop.keywords.length} keywords
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 py-4 space-y-4 bg-muted/30">
                {/* Diagnosis */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    AI Diagnosis
                  </h4>
                  <p className="text-sm text-muted-foreground">{drop.diagnosis}</p>
                </div>

                {/* Affected Keywords */}
                <div>
                  <h4 className="font-medium mb-2">Affected Keywords ({drop.keywords.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {drop.keywords.slice(0, 10).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {drop.keywords.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{drop.keywords.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Recovery Actions */}
                <div>
                  <h4 className="font-medium mb-3">Recommended Recovery Actions</h4>
                  <div className="space-y-2">
                    {drop.actions.map((action: any, actionIdx: number) => (
                      <div
                        key={actionIdx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-card border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                action.priority === "high"
                                  ? "destructive"
                                  : action.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {action.priority}
                            </Badge>
                            <span className="text-sm font-medium">{action.action}</span>
                          </div>
                        </div>
                        {onApplyAction && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApplyAction(`${index}`, actionIdx)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="text-center p-3 rounded-lg bg-card">
                    <div className="text-lg font-bold text-destructive">
                      -{drop.trafficLoss.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Estimated Monthly Visits Lost</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card">
                    <div className="text-lg font-bold text-orange-500">
                      {drop.avgDrop.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Average Position Drop</div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
