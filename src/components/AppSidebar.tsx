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
  TrendingUp as TrendIcon
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
  { title: "Patient Management", url: "/patients", icon: Users, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'patients' },
  { title: "Medical History", url: "/medical-history", icon: FileText, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'medical_history' },
  { title: "Consent Forms", url: "/consent-forms", icon: Shield, requiredRoles: ['admin', 'dentist', 'staff'], moduleKey: 'consent_forms' },
  { title: "Treatment Plans", url: "/treatment-plans", icon: Stethoscope, requiredRoles: ['admin', 'dentist'], moduleKey: 'treatment_plans' },
  { title: "Insurance & Billing", url: "/insurance-billing", icon: CreditCard, requiredRoles: ['admin', 'staff'], requiredFeature: 'basic', moduleKey: 'insurance_billing' },
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
];

const clinicalItems: NavigationItem[] = [
  { title: "X-Ray Diagnostics", url: "/xray-diagnostics", icon: Scan, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'xray_diagnostics' },
  { title: "Treatment Plans", url: "/treatment-plans", icon: ClipboardList, requiredRoles: ['admin', 'dentist'], moduleKey: 'treatment_plans' },
  { title: "Voice-to-Chart", url: "/voice-to-chart", icon: MicVocal, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'voice_to_chart' },
  { title: "Chairside Assistant", url: "/chairside-assistant", icon: HeartHandshake, requiredRoles: ['admin', 'dentist'], requiredFeature: 'ai_features', moduleKey: 'chairside_assistant' },
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
];

const adminItems: NavigationItem[] = [
  { title: "User Approvals", url: "/admin/user-approvals", icon: UserPlus, requiredRoles: ['admin'], moduleKey: 'admin_user_approvals' },
  { title: "Employees", url: "/admin/employees", icon: Users, requiredRoles: ['admin'], moduleKey: 'admin_employees' },
  { title: "Role Assignment", url: "/admin/roles", icon: User, requiredRoles: ['admin'], moduleKey: 'admin_roles' },
  { title: "Password Management", url: "/admin/passwords", icon: Lock, requiredRoles: ['admin'], moduleKey: 'admin_passwords' },
  { title: "Add Employee", url: "/admin/employees/new", icon: UserPlus, requiredRoles: ['admin'], moduleKey: 'admin_add_employee' },
  { title: "Module Access", url: "/admin/navigation-permissions", icon: Settings, requiredRoles: ['admin'], moduleKey: 'admin_navigation_permissions' },
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
      "group relative rounded-lg px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring hover-scale font-medium border border-transparent",
      isActive
        ? "bg-sidebar-accent text-sidebar-primary ring-1 ring-sidebar-primary/30 shadow-elegant before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full before:bg-sidebar-primary"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-elegant"
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
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-sidebar backdrop-blur-md border-r border-sidebar-border shadow-lg animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-transparent bg-sidebar-accent/40 backdrop-blur-sm shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg gradient-text">DentalAI Pro</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-sidebar-foreground/70">
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)} {subscribed && '• Premium'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Portal - Only show for patients */}
        {isPatient && visiblePatientMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
              My Dental Care
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visiblePatientMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
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
        )}

        {/* Practice Management - Only show for staff */}
        {isStaffMember && visiblePracticeDashboards.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
              Practice Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visiblePracticeDashboards.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
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
        )}

        {/* Patient Management - Only show for staff */}
        {isStaffMember && visiblePatientItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
              Patient Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visiblePatientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
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
        )}

        {/* All other sections - Only show for staff */}
        {isStaffMember && (
          <>
            {/* Scheduling */}
            {visibleSchedulingItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  Scheduling
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                     {visibleSchedulingItems.map((item) => (
                       <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
                           <NavLink to={item.url} className={getNavCls}>
                             <item.icon className="h-4 w-4 text-current" />
                             {!isCollapsed && (
                               <div className="flex items-center justify-between w-full">
                                 <span className="font-medium">{item.title}</span>
                                 {item.title === "Appointment Calendar" && upcomingAppointments > 0 && (
                                   <Badge variant="secondary" className="ml-auto min-w-[1.25rem] h-5 px-1 text-xs">
                                     {upcomingAppointments}
                                   </Badge>
                                 )}
                               </div>
                             )}
                             {isCollapsed && item.title === "Appointment Calendar" && upcomingAppointments > 0 && (
                               <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center text-[10px]">
                                 {upcomingAppointments}
                               </span>
                             )}
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
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  Clinical AI
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleClinicalItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
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
            )}

            {/* AI Features */}
            {visibleAiItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  AI Features
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleAiItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
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
            )}

            {/* Reports */}
            {visibleReportsItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  Analytics
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleReportsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
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
            )}

            {/* Enterprise Features */}
            {visibleEnterpriseItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  Enterprise & Operations
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleEnterpriseItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
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
            )}

            {/* Patient Experience & Compliance */}
            {visibleComplianceItems.length > 0 && (
              <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
                  Patient & Compliance
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleComplianceItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                         <SidebarMenuButton asChild tooltip={item.title}>
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
            )}
          </>
        )}

        {/* Admin Tools - Show for clinic admins and corporate admins */}
        {canAccessAdminApprovals() && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/80 uppercase tracking-wider text-xs font-semibold px-3 py-2 mx-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="User Approvals">
                    <NavLink to="/admin/user-approvals" className={getNavCls}>
                      <UserPlus className="h-4 w-4 text-current" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">User Approvals</span>
                          {pendingApprovalsCount > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {pendingApprovalsCount}
                            </span>
                          )}
                        </div>
                      )}
                      {isCollapsed && pendingApprovalsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center text-[10px]">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Employees">
                    <NavLink to="/admin/employees" className={getNavCls}>
                      <Users className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">Employees</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Role Assignment">
                    <NavLink to="/admin/roles" className={getNavCls}>
                      <User className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">Role Assignment</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Employee & Staff Access">
                    <NavLink to="/admin/employee-flow" className={getNavCls}>
                      <ClipboardList className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">Employee & Staff Access</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Password Management">
                    <NavLink to="/admin/passwords" className={getNavCls}>
                      <Lock className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">Password Management</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Add Employee">
                    <NavLink to="/admin/employees/new" className={getNavCls}>
                      <UserPlus className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">Add Employee</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="QA Checklist">
                    <NavLink to="/qa-checklist" className={getNavCls}>
                      <ClipboardList className="h-4 w-4 text-current" />
                      {!isCollapsed && <span className="font-medium">QA Checklist</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
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