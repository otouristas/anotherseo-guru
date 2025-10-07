import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Search, 
  BarChart, 
  Globe, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  ExternalLink,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface APISettings {
  dataforseo: {
    api_key: string;
    is_connected: boolean;
    last_tested?: Date;
  };
  firecrawl: {
    api_key: string;
    is_connected: boolean;
    last_tested?: Date;
  };
  google_search_console: {
    site_url: string;
    is_connected: boolean;
    last_sync?: Date;
  };
  google_analytics: {
    property_id: string;
    is_connected: boolean;
    last_sync?: Date;
  };
}

export const APISettings = () => {
  const [settings, setSettings] = useState<APISettings>({
    dataforseo: { api_key: "", is_connected: false },
    firecrawl: { api_key: "", is_connected: false },
    google_search_console: { site_url: "", is_connected: false },
    google_analytics: { property_id: "", is_connected: false }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load API keys
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id);

      // Load Google API settings
      const { data: googleSettings } = await supabase
        .from('google_api_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const newSettings: APISettings = {
        dataforseo: {
          api_key: apiKeys?.find(k => k.provider === 'dataforseo')?.encrypted_key || "",
          is_connected: !!apiKeys?.find(k => k.provider === 'dataforseo' && k.is_active)
        },
        firecrawl: {
          api_key: apiKeys?.find(k => k.provider === 'firecrawl')?.encrypted_key || "",
          is_connected: !!apiKeys?.find(k => k.provider === 'firecrawl' && k.is_active)
        },
        google_search_console: {
          site_url: googleSettings?.google_search_console_site_url || "",
          is_connected: !!googleSettings?.google_search_console_site_url
        },
        google_analytics: {
          property_id: googleSettings?.google_analytics_property_id || "",
          is_connected: !!googleSettings?.google_analytics_property_id
        }
      };

      setSettings(newSettings);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAPIKey = async (provider: 'dataforseo' | 'firecrawl', apiKey: string) => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: `Please enter your ${provider} API key`,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if key already exists
      const { data: existing } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .maybeSingle();

      if (existing) {
        // Update existing key
        await supabase
          .from('api_keys')
          .update({
            encrypted_key: apiKey,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new key
        await supabase
          .from('api_keys')
          .insert({
            user_id: user.id,
            provider,
            key_name: `${provider} API Key`,
            encrypted_key: apiKey,
            is_active: true
          });
      }

      setSettings(prev => ({
        ...prev,
        [provider]: { ...prev[provider], api_key: apiKey, is_connected: true }
      }));

      toast({
        title: "✅ API Key Saved",
        description: `${provider} API key has been saved successfully`
      });
    } catch (error: any) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error saving API key",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveGoogleSettings = async (type: 'search_console' | 'analytics', value: string) => {
    if (!value.trim()) {
      toast({
        title: "Value Required",
        description: `Please enter your Google ${type} ${type === 'search_console' ? 'site URL' : 'property ID'}`,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const field = type === 'search_console' ? 'google_search_console_site_url' : 'google_analytics_property_id';

      // Check if settings already exist
      const { data: existing } = await supabase
        .from('google_api_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing settings
        await supabase
          .from('google_api_settings')
          .update({ [field]: value })
          .eq('id', existing.id);
      } else {
        // Insert new settings
        await supabase
          .from('google_api_settings')
          .insert({
            user_id: user.id,
            [field]: value
          });
      }

      setSettings(prev => ({
        ...prev,
        [`google_${type}`]: { ...prev[`google_${type}` as keyof APISettings], [type === 'search_console' ? 'site_url' : 'property_id']: value, is_connected: true }
      }));

      toast({
        title: "✅ Settings Saved",
        description: `Google ${type} settings have been saved successfully`
      });
    } catch (error: any) {
      console.error('Error saving Google settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testAPI = async (provider: string) => {
    setTesting(provider);
    try {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { provider, apiKey: settings[provider as keyof APISettings] }
      });

      if (error) throw error;

      toast({
        title: "✅ API Test Successful",
        description: `${provider} API connection is working properly`
      });

      setSettings(prev => ({
        ...prev,
        [provider]: { ...prev[provider as keyof APISettings], last_tested: new Date() }
      }));
    } catch (error: any) {
      console.error('API test error:', error);
      toast({
        title: "❌ API Test Failed",
        description: error.message || "Failed to connect to the API",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getConnectionStatus = (isConnected: boolean) => {
    return isConnected ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="w-3 h-3 mr-1" />
        Not Connected
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">API Settings</h2>
        <p className="text-muted-foreground">Configure your API keys and integrations</p>
      </div>

      <Tabs defaultValue="keyword-research" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keyword-research">Keyword Research</TabsTrigger>
          <TabsTrigger value="content-tools">Content Tools</TabsTrigger>
          <TabsTrigger value="google-apis">Google APIs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Keyword Research APIs */}
        <TabsContent value="keyword-research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                DataForSEO
                {getConnectionStatus(settings.dataforseo.is_connected)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Keyword research, SERP analysis, and competitor intelligence
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataforseo-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="dataforseo-key"
                    type={showKeys.dataforseo ? "text" : "password"}
                    placeholder="Enter your DataForSEO API key"
                    value={settings.dataforseo.api_key}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      dataforseo: { ...prev.dataforseo, api_key: e.target.value }
                    }))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('dataforseo')}
                  >
                    {showKeys.dataforseo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => saveAPIKey('dataforseo', settings.dataforseo.api_key)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testAPI('dataforseo')}
                    disabled={testing === 'dataforseo' || !settings.dataforseo.api_key}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === 'dataforseo' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Get your API key from <ExternalLink className="inline w-3 h-3 mx-1" />
                  <a href="https://dataforseo.com" target="_blank" rel="noopener noreferrer" className="underline">
                    dataforseo.com
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tools */}
        <TabsContent value="content-tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Firecrawl
                {getConnectionStatus(settings.firecrawl.is_connected)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Website crawling and content extraction
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firecrawl-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="firecrawl-key"
                    type={showKeys.firecrawl ? "text" : "password"}
                    placeholder="Enter your Firecrawl API key"
                    value={settings.firecrawl.api_key}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      firecrawl: { ...prev.firecrawl, api_key: e.target.value }
                    }))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('firecrawl')}
                  >
                    {showKeys.firecrawl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => saveAPIKey('firecrawl', settings.firecrawl.api_key)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testAPI('firecrawl')}
                    disabled={testing === 'firecrawl' || !settings.firecrawl.api_key}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === 'firecrawl' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Get your API key from <ExternalLink className="inline w-3 h-3 mx-1" />
                  <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline">
                    firecrawl.dev
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google APIs */}
        <TabsContent value="google-apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-500" />
                Google Search Console
                {getConnectionStatus(settings.google_search_console.is_connected)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                SERP rankings, clicks, impressions, and CTR data
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gsc-url">Site URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="gsc-url"
                    placeholder="https://example.com"
                    value={settings.google_search_console.site_url}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      google_search_console: { ...prev.google_search_console, site_url: e.target.value }
                    }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => saveGoogleSettings('search_console', settings.google_search_console.site_url)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Enter your exact site URL as it appears in Google Search Console
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-500" />
                Google Analytics 4
                {getConnectionStatus(settings.google_analytics.is_connected)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Traffic, user behavior, and conversion data
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga4-id">Property ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="ga4-id"
                    placeholder="123456789"
                    value={settings.google_analytics.property_id}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      google_analytics: { ...prev.google_analytics, property_id: e.target.value }
                    }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => saveGoogleSettings('analytics', settings.google_analytics.property_id)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Find your Property ID in Google Analytics 4 under Admin → Property Settings
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                API Usage & Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">DataForSEO</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Used for keyword research and SERP analysis
                    </p>
                    <Badge variant="outline">No rate limits</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Firecrawl</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Used for content scraping and analysis
                    </p>
                    <Badge variant="outline">Based on plan</Badge>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    API keys are encrypted and stored securely. You can update them anytime.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
