import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Animated Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              Professional SEO Suite + AI Content Engine
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Dominate Search Rankings{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                & Scale Content
              </span>
              {" "}Like a Pro
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Track SERP rankings, analyze competitors, research keywords, monitor backlinks, and generate platform-optimized content—all in one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild
                size="xl" 
                variant="hero"
                className="group"
              >
                <Link to="/auth">
                  Try Free - No Credit Card
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/repurpose">See Live Demo</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                1,000+ active users
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>1-day money back</span>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <img 
              src={heroImage} 
              alt="Multi-platform content preview interface" 
              className="relative rounded-3xl shadow-[0_0_60px_hsl(262_83%_58%/0.3)] border border-primary/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
