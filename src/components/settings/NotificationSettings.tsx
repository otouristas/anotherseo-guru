import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    notification_frequency: "daily",
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
        notifications_enabled: data.notifications_enabled ?? true,
        email_notifications: data.email_notifications ?? true,
        notification_frequency: data.notification_frequency || "daily",
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
        description: "Your notification preferences have been updated",
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
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Notification Settings</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications about SEO recommendations and updates
            </p>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications_enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifications_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email"
            checked={settings.email_notifications}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, email_notifications: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Notification Frequency</Label>
          <Select
            value={settings.notification_frequency}
            onValueChange={(value) =>
              setSettings({ ...settings, notification_frequency: value })
            }
          >
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time (Instant)</SelectItem>
              <SelectItem value="hourly">Hourly Digest</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how often you want to receive notification summaries
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