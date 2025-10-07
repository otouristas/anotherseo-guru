import { LayoutDashboard, Search, ChartBar as BarChart3, Target, FileText, Link2, Globe, Zap, TrendingUp, Calendar, Settings, Upload, Sparkles, Bell, Brain, Mic, MapPin, DollarSign, FileSearch, ChartBar as BarChart, CircleHelp as HelpCircle, Users, Database } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface SEOSidebarProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function SEOSidebar({ onTabChange, activeTab }: SEOSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const mainItems = [
    { id: "overview", title: "Overview", icon: LayoutDashboard },
    { id: "analytics", title: "Analytics", icon: BarChart },
    { id: "advanced-analytics", title: "Advanced Analytics", icon: BarChart },
    { id: "seo-report", title: "SEO Report", icon: FileSearch },
  ];

  const aiItems = [
    { id: "ai-recommendations", title: "AI Insights", icon: Sparkles },
    { id: "content-strategy", title: "Content Strategy", icon: Brain },
    { id: "predictive-analytics", title: "Predictions", icon: TrendingUp },
    { id: "serp-optimizer", title: "SERP Optimizer", icon: Target },
    { id: "performance-dashboard", title: "Performance", icon: BarChart3 },
    { id: "monitoring", title: "SERP Monitoring", icon: Bell },
    { id: "content-gaps", title: "Content Gaps", icon: Target },
    { id: "predictions", title: "Ranking Predictor", icon: Brain },
    { id: "voice-search", title: "Voice Search", icon: Mic },
  ];

  const rankingItems = [
    { id: "serp", title: "SERP Tracker", icon: Search },
    { id: "keywords", title: "Keywords", icon: Target },
    { id: "keyword-matrix", title: "Keyword Matrix", icon: Database },
    { id: "opportunities", title: "Opportunities", icon: Zap },
    { id: "bulk", title: "Bulk Analysis", icon: Upload },
    { id: "clustering", title: "Clustering", icon: Sparkles },
  ];

  const competitionItems = [
    { id: "competitors", title: "Competitors", icon: BarChart3 },
  ];

  const contentItems = [
    { id: "content", title: "Content Score", icon: FileText },
    { id: "calendar", title: "Calendar", icon: Calendar },
  ];

  const technicalItems = [
    { id: "backlinks", title: "Backlinks", icon: Link2 },
    { id: "internal-linking", title: "Internal Linking", icon: Link2 },
    { id: "comprehensive-audit", title: "Full Audit", icon: FileSearch },
    { id: "audit", title: "Site Crawler", icon: Globe },
    { id: "technical", title: "Technical SEO", icon: Zap },
  ];

  const integrationsItems = [
    { id: "integrations", title: "Google Tools", icon: TrendingUp },
    { id: "dataforseo-test", title: "DataForSEO Test", icon: Database },
  ];

  const enterpriseItems = [
    { id: "query-wheel", title: "Query Wheel", icon: Target },
    { id: "intent-matcher", title: "Intent Matcher", icon: Brain },
    { id: "aio-optimizer", title: "AI Overview", icon: Sparkles },
    { id: "public-research", title: "Public Research", icon: Globe },
    { id: "multi-location", title: "Multi-Location", icon: MapPin },
    { id: "revenue", title: "Revenue Attribution", icon: DollarSign },
    { id: "team-collaboration", title: "Team Collaboration", icon: Users },
  ];

  const isActive = (id: string) => activeTab === id;

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu className="space-y-1 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              onClick={() => onTabChange(item.id)}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                isActive(item.id) 
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isActive(item.id) ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
              }`} />
              {!collapsed && (
                <span className={`text-sm font-medium ${
                  isActive(item.id) ? 'text-white dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.title}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-80"} border-r bg-white dark:bg-gray-900`} collapsible="icon">
      <SidebarContent className="mt-30 pt-6 space-y-6 px-3">
        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            AI Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(aiItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rankings & Keywords
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(rankingItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Competition
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(competitionItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Content Strategy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Technical SEO
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(technicalItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Integrations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(integrationsItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-3">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Enterprise Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(enterpriseItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
