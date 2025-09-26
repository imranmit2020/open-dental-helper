import { 
  Users, 
  Calendar, 
  FileText, 
  Lightbulb, 
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
  CalendarHeart,
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
  Layers3,
  PenTool,
  Activity,
  Eye,
  Microscope,
  Compass,
  FlaskConical,
  Headphones,
  Package,
  ChevronDown,
  Home,
  Building2,
  NotebookPen,
  Clipboard,
  CalendarClock,
  CalendarCheck,
  MonitorSpeaker,
  ScanEye,
  Languages,
  ChartNoAxesGantt,
  FileCheck,
  Network,
  Box,
  Route,
  MonitorDot,
  ShieldCheck,
  UserCheck,
  Gamepad2,
  Heart,
  Key,
  ScrollText,
  FolderOpen,
  Terminal,
  Workflow,
  CheckSquare,
  MessageCircle,
  BookOpen,
  Users2,
  FileEdit,
  Clock
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
  { title: "AI Smart Scheduling", url: "/ai-scheduling", icon: CalendarHeart, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'ai_scheduling' },
  { title: "Teledentistry", url: "/teledentistry", icon: Video, requiredRoles: ['admin', 'dentist'], requiredFeature: 'teledentistry', moduleKey: 'teledentistry' },
  { title: "Enhanced Teledentistry", url: "/teledentistry-enhanced", icon: VideoIcon, requiredRoles: ['admin', 'dentist'], requiredFeature: 'teledentistry', moduleKey: 'teledentistry_enhanced' },
];

