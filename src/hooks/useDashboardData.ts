import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface DashboardData {
  usageData: any;
  seoProjects: any[];
  apiKeys: any[];
  recommendations: any[];
  recentActivity: any[];
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardData = (user: User | null) => {
  const [data, setData] = useState<DashboardData>({
    usageData: null,
    seoProjects: [],
    apiKeys: [],
    recommendations: [],
    recentActivity: [],
    isLoading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const [usageResult, projectsResult, keysResult, recsResult] = await Promise.all([
        supabase
          .from("usage_tracking")
          .select("content_generated_count")
          .eq("user_id", user.id)
          .eq("month_year", currentMonth)
          .maybeSingle(),
        supabase
          .from("seo_projects")
          .select("id, name, domain, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("api_keys")
          .select("id")
          .eq("user_id", user.id),
        supabase
          .from("ai_recommendations")
          .select("id, title, priority, confidence_score")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("priority", { ascending: true })
          .limit(3),
      ]);

      const recentActivity = [
        { type: "project", action: "Created SEO project", time: "2 hours ago", icon: "Search" },
        { type: "content", action: "Generated blog post", time: "5 hours ago", icon: "FileText" },
        { type: "api", action: "Added OpenAI API key", time: "1 day ago", icon: "Zap" },
        { type: "recommendation", action: "Accepted AI suggestion", time: "2 days ago", icon: "CheckCircle2" },
      ];

      setData({
        usageData: usageResult.data,
        seoProjects: projectsResult.data || [],
        apiKeys: keysResult.data || [],
        recommendations: recsResult.data || [],
        recentActivity,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { ...data, refetch: fetchDashboardData };
};
