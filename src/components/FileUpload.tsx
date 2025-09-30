import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export const FileUpload = ({ onFileContent }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(txt|md|markdown)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .md file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content);
      toast({
        title: "File uploaded!",
        description: `Loaded ${content.length} characters from ${file.name}`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Could not read the file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  }, [onFileContent, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card
      className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">Upload a file</p>
        <p className="text-xs text-muted-foreground mb-4">
          Drag and drop or click to browse (.txt, .md)
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>Supported: Text, Markdown</span>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".txt,.md,.markdown"
          onChange={handleChange}
        />
      </label>
    </Card>
  );
};
