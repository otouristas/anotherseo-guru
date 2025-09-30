import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export const CTASection = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Welcome aboard! 🎉",
      description: "Check your email to get started with your free trial.",
    });
    setEmail("");
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-8 md:p-12 shadow-[0_0_60px_hsl(262_83%_58%/0.15)] border-primary/20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to 10x Your Content Output?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join 1,000+ marketers who are already scaling their content effortlessly. Start free, no credit card required.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="lg" variant="hero">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>1-day money-back guarantee</span>
              </div>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Want to see it in action first?
              </p>
              <Button asChild variant="outline" size="lg">
                <Link to="/repurpose">Try the Live Demo</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
