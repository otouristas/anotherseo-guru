import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database, Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DataSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      const { data: projects } = await supabase
        .from("seo_projects")
        .select("*")
        .eq("user_id", user.id);

      const { data: keywords } = await supabase
        .from("keyword_analysis")
        .select("*")
        .in("project_id", projects?.map(p => p.id) || []);

      const exportData = {
        user_id: user.id,
        export_date: new Date().toISOString(),
        projects: projects || [],
        keywords: keywords || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seoguru-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const deleteAllData = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await supabase.from("seo_projects").delete().eq("user_id", user.id);
      await supabase.from("api_keys").delete().eq("user_id", user.id);
      await supabase.from("user_settings").delete().eq("user_id", user.id);

      toast({
        title: "Data Deleted",
        description: "All your data has been permanently deleted",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your data",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Data Management</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1">Export Your Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your projects, keywords, and settings in JSON format
              </p>
              <Button
                onClick={exportData}
                disabled={exporting}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border border-destructive/50 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1">Delete All Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete all your projects, keywords, API keys, and settings. This action
                cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete All Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your projects,
                      keywords, API keys, settings, and all associated data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllData} className="bg-destructive">
                      Yes, Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
