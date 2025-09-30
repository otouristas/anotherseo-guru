import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  Target, 
  FileText, 
  Link2, 
  Globe, 
  Zap, 
  TrendingUp, 
  Calendar,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
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
    { id: "serp", title: "SERP Tracker", icon: Search },
    { id: "keywords", title: "Keywords", icon: Target },
    { id: "competitors", title: "Competitors", icon: BarChart3 },
  ];

  const contentItems = [
    { id: "content", title: "Content Score", icon: FileText },
    { id: "calendar", title: "Calendar", icon: Calendar },
  ];

  const technicalItems = [
    { id: "backlinks", title: "Backlinks", icon: Link2 },
    { id: "audit", title: "Site Audit", icon: Globe },
    { id: "technical", title: "Technical SEO", icon: Zap },
  ];

  const integrationsItems = [
    { id: "integrations", title: "Google Tools", icon: TrendingUp },
    { id: "settings", title: "Settings", icon: Settings },
  ];

  const isActive = (id: string) => activeTab === id;

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              onClick={() => onTabChange(item.id)}
              className={isActive(item.id) ? "bg-primary/15 text-primary font-semibold border-l-4 border-primary" : "hover:bg-muted/60 transition-all"}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm">{item.title}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64 border-r shadow-sm"} collapsible="icon">
      <SidebarContent className="mt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider">Content</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider">Technical</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(technicalItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(integrationsItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
