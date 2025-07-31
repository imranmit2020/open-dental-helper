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
      ? "bg-emerald-600 text-white font-medium shadow-lg" 
      : "text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 ease-out bg-slate-50 dark:bg-slate-900 border-r border-emerald-200 dark:border-emerald-800`}
      collapsible="icon"
    >
      <SidebarContent className="h-full">
        {/* Header */}
        <div className="p-4 border-b border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-2 ring-white/30">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-lg text-white">DentalAI Pro</h1>
                <p className="text-xs text-emerald-100">Practice Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-2 space-y-6">
          {/* Patient Management */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs font-semibold px-4 mb-2">
              Patient Care
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {patientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
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
            <SidebarGroupLabel className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs font-semibold px-4 mb-2">
              Scheduling
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {schedulingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
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
            <SidebarGroupLabel className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs font-semibold px-4 mb-2">
              AI Features
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {aiItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
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
            <SidebarGroupLabel className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs font-semibold px-4 mb-2">
              Analytics
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {reportsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                          ${getNavCls({ isActive })}
                        `}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
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
        <div className="border-t border-emerald-200 dark:border-emerald-800 p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings" 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <Settings className="h-4 w-4 shrink-0" />
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