import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  LinkIcon, 
  FileText, 
  Calendar,
  Globe,
  Target,
  Zap
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="py-12 px-4 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Professional SEO Suite 🎯</h1>
              <p className="text-muted-foreground">Enterprise-grade SEO tools for serious results</p>
            </div>
            <Button onClick={() => setShowOnboarding(true)} size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              New SEO Project
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />
          </div>

          {selectedProject ? (
            <Tabs defaultValue="serp" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-9">
                <TabsTrigger value="serp" className="gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">SERP</span>
                </TabsTrigger>
                <TabsTrigger value="competitors" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Competitors</span>
                </TabsTrigger>
                <TabsTrigger value="keywords" className="gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Keywords</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="backlinks" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Backlinks</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Site Audit</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Technical</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Google</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="serp">
                <SERPTracker projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="competitors">
                <CompetitorAnalysis projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="keywords">
                <KeywordMatrix projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="content">
                <ContentScoring projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="backlinks">
                <BacklinkMonitor projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="audit">
                <SiteAuditCrawler projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="technical">
                <TechnicalAudit projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="integrations">
                <GoogleIntegrations projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="calendar">
                <ContentCalendarView projectId={selectedProject} />
              </TabsContent>
            </Tabs>
          ) : showOnboarding ? (
            <SEOProjectOnboarding userId={user?.id || ""} onComplete={handleOnboardingComplete} />
          ) : (
            <Card className="p-12 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first SEO project with our guided setup</p>
              <Button onClick={() => setShowOnboarding(true)} size="lg">
                Create Your First Project
              </Button>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}