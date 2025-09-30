import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SERPTracker } from "@/components/seo/SERPTracker";
import { CompetitorAnalysis } from "@/components/seo/CompetitorAnalysis";
import { ContentScoring } from "@/components/seo/ContentScoring";
import { KeywordMatrix } from "@/components/seo/KeywordMatrix";
import { BacklinkMonitor } from "@/components/seo/BacklinkMonitor";
import { ContentCalendarView } from "@/components/seo/ContentCalendarView";
import { TechnicalAudit } from "@/components/seo/TechnicalAudit";
import { ProjectSelector } from "@/components/seo/ProjectSelector";
import { SiteAuditCrawler } from "@/components/seo/SiteAuditCrawler";
import { GoogleIntegrations } from "@/components/seo/GoogleIntegrations";
import { SEOProjectOnboarding } from "@/components/seo/SEOProjectOnboarding";
import { ProjectOverview } from "@/components/seo/ProjectOverview";
import { SEOSidebar } from "@/components/seo/SEOSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SEODashboard() {
  return (
    <ProtectedRoute>
      <SEODashboardContent />
    </ProtectedRoute>
  );
}

function SEODashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      return;
    }

    setProjects(data || []);
    if (data && data.length > 0 && !selectedProject) {
      setSelectedProject(data[0].id);
    }
  };

  const handleOnboardingComplete = (projectId: string) => {
    setShowOnboarding(false);
    loadProjects();
    setSelectedProject(projectId);
    toast({
      title: "Setup Complete! 🎉",
      description: "Your SEO project is ready. Explore all the tools in the tabs above.",
    });
  };

  const renderContent = () => {
    if (!selectedProject) {
      if (showOnboarding) {
        return <SEOProjectOnboarding userId={user?.id || ""} onComplete={handleOnboardingComplete} />;
      }
      return (
        <Card className="p-12 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first SEO project with our guided setup</p>
          <Button onClick={() => setShowOnboarding(true)} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Project
          </Button>
        </Card>
      );
    }

    switch (activeTab) {
      case "overview":
        return <ProjectOverview projectId={selectedProject} />;
      case "serp":
        return <SERPTracker projectId={selectedProject} />;
      case "competitors":
        return <CompetitorAnalysis projectId={selectedProject} />;
      case "keywords":
        return <KeywordMatrix projectId={selectedProject} />;
      case "content":
        return <ContentScoring projectId={selectedProject} />;
      case "backlinks":
        return <BacklinkMonitor projectId={selectedProject} />;
      case "audit":
        return <SiteAuditCrawler projectId={selectedProject} />;
      case "technical":
        return <TechnicalAudit projectId={selectedProject} />;
      case "integrations":
        return <GoogleIntegrations projectId={selectedProject} />;
      case "calendar":
        return <ContentCalendarView projectId={selectedProject} />;
      default:
        return <ProjectOverview projectId={selectedProject} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {selectedProject && <SEOSidebar onTabChange={setActiveTab} activeTab={activeTab} />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur shadow-sm px-4 md:px-6">
            {selectedProject && <SidebarTrigger className="mr-2" />}
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Professional SEO Suite</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Enterprise-grade SEO platform</p>
              </div>
              {selectedProject && (
                <Button onClick={() => setShowOnboarding(true)} size="sm" className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Project</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto pt-6 sm:pt-8">
            {selectedProject && (
              <div className="mb-4 md:mb-6">
                <ProjectSelector
                  projects={projects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                />
              </div>
            )}
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}