import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Platform = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

const platforms: Platform[] = [
  { id: "seo-blog", name: "SEO Blog", icon: "📝", description: "Long-form, keyword-rich content" },
  { id: "medium", name: "Medium", icon: "📖", description: "Personal storytelling format" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", description: "Professional thought-leadership" },
  { id: "reddit", name: "Reddit", icon: "🗨️", description: "Casual, discussion-oriented" },
  { id: "quora", name: "Quora", icon: "❓", description: "Concise, authority-driven answers" },
  { id: "twitter", name: "Twitter/X", icon: "🐦", description: "Short, punchy threads" },
];

interface PlatformSelectorProps {
  selected: string[];
  onSelect: (platformId: string) => void;
}

export const PlatformSelector = ({ selected, onSelect }: PlatformSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Target Platforms</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {platforms.map((platform) => {
          const isSelected = selected.includes(platform.id);
          
          return (
            <Card
              key={platform.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md relative",
                isSelected && "border-primary border-2 bg-primary/5"
              )}
              onClick={() => onSelect(platform.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-3xl">{platform.icon}</div>
                <h4 className="font-semibold">{platform.name}</h4>
                <p className="text-xs text-muted-foreground">{platform.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
      
      {selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selected.length} platform{selected.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
