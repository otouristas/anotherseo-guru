import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, FileSpreadsheet, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDataProps {
  data: {
    projects?: any[];
    usage?: any;
    recommendations?: any[];
    activity?: any[];
  };
}

export const ExportData = memo(({ data }: ExportDataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "projects",
    "usage",
    "recommendations",
  ]);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const sections = [
    { id: "projects", label: "SEO Projects", count: data.projects?.length || 0 },
    { id: "usage", label: "Usage Statistics", count: 1 },
    { id: "recommendations", label: "AI Recommendations", count: data.recommendations?.length || 0 },
    { id: "activity", label: "Recent Activity", count: data.activity?.length || 0 },
  ];

  const formats = [
    { id: "csv", label: "CSV", icon: FileSpreadsheet, description: "Comma-separated values" },
    { id: "json", label: "JSON", icon: FileCode, description: "JavaScript Object Notation" },
    { id: "pdf", label: "PDF", icon: FileText, description: "Portable Document Format" },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData: any = {};

      if (selectedSections.includes("projects")) {
        exportData.projects = data.projects || [];
      }
      if (selectedSections.includes("usage")) {
        exportData.usage = data.usage || {};
      }
      if (selectedSections.includes("recommendations")) {
        exportData.recommendations = data.recommendations || [];
      }
      if (selectedSections.includes("activity")) {
        exportData.activity = data.activity || [];
      }

      if (exportFormat === "json") {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === "csv") {
        let csv = "";

        if (selectedSections.includes("projects") && exportData.projects?.length > 0) {
          csv += "SEO Projects\n";
          csv += "Name,Domain,Status,Created\n";
          exportData.projects.forEach((p: any) => {
            csv += `"${p.name}","${p.domain}","${p.status}","${new Date(p.created_at).toLocaleDateString()}"\n`;
          });
          csv += "\n";
        }

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export successful",
        description: `Your data has been exported as ${exportFormat.toUpperCase()}`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
          <DialogDescription>
            Choose the sections and format for your export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Select Sections</h3>
            <div className="grid grid-cols-2 gap-3">
              {sections.map((section) => (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSections.includes(section.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <div>
                          <p className="text-sm font-medium">{section.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.count} {section.count === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.id}
                    className={`cursor-pointer transition-colors ${
                      exportFormat === format.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setExportFormat(format.id as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">{format.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedSections.length} section{selectedSections.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ExportData.displayName = "ExportData";
