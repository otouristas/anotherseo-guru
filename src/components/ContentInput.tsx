import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ContentInput = ({ value, onChange }: ContentInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <Label htmlFor="content" className="text-lg font-semibold">
          Your Original Content
        </Label>
      </div>
      
      <Textarea
        id="content"
        placeholder="Paste your blog post or article here... (minimum 100 characters)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] resize-none text-base leading-relaxed border-2 focus:border-primary transition-colors"
      />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{value.length} characters</span>
        {value.length > 0 && value.length < 100 && (
          <span className="text-destructive">Minimum 100 characters required</span>
        )}
        {value.length >= 100 && (
          <span className="text-success">Ready to generate ✓</span>
        )}
      </div>
    </div>
  );
};
