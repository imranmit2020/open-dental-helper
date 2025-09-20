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
  Shield,
  Building,
  User,
  Target,
  CreditCard,
  Bot,
  Video,
  TrendingUp,
  Mail,
  Scan,
  ClipboardList,
  MicVocal,
  HeartHandshake,
  Cog,
  DollarSign,
  MessageSquare,
  Lock,
  Star,
  UserPlus,
  VideoIcon,
  Database,
  TrendingUp as TrendIcon,
  Cpu,
  Zap,
  Activity,
  Eye,
  Microscope,
  Sparkles,
  FlaskConical,
  Headphones,
  Package
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigationPermissions, NavigationItem } from "@/hooks/useNavigationPermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { supabase } from "@/integrations/supabase/client";

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
import { Badge } from "@/components/ui/badge";

const patientMenuItems: NavigationItem[] = [
  { title: "My Dashboard", url: "/patient-dashboard", icon: User, requiredRoles: ['patient'], moduleKey: 'patient_dashboard' },
  { title: "My Appointments", url: "/my-appointments", icon: Calendar, requiredRoles: ['patient'], moduleKey: 'patient_my_appointments' },
  { title: "My Medical Records", url: "/my-medical-records", icon: FileText, requiredRoles: ['patient'], moduleKey: 'patient_medical_records' },
  { title: "My Treatment Plans", url: "/my-treatment-plans", icon: Stethoscope, requiredRoles: ['patient'], moduleKey: 'patient_treatment_plans' },
  { title: "Consent Forms", url: "/my-consent-forms", icon: Shield, requiredRoles: ['patient'], moduleKey: 'patient_consent_forms' },
];

const practiceDashboards: NavigationItem[] = [
  { title: "Practice Overview", url: "/practice-dashboard", icon: Building, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'practice_dashboard' },
  { title: "Dentist Workspace", url: "/dentist-dashboard", icon: Stethoscope, requiredRoles: ['dentist', 'admin'], moduleKey: 'dentist_dashboard' },
];

const patientItems: NavigationItem[] = [
  { title: "Patient Charting Hub", url: "/patient-charting", icon: ClipboardList, requiredRoles: ['admin', 'dentist', 'hygienist', 'staff'] },
  { title: "Patient Management", url: "/patients", icon: Users, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'patients' },
  { title: "Medical History", url: "/medical-history", icon: FileText, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'medical_history' },
  { title: "Consent Forms", url: "/consent-forms", icon: Shield, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'consent_forms' },
  { title: "Treatment Plans", url: "/treatment-plans", icon: Stethoscope, requiredRoles: ['admin', 'dentist'], moduleKey: 'treatment_plans' },
  { title: "Insurance & Billing", url: "/insurance-billing", icon: CreditCard, requiredRoles: ['admin', 'staff'], requiredFeature: 'basic', moduleKey: 'insurance_billing' },
  { title: "Payment Settings", url: "/clinic-payment-settings", icon: Settings, requiredRoles: ['admin'], requiredFeature: 'basic', moduleKey: 'payment_settings' },
];

const schedulingItems: NavigationItem[] = [
  { title: "Appointment Calendar", url: "/schedule", icon: Calendar, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'schedule' },
  { title: "Schedule Management", url: "/schedule-management", icon: Calendar, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'schedule_management' },
  { title: "AI Smart Scheduling", url: "/ai-scheduling", icon: Bot, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'ai_scheduling' },
  { title: "Teledentistry", url: "/teledentistry", icon: Video, requiredRoles: ['admin', 'dentist'], requiredFeature: 'teledentistry', moduleKey: 'teledentistry' },
  { title: "Enhanced Teledentistry", url: "/teledentistry-enhanced", icon: VideoIcon, requiredRoles: ['admin', 'dentist'], requiredFeature: 'teledentistry', moduleKey: 'teledentistry_enhanced' },
];

