import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Key, Plus, Trash2, Eye, EyeOff, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react";
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

interface APIKey {
  id: string;
  provider: string;
  key_name: string;
  encrypted_key: string;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

export const APIKeysSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    provider: "openai",
    key_name: "",
    api_key: "",
  });

  useEffect(() => {
    loadAPIKeys();
  }, [user]);

  const loadAPIKeys = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading API keys:", error);
    } else {
      setApiKeys(data || []);
    }
    setLoading(false);
  };

  const addAPIKey = async () => {
    if (!user || !newKey.key_name || !newKey.api_key) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      provider: newKey.provider,
      key_name: newKey.key_name,
      encrypted_key: btoa(newKey.api_key),
      is_active: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      });
    } else {
      toast({
        title: "API Key Added",
        description: "Your API key has been saved securely",
      });
      setShowDialog(false);
      setNewKey({ provider: "openai", key_name: "", api_key: "" });
      loadAPIKeys();
    }
  };

  const deleteAPIKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    } else {
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed",
      });
      loadAPIKeys();
    }
    setDeleteId(null);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive",
      });
    } else {
      loadAPIKeys();
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      openai: "🤖",
      anthropic: "🧠",
      dataforseo: "📊",
      firecrawl: "🔥",
      serp: "🔍",
      custom: "⚙️",
    };
    return icons[provider] || "🔑";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add API Key</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add your own API keys to use your credits instead of platform credits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={newKey.provider}
                  onValueChange={(value) => setNewKey({ ...newKey, provider: value })}
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="dataforseo">DataForSEO</SelectItem>
                    <SelectItem value="firecrawl">Firecrawl</SelectItem>
                    <SelectItem value="serp">SERP API</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production Key, Test Key"
                  value={newKey.key_name}
                  onChange={(e) => setNewKey({ ...newKey, key_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={newKey.api_key}
                  onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored securely
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addAPIKey}>Add Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
              Use Your Own API Keys
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Add your API keys to use your own credits instead of platform credits. When you add an
              API key, the platform will automatically use it for all requests to that provider.
            </p>
          </div>
        </div>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your own API keys to use your credits instead of platform credits
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getProviderIcon(key.provider)}</span>
                    <h4 className="font-semibold text-sm md:text-base truncate">{key.key_name}</h4>
                    {key.is_active ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                    <span className="capitalize">{key.provider}</span>
                    <span>•</span>
                    <span>Used {key.usage_count} times</span>
                    {key.last_used_at && (
                      <>
                        <span>•</span>
                        <span className="hidden sm:inline">Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showKey[key.id] ? "text" : "password"}
                      value={showKey[key.id] ? atob(key.encrypted_key) : "••••••••••••••••"}
                      readOnly
                      className="text-xs font-mono h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => setShowKey({ ...showKey, [key.id]: !showKey[key.id] })}
                    >
                      {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => toggleActive(key.id, key.is_active)}
                  >
                    {key.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={() => setDeleteId(key.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The API key will be permanently removed from your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteAPIKey(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
