import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { SERPTracker } from "@/components/seo/SERPTracker";
import { SERPMonitoring } from "@/components/seo/SERPMonitoring";
import { CompetitorAnalysis } from "@/components/seo/CompetitorAnalysis";
import { ContentGapAnalysis } from "@/components/seo/ContentGapAnalysis";
import { ContentScoring } from "@/components/seo/ContentScoring";
import { KeywordMatrix } from "@/components/seo/KeywordMatrix";
import { RankingPredictor } from "@/components/seo/RankingPredictor";
import { VoiceSearchOptimizer } from "@/components/seo/VoiceSearchOptimizer";
import { BacklinkMonitor } from "@/components/seo/BacklinkMonitor";
import { ContentCalendarView } from "@/components/seo/ContentCalendarView";
import { TechnicalAudit } from "@/components/seo/TechnicalAudit";
import { ProjectSelector } from "@/components/seo/ProjectSelector";
import { SiteAuditCrawler } from "@/components/seo/SiteAuditCrawler";
import { GoogleIntegrations } from "@/components/seo/GoogleIntegrations";
import { SEOProjectOnboarding } from "@/components/seo/SEOProjectOnboarding";
import { ProjectOverview } from "@/components/seo/ProjectOverview";
import { SEOSidebar } from "@/components/seo/SEOSidebar";
import { BulkAnalysis } from "@/components/seo/BulkAnalysis";
import { KeywordClustering } from "@/components/seo/KeywordClustering";
import { MultiLocationTracker } from "@/components/seo/MultiLocationTracker";
import { RevenueAttribution } from "@/components/seo/RevenueAttribution";
import { ComprehensiveAudit } from "@/components/seo/ComprehensiveAudit";
import { KeywordOpportunityAnalyzer } from "@/components/seo/KeywordOpportunityAnalyzer";
import { SiteAuditDashboard } from "@/components/seo/SiteAuditDashboard";
import { AIRecommendations } from "@/components/seo/AIRecommendations";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryWheel } from "@/components/enterprise/QueryWheel";
import { IntentMatcher } from "@/components/enterprise/IntentMatcher";
import { AIOOptimizer } from "@/components/enterprise/AIOOptimizer";
import { SeoReport } from "@/components/seo/SeoReport";
import { PublicResearchRealTime } from "@/components/PublicResearchRealTime";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { AIContentStrategyGenerator } from "@/components/ai/AIContentStrategyGenerator";
import { PredictiveSEOAnalytics } from "@/components/ai/PredictiveSEOAnalytics";
import { AISERPOptimizer } from "@/components/ai/AISERPOptimizer";
import { AdvancedPerformanceDashboard } from "@/components/ai/AdvancedPerformanceDashboard";
import { TeamCollaborationSuite } from "@/components/ai/TeamCollaborationSuite";

export default function SEODashboard() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>SEO Dashboard - AnotherSEOGuru</title>
        <meta name="description" content="Manage your SEO projects and track rankings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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

  const handleNewProject = () => {
    setShowOnboarding(true);
    setSelectedProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('seo_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Project Deleted",
      description: "The project has been removed successfully",
    });
    
    loadProjects();
    if (selectedProject === projectId) {
      setSelectedProject(null);
    }
  };

  const renderContent = () => {
    if (!selectedProject) {
      if (showOnboarding) {
        if (!user?.id) {
          return (
            <Card className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">Please sign in to create a project</p>
            </Card>
          );
        }
        return <SEOProjectOnboarding userId={user.id} onComplete={handleOnboardingComplete} />;
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
      case "ai-recommendations":
        return <AIRecommendations projectId={selectedProject} userId={user?.id || ""} />;
      case "serp":
        return <SERPTracker projectId={selectedProject} />;
      case "monitoring":
        return <SERPMonitoring projectId={selectedProject} />;
      case "competitors":
        return <CompetitorAnalysis projectId={selectedProject} />;
      case "content-gaps":
        return <ContentGapAnalysis projectId={selectedProject} />;
      case "keywords":
        return <KeywordMatrix projectId={selectedProject} />;
      case "predictions":
        return <RankingPredictor projectId={selectedProject} />;
      case "content":
        return <ContentScoring projectId={selectedProject} />;
      case "voice-search":
        return <VoiceSearchOptimizer projectId={selectedProject} />;
      case "backlinks":
        return <BacklinkMonitor projectId={selectedProject} />;
      case "bulk":
        return <BulkAnalysis projectId={selectedProject} />;
      case "clustering":
        return <KeywordClustering projectId={selectedProject} />;
      case "opportunities":
        return <KeywordOpportunityAnalyzer projectId={selectedProject} />;
      case "audit": {
        const projectForAudit = projects.find(p => p.id === selectedProject);
        return <SiteAuditDashboard projectId={selectedProject} domain={projectForAudit?.domain || ''} />;
      }
      case "comprehensive-audit": {
        const project = projects.find(p => p.id === selectedProject);
        return <ComprehensiveAudit projectId={selectedProject} domain={project?.domain || ''} />;
      }
      case "technical":
        return <TechnicalAudit projectId={selectedProject} />;
      case "integrations":
        return <GoogleIntegrations projectId={selectedProject} />;
      case "calendar":
        return <ContentCalendarView projectId={selectedProject} />;
      case "multi-location":
        return <MultiLocationTracker projectId={selectedProject} />;
      case "revenue":
        return <RevenueAttribution projectId={selectedProject} />;
      case "query-wheel":
        return <QueryWheel />;
      case "intent-matcher":
        return <IntentMatcher />;
      case "aio-optimizer":
        return <AIOOptimizer />;
      case "seo-report":
        return <SeoReport projectId={selectedProject} />;
      case "public-research":
        return <PublicResearchRealTime />;
      case "analytics":
        return <AdvancedAnalytics projectId={selectedProject} />;
      case "content-strategy":
        return <AIContentStrategyGenerator projectId={selectedProject} />;
      case "predictive-analytics":
        return <PredictiveSEOAnalytics projectId={selectedProject} />;
      case "serp-optimizer":
        return <AISERPOptimizer projectId={selectedProject} />;
      case "performance-dashboard":
        return <AdvancedPerformanceDashboard projectId={selectedProject} />;
      case "team-collaboration":
        return <TeamCollaborationSuite projectId={selectedProject} />;
      default:
        return <ProjectOverview projectId={selectedProject} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {selectedProject && <SEOSidebar onTabChange={setActiveTab} activeTab={activeTab} />}
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur shadow-lg px-4 md:px-6">
            {selectedProject && <SidebarTrigger className="mr-2" />}
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      SEO Command Center
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Enterprise-grade SEO intelligence platform
                    </p>
                  </div>
                </div>
              </div>
              {selectedProject && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Live Monitoring</span>
                  </div>
                  <Button onClick={handleNewProject} size="sm" className="gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb />
                {selectedProject && (
                  <div className="mb-6 lg:mb-8">
                    <ProjectSelector
                      projects={projects}
                      selectedProject={selectedProject}
                      onSelectProject={setSelectedProject}
                      onDeleteProject={handleDeleteProject}
                    />
                  </div>
                )}
                <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" style={{ backgroundSize: '20px 20px' }} />
                  <div className="relative">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}