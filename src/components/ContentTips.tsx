import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle, AlertCircle, Sparkles, Target } from "lucide-react";

export const ContentTips = () => {
  const tips = [
    {
      title: "SEO Optimization",
      icon: <Target className="w-4 h-4" />,
      color: "text-primary",
      items: [
        "Use H1 for main title (1 per page)",
        "H2-H3 for section headers",
        "Include keywords naturally",
        "Keep paragraphs concise (3-4 lines)",
      ]
    },
    {
      title: "Content Structure",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "text-success",
      items: [
        "Start with a strong hook",
        "Use bullet points for lists",
        "Include internal links",
        "Add CTAs strategically",
      ]
    },
    {
      title: "Platform Best Practices",
      icon: <Sparkles className="w-4 h-4" />,
      color: "text-accent",
      items: [
        "Blog: 1000-2000 words optimal",
        "LinkedIn: 150-300 words max",
        "Twitter: Concise threads",
        "Instagram: Visual storytelling",
      ]
    },
    {
      title: "Common Issues to Avoid",
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-destructive",
      items: [
        "Too many H1 tags",
        "Missing meta descriptions",
        "Poor link structure",
        "Keyword stuffing",
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Pro Tips</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Review your content structure before repurposing to ensure optimal results across all platforms.
        </p>
      </Card>

      {tips.map((section, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={section.color}>
              {section.icon}
            </div>
            <h4 className="font-semibold text-sm">{section.title}</h4>
          </div>
          <ul className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          💡 Our AI will automatically optimize your content for each platform's best practices
        </p>
      </Card>
    </div>
  );
};
