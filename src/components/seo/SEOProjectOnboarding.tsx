import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2, Search, Globe, TrendingUp, Link2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SEOProjectOnboardingProps {
  userId: string;
  onComplete: (projectId: string) => void;
}

export const SEOProjectOnboarding = ({ userId, onComplete }: SEOProjectOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gscConnected, setGscConnected] = useState(false);
  const [ga4Connected, setGa4Connected] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Create Project", icon: Zap, description: "Set up your SEO project" },
    { id: 2, title: "Connect Google Analytics", icon: TrendingUp, description: "Link GA4 for traffic insights" },
    { id: 3, title: "Connect Search Console", icon: Search, description: "Get real SERP data" },
    { id: 4, title: "Initial Audit", icon: Globe, description: "Crawl your website" },
  ];

  const createProject = async () => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Please sign in to create a project.",
        variant: "destructive",
      });
      return;
    }
    if (!projectName.trim() || !domain.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both project name and domain",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    try {
      const { data, error } = await supabase
        .from('seo_projects')
        .insert({
          user_id: userId,
          name: projectName,
          domain: cleanDomain,
          target_location: 'United States'
        })
        .select()
        .single();

      if (error) throw error;

      setProjectId(data.id);
      toast({
        title: "Project Created! 🎉",
        description: "Let's connect your analytics tools next",
      });
      setStep(2);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectGA4 = () => {
    // Simulate connection
    setGa4Connected(true);
    toast({
      title: "GA4 Connected ✅",
      description: "Traffic data will sync automatically",
    });
    setStep(3);
  };

  const connectGSC = () => {
    // Simulate connection
    setGscConnected(true);
    toast({
      title: "Search Console Connected ✅",
      description: "SERP data is now available",
    });
    setStep(4);
  };

  const runInitialAudit = () => {
    setIsLoading(true);
    toast({
      title: "Starting Initial Audit...",
      description: "This may take a few minutes",
    });
    
    // Simulate audit process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Audit Complete! 🎯",
        description: "Your SEO project is ready to use",
      });
      if (projectId) onComplete(projectId);
    }, 3000);
  };

  const skipStep = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4 && projectId) {
      onComplete(projectId);
    }
  };

  const progressPercentage = (step / steps.length) * 100;

  return (
    <Card className="p-8 max-w-4xl mx-auto shadow-2xl border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary to-secondary">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome to Your SEO Suite 🚀</h2>
            <p className="text-muted-foreground">Let's set up your first project in 4 easy steps</p>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Step {step} of {steps.length}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {steps.map((s) => {
          const Icon = s.icon;
          const isComplete = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                isComplete ? "bg-gradient-to-br from-success to-success/70 text-success-foreground shadow-lg scale-105" :
                isCurrent ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl scale-110" :
                "bg-muted text-muted-foreground"
              }`}>
                {isComplete ? <CheckCircle className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
              </div>
              <p className={`text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
            <h3 className="text-2xl font-bold mb-2">Step 1: Create Your SEO Project</h3>
            <p className="text-muted-foreground mb-6">Set up your project to start tracking and optimizing</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block">Project Name</label>
                <Input
                  placeholder="e.g., My Business Website"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Website Domain</label>
                <Input
                  placeholder="e.g., example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
          <Button onClick={createProject} disabled={isLoading} className="w-full h-12 text-base" size="lg">
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
            {isLoading ? "Creating..." : "Create Project & Continue"}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Step 2: Connect Google Analytics 4</h3>
            <p className="text-muted-foreground mb-4">
              Get traffic insights, conversion data, and audience analytics
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ User behavior & engagement metrics</li>
                <li>✓ Traffic sources & channel performance</li>
                <li>✓ Conversion tracking & goal completions</li>
                <li>✓ Landing page performance analysis</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={connectGA4} disabled={ga4Connected} className="flex-1" size="lg">
              {ga4Connected ? "✅ Connected" : "Connect Google Analytics"}
            </Button>
            <Button onClick={skipStep} variant="outline" size="lg">Skip</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Step 3: Connect Search Console</h3>
            <p className="text-muted-foreground mb-4">
              Access real SERP data, indexing status, and search analytics
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Real SERP position data for keywords</li>
                <li>✓ Click-through rates and impressions</li>
                <li>✓ Index coverage and crawl errors</li>
                <li>✓ Core Web Vitals performance</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={connectGSC} disabled={gscConnected} className="flex-1" size="lg">
              {gscConnected ? "✅ Connected" : "Connect Search Console"}
            </Button>
            <Button onClick={skipStep} variant="outline" size="lg">Skip</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Step 4: Run Initial Site Audit</h3>
            <p className="text-muted-foreground mb-4">
              Crawl your website to analyze technical SEO, keywords, and backlinks
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">What we'll analyze:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Technical Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span>Keywords Found</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  <span>Backlink Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Core Web Vitals</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={runInitialAudit} disabled={isLoading} className="flex-1" size="lg">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isLoading ? "Running Audit..." : "Start Audit & Complete Setup"}
            </Button>
            <Button onClick={skipStep} variant="outline" size="lg">Skip</Button>
          </div>
        </div>
      )}
    </Card>
  );
};
