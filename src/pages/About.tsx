import { Card } from "@/components/ui/card";
import { Sparkles, Target, Zap, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            About <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Amplify</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            We're on a mission to help content creators amplify their reach without multiplying their workload
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Content creation is hard enough. You shouldn't have to manually rewrite your content for every platform. 
                Amplify uses AI to transform your original content into platform-optimized versions, maintaining your 
                voice while adapting to each platform's unique style and audience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that great content deserves to reach its full potential audience, and that creators should 
                spend their time creating—not reformatting.
              </p>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Platform Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Each platform has its own culture, format, and best practices. We understand them all.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI models adapt your content while maintaining your unique voice and message.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <Sparkles className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">SEO Optimized</h3>
                    <p className="text-sm text-muted-foreground">
                      Built-in SEO optimization ensures your content ranks well and reaches more people.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Creator-First</h3>
              <p className="text-muted-foreground">
                Every feature is designed with content creators in mind. Your workflow, your needs, your success.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Over Quantity</h3>
              <p className="text-muted-foreground">
                We focus on generating high-quality, authentic content that truly resonates with your audience.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Continuous Innovation</h3>
              <p className="text-muted-foreground">
                We're constantly improving our AI and adding new platforms to stay ahead of the curve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Built by Creators, for Creators</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our team understands the challenges of content creation because we've lived them. We're marketers, 
            writers, and entrepreneurs who got tired of copy-pasting and manually reformatting content. So we 
            built Amplify to solve our own problem—and now we're sharing it with you.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
