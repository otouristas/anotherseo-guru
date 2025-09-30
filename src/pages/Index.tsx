import { Helmet } from "react-helmet";
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
    <>
      <Helmet>
        <title>AnotherSEOGuru - Professional SEO Tools & AI Content Creation Platform</title>
        <meta name="description" content="Dominate search rankings with our professional SEO suite. Track SERP positions, analyze competitors, research keywords, monitor backlinks, and create AI-powered content. All-in-one platform for SEO professionals." />
        <meta name="keywords" content="SEO tools, SERP tracker, keyword research, competitor analysis, backlink monitor, content creation, AI content generator, technical SEO audit" />
        <link rel="canonical" href="https://anotherseo.guru/" />
      </Helmet>
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
    </>
  );
}
