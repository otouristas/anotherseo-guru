import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface KeywordOpportunity {
  keyword: string;
  currentPosition: number;
  targetPosition: number;
  searchVolume: number;
  difficulty: number;
  trafficPotential: number;
  type: string;
  priorityScore: number;
  quickWin: boolean;
  actions: any[];
}

interface KeywordOpportunitiesProps {
  opportunities: KeywordOpportunity[];
  onSelectOpportunity?: (opportunity: KeywordOpportunity) => void;
  className?: string;
}

export function KeywordOpportunities({
  opportunities,
  onSelectOpportunity,
  className = "",
}: KeywordOpportunitiesProps) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No immediate keyword opportunities identified</p>
          <p className="text-xs mt-1">Continue optimizing your content for better rankings</p>
        </div>
      </Card>
    );
  }

  const quickWins = opportunities.filter((o) => o.quickWin);
  const recoveryOpps = opportunities.filter((o) => o.type === "recovery");
  const highPotential = opportunities.filter((o) => o.trafficPotential > 100 && !o.quickWin);

  const totalTrafficPotential = opportunities.reduce((sum, o) => sum + o.trafficPotential, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quick_win":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "recovery":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "high_potential":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quick_win":
        return <Zap className="w-4 h-4" />;
      case "recovery":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">
              {opportunities.length} Keyword Opportunities
            </h3>
            <p className="text-sm text-muted-foreground">
              Potential monthly traffic gain: <span className="font-bold text-primary">+{totalTrafficPotential.toLocaleString()}</span> visits
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{quickWins.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Quick Wins</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-600">{recoveryOpps.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Recovery</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-600">{highPotential.length}</div>
            <div className="text-xs text-muted-foreground mt-1">High Potential</div>
          </div>
        </div>
      </Card>

      {/* Quick Wins Section */}
      {quickWins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Quick Wins (Page 2 Keywords)</h3>
          </div>
          <div className="space-y-3">
            {quickWins.slice(0, 5).map((opp, index) => (
              <OpportunityCard
                key={index}
                opportunity={opp}
                onSelect={onSelectOpportunity}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recovery Opportunities */}
      {recoveryOpps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Recovery Opportunities</h3>
          </div>
          <div className="space-y-3">
            {recoveryOpps.slice(0, 5).map((opp, index) => (
              <OpportunityCard
                key={index}
                opportunity={opp}
                onSelect={onSelectOpportunity}
              />
            ))}
          </div>
        </div>
      )}

      {/* High Potential */}
      {highPotential.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">High Potential Keywords</h3>
          </div>
          <div className="space-y-3">
            {highPotential.slice(0, 5).map((opp, index) => (
              <OpportunityCard
                key={index}
                opportunity={opp}
                onSelect={onSelectOpportunity}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity,
  onSelect,
}: {
  opportunity: KeywordOpportunity;
  onSelect?: (opp: KeywordOpportunity) => void;
}) {
  const positionImprovement = opportunity.currentPosition - opportunity.targetPosition;
  const progressValue = ((opportunity.currentPosition - opportunity.targetPosition) / opportunity.currentPosition) * 100;

  return (
    <Card className="p-4 hover:shadow-md transition-all border-l-4 border-l-primary/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-base truncate">{opportunity.keyword}</h4>
            {opportunity.quickWin && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Quick Win
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Priority: {opportunity.priorityScore}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <span>Current: #{opportunity.currentPosition.toFixed(0)}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-primary">Target: #{opportunity.targetPosition}</span>
            <span className="text-green-600 font-medium">
              +{opportunity.trafficPotential} visits/mo
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to Target</span>
              <span className="font-medium">{positionImprovement.toFixed(0)} positions to go</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
        </div>

        {onSelect && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelect(opportunity)}
            className="ml-3 shrink-0"
          >
            View Actions
          </Button>
        )}
      </div>

      {opportunity.actions && opportunity.actions.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Top Recommended Actions:
          </div>
          <div className="space-y-1">
            {opportunity.actions.slice(0, 2).map((action: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{action.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
