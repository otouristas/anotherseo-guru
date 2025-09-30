import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need technical SEO knowledge to use this?",
    answer: "Not at all! Our AI handles all the SEO optimization automatically. You just paste your content, select platforms, and let the AI do the heavy lifting. Keywords, meta tags, heading structure, and anchor links are all optimized for you."
  },
  {
    question: "How is this different from ChatGPT or other AI tools?",
    answer: "While ChatGPT is general-purpose, Repurposfy is specifically trained for content repurposing with platform-specific best practices, 2025 algorithm knowledge, real-time SEO data from DataForSEO, and strategic prompt engineering. It's like having a senior content strategist for every platform."
  },
  {
    question: "Can I customize the AI prompts or add my own platforms?",
    answer: "Yes! Pro plan users get access to the custom prompt builder where you can create your own templates, adjust tone preferences, and even add custom platforms not in our default list."
  },
  {
    question: "Are the exported posts ready to publish immediately?",
    answer: "Yes! Each output is formatted and optimized for its target platform. You can copy-paste directly or use our export features. That said, we always recommend a quick human review to ensure brand voice alignment."
  },
  {
    question: "Does this work with WordPress, Medium, or other CMSs?",
    answer: "Absolutely. We export in multiple formats (.docx, .html, .md, plain text) that are compatible with all major content platforms. Pro users also get API access for direct integrations."
  },
  {
    question: "What happens to my content? Do you store or train on it?",
    answer: "Your content is yours. We process it to generate outputs but don't store it long-term or use it to train our models. Check our Privacy Policy for full details on data handling."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes! You can change plans anytime from your dashboard. Upgrades are immediate, and downgrades take effect at the end of your billing cycle. No penalties, no hassle."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 1-day money-back guarantee on all paid plans. If you're not satisfied for any reason, just contact support within 24 hours of purchase for a full refund."
  },
  {
    question: "How accurate is the keyword research data?",
    answer: "Our keyword data comes directly from DataForSEO, which aggregates real-time data from Google Ads API, search engines, and other authoritative sources. It's the same data used by enterprise SEO tools."
  },
  {
    question: "Can multiple team members use one account?",
    answer: "Pro plan includes team collaboration features with up to 5 seats. Need more? Contact us for Enterprise pricing with unlimited seats and white-label options."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Repurposfy
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
