import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Marketing Manager",
    company: "TechCorp",
    content: "Repurposfy cut our content production time by 70%. What used to take our team a full week now takes less than a day. The SEO optimization is incredible.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder & CEO",
    company: "Growth Agency",
    content: "We manage 15+ clients and this tool has been a game-changer. The platform-specific optimization means our content performs 3x better across channels.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Freelance Writer",
    company: "Independent",
    content: "As a solopreneur, I can't afford a full content team. Repurposfy gives me enterprise-level capabilities at a fraction of the cost. Absolutely worth it.",
    rating: 5
  },
  {
    name: "David Kim",
    role: "Social Media Director",
    company: "E-commerce Brand",
    content: "The AI understands platform nuances better than most humans. Our engagement rates are up 45% since we started using this for our social content.",
    rating: 5
  },
  {
    name: "Lisa Anderson",
    role: "Content Strategist",
    company: "SaaS Startup",
    content: "The keyword research integration is phenomenal. We're now ranking for terms we didn't even know we should target. ROI has been insane.",
    rating: 5
  },
  {
    name: "James Miller",
    role: "Marketing Head",
    company: "B2B Company",
    content: "We went from publishing 2-3 pieces per week to 20+ across all platforms. Same team, 10x output. This is the future of content marketing.",
    rating: 5
  }
];

const stats = [
  { value: "1,000+", label: "Active Users" },
  { value: "50K+", label: "Posts Generated" },
  { value: "42%", label: "Avg Engagement Increase" },
  { value: "70%", label: "Time Saved" }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by Content Teams Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of marketers, agencies, and creators who are scaling their content effortlessly
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm mb-4 text-muted-foreground italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
