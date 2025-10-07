import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";

interface GoogleIntegrationsProps {
  projectId: string;
}

interface GoogleSettings {
  id?: string;
  project_id?: string;
  google_analytics_property_id?: string;
  google_search_console_site_url?: string;
  credentials_json?: any;
  last_ga4_sync?: string;
  last_gsc_sync?: string;
  sync_status?: string;
}

export default function GoogleIntegrations({ projectId }: GoogleIntegrationsProps) {
  const [settings, setSettings] = useState<GoogleSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [projectId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('google_api_settings')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const initiateGoogleOAuth = async () => {
    try {
      setLoading(true);
      
      // Open OAuth popup
      const popup = window.open(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`,
        'google-oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          popup?.close();
          window.removeEventListener('message', messageListener);
          loadSettings();
          toast({
            title: "Google OAuth successful! ✅",
            description: "Google integration has been connected",
          });
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          popup?.close();
          window.removeEventListener('message', messageListener);
          toast({
            title: "OAuth failed ❌",
            description: event.data.error || "Failed to authenticate with Google",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', messageListener);
      
      // Cleanup listener after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 300000);

    } catch (error: any) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: "OAuth initiation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      const { error } = await supabase
        .from('google_api_settings')
        .delete()
        .eq('project_id', projectId);

      if (error) throw error;

      setSettings(null);
      
      toast({
        title: "Google disconnected",
        description: "Google integrations have been removed",
      });
    } catch (error: any) {
      console.error('Error disconnecting Google:', error);
      toast({
        title: "Disconnect failed ❌",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'syncing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Google Integrations</h1>
          <p className="text-gray-600 mt-1">Connect Google Search Console and Analytics to your project</p>
        </div>
        <div className="flex gap-3">
          {settings?.credentials_json ? (
            <Button
              variant="outline"
              onClick={disconnectGoogle}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button 
              onClick={initiateGoogleOAuth} 
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Google
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
        </div>
        <div className="p-4">
          {settings?.credentials_json ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-900">Connected to Google</span>
              <Badge className={getStatusColor(settings.sync_status)}>
                {settings.sync_status || 'idle'}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Not connected to Google</span>
            </div>
          )}
        </div>
      </div>

      {/* Google Search Console */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Google Search Console</h3>
          </div>
        </div>
        <div className="p-4">
          {settings?.google_search_console_site_url ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{settings.google_search_console_site_url}</div>
                  <div className="text-sm text-gray-600">
                    Last sync: {settings.last_gsc_sync ? new Date(settings.last_gsc_sync).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No Google Search Console property selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Google Analytics */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Google Analytics 4</h3>
          </div>
        </div>
        <div className="p-4">
          {settings?.google_analytics_property_id ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Property ID: {settings.google_analytics_property_id}</div>
                  <div className="text-sm text-gray-600">
                    Last sync: {settings.last_ga4_sync ? new Date(settings.last_ga4_sync).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No Google Analytics property selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}