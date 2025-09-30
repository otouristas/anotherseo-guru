import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Play, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAndTriggerJob } from "@/lib/jobHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface BulkAnalysisProps {
  projectId: string;
}

export const BulkAnalysis = ({ projectId }: BulkAnalysisProps) => {
  const [analysisType, setAnalysisType] = useState<"backlinks" | "keywords">("keywords");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const parseInput = (): any[] => {
    const lines = inputText.split("\n").filter((line) => line.trim());
    
    if (analysisType === "keywords") {
      return lines.map((line) => {
        const parts = line.split(",");
        return {
          keyword: parts[0].trim(),
          location: parts[1]?.trim() || "2840", // Default US
        };
      });
    } else {
      return lines.map((line) => ({
        domain: line.trim(),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use bulk analysis.",
      });
      return;
    }

    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Empty input",
        description: "Please provide at least one item to analyze.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const items = parseInput();

      const job = await createAndTriggerJob({
        jobType: "bulk_analysis",
        inputData: {
          items,
          analysisType,
          project_id: projectId,
        },
        totalItems: items.length,
      });

      toast({
        title: "Bulk analysis started",
        description: `Processing ${items.length} items. Job ID: ${job.id.slice(0, 8)}...`,
      });

      // Navigate to jobs page
      navigate("/jobs");
    } catch (error: any) {
      console.error("Bulk analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Analysis
        </CardTitle>
        <CardDescription>
          Analyze multiple domains or keywords at once. Results will be processed in the background.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Analysis Type</Label>
          <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keywords">Keyword Research</SelectItem>
              <SelectItem value="backlinks">Backlink Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Input Data</Label>
          <Textarea
            placeholder={
              analysisType === "keywords"
                ? "Enter one keyword per line, optionally with location code:\nkeyword1, 2840\nkeyword2\nkeyword3, 2826"
                : "Enter one domain per line:\nexample.com\ncompetitor.com\nanother-site.com"
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            {inputText.split("\n").filter((l) => l.trim()).length} items
          </p>
        </div>

        <div className="space-y-2">
          <Label>Or Upload CSV/TXT File</Label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" asChild className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isProcessing} className="w-full">
          {isProcessing ? (
            "Starting Analysis..."
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Bulk Analysis
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your analysis will be queued and processed in the background</li>
            <li>You can monitor progress on the Jobs page</li>
            <li>Results will be automatically saved to your project</li>
            <li>Download results as CSV/JSON when complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
