import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DentistDashboard from "./pages/DentistDashboard";
import PracticeDashboard from "./pages/PracticeDashboard";
import Schedule from "./pages/Schedule";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import MedicalHistory from "./pages/MedicalHistory";
import ConsentForms from "./pages/ConsentForms";
import { VoiceTranscription } from "./pages/VoiceTranscription";
import { Translation } from "./pages/Translation";
import AIVoiceNotes from "./pages/AIVoiceNotes";
import { VoiceAgent } from "./pages/VoiceAgent";
import { ImageAnalysis } from "./pages/ImageAnalysis";
import AIMarketing from "./pages/AIMarketing";
import PracticeAnalytics from "./pages/PracticeAnalytics";
import { PredictiveAnalytics } from "./pages/PredictiveAnalytics";
import InsuranceBilling from "./pages/InsuranceBilling";
import AIScheduling from "./pages/AIScheduling";
import Teledentistry from "./pages/Teledentistry";
import MultiPracticeAnalytics from "./pages/MultiPracticeAnalytics";
import MarketingAutomation from "./pages/MarketingAutomation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import XRayDiagnostics from "./pages/XRayDiagnostics";
import TreatmentPlanGenerator from "./pages/TreatmentPlanGenerator";
import VoiceToChart from "./pages/VoiceToChart";
import ChairsideAssistant from "./pages/ChairsideAssistant";
import SmartOperations from "./pages/SmartOperations";
import RevenueManagement from "./pages/RevenueManagement";
import PatientConcierge from "./pages/PatientConcierge";
import ComplianceSecurity from "./pages/ComplianceSecurity";
import TeledentistryEnhanced from "./pages/TeledentistryEnhanced";
import ReputationManagement from "./pages/ReputationManagement";
import LeadConversion from "./pages/LeadConversion";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
          <SidebarProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patient-dashboard" element={<PatientDashboard />} />
            <Route path="dentist-dashboard" element={<DentistDashboard />} />
            <Route path="practice-dashboard" element={<PracticeDashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="consent-forms" element={<ConsentForms />} />
            <Route path="voice-transcription" element={<VoiceTranscription />} />
            <Route path="ai/voice" element={<VoiceTranscription />} />
            <Route path="translation" element={<Translation />} />
            <Route path="ai/translation" element={<Translation />} />
            <Route path="ai-voice-notes" element={<AIVoiceNotes />} />
            <Route path="voice-agent" element={<VoiceAgent />} />
            <Route path="ai/voice-agent" element={<VoiceAgent />} />
            <Route path="ai/agent" element={<VoiceAgent />} />
            <Route path="image-analysis" element={<ImageAnalysis />} />
            <Route path="ai/image-analysis" element={<ImageAnalysis />} />
            <Route path="ai/image" element={<ImageAnalysis />} />
            <Route path="ai-marketing" element={<AIMarketing />} />
            <Route path="ai/marketing" element={<AIMarketing />} />
            <Route path="practice-analytics" element={<PracticeAnalytics />} />
            <Route path="ai/analytics" element={<PracticeAnalytics />} />
            <Route path="predictive-analytics" element={<PredictiveAnalytics />} />
            <Route path="ai/predictive-analytics" element={<PredictiveAnalytics />} />
            <Route path="ai/predictive" element={<PredictiveAnalytics />} />
            <Route path="insurance-billing" element={<InsuranceBilling />} />
            <Route path="ai-scheduling" element={<AIScheduling />} />
            <Route path="ai/scheduling" element={<AIScheduling />} />
            <Route path="teledentistry" element={<Teledentistry />} />
            <Route path="multi-practice-analytics" element={<MultiPracticeAnalytics />} />
            <Route path="marketing-automation" element={<MarketingAutomation />} />
            <Route path="reports/patients" element={<PatientProfile />} />
            <Route path="reports" element={<PracticeAnalytics />} />
            <Route path="patient-insights" element={<PracticeAnalytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="xray-diagnostics" element={<XRayDiagnostics />} />
            <Route path="treatment-plans" element={<TreatmentPlanGenerator />} />
            <Route path="voice-to-chart" element={<VoiceToChart />} />
            <Route path="chairside-assistant" element={<ChairsideAssistant />} />
            <Route path="smart-operations" element={<SmartOperations />} />
            <Route path="revenue-management" element={<RevenueManagement />} />
            <Route path="patient-concierge" element={<PatientConcierge />} />
            <Route path="compliance-security" element={<ComplianceSecurity />} />
            <Route path="teledentistry-enhanced" element={<TeledentistryEnhanced />} />
            <Route path="reputation-management" element={<ReputationManagement />} />
            <Route path="lead-conversion" element={<LeadConversion />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </SidebarProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </TooltipProvider>
  );
}

export default App;
