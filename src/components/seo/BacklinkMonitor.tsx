import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link as LinkIcon, TrendingUp, ExternalLink } from "lucide-react";

interface BacklinkMonitorProps {
  projectId: string;
}

export const BacklinkMonitor = ({ projectId }: BacklinkMonitorProps) => {
  const [backlinks, setBacklinks] = useState<any[]>([]);

  useEffect(() => {
    loadBacklinks();
  }, [projectId]);

  const loadBacklinks = async () => {
    const { data } = await supabase
      .from('backlink_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('domain_authority', { ascending: false })
      .limit(50);
    setBacklinks(data || []);
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return "default";
    if (status === 'lost') return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Backlink Profile Monitor</h3>
        
        {backlinks.length > 0 ? (
          <div className="space-y-4">
            {backlinks.map((backlink) => (
              <Card key={backlink.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`https://${backlink.source_domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {backlink.source_domain}
                      </a>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                    {backlink.anchor_text && (
                      <p className="text-sm text-muted-foreground">
                        Anchor: "{backlink.anchor_text}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(backlink.status)}>
                      {backlink.status || 'unknown'}
                    </Badge>
                    {backlink.is_dofollow && (
                      <Badge variant="default">DoFollow</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    DA: {backlink.domain_authority || 'N/A'}
                  </div>
                  <div>
                    Type: {backlink.link_type || 'standard'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Backlinks Tracked</h3>
            <p className="text-muted-foreground">
              Backlink data will appear here once analyzed
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};