import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientSignIn from "./pages/PatientSignIn";
import PatientSignUp from "./pages/PatientSignUp";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Settings from "./pages/Settings";

// Lazy load heavy pages for better initial load performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const DentistDashboard = lazy(() => import("./pages/DentistDashboard"));
const PracticeDashboard = lazy(() => import("./pages/PracticeDashboard"));
const Schedule = lazy(() => import("./pages/Schedule"));
const ScheduleManagement = lazy(() => import("./pages/ScheduleManagement"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const EmployeeOnboarding = lazy(() => import("./pages/EmployeeOnboarding"));
const AdminAddEmployee = lazy(() => import("./pages/AdminAddEmployee"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const MedicalHistory = lazy(() => import("./pages/MedicalHistory"));
const ConsentForms = lazy(() => import("./pages/ConsentForms"));
const VoiceTranscription = lazy(() => import("./pages/VoiceTranscription").then(m => ({ default: m.VoiceTranscription })));
const Translation = lazy(() => import("./pages/Translation").then(m => ({ default: m.Translation })));
const AIVoiceNotes = lazy(() => import("./pages/AIVoiceNotes"));
const VoiceAgent = lazy(() => import("./pages/VoiceAgent").then(m => ({ default: m.VoiceAgent })));
const ImageAnalysis = lazy(() => import("./pages/ImageAnalysis").then(m => ({ default: m.ImageAnalysis })));
const AIMarketing = lazy(() => import("./pages/AIMarketing"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const PracticeAnalytics = lazy(() => import("./pages/PracticeAnalytics"));
const PracticeAnalyticsDetail = lazy(() => import("./pages/PracticeAnalyticsDetail"));
const PredictiveAnalytics = lazy(() => import("./pages/PredictiveAnalytics").then(m => ({ default: m.PredictiveAnalytics })));
const InsuranceBilling = lazy(() => import("./pages/InsuranceBilling"));
const ClinicPaymentSettings = lazy(() => import("./pages/ClinicPaymentSettings"));
const AIScheduling = lazy(() => import("./pages/AIScheduling"));
const Teledentistry = lazy(() => import("./pages/Teledentistry"));
const MultiPracticeAnalytics = lazy(() => import("./pages/MultiPracticeAnalytics"));
const MarketingAutomation = lazy(() => import("./pages/MarketingAutomation"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));
const MyMedicalRecords = lazy(() => import("./pages/MyMedicalRecords"));
const MyTreatmentPlans = lazy(() => import("./pages/MyTreatmentPlans"));
const MyConsentForms = lazy(() => import("./pages/MyConsentForms"));
// Settings statically imported to avoid dynamic import issue
const XRayDiagnostics = lazy(() => import("./pages/XRayDiagnostics"));
const TreatmentPlanGenerator = lazy(() => import("./pages/TreatmentPlanGenerator"));
const VoiceToChart = lazy(() => import("./pages/VoiceToChart"));
const ChairsideAssistant = lazy(() => import("./pages/ChairsideAssistant"));
const SmartOperations = lazy(() => import("./pages/SmartOperations"));
const RevenueManagement = lazy(() => import("./pages/RevenueManagement"));
const PatientConcierge = lazy(() => import("./pages/PatientConcierge"));
const ComplianceSecurity = lazy(() => import("./pages/ComplianceSecurity"));
const TeledentistryEnhanced = lazy(() => import("./pages/TeledentistryEnhanced"));
const ReputationManagement = lazy(() => import("./pages/ReputationManagement"));
const LeadConversion = lazy(() => import("./pages/LeadConversion"));
const QuantumDentalAI = lazy(() => import("./pages/QuantumDentalAI"));
const QuantumScheduling = lazy(() => import("./pages/QuantumScheduling"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const AdminApprovalDashboard = lazy(() => import("./pages/AdminApprovalDashboard"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const AdminPasswordManagement = lazy(() => import("./pages/AdminPasswordManagement"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmployeeAccessFlow = lazy(() => import("./pages/EmployeeAccessFlow"));
const AdminNavigationPermissions = lazy(() => import("./pages/AdminNavigationPermissions"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const ProfessionalProfile = lazy(() => import("./pages/ProfessionalProfile"));
const QAChecklist = lazy(() => import("./pages/QAChecklist"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog"));
const DataMigration = lazy(() => import("./pages/DataMigration"));
const ModuleFlows = lazy(() => import("./pages/ModuleFlows"));
const PatientCharting = lazy(() => import("./pages/PatientCharting"));
const ToothCharting = lazy(() => import("./pages/ToothCharting"));

// New AI-powered modules
const AIPatientAnalytics = lazy(() => import("./pages/AIPatientAnalytics"));
const SmartDocumentation = lazy(() => import("./pages/SmartDocumentation"));
const PredictiveTreatment = lazy(() => import("./pages/PredictiveTreatment"));
const DentalModeling3D = lazy(() => import("./pages/DentalModeling3D"));
const PatientJourney = lazy(() => import("./pages/PatientJourney"));
const RealtimeMonitoring = lazy(() => import("./pages/RealtimeMonitoring"));
const RealtimeSystemsDashboard = lazy(() => import("./pages/RealtimeSystemsDashboard"));
const AdvancedSecurityDashboard = lazy(() => import("./pages/AdvancedSecurityDashboard"));
const ARTreatmentPreview = lazy(() => import("./pages/ARTreatmentPreview"));
const MicroscopicAnalysis = lazy(() => import("./pages/MicroscopicAnalysis"));
const ModuleAnalysisReport = lazy(() => import("./pages/ModuleAnalysisReport"));
const EmployeeTimeTracking = lazy(() => import("./pages/EmployeeTimeTracking"));
const EmployeeTimeAnalytics = lazy(() => import("./pages/EmployeeTimeAnalytics"));
const AdminSecuritySettings = lazy(() => import("./pages/AdminSecuritySettings"));
const AdminSQLQuery = lazy(() => import("./pages/AdminSQLQuery"));
const AdminDatabaseBackup = lazy(() => import("./pages/AdminDatabaseBackup"));
const ETLDeveloper = lazy(() => import("./pages/ETLDeveloper"));
const GamifiedKidsApp = lazy(() => import("./pages/GamifiedKidsApp"));
const ReferralNetwork = lazy(() => import("./pages/ReferralNetwork"));
const PersonalizedPreventiveCare = lazy(() => import("./pages/PersonalizedPreventiveCare"));
const LabManagement = lazy(() => import("./pages/LabManagement"));
const LabProviderDashboard = lazy(() => import("./pages/LabProviderDashboard"));
const LabProviderSignUp = lazy(() => import("./pages/LabProviderSignUp"));
const LabProviderAuth = lazy(() => import("./pages/LabProviderAuth"));
const TechSupport = lazy(() => import('./pages/TechSupport'));
const Collaboration = lazy(() => import('./pages/Collaboration'));
const InventoryManagement = lazy(() => import('./pages/InventoryManagement'));
const APIIntegrations = lazy(() => import('./pages/APIIntegrations'));
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function AuthProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <CurrencyProvider>
          <TenantProvider>
            <SidebarProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/lab-provider-signup" element={<LabProviderSignUp />} />
          <Route path="/lab-provider-auth" element={<Suspense fallback={<PageLoader />}><LabProviderAuth /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
          <Route path="/patient-signin" element={<PatientSignIn />} />
          <Route path="/patient-signup" element={<PatientSignUp />} />
          <Route path="/" element={<AuthProtectedRoute><Layout /></AuthProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="patient-dashboard" element={<Suspense fallback={<PageLoader />}><PatientDashboard /></Suspense>} />
            <Route path="dentist-dashboard" element={<Suspense fallback={<PageLoader />}><DentistDashboard /></Suspense>} />
            <Route path="practice-dashboard" element={<Suspense fallback={<PageLoader />}><PracticeDashboard /></Suspense>} />
            <Route path="schedule" element={<Suspense fallback={<PageLoader />}><Schedule /></Suspense>} />
            <Route path="schedule-management" element={<Suspense fallback={<PageLoader />}><ScheduleManagement /></Suspense>} />
            <Route path="patients" element={<Suspense fallback={<PageLoader />}><Patients /></Suspense>} />
            <Route path="patients/:id" element={<Suspense fallback={<PageLoader />}><PatientProfile /></Suspense>} />
            <Route path="medical-history" element={<Suspense fallback={<PageLoader />}><MedicalHistory /></Suspense>} />
            <Route path="consent-forms" element={<Suspense fallback={<PageLoader />}><ConsentForms /></Suspense>} />
            <Route path="my-appointments" element={<Suspense fallback={<PageLoader />}><MyAppointments /></Suspense>} />
            <Route path="my-medical-records" element={<Suspense fallback={<PageLoader />}><MyMedicalRecords /></Suspense>} />
            <Route path="my-treatment-plans" element={<Suspense fallback={<PageLoader />}><MyTreatmentPlans /></Suspense>} />
            <Route path="my-consent-forms" element={<Suspense fallback={<PageLoader />}><MyConsentForms /></Suspense>} />
            <Route path="voice-transcription" element={<Suspense fallback={<PageLoader />}><VoiceTranscription /></Suspense>} />
            <Route path="ai/voice" element={<Suspense fallback={<PageLoader />}><VoiceTranscription /></Suspense>} />
            <Route path="translation" element={<Suspense fallback={<PageLoader />}><Translation /></Suspense>} />
            <Route path="ai/translation" element={<Suspense fallback={<PageLoader />}><Translation /></Suspense>} />
            <Route path="ai-voice-notes" element={<Suspense fallback={<PageLoader />}><AIVoiceNotes /></Suspense>} />
            <Route path="voice-agent" element={<Suspense fallback={<PageLoader />}><VoiceAgent /></Suspense>} />
            <Route path="ai/voice-agent" element={<Suspense fallback={<PageLoader />}><VoiceAgent /></Suspense>} />
            <Route path="ai/agent" element={<Suspense fallback={<PageLoader />}><VoiceAgent /></Suspense>} />
            <Route path="image-analysis" element={<Suspense fallback={<PageLoader />}><ImageAnalysis /></Suspense>} />
            <Route path="ai/image-analysis" element={<Suspense fallback={<PageLoader />}><ImageAnalysis /></Suspense>} />
            <Route path="ai/image" element={<Suspense fallback={<PageLoader />}><ImageAnalysis /></Suspense>} />
            <Route path="ai-marketing" element={<Suspense fallback={<PageLoader />}><AIMarketing /></Suspense>} />
            <Route path="ai/marketing" element={<Suspense fallback={<PageLoader />}><AIMarketing /></Suspense>} />
            <Route path="ai-assistant" element={<Suspense fallback={<PageLoader />}><AIAssistant /></Suspense>} />
            <Route path="practice-analytics" element={<Suspense fallback={<PageLoader />}><PracticeAnalytics /></Suspense>} />
            <Route path="practice-analytics/:tenantId" element={<Suspense fallback={<PageLoader />}><PracticeAnalyticsDetail /></Suspense>} />
            <Route path="quantum-dental-ai" element={<Suspense fallback={<PageLoader />}><QuantumDentalAI /></Suspense>} />
            <Route path="quantum-scheduling" element={<Suspense fallback={<PageLoader />}><QuantumScheduling /></Suspense>} />
            <Route path="ai/analytics" element={<Suspense fallback={<PageLoader />}><PracticeAnalytics /></Suspense>} />
            <Route path="predictive-analytics" element={<Suspense fallback={<PageLoader />}><PredictiveAnalytics /></Suspense>} />
            <Route path="ai/predictive-analytics" element={<Suspense fallback={<PageLoader />}><PredictiveAnalytics /></Suspense>} />
            <Route path="ai/predictive" element={<Suspense fallback={<PageLoader />}><PredictiveAnalytics /></Suspense>} />
            <Route path="insurance-billing" element={<Suspense fallback={<PageLoader />}><InsuranceBilling /></Suspense>} />
            <Route path="clinic-payment-settings" element={<Suspense fallback={<PageLoader />}><ClinicPaymentSettings /></Suspense>} />
            <Route path="ai-scheduling" element={<Suspense fallback={<PageLoader />}><AIScheduling /></Suspense>} />
            <Route path="ai/scheduling" element={<Suspense fallback={<PageLoader />}><AIScheduling /></Suspense>} />
            <Route path="teledentistry" element={<Suspense fallback={<PageLoader />}><Teledentistry /></Suspense>} />
            <Route path="multi-practice-analytics" element={<Suspense fallback={<PageLoader />}><MultiPracticeAnalytics /></Suspense>} />
            <Route path="marketing-automation" element={<Suspense fallback={<PageLoader />}><MarketingAutomation /></Suspense>} />
            <Route path="reports/patients" element={<Suspense fallback={<PageLoader />}><PracticeAnalytics /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<PageLoader />}><PracticeAnalytics /></Suspense>} />
            <Route path="patient-insights" element={<Suspense fallback={<PageLoader />}><PracticeAnalytics /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            <Route path="my-profile" element={<Suspense fallback={<PageLoader />}><MyProfile /></Suspense>} />
            <Route path="professional-profile" element={<Suspense fallback={<PageLoader />}><ProfessionalProfile /></Suspense>} />
            <Route path="xray-diagnostics" element={<Suspense fallback={<PageLoader />}><XRayDiagnostics /></Suspense>} />
            <Route path="treatment-plans" element={<Suspense fallback={<PageLoader />}><TreatmentPlanGenerator /></Suspense>} />
            <Route path="voice-to-chart" element={<Suspense fallback={<PageLoader />}><VoiceToChart /></Suspense>} />
            <Route path="chairside-assistant" element={<Suspense fallback={<PageLoader />}><ChairsideAssistant /></Suspense>} />
            <Route path="smart-operations" element={<Suspense fallback={<PageLoader />}><SmartOperations /></Suspense>} />
            <Route path="revenue-management" element={<Suspense fallback={<PageLoader />}><RevenueManagement /></Suspense>} />
            <Route path="patient-concierge" element={<Suspense fallback={<PageLoader />}><PatientConcierge /></Suspense>} />
            <Route path="compliance-security" element={<Suspense fallback={<PageLoader />}><ComplianceSecurity /></Suspense>} />
            <Route path="teledentistry-enhanced" element={<Suspense fallback={<PageLoader />}><TeledentistryEnhanced /></Suspense>} />
            <Route path="reputation-management" element={<Suspense fallback={<PageLoader />}><ReputationManagement /></Suspense>} />
            <Route path="lead-conversion" element={<Suspense fallback={<PageLoader />}><LeadConversion /></Suspense>} />
            <Route path="market-intelligence" element={<Suspense fallback={<PageLoader />}><MarketIntelligence /></Suspense>} />
            <Route path="admin/user-approvals" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminApprovalDashboard /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/employees" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><TeamManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/team" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><TeamManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/user-management" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminUserManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/passwords" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminPasswordManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/employee-flow" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><EmployeeAccessFlow /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/employees/new" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminAddEmployee /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/navigation-permissions" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminNavigationPermissions /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/audit-log" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminAuditLog /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/data-migration" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><DataMigration /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/module-flows" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><ModuleFlows /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/security-settings" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminSecuritySettings /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/sql-query" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminSQLQuery /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/database-backup" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminDatabaseBackup /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="admin/etl-developer" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><ETLDeveloper /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="patient-charting" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><PatientCharting /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="tooth-charting" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><ToothCharting /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="ai/patient-analytics" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><AIPatientAnalytics /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="smart-documentation" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'staff']}>
                <Suspense fallback={<PageLoader />}><SmartDocumentation /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="predictive-treatment" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><PredictiveTreatment /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="3d-dental-modeling" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><DentalModeling3D /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="patient-journey" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><PatientJourney /></Suspense>
              </ProtectedRoute>
            } />
             <Route path="real-time-monitoring" element={
               <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                 <Suspense fallback={<PageLoader />}><RealtimeMonitoring /></Suspense>
               </ProtectedRoute>
             } />
             <Route path="realtime-systems" element={
               <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                 <Suspense fallback={<PageLoader />}><RealtimeSystemsDashboard /></Suspense>
               </ProtectedRoute>
             } />
             <Route path="advanced-security" element={
               <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                 <Suspense fallback={<PageLoader />}><AdvancedSecurityDashboard /></Suspense>
               </ProtectedRoute>
             } />
            <Route path="ar-treatment-preview" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><ARTreatmentPreview /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="microscopic-analysis" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><MicroscopicAnalysis /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="module-analysis-report" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><ModuleAnalysisReport /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="employee-time-tracking" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'staff']}>
                <Suspense fallback={<PageLoader />}><EmployeeTimeTracking /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="employee-time-analytics" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'staff']}>
                <Suspense fallback={<PageLoader />}><EmployeeTimeAnalytics /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="qa-checklist" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><QAChecklist /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="gamified-kids-app" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><GamifiedKidsApp /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="referral-network" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist']}>
                <Suspense fallback={<PageLoader />}><ReferralNetwork /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="personalized-preventive-care" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist']}>
                <Suspense fallback={<PageLoader />}><PersonalizedPreventiveCare /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="lab-management" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist']}>
                <Suspense fallback={<PageLoader />}><LabManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="lab-provider-dashboard" element={
              <Suspense fallback={<PageLoader />}><LabProviderDashboard /></Suspense>
            } />
            <Route path="employee-onboarding" element={<Suspense fallback={<PageLoader />}><EmployeeOnboarding /></Suspense>} />
            <Route path="tech-support" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><TechSupport /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="collaboration" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><Collaboration /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><InventoryManagement /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="api-integrations" element={
              <ProtectedRoute requiredRoles={['admin', 'dentist', 'hygienist', 'staff']}>
                <Suspense fallback={<PageLoader />}><APIIntegrations /></Suspense>
              </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
            </SidebarProvider>
          </TenantProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </TooltipProvider>
  );
}

export default App;
