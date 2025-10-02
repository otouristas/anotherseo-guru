import { LayoutDashboard, Search, ChartBar as BarChart3, Target, FileText, Link2, Globe, Zap, TrendingUp, Calendar, Settings, Upload, Sparkles, Bell, Brain, Mic, MapPin, DollarSign, FileSearch, ChartBar as BarChart, CircleHelp as HelpCircle, Users } from "lucide-react";
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
    { id: "comprehensive-audit", title: "Full Audit", icon: FileSearch },
    { id: "audit", title: "Site Crawler", icon: Globe },
    { id: "technical", title: "Technical SEO", icon: Zap },
  ];

  const integrationsItems = [
    { id: "integrations", title: "Google Tools", icon: TrendingUp },
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
    <SidebarMenu className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              onClick={() => onTabChange(item.id)}
              className={`group relative flex items-center gap-3 rounded-lg transition-all duration-200 ${
                isActive(item.id) 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105' 
                  : 'hover:bg-primary/10 hover:text-primary hover:scale-105'
              }`}
            >
              <div className={`p-1.5 rounded-md transition-all ${
                isActive(item.id) 
                  ? 'bg-white/20 shadow-sm' 
                  : 'bg-primary/10 group-hover:bg-primary/20'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {!collapsed && (
                <span className={`text-sm font-medium transition-all ${
                  isActive(item.id) ? 'text-white' : 'group-hover:text-primary'
                }`}>
                  {item.title}
                </span>
              )}
              {isActive(item.id) && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur`} collapsible="icon">
      <SidebarContent className="mt-20 pt-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mx-2 py-2 text-primary border border-primary/20">
            🎯 Core Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg mx-2 py-2 text-purple-600 border border-purple-200/20">
            <Sparkles className="w-4 h-4" />
            AI Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(aiItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg mx-2 py-2 text-green-600 border border-green-200/20">
            <TrendingUp className="w-4 h-4" />
            Rankings & Keywords
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(rankingItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg mx-2 py-2 text-orange-600 border border-orange-200/20">
            <Target className="w-4 h-4" />
            Competition
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(competitionItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg mx-2 py-2 text-blue-600 border border-blue-200/20">
            <FileText className="w-4 h-4" />
            Content Strategy
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-lg mx-2 py-2 text-gray-600 border border-gray-200/20">
            <Zap className="w-4 h-4" />
            Technical SEO
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(technicalItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg mx-2 py-2 text-indigo-600 border border-indigo-200/20">
            <Globe className="w-4 h-4" />
            Integrations
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(integrationsItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg mx-2 py-2 text-yellow-600 border border-yellow-200/20">
            <Users className="w-4 h-4" />
            Enterprise Tools
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {renderMenuItems(enterpriseItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
