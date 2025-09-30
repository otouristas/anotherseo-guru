import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Hash, Type, Link as LinkIcon, List } from "lucide-react";

interface ContentReviewProps {
  content: string;
}

export const ContentReview = ({ content }: ContentReviewProps) => {
  // Parse content and annotate with tags
  const annotateContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let tag = null;
      let icon = null;

      if (line.startsWith('# ')) {
        tag = 'H1';
        icon = <Hash className="w-3 h-3" />;
      } else if (line.startsWith('## ')) {
        tag = 'H2';
        icon = <Hash className="w-3 h-3" />;
      } else if (line.startsWith('### ')) {
        tag = 'H3';
        icon = <Hash className="w-3 h-3" />;
      } else if (line.startsWith('#### ')) {
        tag = 'H4';
        icon = <Hash className="w-3 h-3" />;
      } else if (line.match(/^\[.*\]\(.*\)/)) {
        tag = 'LINK';
        icon = <LinkIcon className="w-3 h-3" />;
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\. /)) {
        tag = 'LIST';
        icon = <List className="w-3 h-3" />;
      } else if (line.trim() !== '') {
        tag = 'P';
        icon = <Type className="w-3 h-3" />;
      }

      if (!tag) return null;

      return (
        <div key={index} className="flex items-start gap-3 py-2 border-b border-border/50 hover:bg-muted/30 transition-colors">
          <Badge variant="outline" className="flex items-center gap-1 min-w-[60px] justify-center">
            {icon}
            {tag}
          </Badge>
          <div className="flex-1 text-sm break-words overflow-hidden">
            {line.replace(/^#+\s*/, '').replace(/^\*\s*/, '').replace(/^-\s*/, '').replace(/^\d+\.\s*/, '')}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  const wordCount = content.split(/\s+/).length;
  const charCount = content.length;
  const estimatedReadTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{wordCount} words</span>
          </div>
          <div>•</div>
          <div>{charCount} characters</div>
          <div>•</div>
          <div>~{estimatedReadTime} min read</div>
        </div>
      </Card>

      <Card className="p-6 max-h-[600px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Content Structure
        </h3>
        <div className="space-y-1">
          {annotateContent(content)}
        </div>
      </Card>
    </div>
  );
};
