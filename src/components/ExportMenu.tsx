import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToXLSX } from "@/lib/exportHelpers";

interface ExportMenuProps {
  data: Record<string, unknown>[];
  filename: string;
  type?: "keyword" | "ranking" | "audit" | "competitor";
  sheetName?: string;
}

export const ExportMenu = ({ data, filename, type = "keyword", sheetName = "Data" }: ExportMenuProps) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToCSV(data, `${filename}-${new Date().toISOString().split("T")[0]}`);
      toast({
        title: "Export Successful",
        description: "Data exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleExportXLSX = async () => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToXLSX(data, `${filename}-${new Date().toISOString().split("T")[0]}`, sheetName);
      toast({
        title: "Export Successful",
        description: "Data exported to Excel",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Data exported to JSON",
    });
  };

  const generateReport = () => {
    toast({
      title: "Generating Report",
      description: "PDF report generation is coming soon!",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportXLSX} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel (XLSX)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export to JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={generateReport} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
