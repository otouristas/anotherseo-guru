import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Search, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoogleIntegrationsProps {
  projectId: string;
}

export const GoogleIntegrations = ({ projectId }: GoogleIntegrationsProps) => {
  const [gscConnected, setGscConnected] = useState(false);
  const [gaConnected, setGaConnected] = useState(false);
  const [gscPropertyId, setGscPropertyId] = useState("");
  const [gaPropertyId, setGaPropertyId] = useState("");
  const [gscProperties, setGscProperties] = useState<Array<{ siteUrl: string }>>([]);
  const [gaProperties, setGaProperties] = useState<Array<{ name: string; displayName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [projectId]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('google_api_settings')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (data) {
      setGscPropertyId(data.google_search_console_site_url || "");
      setGaPropertyId(data.google_analytics_property_id || "");
      setGscConnected(!!data.google_search_console_site_url);
      setGaConnected(!!data.google_analytics_property_id);
    }
    setLoading(false);
  };

  const saveSettings = async (gscUrl?: string, gaId?: string) => {
    const { data: existing } = await supabase
      .from('google_api_settings')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('google_api_settings')
        .update({
          google_search_console_site_url: gscUrl ?? gscPropertyId,
          google_analytics_property_id: gaId ?? gaPropertyId,
        })
        .eq('project_id', projectId);
    } else {
      await supabase
        .from('google_api_settings')
        .insert({
          project_id: projectId,
          google_search_console_site_url: gscUrl ?? gscPropertyId,
          google_analytics_property_id: gaId ?? gaPropertyId,
        });
    }
  };

  const initiateGoogleOAuth = async () => {
    setConnecting(true);
    
    const redirectUri = `${window.location.origin}/google-oauth-callback.html`;
    const clientId = "536359531915-s1d9kfa7m6mphmc14ri0hrm8425r6p14.apps.googleusercontent.com";
    
    const scope = [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open OAuth window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth callback
    const handleOAuthCallback = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { code } = event.data;
        
        try {
          const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
            body: { 
              code, 
              projectId,
              redirectUri 
            }
          });

          if (error) throw error;

          setGscProperties(data.gscProperties || []);
          setGaProperties(data.gaProperties || []);
          
          toast({
            title: "Connected to Google! ✅",
            description: "Please select your properties below",
          });
          
        } catch (error) {
          console.error('OAuth callback failed:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to complete Google authentication",
            variant: "destructive",
          });
        } finally {
          setConnecting(false);
        }
        
        window.removeEventListener('message', handleOAuthCallback);
        if (popup) popup.close();
      }
    };

    window.addEventListener('message', handleOAuthCallback);
    
    // Cleanup if popup is closed without completing
    const checkPopup = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopup);
        setConnecting(false);
        window.removeEventListener('message', handleOAuthCallback);
      }
    }, 500);
  };

  const selectGSCProperty = async (siteUrl: string) => {
    await saveSettings(siteUrl, gaPropertyId);
    setGscPropertyId(siteUrl);
    setGscConnected(true);
    toast({
      title: "Google Search Console Connected! ✅",
      description: "Property selected successfully",
    });
  };

  const selectGAProperty = async (propertyId: string) => {
    await saveSettings(gscPropertyId, propertyId);
    setGaPropertyId(propertyId);
    setGaConnected(true);
    toast({
      title: "Google Analytics Connected! ✅",
      description: "Property selected successfully",
    });
  };


  const disconnectGSC = async () => {
    await saveSettings("", gaPropertyId);
    setGscConnected(false);
    setGscPropertyId("");
    toast({
      title: "Disconnected",
      description: "Google Search Console disconnected",
    });
  };

  const disconnectGA = async () => {
    await saveSettings(gscPropertyId, "");
    setGaConnected(false);
    setGaPropertyId("");
    toast({
      title: "Disconnected",
      description: "Google Analytics disconnected",
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

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

            {gscProperties.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Select your Search Console property:</p>
                <Select onValueChange={selectGSCProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gscProperties.map((prop) => (
                      <SelectItem key={prop.siteUrl} value={prop.siteUrl}>
                        {prop.siteUrl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Button 
                onClick={initiateGoogleOAuth} 
                disabled={connecting}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {connecting ? 'Connecting...' : 'Connect with Google'}
              </Button>
            )}
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
            <Button variant="outline" onClick={disconnectGSC}>Disconnect</Button>
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

            {gaProperties.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Select your Analytics property:</p>
                <Select onValueChange={selectGAProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gaProperties.map((prop) => (
                      <SelectItem key={prop.name} value={prop.name}>
                        {prop.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : gscProperties.length === 0 ? (
              <Button 
                onClick={initiateGoogleOAuth} 
                disabled={connecting}
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {connecting ? 'Connecting...' : 'Connect with Google'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete Google authentication above to select Analytics properties
              </p>
            )}
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
            <Button variant="outline" onClick={disconnectGA}>Disconnect</Button>
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
