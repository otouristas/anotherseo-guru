import { Helmet } from "react-helmet-async";
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
        <title>AnotherSEOGuru - Enterprise SEO Tools & AI Content Platform</title>
        <meta name="description" content="Professional SEO platform with SERP tracking, competitor analysis, keyword research, backlink monitoring, technical audits, and AI-powered content generation. Dominate search rankings." />
        <meta name="keywords" content="SEO tools, SERP tracking, keyword research, competitor analysis, backlink monitoring, technical SEO, AI content generation" />
        <link rel="canonical" href="https://anotherseoguru.com/" />
        <meta property="og:url" content="https://anotherseoguru.com/" />
        <meta property="og:title" content="AnotherSEOGuru - Enterprise SEO Tools & AI Content Platform" />
        <meta property="og:description" content="Professional SEO platform with SERP tracking, competitor analysis, keyword research, backlink monitoring, and AI-powered content generation." />
        <meta name="twitter:url" content="https://anotherseoguru.com/" />
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
