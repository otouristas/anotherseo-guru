import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SERPPreviewProps {
  title: string;
  description: string;
  url?: string;
}

export const SERPPreview = ({ title, description, url = "https://amplify.app/blog/example-post" }: SERPPreviewProps) => {
  const displayTitle = title || "Your SEO Title Will Appear Here (50-60 characters)";
  const displayDescription = description || "Your meta description will appear here. Make it compelling and include your target keywords. Aim for 140-160 characters for optimal display.";
  
  const titleLength = title.length;
  const descLength = description.length;
  
  const getTitleColor = () => {
    if (titleLength === 0) return "text-muted-foreground";
    if (titleLength > 60) return "text-destructive";
    if (titleLength >= 50) return "text-success";
    return "text-primary";
  };
  
  const getDescColor = () => {
    if (descLength === 0) return "text-muted-foreground";
    if (descLength > 160) return "text-destructive";
    if (descLength >= 140) return "text-success";
    return "text-primary";
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Google SERP Preview</h3>
        <div className="flex gap-4 text-xs">
          <span className={getTitleColor()}>
            Title: {titleLength}/60
          </span>
          <span className={getDescColor()}>
            Desc: {descLength}/160
          </span>
        </div>
      </div>

      {/* SERP Preview */}
      <div className="p-4 bg-white rounded-lg border-2 border-muted space-y-2">
        {/* URL */}
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">{url}</span>
        </div>

        {/* Title */}
        <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-normal leading-tight">
          {displayTitle}
        </h4>

        {/* Description */}
        <p className="text-sm text-[#4d5156] leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* Character Count Guidance */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>✓ Title: 50-60 characters (current: {titleLength})</p>
        <p>✓ Description: 140-160 characters (current: {descLength})</p>
      </div>
    </Card>
  );
};
