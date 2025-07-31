import { 
  Users, 
  Calendar, 
  FileText, 
  Brain, 
  Mic, 
  Camera, 
  BarChart3,
  Settings,
  Stethoscope,
  Shield
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

const patientItems = [
  { title: "Patient Management", url: "/patients", icon: Users },
  { title: "Medical History", url: "/patients/history", icon: FileText },
  { title: "Treatment Plans", url: "/patients/treatments", icon: Stethoscope },
];

const schedulingItems = [
  { title: "Appointment Calendar", url: "/schedule", icon: Calendar },
  { title: "AI Smart Scheduling", url: "/schedule/ai", icon: Brain },
];

const aiItems = [
  { title: "X-Ray Analysis", url: "/ai/xray", icon: Camera },
  { title: "Voice Notes", url: "/ai/voice", icon: Mic },
  { title: "Diagnostic Assistant", url: "/ai/diagnostics", icon: Brain },
];

const reportsItems = [
  { title: "Practice Analytics", url: "/reports", icon: BarChart3 },
  { title: "Patient Insights", url: "/reports/patients", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-primary/90 to-secondary/90 text-white font-bold shadow-xl border border-primary/30 rounded-lg" 
      : "hover:bg-gradient-to-r hover:from-accent/20 hover:to-muted/30 hover:text-primary transition-all duration-300 rounded-lg hover:shadow-md";

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-card/95 to-muted/50 backdrop-blur-sm border-r border-border/60 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">DentalAI Pro</h1>
                <p className="text-xs text-muted-foreground">Revolutionary Practice Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">
            Patient Care
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Scheduling */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">
            Scheduling
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {schedulingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">
            AI Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}