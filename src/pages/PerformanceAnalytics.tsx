import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Footer } from "@/components/Footer";
import { Ga4HistoryDashboard } from "@/components/seo/Ga4HistoryDashboard";
import { supabase } from "@/integrations/supabase/client";

type ConnectedProject = {
  id: string;
  name: string;
  domain: string;
  propertyId: string;
};

export default function PerformanceAnalytics() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Analytics - AnotherSEOGuru</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PerformanceAnalyticsContent />
    </ProtectedRoute>
  );
}

function PerformanceAnalyticsContent() {
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<ConnectedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const selected = params.get("project") ?? "all";

  useEffect(() => {
    const loadProjects = async () => {
      const [{ data: projectRows }, { data: settings }] = await Promise.all([
        supabase.from("seo_projects").select("id, name, domain").order("name"),
        supabase
          .from("google_api_settings")
          .select("project_id, google_analytics_property_id")
          .not("google_analytics_property_id", "is", null),
      ]);
      const byId = new Map((projectRows ?? []).map((project) => [project.id, project]));
      const connected = (settings ?? []).flatMap((setting) => {
        const project = byId.get(setting.project_id);
        if (!project || !setting.google_analytics_property_id) return [];
        return [{
          id: project.id,
          name: project.name,
          domain: project.domain,
          propertyId: setting.google_analytics_property_id.replace(/^properties\//, ""),
        }];
      });
      setProjects(connected);
      setLoadingProjects(false);
    };
    void loadProjects();
  }, []);

  const current = projects.find((project) => project.id === selected) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              <Link to="/seo" className="hover:underline">SEO Suite</Link>
              {" / Analytics"}
            </p>
          </div>
          <label className="text-sm">
            <span className="mr-2 text-muted-foreground">Property</span>
            <select
              value={current ? current.id : "all"}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "all") setParams({});
                else setParams({ project: value });
              }}
              className="h-10 rounded-md border bg-background px-3"
              disabled={loadingProjects}
            >
              <option value="all">All properties</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.propertyId})
                </option>
              ))}
            </select>
          </label>
        </div>
        {!loadingProjects && projects.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h1 className="text-xl font-semibold">Connect Google Analytics</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Link a GA4 property on a project. The nightly sync will store its history here.
            </p>
            <Link to="/seo" className="mt-4 inline-block text-sm font-medium hover:underline">Open SEO Suite</Link>
          </div>
        ) : (
          <Ga4HistoryDashboard
            projectId={current?.id ?? null}
            projectName={current ? `${current.name} · ${current.propertyId}` : "All properties"}
            showPortfolio
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
