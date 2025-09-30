import { Link } from "react-router-dom";
import { CreditCard, Apple, DollarSign } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="AnotherSEOGuru" className="h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AnotherSEOGuru
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Enterprise-level SEO platform with advanced analytics, competitor research, and AI-powered content generation.
            </p>
            <div className="flex gap-3 items-center">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <Apple className="w-6 h-6 text-muted-foreground" />
              <DollarSign className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Secure payments</span>
            </div>
          </div>

          {/* SEO Tools */}
          <div>
            <h3 className="font-semibold mb-4">SEO Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">Keyword Research</Link></li>
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">SERP Tracking</Link></li>
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">Backlink Analysis</Link></li>
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">Traffic Analytics</Link></li>
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">Site Audit</Link></li>
              <li><Link to="/seo" className="text-muted-foreground hover:text-foreground transition-colors">Content Gap Analysis</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Keyword Clustering</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">SERP Similarity</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Rank Tracker</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">AI Content Writer</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Competitor Analysis</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">NLP Analysis</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><a href="mailto:support@anotherseoguru.com" className="text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AnotherSEOGuru. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Professional SEO platform for enterprise-level keyword research, competitor analysis, and content optimization.
          </p>
        </div>
      </div>
    </footer>
  );
};
