import { Clock, Target, Zap, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

const problems = [
  {
    icon: Clock,
    title: "Time-Consuming Manual Work",
    description: "Creating unique posts for every platform takes hours of manual rewriting and formatting."
  },
  {
    icon: Target,
    title: "Inconsistent SEO Optimization",
    description: "Implementing proper keywords, meta tags, and CRO across all content is difficult and error-prone."
  },
  {
    icon: TrendingDown,
    title: "Low Engagement Rates",
    description: "Generic content doesn't perform well because each platform has unique algorithm preferences."
  },
  {
    icon: Zap,
    title: "Platform Context Switching",
    description: "Maintaining consistent voice while adapting to LinkedIn, Reddit, Instagram, TikTok... is overwhelming."
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Content Creation Shouldn't Be This Hard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            You're spending too much time on repetitive tasks when you could be focusing on strategy and growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
