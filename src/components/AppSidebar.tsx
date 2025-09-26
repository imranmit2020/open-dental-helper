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
      "group relative rounded-xl px-4 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring font-semibold border border-transparent mx-2 my-1",
      isActive
        ? "bg-gradient-primary text-white shadow-glow scale-105 border-primary/20 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-white/30"
        : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground hover:shadow-elegant hover:scale-105 hover:border-sidebar-border/50"
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

  const MenuItem = ({ item, showBadge = false, badgeCount = 0, badgeType = "secondary" }: { 
    item: NavigationItem, 
    showBadge?: boolean, 
    badgeCount?: number,
    badgeType?: "secondary" | "destructive" 
  }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title}>
        <NavLink to={item.url} className={getNavCls}>
          <div className="flex items-center gap-3 w-full relative">
            <div className="w-5 h-5 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-current" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{item.title}</span>
                {showBadge && badgeCount > 0 && (
                  <Badge 
                    variant={badgeType} 
                    className={`ml-auto min-w-[1.25rem] h-5 px-1 text-xs ${
                      badgeType === "destructive" ? "bg-destructive text-destructive-foreground" : ""
                    }`}
                  >
                    {badgeCount}
                  </Badge>
                )}
              </div>
            )}
            {isCollapsed && showBadge && badgeCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center text-[10px] ${
                badgeType === "destructive" 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                {badgeCount}
              </span>
            )}
          </div>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const SectionGroup = ({ title, icon: Icon, items, className = "" }: {
    title: string,
    icon: any,
    items: NavigationItem[],
    className?: string
  }) => (
    <SidebarGroup className={`px-2 py-2 ${className}`}>
            <SidebarGroupLabel className="text-sidebar-foreground/90 uppercase tracking-widest text-xs font-bold px-4 py-3 mb-2 bg-sidebar-accent/30 rounded-lg">
        <Icon className="h-3 w-3 inline mr-2" />
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent className="space-y-1">
        <SidebarMenu>
          {items.map((item) => (
            <MenuItem 
              key={item.title} 
              item={item}
              showBadge={item.title === "Appointment Calendar"}
              badgeCount={upcomingAppointments}
              badgeType="secondary"
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      className={`${isCollapsed ? "w-20" : "w-80"} fixed right-0 top-0 h-full z-50`}
      collapsible="icon"
      side="right"
    >
      <SidebarContent className="bg-gradient-sidebar backdrop-blur-xl border-l border-sidebar-border/50 shadow-glow animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border/30 bg-gradient-to-br from-sidebar-accent/60 to-sidebar-accent/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow hover-scale">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-sidebar-background animate-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">DentalAI Pro</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-sidebar-foreground/80">
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                  </p>
                  {subscribed && (
                    <div className="px-2 py-0.5 bg-gradient-primary rounded-full">
                      <span className="text-xs font-semibold text-white">Premium</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Portal - Only show for patients */}
        {isPatient && visiblePatientMenuItems.length > 0 && (
          <SectionGroup title="My Dental Care" icon={Star} items={visiblePatientMenuItems} className="py-4" />
        )}

        {/* Staff Sections - Only show for staff */}
        {isStaffMember && (
          <>
            {visiblePracticeDashboards.length > 0 && (
              <SectionGroup title="Practice Management" icon={Building} items={visiblePracticeDashboards} />
            )}

            {visiblePatientItems.length > 0 && (
              <SectionGroup title="Patient Management" icon={Users} items={visiblePatientItems} />
            )}

            {visibleSchedulingItems.length > 0 && (
              <SectionGroup title="Scheduling" icon={Calendar} items={visibleSchedulingItems} />
            )}

            {visibleAiItems.length > 0 && (
              <SectionGroup title="AI Tools" icon={Brain} items={visibleAiItems} />
            )}

            {visibleClinicalItems.length > 0 && (
              <SectionGroup title="Clinical AI" icon={Stethoscope} items={visibleClinicalItems} />
            )}

            {visibleReportsItems.length > 0 && (
              <SectionGroup title="Reports & Analytics" icon={BarChart3} items={visibleReportsItems} />
            )}

            {visibleEnterpriseItems.length > 0 && (
              <SectionGroup title="Enterprise" icon={TrendingUp} items={visibleEnterpriseItems} />
            )}

            {visibleComplianceItems.length > 0 && (
              <SectionGroup title="Compliance & Care" icon={Shield} items={visibleComplianceItems} />
            )}
          </>
        )}

        {/* Admin Tools - Show for clinic admins */}
        {visibleAdminItems.length > 0 && (
          <SidebarGroup className="px-2 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-4 py-3 mb-2 bg-sidebar-accent/30 rounded-lg">
              <Settings className="h-3 w-3 inline mr-2" />
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {visibleAdminItems.map((item) => (
                  <MenuItem 
                    key={item.title} 
                    item={item}
                    showBadge={item.title === "User Approvals"}
                    badgeCount={pendingApprovalsCount}
                    badgeType="destructive"
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Fallback Quick Access - if no items visible */}
        {isStaffMember && (
          (visiblePracticeDashboards.length + visiblePatientItems.length + visibleSchedulingItems.length + visibleAiItems.length + visibleClinicalItems.length + visibleReportsItems.length + visibleEnterpriseItems.length + visibleComplianceItems.length) === 0 && (
            <SidebarGroup className="px-2 py-2">
              <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-4 py-3 mb-2 bg-sidebar-accent/30 rounded-lg">
                Quick Access
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  <MenuItem item={{ title: "Dashboard", url: "/dashboard", icon: TrendingUp }} />
                  <MenuItem item={{ title: "Patients", url: "/patients", icon: Users }} />
                  <MenuItem item={{ title: "Schedule", url: "/schedule", icon: Calendar }} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        )}

        {/* Support - Show for all staff */}
        {isStaffMember && (
          <SidebarGroup className="mt-auto px-2 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-xs font-bold px-4 py-3 mb-2 bg-sidebar-accent/30 rounded-lg">
              <Headphones className="h-3 w-3 inline mr-2" />
              Support & Collaboration
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                <MenuItem item={{ title: "Team Collaboration", url: "/collaboration", icon: Users }} />
                <MenuItem item={{ title: "Tech Support", url: "/tech-support", icon: Headphones }} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}