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
              className={isActive(item.id) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}
            >
              <Icon className="w-4 h-4" />
              {!collapsed && <span>{item.title}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Technical</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(technicalItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(integrationsItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
