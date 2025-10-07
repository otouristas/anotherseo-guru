import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Search, CheckCircle, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleAnalyticsDashboard } from "./GoogleAnalyticsDashboard";
import { Separator } from "@/components/ui/separator";

interface GoogleIntegrationsProps {
  projectId: string;
}

interface GSCProperty {
  siteUrl: string;
  permissionLevel?: string;
}

interface GAProperty {
  name: string;
  displayName: string;
  parent?: string;
  timeZone?: string;
}

export const GoogleIntegrations = ({ projectId }: GoogleIntegrationsProps) => {
  const [gscConnected, setGscConnected] = useState(false);
  const [gaConnected, setGaConnected] = useState(false);
  const [gscPropertyId, setGscPropertyId] = useState("");
  const [gaPropertyId, setGaPropertyId] = useState("");
  const [gscProperties, setGscProperties] = useState<GSCProperty[]>([]);
  const [gaProperties, setGaProperties] = useState<GAProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
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
      
      // If we have credentials but no properties loaded, fetch them
      if (data.credentials_json && (gscProperties.length === 0 || gaProperties.length === 0)) {
        await refreshProperties();
      }
    }
    setLoading(false);
  };

  const refreshProperties = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
        body: { 
          refreshOnly: true,
          projectId,
          redirectUri: `${window.location.origin}/google-oauth-callback.html`
        }
      });

      if (error) throw error;

      setGscProperties(data.gscProperties || []);
      setGaProperties(data.gaProperties || []);
      
      toast({
        title: "Properties Refreshed! ✅",
        description: "Updated list of available Google properties",
      });
    } catch (error) {
      console.error('Failed to refresh properties:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh Google properties",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
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
          setShowPropertySelector(true);
          
          toast({
            title: "Connected to Google! ✅",
            description: "Now select your specific properties for this project",
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
    setShowPropertySelector(false);
    toast({
      title: "Google Search Console Connected! ✅",
      description: `Selected property: ${siteUrl}`,
    });
  };

  const selectGAProperty = async (propertyId: string) => {
    await saveSettings(gscPropertyId, propertyId);
    setGaPropertyId(propertyId);
    setGaConnected(true);
    setShowPropertySelector(false);
    const propertyName = gaProperties.find(p => p.name === propertyId)?.displayName || propertyId;
    toast({
      title: "Google Analytics Connected! ✅",
      description: `Selected property: ${propertyName}`,
    });
  };

  const changeProperties = () => {
    setShowPropertySelector(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Google Properties</h2>
          <p className="text-muted-foreground">
            Integrate with Google Search Console and Google Analytics to get comprehensive insights and
            actionable SEO recommendations based on real data.
          </p>
        </div>
        {(gscConnected || gaConnected) && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProperties}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Properties
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={changeProperties}
            >
              <Settings className="w-4 h-4 mr-2" />
              Change Properties
            </Button>
          </div>
        )}
      </div>

      {/* Property Selection Modal */}
      {showPropertySelector && (gscProperties.length > 0 || gaProperties.length > 0) && (
        <Card className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Properties for This Project
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPropertySelector(false)}
            >
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose which Google Search Console and Analytics properties to connect to this specific project.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* GSC Property Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Search Console</label>
              <Select onValueChange={selectGSCProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property..." />
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

            {/* GA Property Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Analytics</label>
              <Select onValueChange={selectGAProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property..." />
                </SelectTrigger>
                <SelectContent>
                  {gaProperties.map((prop) => (
                    <SelectItem key={prop.name} value={prop.name}>
                      {prop.displayName} ({prop.name.split('/').pop()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Google Search Console */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
              <Search className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Search Console</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect to sync SERP data, indexing status, and search analytics</p>
            </div>
          </div>
          {gscConnected && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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

            {gscProperties.length > 0 && !showPropertySelector ? (
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
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Connected Property:</span> {gscPropertyId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Last synced: Just now • Next sync: In 1 hour
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={changeProperties}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">1,245</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks (7d)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">45.2K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Impressions (7d)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">2.75%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. CTR (7d)</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={disconnectGSC}>Disconnect</Button>
              <Button variant="outline" onClick={refreshProperties} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Google Analytics */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
              <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Analytics 4</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect to analyze user behavior, conversions, and traffic sources</p>
            </div>
          </div>
          {gaConnected && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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

            {gaProperties.length > 0 && !showPropertySelector ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Select your Analytics property:</p>
                <Select onValueChange={selectGAProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gaProperties.map((prop) => (
                      <SelectItem key={prop.name} value={prop.name}>
                        {prop.displayName} ({prop.name.split('/').pop()})
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
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">✅ OAuth completed! Now select your Analytics property above.</p>
                <Button 
                  onClick={initiateGoogleOAuth} 
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Connected Property:</span> {gaPropertyId.split('/').pop()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {gaProperties.find(p => p.name === gaPropertyId)?.displayName || gaPropertyId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Last synced: Just now • Next sync: In 1 hour
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={changeProperties}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">3,521</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Users (7d)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">5.2K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sessions (7d)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">3:24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={disconnectGA}>Disconnect</Button>
              <Button variant="outline" onClick={refreshProperties} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Analytics Dashboard */}
      {(gscConnected || gaConnected) && (
        <>
          <GoogleAnalyticsDashboard projectId={projectId} />
        </>
      )}
    </div>
  );
};
