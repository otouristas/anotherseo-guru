import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Loader as Loader2, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AppearanceSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_settings")
      .select("theme")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.theme) {
      setTheme(data.theme);
    }
    setLoading(false);
  };

  const saveTheme = async (newTheme: string) => {
    if (!user) return;

    setSaving(true);
    setTheme(newTheme);

    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("user_settings")
        .update({ theme: newTheme })
        .eq("user_id", user.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("user_settings")
        .insert({ user_id: user.id, theme: newTheme });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save theme preference",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Theme Updated",
        description: "Your appearance preferences have been saved",
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
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Appearance Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => saveTheme("light")}
              disabled={saving}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs">Light</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => saveTheme("dark")}
              disabled={saving}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs">Dark</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => saveTheme("system")}
              disabled={saving}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-xs">System</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color theme for the interface
          </p>
        </div>
      </div>

      {saving && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving theme preference...
        </div>
      )}
    </Card>
  );
};
