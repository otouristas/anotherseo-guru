import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import Repurpose from "./pages/Repurpose";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SEODashboard from "./pages/SEODashboard";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { SEOAIChatbot } from "@/components/SEOAIChatbot";
import { CookieConsent } from "@/components/CookieConsent";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/repurpose" element={<Repurpose />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/seo" element={<SEODashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SEOAIChatbot />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
