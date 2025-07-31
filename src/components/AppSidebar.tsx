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
  { title: "Voice Transcription", url: "/ai/voice", icon: Mic },
  { title: "Image Analysis", url: "/ai/image", icon: Camera },
  { title: "Voice Agent", url: "/ai/agent", icon: Brain },
  { title: "Translation", url: "/ai/translation", icon: Brain },
  { title: "Predictive Analytics", url: "/ai/analytics", icon: BarChart3 },
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
      ? "bg-gradient-primary text-white font-semibold shadow-elegant border border-primary/20 transition-all duration-300" 
      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-300 hover:shadow-md";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-72"} transition-all duration-300 ease-out`}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border shadow-elegant backdrop-blur-sm">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            {!isCollapsed && (
              <div className="space-y-1">
                <h1 className="font-bold text-xl text-sidebar-foreground tracking-tight">DentalAI Pro</h1>
                <p className="text-xs text-sidebar-foreground/60 font-medium">Advanced Practice Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {/* Patient Management */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-widest text-xs font-bold px-6 mb-3">
              Patient Care
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="space-y-1">
                {patientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Scheduling */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-widest text-xs font-bold px-6 mb-3">
              Scheduling
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="space-y-1">
                {schedulingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* AI Features */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-widest text-xs font-bold px-6 mb-3">
              AI Features
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="space-y-1">
                {aiItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Reports */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-widest text-xs font-bold px-6 mb-3">
              Analytics
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="space-y-1">
                {reportsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Settings - Bottom */}
        <div className="border-t border-sidebar-border/50 p-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings" 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <Settings className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="truncate">Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}