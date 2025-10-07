import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader as Loader2, 
  CircleCheck as CheckCircle, 
  CircleAlert as AlertCircle,
  ExternalLink,
  Key,
  Database,
  Search,
  BarChart3,
  Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoogleAPISettings {
  id?: string;
  project_id?: string;
  google_analytics_property_id?: string;
  google_search_console_site_url?: string;
  google_ads_customer_id?: string;
  credentials_json?: any;
  last_gsc_sync?: string;
  last_ga4_sync?: string;
}

interface DataForSEOSettings {
  id?: string;
  project_id?: string;
  api_key?: string;
  is_active?: boolean;
  usage_count?: number;
  last_used_at?: string;
}

interface FirecrawlSettings {
  id?: string;
  project_id?: string;
  api_key?: string;
  is_active?: boolean;
  usage_count?: number;
  last_used_at?: string;
}

export const APIIntegrationsSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Google API Settings
  const [googleSettings, setGoogleSettings] = useState<GoogleAPISettings>({});
  const [showGoogleCredentials, setShowGoogleCredentials] = useState(false);
  
  // DataForSEO Settings
  const [dataForSEOSettings, setDataForSEOSettings] = useState<DataForSEOSettings>({});
  const [showDataForSEOKey, setShowDataForSEOKey] = useState(false);
  
  // Firecrawl Settings
  const [firecrawlSettings, setFirecrawlSettings] = useState<FirecrawlSettings>({});
  const [showFirecrawlKey, setShowFirecrawlKey] = useState(false);
  
  // Dialog states
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [dataForSEODialogOpen, setDataForSEODialogOpen] = useState(false);
  const [firecrawlDialogOpen, setFirecrawlDialogOpen] = useState(false);

  useEffect(() => {
    loadAPISettings();
  }, [user]);

  const loadAPISettings = async () => {
    if (!user) return;

    try {
      // Load Google API settings
      const { data: googleData, error: googleError } = await supabase
        .from("google_api_settings" as any)
        .select("*")
        .eq("project_id", "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc") // Default project ID
        .maybeSingle();

      if (!googleError && googleData && typeof googleData === 'object') {
        setGoogleSettings(googleData as GoogleAPISettings);
      }

      // Load DataForSEO settings
      const { data: dataForSEOData, error: dataForSEOError } = await supabase
        .from("dataforseo_settings" as any)
        .select("*")
        .eq("project_id", "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc")
        .maybeSingle();

      if (!dataForSEOError && dataForSEOData && typeof dataForSEOData === 'object') {
        setDataForSEOSettings(dataForSEOData as DataForSEOSettings);
      }

      // Load Firecrawl settings
      const { data: firecrawlData, error: firecrawlError } = await supabase
        .from("firecrawl_settings" as any)
        .select("*")
        .eq("project_id", "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc")
        .maybeSingle();

      if (!firecrawlError && firecrawlData && typeof firecrawlData === 'object') {
        setFirecrawlSettings(firecrawlData as FirecrawlSettings);
      }
    } catch (error) {
      console.error("Error loading API settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoogleSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        project_id: "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc",
        google_analytics_property_id: googleSettings.google_analytics_property_id,
        google_search_console_site_url: googleSettings.google_search_console_site_url,
        google_ads_customer_id: googleSettings.google_ads_customer_id,
        credentials_json: googleSettings.credentials_json,
      };

      const { error } = await supabase
        .from("google_api_settings" as any)
        .upsert(settingsData, { onConflict: "project_id" });

      if (error) throw error;

      toast({
        title: "Google API Settings Saved",
        description: "Your Google API configuration has been updated",
      });
      setGoogleDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Google API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDataForSEOSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        project_id: "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc",
        api_key: dataForSEOSettings.api_key,
        is_active: true,
      };

      const { error } = await supabase
        .from("dataforseo_settings" as any)
        .upsert(settingsData, { onConflict: "project_id" });

      if (error) throw error;

      toast({
        title: "DataForSEO Settings Saved",
        description: "Your DataForSEO API configuration has been updated",
      });
      setDataForSEODialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save DataForSEO settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveFirecrawlSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        project_id: "0288f2ae-fbb1-4eef-97e3-23e254c1c9dc",
        api_key: firecrawlSettings.api_key,
        is_active: true,
      };

      const { error } = await supabase
        .from("firecrawl_settings" as any)
        .upsert(settingsData, { onConflict: "project_id" });

      if (error) throw error;

      toast({
        title: "Firecrawl Settings Saved",
        description: "Your Firecrawl API configuration has been updated",
      });
      setFirecrawlDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Firecrawl settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">API Integrations</h3>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
              Configure Your API Integrations
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Set up your API keys and credentials to enable advanced SEO features. 
              These integrations allow you to access Google Analytics, Search Console, 
              DataForSEO, and other powerful SEO tools.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="google" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Google APIs
          </TabsTrigger>
          <TabsTrigger value="dataforseo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            DataForSEO
          </TabsTrigger>
          <TabsTrigger value="firecrawl" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Firecrawl
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold">Google APIs</h4>
            </div>
            <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Google API Configuration</DialogTitle>
                  <DialogDescription>
                    Configure your Google Analytics, Search Console, and Ads API credentials
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ga-property">Google Analytics Property ID</Label>
                    <Input
                      id="ga-property"
                      placeholder="123456789"
                      value={googleSettings.google_analytics_property_id || ""}
                      onChange={(e) => setGoogleSettings({ ...googleSettings, google_analytics_property_id: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in Google Analytics Admin → Property Settings
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gsc-url">Search Console Site URL</Label>
                    <Input
                      id="gsc-url"
                      placeholder="https://example.com"
                      value={googleSettings.google_search_console_site_url || ""}
                      onChange={(e) => setGoogleSettings({ ...googleSettings, google_search_console_site_url: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      The verified site URL in Google Search Console
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ads-customer">Google Ads Customer ID</Label>
                    <Input
                      id="ads-customer"
                      placeholder="123-456-7890"
                      value={googleSettings.google_ads_customer_id || ""}
                      onChange={(e) => setGoogleSettings({ ...googleSettings, google_ads_customer_id: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: For Google Ads integration
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGoogleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveGoogleSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {googleSettings.google_analytics_property_id && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Google Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Property ID: {googleSettings.google_analytics_property_id}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Configured
                </Badge>
              </div>
            </Card>
          )}

          {googleSettings.google_search_console_site_url && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="font-medium">Google Search Console</p>
                    <p className="text-sm text-muted-foreground">
                      Site: {googleSettings.google_search_console_site_url}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Configured
                </Badge>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dataforseo" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold">DataForSEO</h4>
            </div>
            <Dialog open={dataForSEODialogOpen} onOpenChange={setDataForSEODialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>DataForSEO API Configuration</DialogTitle>
                  <DialogDescription>
                    Enter your DataForSEO API credentials for keyword research and SERP analysis
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataforseo-key">API Key</Label>
                    <Input
                      id="dataforseo-key"
                      type={showDataForSEOKey ? "text" : "password"}
                      placeholder="Enter your DataForSEO API key"
                      value={dataForSEOSettings.api_key || ""}
                      onChange={(e) => setDataForSEOSettings({ ...dataForSEOSettings, api_key: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from your DataForSEO dashboard
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDataForSEODialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveDataForSEOSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {dataForSEOSettings.api_key && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-medium">DataForSEO API</p>
                    <p className="text-sm text-muted-foreground">
                      Key: {showDataForSEOKey ? dataForSEOSettings.api_key : "••••••••••••••••"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowDataForSEOKey(!showDataForSEOKey)}
                  >
                    {showDataForSEOKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="firecrawl" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold">Firecrawl</h4>
            </div>
            <Dialog open={firecrawlDialogOpen} onOpenChange={setFirecrawlDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Firecrawl API Configuration</DialogTitle>
                  <DialogDescription>
                    Enter your Firecrawl API key for web scraping and content extraction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firecrawl-key">API Key</Label>
                    <Input
                      id="firecrawl-key"
                      type={showFirecrawlKey ? "text" : "password"}
                      placeholder="Enter your Firecrawl API key"
                      value={firecrawlSettings.api_key || ""}
                      onChange={(e) => setFirecrawlSettings({ ...firecrawlSettings, api_key: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from the Firecrawl dashboard
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFirecrawlDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveFirecrawlSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {firecrawlSettings.api_key && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Firecrawl API</p>
                    <p className="text-sm text-muted-foreground">
                      Key: {showFirecrawlKey ? firecrawlSettings.api_key : "••••••••••••••••"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowFirecrawlKey(!showFirecrawlKey)}
                  >
                    {showFirecrawlKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-700 dark:text-green-300 mb-1">
              API Integration Benefits
            </p>
            <ul className="text-green-600 dark:text-green-400 space-y-1">
              <li>• Real-time Google Analytics and Search Console data</li>
              <li>• Advanced keyword research with DataForSEO</li>
              <li>• Automated web scraping with Firecrawl</li>
              <li>• Enhanced SEO analysis and reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
