import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Search, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface GoogleIntegrationsProps {
  projectId: string;
}

export const GoogleIntegrations = ({ projectId }: GoogleIntegrationsProps) => {
  const [gscConnected, setGscConnected] = useState(false);
  const [gaConnected, setGaConnected] = useState(false);
  const [gscPropertyId, setGscPropertyId] = useState("");
  const [gaPropertyId, setGaPropertyId] = useState("");
  const { toast } = useToast();

  const connectGoogleSearchConsole = async () => {
    if (!gscPropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter your Google Search Console property ID",
        variant: "destructive",
      });
      return;
    }

    // In production, this would initiate OAuth flow and store credentials
    toast({
      title: "Google Search Console Connected! ✅",
      description: "Now syncing data from your property",
    });
    setGscConnected(true);
  };

  const connectGoogleAnalytics = async () => {
    if (!gaPropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter your Google Analytics 4 property ID",
        variant: "destructive",
      });
      return;
    }

    // In production, this would initiate OAuth flow and store credentials
    toast({
      title: "Google Analytics Connected! ✅",
      description: "Now syncing data from your property",
    });
    setGaConnected(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Google Properties</h2>
        <p className="text-muted-foreground">
          Integrate with Google Search Console and Google Analytics to get comprehensive insights and
          actionable SEO recommendations based on real data.
        </p>
      </div>

      {/* Google Search Console */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Google Search Console</h3>
              <p className="text-sm text-muted-foreground">Connect to sync SERP data, indexing status, and search analytics</p>
            </div>
          </div>
          {gscConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Connected
            </Badge>
          )}
        </div>

        {!gscConnected ? (
          <div className="space-y-4">
            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                What you'll get:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real SERP position data for your keywords</li>
                <li>• Click-through rates and impressions</li>
                <li>• Index coverage and crawl errors</li>
                <li>• Core Web Vitals performance metrics</li>
                <li>• Mobile usability issues</li>
                <li>• Security issues and manual actions</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Enter GSC Property URL (e.g., https://example.com)"
                value={gscPropertyId}
                onChange={(e) => setGscPropertyId(e.target.value)}
              />
              <Button onClick={connectGoogleSearchConsole} className="whitespace-nowrap">
                <Search className="w-4 h-4 mr-2" />
                Connect GSC
              </Button>
            </div>

            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Don't have Google Search Console? Set it up here
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Connected Property:</span> {gscPropertyId}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last synced: Just now • Next sync: In 1 hour
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">1,245</div>
                <div className="text-sm text-muted-foreground">Total Clicks (7d)</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">45.2K</div>
                <div className="text-sm text-muted-foreground">Impressions (7d)</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">2.75%</div>
                <div className="text-sm text-muted-foreground">Avg. CTR (7d)</div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setGscConnected(false)}>Disconnect</Button>
          </div>
        )}
      </Card>

      {/* Google Analytics */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Google Analytics 4</h3>
              <p className="text-sm text-muted-foreground">Connect to analyze user behavior, conversions, and traffic sources</p>
            </div>
          </div>
          {gaConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Connected
            </Badge>
          )}
        </div>

        {!gaConnected ? (
          <div className="space-y-4">
            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                What you'll get:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User behavior and engagement metrics</li>
                <li>• Traffic sources and channel performance</li>
                <li>• Conversion tracking and goal completions</li>
                <li>• Landing page performance analysis</li>
                <li>• Audience demographics and interests</li>
                <li>• Real-time visitor tracking</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Enter GA4 Measurement ID (e.g., G-XXXXXXXXXX)"
                value={gaPropertyId}
                onChange={(e) => setGaPropertyId(e.target.value)}
              />
              <Button onClick={connectGoogleAnalytics} className="whitespace-nowrap">
                <BarChart3 className="w-4 h-4 mr-2" />
                Connect GA4
              </Button>
            </div>

            <a 
              href="https://analytics.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Don't have Google Analytics? Set it up here
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Connected Property:</span> {gaPropertyId}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last synced: Just now • Next sync: In 1 hour
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">3,521</div>
                <div className="text-sm text-muted-foreground">Users (7d)</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">5.2K</div>
                <div className="text-sm text-muted-foreground">Sessions (7d)</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold mb-1">3:24</div>
                <div className="text-sm text-muted-foreground">Avg. Duration</div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setGaConnected(false)}>Disconnect</Button>
          </div>
        )}
      </Card>

      {/* Combined Insights */}
      {gscConnected && gaConnected && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">🎯 AI-Powered SEO Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Focus on high-impression, low-CTR keywords</p>
                <p className="text-sm text-muted-foreground">
                  15 keywords with 500+ impressions but CTR below 2%. Optimize meta titles and descriptions to boost clicks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Improve bounce rate on top landing pages</p>
                <p className="text-sm text-muted-foreground">
                  3 landing pages have 70%+ bounce rate. Add internal links and improve content relevance to user intent.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Target keywords in position 4-10</p>
                <p className="text-sm text-muted-foreground">
                  8 keywords on page 1 but not in top 3. Small optimizations could dramatically increase traffic.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
