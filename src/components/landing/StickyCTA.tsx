import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

export const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 50% of viewport
      if (window.scrollY > window.innerHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-primary/95 to-secondary/95 backdrop-blur-sm border-t border-primary/20 shadow-[0_-10px_40px_hsl(262_83%_58%/0.2)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 hidden md:block">
              <p className="text-white font-semibold">
                Ready to transform your content workflow?
              </p>
              <p className="text-white/80 text-sm">
                Start free, no credit card required • 1,000+ satisfied users
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="font-semibold"
              >
                <Link to="/auth">
                  Try Free Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setIsDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
