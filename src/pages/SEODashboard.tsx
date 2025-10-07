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
import ErrorBoundary from "@/components/ErrorBoundary";
import { AIContentStrategyGenerator } from "@/components/ai/AIContentStrategyGenerator";
import { PredictiveSEOAnalytics } from "@/components/ai/PredictiveSEOAnalytics";
import { AISERPOptimizer } from "@/components/ai/AISERPOptimizer";
import { AdvancedPerformanceDashboard } from "@/components/ai/AdvancedPerformanceDashboard";
import { TeamCollaborationSuite } from "@/components/ai/TeamCollaborationSuite";
import { InternalLinkingAnalyzer } from "@/components/seo/InternalLinkingAnalyzer";
import { AdvancedSEOAnalytics } from "@/components/seo/AdvancedSEOAnalytics";
import { DataForSEOTest } from "@/components/seo/DataForSEOTest";
import KeywordResearchMatrix from "@/components/seo/KeywordResearchMatrix";
import SERPTrackerMinimal from "@/components/seo/SERPTrackerMinimal";
import ProjectOverviewMinimal from "@/components/seo/ProjectOverviewMinimal";
import GoogleIntegrationsMinimal from "@/components/seo/GoogleIntegrationsMinimal";

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
        return <ProjectOverviewMinimal projectId={selectedProject} />;
      case "ai-recommendations":
        return <AIRecommendations projectId={selectedProject} userId={user?.id || ""} />;
      case "serp":
        return <SERPTrackerMinimal projectId={selectedProject} />;
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
      case "audit":
        const projectForAudit = projects.find(p => p.id === selectedProject);
        return <SiteAuditDashboard projectId={selectedProject} domain={projectForAudit?.domain || ''} />;
      case "comprehensive-audit":
        const project = projects.find(p => p.id === selectedProject);
        return <ComprehensiveAudit projectId={selectedProject} domain={project?.domain || ''} />;
      case "technical":
        return <TechnicalAudit projectId={selectedProject} />;
      case "integrations":
        return <GoogleIntegrationsMinimal projectId={selectedProject} />;
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
        return (
          <ErrorBoundary>
            <AdvancedAnalytics projectId={selectedProject} />
          </ErrorBoundary>
        );
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
      case "internal-linking":
        return <InternalLinkingAnalyzer projectId={selectedProject} />;
      case "advanced-analytics":
        return <AdvancedSEOAnalytics projectId={selectedProject} />;
      case "dataforseo-test":
        return <DataForSEOTest projectId={selectedProject} />;
      case "keyword-matrix":
        return <KeywordResearchMatrix projectId={selectedProject} />;
      default:
        return <ProjectOverview projectId={selectedProject} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {selectedProject && <SEOSidebar onTabChange={setActiveTab} activeTab={activeTab} />}
        
        <div className="flex-1 flex flex-col">
          {/* SEO Suite Sub-Header */}
          <div className="sticky top-16 z-[10000] flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-900 px-4 md:px-6 shadow-sm">
            {selectedProject && <SidebarTrigger className="mr-2 flex-shrink-0" />}
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO Suite
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Professional SEO management platform
                  </p>
                </div>
              </div>
              {selectedProject && (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </div>
                  <Button 
                    onClick={handleNewProject} 
                    size="sm" 
                    className="gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
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
                  {renderContent()}
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