import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { platforms } from "@/lib/platforms";

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
                <div className="text-primary">
                  <platform.icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold">{platform.name}</h4>
                <p className="text-xs text-muted-foreground">{platform.description}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xs font-medium text-primary">{platform.credits} credits</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {selected.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {selected.length} platform{selected.length > 1 ? "s" : ""} selected
          </p>
          <p className="text-sm font-medium text-primary">
            Total: {platforms.filter(p => selected.includes(p.id)).reduce((sum, p) => sum + p.credits, 0)} credits
          </p>
        </div>
      )}
    </div>
  );
};
