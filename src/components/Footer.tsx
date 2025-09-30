import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="AnotherSEOGuru" className="h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AnotherSEOGuru
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Enterprise-level SEO platform with advanced analytics, competitor research, and AI-powered content generation.
            </p>
            <div className="flex gap-3 items-center flex-wrap">
              <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <path d="M20 10L16 22H18.5L19.5 19H23L24 22H26.5L22.5 10H20ZM20.5 17L21.7 13H21.8L23 17H20.5Z" fill="white"/>
                <path d="M28 10V22H30.5V18H32.5C34.5 18 36 16.5 36 14.5C36 12.5 34.5 11 32.5 11H28V10ZM30.5 13H32C33 13 33.5 13.5 33.5 14.5C33.5 15.5 33 16 32 16H30.5V13Z" fill="white"/>
              </svg>
              <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#EB001B"/>
                <circle cx="18" cy="16" r="9" fill="#FF5F00"/>
                <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
              </svg>
              <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#0066B2"/>
                <path d="M14 8H20V24H14V8Z" fill="#FFF"/>
                <path d="M22 8H28L32 16L28 24H22L26 16L22 8Z" fill="#FFF"/>
                <path d="M30 8H36V24H30V8Z" fill="#FFF"/>
              </svg>
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

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
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
