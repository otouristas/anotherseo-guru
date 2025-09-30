import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, TrendingUp, TrendingDown, AlertCircle, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SERPMonitoringProps {
  projectId: string;
}

export const SERPMonitoring = ({ projectId }: SERPMonitoringProps) => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('serp_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'serp_alerts',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('serp_alerts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setAlerts(data);
  };

  const startMonitoring = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to monitor",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('serp-monitor', {
        body: { projectId, keyword: keyword.trim() }
      });

      if (error) throw error;

      toast({
        title: "Monitoring Started",
        description: `Now tracking "${keyword}" for ranking changes`,
      });

      setKeyword("");
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    await supabase
      .from('serp_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, is_read: true } : a
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'position_change': return TrendingUp;
      case 'ranking_drop': return TrendingDown;
      case 'snippet_lost': return AlertCircle;
      default: return Bell;
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Real-Time SERP Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Get instant alerts for ranking changes and SERP features
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} new alert{unreadCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter keyword to monitor..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && startMonitoring()}
          />
          <Button onClick={startMonitoring} disabled={loading}>
            <Bell className="w-4 h-4 mr-2" />
            Monitor
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.alert_type);
              return (
                <Card 
                  key={alert.id} 
                  className={`p-4 ${!alert.is_read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{alert.message}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Keyword: {alert.keyword}</span>
                          {alert.old_position && (
                            <span>
                              {alert.old_position} → {alert.new_position || 'N/A'}
                            </span>
                          )}
                          {alert.competitor_domain && (
                            <span>Competitor: {alert.competitor_domain}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {alerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts yet. Start monitoring keywords to receive real-time notifications.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
