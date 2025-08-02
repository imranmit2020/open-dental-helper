import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import NotFound from "./pages/NotFound";

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
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="consent-forms" element={<ConsentForms />} />
            <Route path="voice-transcription" element={<VoiceTranscription />} />
            <Route path="translation" element={<Translation />} />
            <Route path="ai-voice-notes" element={<AIVoiceNotes />} />
            <Route path="voice-agent" element={<VoiceAgent />} />
            <Route path="image-analysis" element={<ImageAnalysis />} />
            <Route path="ai-marketing" element={<AIMarketing />} />
            <Route path="practice-analytics" element={<PracticeAnalytics />} />
            <Route path="predictive-analytics" element={<PredictiveAnalytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default App;
