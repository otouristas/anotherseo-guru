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
    <Card className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome to Your SEO Suite 🚀</h2>
        <p className="text-muted-foreground mb-4">Let's set up your first project in 4 easy steps</p>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Steps Progress */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                step > s.id ? "bg-success text-success-foreground" :
                step === s.id ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {step > s.id ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <p className="text-xs font-medium">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-4">Step 1: Create Your SEO Project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Name</label>
                <Input
                  placeholder="e.g., My Business Website"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Website Domain</label>
                <Input
                  placeholder="e.g., example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button onClick={createProject} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Project & Continue
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