const aiItems: NavigationItem[] = [
  { title: "Voice Transcription", url: "/ai/voice", icon: Mic, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'voice_transcription' },
  { title: "Image Analysis", url: "/ai/image", icon: Camera, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'image_analysis' },
  { title: "Voice Agent", url: "/ai/agent", icon: MessageCircle, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'voice_agent' },
  { title: "Translation", url: "/ai/translation", icon: Languages, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features', moduleKey: 'translation' },
  { title: "Predictive Analytics", url: "/ai/analytics", icon: BarChart3, requiredRoles: ['admin', 'dentist'], requiredFeature: 'analytics', moduleKey: 'analytics' },
  { title: "AI Marketing", url: "/ai-marketing", icon: Target, requiredRoles: ['admin'], requiredFeature: 'ai_features', moduleKey: 'ai_marketing' },
  { title: "AI Assistant", url: "/ai-assistant", icon: Users2, requiredRoles: ['admin', 'dentist', 'hygienist', 'staff'], moduleKey: 'ai_assistant' },
  { title: "AI Patient Analytics", url: "/ai/patient-analytics", icon: Lightbulb, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Smart Documentation", url: "/smart-documentation", icon: PenTool, requiredRoles: ['admin', 'dentist', 'staff'], requiredFeature: 'ai_features' },
  { title: "Predictive Treatment", url: "/predictive-treatment", icon: Compass, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
];

const clinicalItems: NavigationItem[] = [
  { title: "X-Ray Diagnostics", url: "/xray-diagnostics", icon: Scan, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'xray_diagnostics' },
  { title: "Voice-to-Chart", url: "/voice-to-chart", icon: MicVocal, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'voice_to_chart' },
  { title: "Chairside Assistant", url: "/chairside-assistant", icon: HeartHandshake, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'chairside_assistant' },
  { title: "Referral Network", url: "/referral-network", icon: Users, requiredRoles: ['admin', 'dentist'] },
  { title: "3D Dental Modeling", url: "/3d-dental-modeling", icon: Layers3, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Patient Journey", url: "/patient-journey", icon: TrendingUp, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Real-time Monitoring", url: "/real-time-monitoring", icon: Activity, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Real-Time Systems", url: "/realtime-systems", icon: Activity, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Advanced Security", url: "/advanced-security", icon: Shield, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "IoT & Hardware", url: "/iot-hardware", icon: Settings, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
  { title: "Next-Gen AI Features", url: "/next-gen-ai", icon: BookOpen, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features' },
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
  
  // Track expanded/collapsed state for each section
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'practice-management': false,
    'patient-management': true,
    'scheduling': true,
    'ai-tools': false,
    'clinical-ai': false,
    'reports-analytics': false,
    'enterprise': false,
    'compliance-care': false,
    'administration': false,
    'my-dental-care': true,
    'quick-access': true,
    'support': true
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

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
      "group relative rounded-2xl px-4 py-4 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-semibold border border-transparent mx-2 my-1 overflow-hidden",
      isActive
        ? "bg-gradient-to-r from-primary via-primary-glow to-secondary text-white shadow-glow scale-[1.02] border-primary/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-pulse"
        : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:via-blue-500/10 hover:to-cyan-500/10 hover:text-sidebar-foreground hover:shadow-lg hover:scale-[1.02] hover:border-purple-300/20 backdrop-blur-sm hover:backdrop-blur-md"
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

  const MenuItem = ({ item, isActive = false, showBadge = false, badgeCount = 0, badgeType = "secondary" }: { 
    item: NavigationItem,
    isActive?: boolean,
    showBadge?: boolean, 
    badgeCount?: number,
    badgeType?: "secondary" | "destructive" 
  }) => (
    <SidebarMenuItem className="group">
      <SidebarMenuButton asChild tooltip={item.title} className="!p-0 !bg-transparent hover:!bg-transparent">
        <NavLink to={item.url} className={getNavCls({ isActive })}>
          <div className="flex items-center gap-4 w-full relative z-10">
            <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors duration-300 ${
              isActive 
                ? 'bg-white/20 shadow-lg' 
                : 'bg-sidebar-accent/40 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-cyan-500/20'
            }`}>
              <item.icon className={`h-5 w-5 transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-sidebar-foreground'
              }`} />
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className={`${isActive ? 'text-white' : 'text-sidebar-foreground'} text-sm font-semibold transition-all duration-300`}>
                    {item.title}
                  </span>
                </div>
                {showBadge && badgeCount > 0 && (
                  <div className={`relative flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full transition-all duration-300 ${
                    badgeType === "destructive" 
                      ? "bg-destructive/90 text-destructive-foreground shadow-lg" 
                      : "bg-primary/90 text-primary-foreground shadow-lg"
                  }`}>
                    <span className="text-xs font-bold">{badgeCount}</span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            )}
            {isCollapsed && showBadge && badgeCount > 0 && (
              <div className={`absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${
                badgeType === "destructive" 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                {badgeCount}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
            )}
          </div>
          {/* Animated background overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-300/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const SectionGroup = ({ title, icon: Icon, items, className = "", sectionKey }: {
    title: string,
    icon: any,
    items: NavigationItem[],
    className?: string,
    sectionKey: string
  }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className={`relative px-3 py-4 ${className}`}>
        {/* Section Header */}
        <div className="relative mb-4 px-3">
          <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-sidebar-accent/40 to-sidebar-accent/20 backdrop-blur-sm border border-sidebar-border/20 shadow-sm hover:from-purple-500/10 hover:via-blue-500/10 hover:to-cyan-500/10 hover:border-purple-300/30 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <h3 className="text-sidebar-foreground font-bold text-sm uppercase tracking-wider">
                    {title}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-primary/40 hover:to-secondary/40 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown className="h-4 w-4 text-primary font-bold drop-shadow-sm" />
                </div>
              </>
            )}
          </button>
          {/* Decorative line */}
          <div className="absolute left-6 right-6 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/30 to-transparent" />
        </div>
        
        {/* Menu Items with Collapsible Animation */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <SidebarGroup className="space-y-1">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item, index) => (
                  <div
                    key={item.title}
                    className="animate-fade-in"
                    style={{ 
                      animationDelay: isExpanded ? `${index * 50}ms` : '0ms',
                      animationFillMode: 'both'
                    }}
                  >
                    <MenuItem 
                      item={item}
                      isActive={currentPath === item.url}
                      showBadge={item.title === "Appointment Calendar" || item.title === "User Approvals"}
                      badgeCount={item.title === "Appointment Calendar" ? upcomingAppointments : pendingApprovalsCount}
                      badgeType={item.title === "User Approvals" ? "destructive" : "secondary"}
                    />
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </div>
    );
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-20" : "w-80"} fixed right-0 top-0 h-full z-50`}
      collapsible="icon"
      side="right"
    >
      <SidebarContent className="relative bg-gradient-to-b from-sidebar-background/95 via-sidebar-background/98 to-sidebar-background backdrop-blur-2xl border-l border-sidebar-border/30 shadow-2xl animate-fade-in overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-secondary/20 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-gradient-to-r from-transparent via-sidebar-border/20 to-transparent">
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 backdrop-blur-sm border border-sidebar-border/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-2xl flex items-center justify-center shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Stethoscope className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-success to-success-light rounded-full border-2 border-sidebar-background animate-bounce shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <h1 className="font-bold text-2xl bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    DentalAI Pro
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-sidebar-accent/60 to-sidebar-accent/40 rounded-full border border-sidebar-border/20">
                      <span className="text-xs font-semibold text-sidebar-foreground">
                        {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                      </span>
                    </div>
                    {subscribed && (
                      <div className="relative px-3 py-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-glow">
                        <span className="text-xs font-bold text-white">Premium</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Patient Portal - Only show for patients */}
          {isPatient && visiblePatientMenuItems.length > 0 && (
            <SectionGroup title="My Dental Care" icon={Star} items={visiblePatientMenuItems} className="pt-2" sectionKey="my-dental-care" />
          )}

          {/* Staff Sections - Only show for staff */}
          {isStaffMember && (
            <>
              {visiblePracticeDashboards.length > 0 && (
                <SectionGroup title="Practice Management" icon={Building} items={visiblePracticeDashboards} sectionKey="practice-management" />
              )}

              {visiblePatientItems.length > 0 && (
                <SectionGroup title="Patient Management" icon={Users} items={visiblePatientItems} sectionKey="patient-management" />
              )}

              {visibleSchedulingItems.length > 0 && (
                <SectionGroup title="Scheduling" icon={Calendar} items={visibleSchedulingItems} sectionKey="scheduling" />
              )}

              {visibleAiItems.length > 0 && (
                <SectionGroup title="AI Tools" icon={Lightbulb} items={visibleAiItems} sectionKey="ai-tools" />
              )}

              {visibleClinicalItems.length > 0 && (
                <SectionGroup title="Clinical AI" icon={Stethoscope} items={visibleClinicalItems} sectionKey="clinical-ai" />
              )}

              {visibleReportsItems.length > 0 && (
                <SectionGroup title="Reports & Analytics" icon={BarChart3} items={visibleReportsItems} sectionKey="reports-analytics" />
              )}

              {visibleEnterpriseItems.length > 0 && (
                <SectionGroup title="Enterprise" icon={TrendingUp} items={visibleEnterpriseItems} sectionKey="enterprise" />
              )}

              {visibleComplianceItems.length > 0 && (
                <SectionGroup title="Compliance & Care" icon={Shield} items={visibleComplianceItems} sectionKey="compliance-care" />
              )}
            </>
          )}

          {/* Admin Tools - Show for clinic admins */}
          {visibleAdminItems.length > 0 && (
            <SectionGroup title="Administration" icon={Settings} items={visibleAdminItems} sectionKey="administration" />
          )}

          {/* Fallback Quick Access - if no items visible */}
          {isStaffMember && (
            (visiblePracticeDashboards.length + visiblePatientItems.length + visibleSchedulingItems.length + visibleAiItems.length + visibleClinicalItems.length + visibleReportsItems.length + visibleEnterpriseItems.length + visibleComplianceItems.length) === 0 && (
              <SectionGroup 
                title="Quick Access" 
                icon={TrendingUp} 
                items={[
                  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
                  { title: "Patients", url: "/patients", icon: Users },
                  { title: "Schedule", url: "/schedule", icon: Calendar }
                ]} 
                sectionKey="quick-access"
              />
            )
          )}
        </div>

        {/* Footer - Support & Collaboration */}
        {isStaffMember && (
          <div className="relative z-10 mt-auto p-3 border-t border-gradient-to-r from-transparent via-sidebar-border/20 to-transparent">
            <div className="relative p-3 rounded-2xl bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 backdrop-blur-sm border border-sidebar-border/10">
              <button
                onClick={() => toggleSection('support')}
                className="w-full flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:via-blue-500/10 hover:to-cyan-500/10 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Headphones className="h-3 w-3 text-primary" />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="text-xs font-bold text-sidebar-foreground/80 uppercase tracking-wider flex-1 text-left">
                      Support
                    </span>
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center transition-all duration-300 ${expandedSections.support ? 'rotate-180' : 'rotate-0'}`}>
                      <ChevronDown className="h-3 w-3 text-primary font-bold drop-shadow-sm" />
                    </div>
                  </>
                )}
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-out ${
                expandedSections.support ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-1">
                  <MenuItem item={{ title: "Team Collaboration", url: "/collaboration", icon: Users }} isActive={currentPath === "/collaboration"} />
                  <MenuItem item={{ title: "Tech Support", url: "/tech-support", icon: Headphones }} isActive={currentPath === "/tech-support"} />
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}