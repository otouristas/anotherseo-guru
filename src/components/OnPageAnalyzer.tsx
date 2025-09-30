import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileSearch, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function OnPageAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [domain, setDomain] = useState("");
  const [taskId, setTaskId] = useState("");
  const [summary, setSummary] = useState<any>(null);
  
  const { toast } = useToast();

  const startCrawl = async () => {
    if (!domain || domain.length < 3) {
      toast({
        title: "Domain required",
        description: "Please enter a valid domain to crawl",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'onpage_task',
          domain: domain,
          max_crawl_pages: 100
        }
      });

      if (error) throw error;

      const task = data?.tasks?.[0];
      if (task?.id) {
        setTaskId(task.id);
        toast({
          title: "Crawl started!",
          description: "Website crawling has been initiated. Use the Task ID to check progress."
        });
        
        // Auto-start polling
        setTimeout(() => pollSummary(task.id), 5000);
      }
    } catch (error) {
      console.error('Crawl start error:', error);
      toast({
        title: "Crawl failed",
        description: error instanceof Error ? error.message : "Failed to start crawl",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pollSummary = async (id?: string) => {
    const targetId = id || taskId;
    if (!targetId) {
      toast({
        title: "Task ID required",
        description: "Please provide a task ID to fetch results",
        variant: "destructive"
      });
      return;
    }

    setPolling(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'onpage_summary',
          task_id: targetId
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result) {
        setSummary(result);
        
        if (result.crawl_progress === 'in_progress') {
          toast({
            title: "Crawl in progress",
            description: `${result.crawl_status?.pages_crawled || 0} pages crawled so far`
          });
          // Continue polling every 10 seconds
          setTimeout(() => pollSummary(targetId), 10000);
        } else {
          toast({
            title: "Crawl complete!",
            description: `Analyzed ${result.domain_info?.total_pages || 0} pages`
          });
          setPolling(false);
        }
      }
    } catch (error) {
      console.error('Summary fetch error:', error);
      toast({
        title: "Fetch failed",
        description: error instanceof Error ? error.message : "Failed to fetch summary",
        variant: "destructive"
      });
      setPolling(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">OnPage Site Analyzer</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Comprehensive on-page SEO analysis and crawling
          </p>
        </div>

        {/* Start Crawl */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crawl-domain">Website Domain</Label>
            <Input
              id="crawl-domain"
              placeholder="e.g., example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <Button
            onClick={startCrawl}
            disabled={loading || polling || !domain}
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSearch className="w-4 h-4 mr-2" />}
            Start OnPage Crawl
          </Button>
        </div>

        {/* Task ID Display */}
        {taskId && (
          <div className="p-3 bg-muted/50 border rounded-lg space-y-2">
            <Label className="text-xs font-semibold">Task ID:</Label>
            <code className="text-xs block bg-background p-2 rounded">{taskId}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pollSummary()}
              disabled={polling}
              className="w-full"
            >
              {polling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {polling ? 'Checking...' : 'Check Progress'}
            </Button>
          </div>
        )}

        {/* Summary Results */}
        {summary && (
          <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Crawl Summary</Label>
              <Badge variant={summary.crawl_progress === 'finished' ? 'default' : 'secondary'}>
                {summary.crawl_progress || 'unknown'}
              </Badge>
            </div>

            {/* Progress */}
            {summary.crawl_status && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Pages Crawled</span>
                  <span className="font-medium">
                    {summary.crawl_status.pages_crawled} / {summary.crawl_status.max_crawl_pages}
                  </span>
                </div>
                <Progress
                  value={(summary.crawl_status.pages_crawled / summary.crawl_status.max_crawl_pages) * 100}
                  className="h-2"
                />
              </div>
            )}

            {/* Domain Info */}
            {summary.domain_info && (
              <div className="space-y-2 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Domain</div>
                    <div className="font-medium">{summary.domain_info.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Pages</div>
                    <div className="font-medium">{summary.domain_info.total_pages || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">CMS</div>
                    <div className="font-medium">{summary.domain_info.cms || 'None detected'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">SSL</div>
                    <div className="font-medium">
                      {summary.domain_info.checks?.ssl ? (
                        <CheckCircle className="w-4 h-4 text-success inline" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive inline" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page Metrics */}
            {summary.page_metrics && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">OnPage Score</Label>
                <div className="flex items-center gap-3">
                  <Progress
                    value={summary.page_metrics.onpage_score || 0}
                    className="h-3 flex-1"
                  />
                  <Badge variant="default">
                    {Math.round(summary.page_metrics.onpage_score || 0)}/100
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                  <div className="p-2 bg-background border rounded">
                    <div className="text-muted-foreground">Internal Links</div>
                    <div className="font-bold text-lg">{summary.page_metrics.links_internal || 0}</div>
                  </div>
                  <div className="p-2 bg-background border rounded">
                    <div className="text-muted-foreground">External Links</div>
                    <div className="font-bold text-lg">{summary.page_metrics.links_external || 0}</div>
                  </div>
                  <div className="p-2 bg-background border rounded">
                    <div className="text-muted-foreground">Broken Links</div>
                    <div className="font-bold text-lg text-destructive">{summary.page_metrics.broken_links || 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-background border rounded">
                    <div className="text-muted-foreground">Duplicate Titles</div>
                    <div className="font-medium">{summary.page_metrics.duplicate_title || 0}</div>
                  </div>
                  <div className="p-2 bg-background border rounded">
                    <div className="text-muted-foreground">Duplicate Content</div>
                    <div className="font-medium">{summary.page_metrics.duplicate_content || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
