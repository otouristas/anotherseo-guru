import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Loader as Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GeneralSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    language: "en",
    timezone: "UTC",
    ai_model_preference: "auto",
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading settings:", error);
    } else if (data) {
      setSettings({
        language: data.language || "en",
        timezone: data.timezone || "UTC",
        ai_model_preference: data.ai_model_preference || "auto",
      });
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("user_settings")
        .update(settings)
        .eq("user_id", user.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("user_settings")
        .insert({ user_id: user.id, ...settings });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated",
      });
    }
    setSaving(false);
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
        <h3 className="text-lg font-semibold">General Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => setSettings({ ...settings, language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => setSettings({ ...settings, timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-model">AI Model Preference</Label>
          <Select
            value={settings.ai_model_preference}
            onValueChange={(value) => setSettings({ ...settings, ai_model_preference: value })}
          >
            <SelectTrigger id="ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Best Available)</SelectItem>
              <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5 Turbo (OpenAI)</SelectItem>
              <SelectItem value="claude-3">Claude 3 (Anthropic)</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select which AI model to use for content generation and analysis
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={saveSettings} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </Card>
  );
};
