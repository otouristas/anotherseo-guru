import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { FileSearch, Loader2, CheckCircle, AlertCircle, Copy, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function OnPageAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [domain, setDomain] = useState("");
  const [taskId, setTaskId] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [duplicateUrl, setDuplicateUrl] = useState("");
  const [similarity, setSimilarity] = useState([6]);
  const [duplicates, setDuplicates] = useState<any>(null);
  const [pageFrom, setPageFrom] = useState("");
  const [linkType, setLinkType] = useState("all");
  const [links, setLinks] = useState<any>(null);
  
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

  const analyzeDuplicateContent = async () => {
    if (!taskId || !duplicateUrl) {
      toast({
        title: "Missing information",
        description: "Please provide both Task ID and URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'onpage_duplicate_content',
          task_id: taskId,
          url: duplicateUrl,
          similarity: similarity[0],
          limit: 50
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result) {
        setDuplicates(result);
        toast({
          title: "Duplicate content analysis complete!",
          description: `Found ${result.items?.[0]?.total_count || 0} duplicate pages`
        });
      }
    } catch (error) {
      console.error('Duplicate content error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze duplicate content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeLinks = async () => {
    if (!taskId || !pageFrom) {
      toast({
        title: "Missing information",
        description: "Please provide both Task ID and page path",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const filters: any[] = [];
      if (linkType === 'internal') {
        filters.push(["direction", "=", "internal"]);
      } else if (linkType === 'external') {
        filters.push(["direction", "=", "external"]);
      } else if (linkType === 'dofollow') {
        filters.push(["dofollow", "=", true]);
      } else if (linkType === 'nofollow') {
        filters.push(["dofollow", "=", false]);
      }

      const { data, error } = await supabase.functions.invoke('dataforseo-research', {
        body: {
          action: 'onpage_links',
          task_id: taskId,
          page_from: pageFrom,
          filters: filters.length > 0 ? filters : undefined,
          limit: 100
        }
      });

      if (error) throw error;

      const result = data?.tasks?.[0]?.result?.[0];
      if (result) {
        setLinks(result);
        toast({
          title: "Links analysis complete!",
          description: `Found ${result.total_items_count || 0} links`
        });
      }
    } catch (error) {
      console.error('Links analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze links",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

        <Tabs defaultValue="crawl" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crawl">
              <FileSearch className="w-4 h-4 mr-1" />
              Crawl
            </TabsTrigger>
            <TabsTrigger value="duplicates">
              <Copy className="w-4 h-4 mr-1" />
              Duplicates
            </TabsTrigger>
            <TabsTrigger value="links">
              <LinkIcon className="w-4 h-4 mr-1" />
              Links
            </TabsTrigger>
          </TabsList>

          {/* Crawl Tab */}
          <TabsContent value="crawl" className="space-y-4"
            >
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
            {/* ... keep existing summary display code ... */}
          </div>
        )}
      </TabsContent>

          {/* Duplicate Content Tab */}
          <TabsContent value="duplicates" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Find pages with similar content using SimHash algorithm (0-10 scale)
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dup-taskid">Task ID</Label>
                <Input
                  id="dup-taskid"
                  placeholder="Paste your crawl task ID"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dup-url">Page URL</Label>
                <Input
                  id="dup-url"
                  placeholder="https://example.com/page"
                  value={duplicateUrl}
                  onChange={(e) => setDuplicateUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Similarity Threshold: {similarity[0]}/10</Label>
                <Slider
                  value={similarity}
                  onValueChange={setSimilarity}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher = more similar (10 = identical)
                </p>
              </div>

              <Button
                onClick={analyzeDuplicateContent}
                disabled={loading || !taskId || !duplicateUrl}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                Find Duplicate Content
              </Button>
            </div>

            {/* Duplicate Results */}
            {duplicates && (
              <div className="space-y-3 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Duplicate Pages</Label>
                  <Badge>{duplicates.items?.[0]?.total_count || 0} found</Badge>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {duplicates.items?.[0]?.pages?.map((dup: any, idx: number) => (
                    <div key={idx} className="p-3 bg-background border rounded text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          Similarity: {dup.similarity}/10
                        </Badge>
                        <Badge variant={dup.page?.[0]?.checks?.duplicate_content ? 'destructive' : 'default'}>
                          {dup.page?.[0]?.checks?.duplicate_content ? 'Duplicate' : 'Similar'}
                        </Badge>
                      </div>
                      <div className="font-medium truncate">
                        {dup.page?.[0]?.meta?.title || 'No title'}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {dup.page?.[0]?.url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze internal and external links on your pages
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="links-taskid">Task ID</Label>
                <Input
                  id="links-taskid"
                  placeholder="Paste your crawl task ID"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-from">Page Path (from root)</Label>
                <Input
                  id="page-from"
                  placeholder="e.g., /about or /blog/post"
                  value={pageFrom}
                  onChange={(e) => setPageFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Link Type Filter</Label>
                <div className="grid grid-cols-5 gap-2">
                  {['all', 'internal', 'external', 'dofollow', 'nofollow'].map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={linkType === type ? 'default' : 'outline'}
                      onClick={() => setLinkType(type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={analyzeLinks}
                disabled={loading || !taskId || !pageFrom}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                Analyze Links
              </Button>
            </div>

            {/* Links Results */}
            {links && (
              <div className="space-y-3 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Links Found</Label>
                  <Badge>{links.total_items_count || 0} total</Badge>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {links.items?.slice(0, 50).map((link: any, idx: number) => (
                    <div key={idx} className="p-3 bg-background border rounded text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{link.type}</Badge>
                        <Badge variant={link.direction === 'internal' ? 'default' : 'secondary'}>
                          {link.direction}
                        </Badge>
                        {link.dofollow ? (
                          <Badge variant="default">dofollow</Badge>
                        ) : (
                          <Badge variant="destructive">nofollow</Badge>
                        )}
                        {link.is_broken && <Badge variant="destructive">broken</Badge>}
                      </div>
                      <div className="font-medium truncate">
                        {link.text || link.image_alt || 'No text'}
                      </div>
                      <div className="text-muted-foreground truncate">
                        → {link.link_to}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary still available when outside tabs */}
        {summary && (
          <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg mt-6">
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
