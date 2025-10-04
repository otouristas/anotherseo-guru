import { FileText, Zap, Eye, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Paste Your Content",
    description: "Upload your blog post, article, or unknown content you want to repurpose. We support text, URLs, and file uploads."
  },
  {
    number: "02",
    icon: Zap,
    title: "Choose Your Platforms",
    description: "Select from 10+ platforms including LinkedIn, Twitter, Instagram, Medium, Reddit, and more. Or let AI auto-select."
  },
  {
    number: "03",
    icon: Eye,
    title: "AI Optimizes Everything",
    description: "Our AI rewrites content for each platform with SEO keywords, anchor links, optimal formatting, and 2025 algorithm best practices."
  },
  {
    number: "04",
    icon: Rocket,
    title: "Preview & Export",
    description: "Review all versions in real-time, make tweaks if needed, then export or schedule directly to your platforms."
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Zap className="w-4 h-4" />
            Simple 4-Step Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform one piece of content into 10+ platform-optimized versions in minutes, not hours
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 z-20">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