const aiItems: NavigationItem[] = [
  { title: "Voice Transcription", url: "/ai/voice", icon: Mic, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'voice_transcription' },
  { title: "Image Analysis", url: "/ai/image", icon: Camera, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'image_analysis' },
  { title: "Voice Agent", url: "/ai/agent", icon: Brain, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'voice_agent' },
  { title: "Translation", url: "/ai/translation", icon: Brain, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'translation' },
  { title: "Predictive Analytics", url: "/ai/analytics", icon: BarChart3, requiredRoles: ['admin', 'dentist'], requiredFeature: 'analytics', moduleKey: 'analytics' },
  { title: "AI Marketing", url: "/ai-marketing", icon: Target, requiredRoles: ['admin'], requiredFeature: 'ai_features', moduleKey: 'ai_marketing' },
  { title: "AI Assistant", url: "/ai-assistant", icon: MessageSquare, requiredRoles: ['admin', 'dentist', 'hygienist', 'staff'], moduleKey: 'ai_assistant' },
  { title: "AI Patient Analytics", url: "/ai/patient-analytics", icon: Brain, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Smart Documentation", url: "/smart-documentation", icon: Zap, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features' },
  { title: "Predictive Treatment", url: "/predictive-treatment", icon: Sparkles, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
];

const clinicalItems: NavigationItem[] = [
  { title: "X-Ray Diagnostics", url: "/xray-diagnostics", icon: Scan, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'xray_diagnostics' },
  { title: "Treatment Plans", url: "/treatment-plans", icon: ClipboardList, requiredRoles: ['admin', 'dentist'], moduleKey: 'treatment_plans' },
  { title: "Voice-to-Chart", url: "/voice-to-chart", icon: MicVocal, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'voice_to_chart' },
  { title: "Chairside Assistant", url: "/chairside-assistant", icon: HeartHandshake, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'chairside_assistant' },
  { title: "Referral Network", url: "/referral-network", icon: Users, requiredRoles: ['admin', 'dentist'] },
  { title: "3D Dental Modeling", url: "/3d-dental-modeling", icon: Cpu, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Patient Journey", url: "/patient-journey", icon: TrendingUp, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Real-time Monitoring", url: "/real-time-monitoring", icon: Activity, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Real-Time Systems", url: "/realtime-systems", icon: Activity, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Advanced Security", url: "/advanced-security", icon: Shield, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "IoT & Hardware", url: "/iot-hardware", icon: Settings, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Next-Gen AI Features", url: "/next-gen-ai", icon: Brain, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "AR Treatment Preview", url: "/ar-treatment-preview", icon: Eye, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Microscopic Analysis", url: "/microscopic-analysis", icon: Microscope, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Lab Management", url: "/lab-management", icon: FlaskConical, requiredRoles: ['admin', 'dentist', 'hygienist'], moduleKey: 'lab_management' },
  { title: "Inventory Management", url: "/inventory-management", icon: Package, requiredRoles: ['admin', 'dentist', 'staff'] },
];

const reportsItems: NavigationItem[] = [
  { title: "Practice Analytics", url: "/reports", icon: BarChart3, requiredRoles: ['admin', 'dentist'], requiredFeature: 'analytics', moduleKey: 'reports' },
  { title: "Patient Insights", url: "/reports/patients", icon: Users, requiredRoles: ['admin', 'dentist'], requiredFeature: 'analytics', moduleKey: 'reports_patients' },
];

const enterpriseItems: NavigationItem[] = [
  { title: "Multi-Practice Analytics", url: "/multi-practice-analytics", icon: TrendingUp, requiredRoles: ['admin'], requiredFeature: 'multi_practice', moduleKey: 'multi_practice_analytics' },
  { title: "Marketing Automation", url: "/marketing-automation", icon: Mail, requiredRoles: ['admin'], requiredFeature: 'ai_features', moduleKey: 'marketing_automation' },
  { title: "Smart Operations", url: "/smart-operations", icon: Cog, requiredRoles: ['admin'], requiredFeature: 'multi_practice', moduleKey: 'smart_operations' },
  { title: "Revenue Management", url: "/revenue-management", icon: DollarSign, requiredRoles: ['admin'], requiredFeature: 'analytics', moduleKey: 'revenue_management' },
  { title: "Market Intelligence", url: "/market-intelligence", icon: Database, requiredRoles: ['admin'], requiredFeature: 'multi_practice', moduleKey: 'market_intelligence' },
  { title: "Reputation Management", url: "/reputation-management", icon: Star, requiredRoles: ['admin'], requiredFeature: 'ai_features', moduleKey: 'reputation_management' },
  { title: "Lead Conversion AI", url: "/lead-conversion", icon: UserPlus, requiredRoles: ['admin'], requiredFeature: 'ai_features', moduleKey: 'lead_conversion' },
];

const complianceItems: NavigationItem[] = [
  { title: "Compliance & Security", url: "/compliance-security", icon: Lock, requiredRoles: ['admin'], requiredFeature: 'compliance', moduleKey: 'compliance_security' },
  { title: "Patient Concierge", url: "/patient-concierge", icon: MessageSquare, requiredRoles: ['admin', 'staff'], requiredFeature: 'ai_features', moduleKey: 'patient_concierge' },
  { title: "Gamified Kids App", url: "/gamified-kids-app", icon: Star, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features' },
  { title: "Personalized Preventive Care", url: "/personalized-preventive-care", icon: HeartHandshake, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features' },
];

const adminItems: NavigationItem[] = [
  { title: "User Approvals", url: "/admin/user-approvals", icon: UserPlus, requiredRoles: ['admin'], moduleKey: 'admin_user_approvals' },
  { title: "User Management", url: "/admin/user-management", icon: Users, requiredRoles: ['admin'], moduleKey: 'admin_user_management' },
  { title: "Add Employee", url: "/admin/employees/new", icon: UserPlus, requiredRoles: ['admin'] },
  { title: "Team Management", url: "/admin/team", icon: Users, requiredRoles: ['admin'] },
  { title: "Module Access", url: "/admin/navigation-permissions", icon: Settings, requiredRoles: ['admin'], moduleKey: 'admin_navigation_permissions' },
  { title: "Security Settings", url: "/admin/security-settings", icon: Shield, requiredRoles: ['admin'] },
  { title: "Audit Log", url: "/admin/audit-log", icon: ClipboardList, requiredRoles: ['admin'] },
  { title: "Data Migration", url: "/admin/data-migration", icon: Database, requiredRoles: ['admin'] },
  { title: "ETL Developer", url: "/admin/etl-developer", icon: Database, requiredRoles: ['admin'] },
  { title: "SQL Query Tool", url: "/admin/sql-query", icon: Database, requiredRoles: ['admin'] },
  { title: "Module Flows", url: "/admin/module-flows", icon: TrendIcon, requiredRoles: ['admin'] },
  { title: "QA Checklist", url: "/qa-checklist", icon: ClipboardList, requiredRoles: ['admin', 'dentist', 'staff'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useLanguage();
  const location = useLocation();
  const { filterNavigationItems, userRole, subscribed, isStaffMember, isPatient, isAdmin } = useNavigationPermissions();
  const { canAccessAdminApprovals } = useRoleAccess();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  // Track pending approvals for notification badge
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (canAccessAdminApprovals()) {
        const { data } = await supabase
          .from('user_approval_requests')
          .select('id')
          .eq('status', 'pending');
        setPendingApprovalsCount(data?.length || 0);
      }
    };

    const fetchUpcomingAppointments = async () => {
      if (isStaffMember) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from('appointments')
          .select('id')
          .gte('appointment_date', today.toISOString())
          .lte('appointment_date', tomorrow.toISOString())
          .in('status', ['scheduled', 'confirmed']);
        
        setUpcomingAppointments(data?.length || 0);
      }
    };
      
    fetchPendingCount();
    fetchUpcomingAppointments();
      
    // Set up real-time subscriptions
    const channels = [];
    
    if (canAccessAdminApprovals()) {
      const approvalChannel = supabase
        .channel('pending-approvals-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_approval_requests'
          },
          () => {
            fetchPendingCount();
          }
        )
        .subscribe();
      channels.push(approvalChannel);
    }

    if (isStaffMember) {
      const appointmentChannel = supabase
        .channel('appointment-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          () => {
            fetchUpcomingAppointments();
          }
        )
        .subscribe();
      channels.push(appointmentChannel);
    }

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [canAccessAdminApprovals, isStaffMember]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    [
      "group relative rounded-2xl px-5 py-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-semibold border border-transparent backdrop-blur-sm overflow-hidden",
      isActive
        ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent text-blue-700 shadow-lg ring-1 ring-blue-200 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-blue-400 before:via-blue-600 before:to-blue-400"
        : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:via-slate-50 hover:to-slate-100/60 hover:text-slate-700 hover:shadow-sm hover:scale-[1.01] hover:translate-x-1 hover:border-slate-200"
    ].join(" ");

  // Filter navigation items based on user permissions
  const visiblePatientMenuItems = filterNavigationItems(patientMenuItems);
  const visiblePracticeDashboards = filterNavigationItems(practiceDashboards);
  const visiblePatientItems = filterNavigationItems(patientItems);
  const visibleSchedulingItems = filterNavigationItems(schedulingItems);
  const visibleAiItems = filterNavigationItems(aiItems);
  const visibleClinicalItems = filterNavigationItems(clinicalItems);
  const visibleReportsItems = filterNavigationItems(reportsItems);
  const visibleEnterpriseItems = filterNavigationItems(enterpriseItems);
  const visibleComplianceItems = filterNavigationItems(complianceItems);
  const visibleAdminItems = filterNavigationItems(adminItems);

  return (
    <Sidebar
      className={isCollapsed ? "w-20" : "w-80"}
      collapsible="icon"
    >
      <SidebarContent className="bg-slate-50 backdrop-blur-xl border-r border-slate-200 shadow-2xl animate-fade-in">
        {/* Professional Header */}
        <div className="relative p-8 border-b border-slate-200 bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-50"></div>
          <div className="relative flex items-center gap-5">
            <div className="relative group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg ring-1 ring-blue-200 transition-all duration-300 group-hover:shadow-blue-200 group-hover:scale-105">
                <Stethoscope className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-slate-50 animate-pulse shadow-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 space-y-2">
                <h1 className="font-bold text-2xl bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent tracking-tight">
                  DentalAI Pro
                </h1>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-sm backdrop-blur-sm">
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                  </div>
                  {subscribed && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-500/20 shadow-soft backdrop-blur-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Portal - Only show for patients */}
        {isPatient && visiblePatientMenuItems.length > 0 && (
          <SidebarGroup className="px-4 pt-8">
            <SidebarGroupLabel className="text-slate-600 uppercase tracking-wide text-sm font-bold px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-slate-100 to-transparent rounded-xl mb-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              My Dental Care
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {visiblePatientMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild tooltip={item.title}>
                       <NavLink to={item.url} className={getNavCls({ isActive: currentPath === item.url })}>
                         <div className="flex items-center gap-4 w-full relative">
                           <div className={`p-2.5 rounded-xl transition-all duration-300 ${currentPath === item.url ? 'bg-sidebar-primary/15 shadow-soft' : 'bg-sidebar-accent/40 group-hover:bg-sidebar-primary/10'}`}>
                             <item.icon className={`w-5 h-5 transition-all duration-300 ${currentPath === item.url ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-primary'}`} />
                           </div>
                           {!isCollapsed && (
                             <span className="font-semibold text-sm tracking-wide truncate">{item.title}</span>
                           )}
                         </div>
                       </NavLink>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Practice Management - Only show for staff */}
        {isStaffMember && visiblePracticeDashboards.length > 0 && (
          <SidebarGroup className="px-4 pt-6">
            <SidebarGroupLabel className="text-sidebar-muted-foreground uppercase tracking-wide text-sm font-bold px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-sidebar-accent/50 to-transparent rounded-xl mb-2">
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
              Practice Management
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {visiblePracticeDashboards.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavCls({ isActive: currentPath === item.url })}>
                        <div className="flex items-center gap-4 w-full relative">
                          <div className={`p-2.5 rounded-xl transition-all duration-300 ${currentPath === item.url ? 'bg-sidebar-primary/15 shadow-soft' : 'bg-sidebar-accent/40 group-hover:bg-sidebar-primary/10'}`}>
                            <item.icon className={`w-5 h-5 transition-all duration-300 ${currentPath === item.url ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-primary'}`} />
                          </div>
                          {!isCollapsed && (
                            <span className="font-semibold text-sm tracking-wide truncate">{item.title}</span>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Patient Management - Only show for staff */}
        {isStaffMember && visiblePatientItems.length > 0 && (
          <SidebarGroup className="px-3">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
              Patient Management
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {visiblePatientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavCls}>
                        <div className="flex items-center gap-4">
                          <item.icon className="h-5 w-5 text-current shrink-0" />
                          {!isCollapsed && (
                            <span className="font-medium text-sm tracking-wide">{item.title}</span>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* All other sections - Only show for staff */}
        {isStaffMember && (
          <>
            {/* Scheduling */}
            {visibleSchedulingItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  Scheduling
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                     {visibleSchedulingItems.map((item) => (
                       <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                           <NavLink to={item.url} className={getNavCls}>
                             <div className="flex items-center gap-4 w-full">
                               <item.icon className="h-5 w-5 text-current shrink-0" />
                               {!isCollapsed && (
                                 <div className="flex items-center justify-between w-full">
                                   <span className="font-medium text-sm tracking-wide">{item.title}</span>
                                   {item.title === "Appointment Calendar" && upcomingAppointments > 0 && (
                                     <Badge variant="secondary" className="ml-auto min-w-[1.25rem] h-5 px-2 text-xs bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30">
                                       {upcomingAppointments}
                                     </Badge>
                                   )}
                                 </div>
                               )}
                               {isCollapsed && item.title === "Appointment Calendar" && upcomingAppointments > 0 && (
                                 <span className="absolute -top-1 -right-1 bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center text-[10px] shadow-lg">
                                   {upcomingAppointments}
                                 </span>
                               )}
                             </div>
                           </NavLink>
                         </SidebarMenuButton>
                       </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Clinical AI Tools */}
            {visibleClinicalItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  Clinical AI
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                    {visibleClinicalItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* AI Features */}
            {visibleAiItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  AI Features
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                    {visibleAiItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Reports */}
            {visibleReportsItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  Analytics
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                    {visibleReportsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Enterprise Features */}
            {visibleEnterpriseItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  Enterprise & Operations
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                    {visibleEnterpriseItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Patient Experience & Compliance */}
            {visibleComplianceItems.length > 0 && (
              <SidebarGroup className="px-3">
                <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                  Patient & Compliance
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-1">
                  <SidebarMenu>
                    {visibleComplianceItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-current shrink-0" />
                              {!isCollapsed && (
                                <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}

        {/* Admin Tools - Show for clinic admins and corporate admins */}
        {visibleAdminItems.length > 0 && (
          <SidebarGroup className="px-3">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {visibleAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavCls}>
                        <div className="flex items-center gap-4 w-full">
                          <item.icon className="h-5 w-5 text-current shrink-0" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium text-sm tracking-wide">{item.title}</span>
                              {item.title === "User Approvals" && pendingApprovalsCount > 0 && (
                                <span className="bg-destructive/20 text-destructive text-xs rounded-full px-2.5 py-1 min-w-[20px] text-center font-semibold border border-destructive/30">
                                  {pendingApprovalsCount}
                                </span>
                              )}
                            </div>
                          )}
                          {isCollapsed && item.title === "User Approvals" && pendingApprovalsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center text-[10px] shadow-lg">
                              {pendingApprovalsCount}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Support - Show for all staff */}
        {isStaffMember && (
          <SidebarGroup className="mt-auto px-3">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-3 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
              Support & Collaboration
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Team Collaboration">
                    <NavLink to="/collaboration" className={getNavCls}>
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-current shrink-0" />
                        {!isCollapsed && (
                          <span className="font-medium text-sm tracking-wide">Team Collaboration</span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Tech Support">
                    <NavLink to="/tech-support" className={getNavCls}>
                      <div className="flex items-center gap-4">
                        <Headphones className="h-5 w-5 text-current shrink-0" />
                        {!isCollapsed && (
                          <span className="font-medium text-sm tracking-wide">Tech Support</span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup className="mt-auto px-3 pb-6">
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink to="/settings" className={getNavCls}>
                    <div className="flex items-center gap-4">
                      <Settings className="h-5 w-5 text-current shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm tracking-wide">Settings</span>
                      )}
                    </div>
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