import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PlatformShowcase } from "@/components/landing/PlatformShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { Footer } from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProblemSection />
      <HowItWorksSection />
      <PlatformShowcase />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <StickyCTA />
    </div>
  );
}
