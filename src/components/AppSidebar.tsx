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
      ? "data-[active=true]:bg-blue-800 data-[active=true]:text-white bg-blue-800 text-white font-semibold" 
      : "";

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">DentalAI Pro</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Revolutionary Practice Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold px-3 py-2">
            Patient Care
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Scheduling */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold px-3 py-2">
            Scheduling
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {schedulingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold px-3 py-2">
            AI Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold px-3 py-2">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
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
                    <Settings className="h-4 w-4 text-current" />
                    {!isCollapsed && <span className="font-medium">Settings</span>}
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