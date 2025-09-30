import { Hero } from "@/components/Hero";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to amplify your content?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of content creators who are saving time and reaching more audiences
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Start Free Trial</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
