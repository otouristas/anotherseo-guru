import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Search, FileText, Zap, CircleCheck as CheckCircle2 } from "lucide-react";

interface Activity {
  type: string;
  action: string;
  time: string;
  icon: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const iconMap: Record<string, any> = {
  Search,
  FileText,
  Zap,
  CheckCircle2,
};

export const RecentActivity = memo(({ activities }: RecentActivityProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {activities.map((activity, idx) => {
            const Icon = iconMap[activity.icon] || Clock;
            return (
              <div key={idx} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

RecentActivity.displayName = "RecentActivity";
