import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { platforms } from "@/components/PlatformSelector";

const previewExamples = {
  "seo-blog": {
    title: "SEO Blog Post",
    preview: `# The Complete Guide to Content Marketing in 2025

**Meta Title:** Content Marketing 2025: Ultimate Strategy Guide | 10x Your ROI
**Meta Description:** Discover the latest content marketing strategies for 2025. Learn SEO optimization, distribution tactics, and AI-powered workflows that drive results.

## What is Content Marketing?

Content marketing is a strategic approach focused on creating and distributing valuable, relevant content...

### Key Benefits
- Increased organic traffic by 300%
- Higher conversion rates
- Better brand authority

[Learn more about our content strategy →](#link)`,
    features: ["SEO Keywords", "Meta Tags", "H1/H2/H3 Structure", "Internal Links"]
  },
  "linkedin": {
    title: "LinkedIn Post",
    preview: `🚀 Just discovered a game-changing approach to content marketing

After testing 50+ strategies this year, here's what actually moved the needle:

✓ Quality > Quantity (always)
✓ Data-driven decisions
✓ Authentic storytelling

The results? 300% increase in organic reach.

Here's exactly what we did... 🧵

What's your #1 content challenge? Drop a comment ⬇️

#ContentMarketing #DigitalMarketing #GrowthHacking`,
    features: ["Hook First Line", "Emojis", "Hashtags", "Engagement CTA"]
  },
  "twitter": {
    title: "Twitter Thread",
    preview: `🧵 1/8: The content marketing playbook just changed.

Here's what's working in 2025 (backed by data from 10,000+ posts):

2/8: Stop creating content for algorithms.
Start creating for humans.

The platforms reward authenticity now.

3/8: Data shows posts with personal stories get 3x more engagement...

8/8: If you found this valuable:
→ Follow @yourhandle for more
→ RT the first tweet to help others

What would you add? 💭`,
    features: ["Thread Format", "Data Points", "CTA", "Numbered Structure"]
  },
  "instagram": {
    title: "Instagram Caption",
    preview: `✨ Game-changer alert for content creators ✨

Spent the last 6 months testing EVERY content strategy...

And here's what actually worked 👇

1️⃣ Authenticity > Perfection
2️⃣ Consistency beats intensity
3️⃣ Engagement is a two-way street

The result? 10K new followers in 3 months 📈

Save this for later 💾
Tag a creator who needs this 🏷️

#ContentCreator #InstagramGrowth #SocialMediaTips #ContentStrategy #DigitalMarketing`,
    features: ["Visual Emojis", "List Format", "Save/Share CTA", "25+ Hashtags"]
  }
};

export const PlatformShowcase = () => {
  const [activeTab, setActiveTab] = useState("seo-blog");
  const activeExample = previewExamples[activeTab as keyof typeof previewExamples];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            One Input. 10+ Perfect Outputs.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Each platform gets content optimized for its unique algorithm, audience, and format
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 h-auto bg-muted/50 p-2">
            {Object.entries(previewExamples).map(([key, data]) => (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {data.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(previewExamples).map(([key, data]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <Card className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{data.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap border">
                  {data.preview}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Plus: Medium, Reddit, Quora, YouTube, TikTok, Facebook, Newsletter formats
          </p>
          <Button size="lg" variant="hero">Try It Free Now</Button>
        </div>
      </div>
    </section>
  );
};
