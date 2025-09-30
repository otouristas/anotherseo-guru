import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BlogIcon, 
  MediumIcon, 
  LinkedInIcon, 
  RedditIcon, 
  QuoraIcon, 
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  NewsletterIcon,
  TikTokIcon
} from "@/components/PlatformLogos";

export type Platform = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  credits: number;
};

const platforms: Platform[] = [
  { id: "seo-blog", name: "SEO Blog", icon: BlogIcon, description: "Long-form, keyword-rich content", credits: 3 },
  { id: "medium", name: "Medium", icon: MediumIcon, description: "Personal storytelling format", credits: 2 },
  { id: "linkedin", name: "LinkedIn", icon: LinkedInIcon, description: "Professional thought-leadership", credits: 2 },
  { id: "reddit", name: "Reddit", icon: RedditIcon, description: "Casual, discussion-oriented", credits: 2 },
  { id: "quora", name: "Quora", icon: QuoraIcon, description: "Concise, authority-driven answers", credits: 2 },
  { id: "twitter", name: "Twitter/X", icon: TwitterIcon, description: "Short, punchy threads", credits: 1 },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, description: "Visual captions with hashtags", credits: 1 },
  { id: "youtube", name: "YouTube", icon: YoutubeIcon, description: "Engaging video descriptions", credits: 2 },
  { id: "newsletter", name: "Newsletter", icon: NewsletterIcon, description: "Email-friendly format", credits: 2 },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, description: "Short video scripts", credits: 1 },
];

export { platforms };

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
