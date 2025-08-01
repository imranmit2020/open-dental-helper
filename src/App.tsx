import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PracticeDashboard from "./pages/PracticeDashboard";
import DentistDashboard from "./pages/DentistDashboard";
import AIMarketing from "./pages/AIMarketing";
import Patients from "./pages/Patients";
import Schedule from "./pages/Schedule";
import AIVoiceNotes from "./pages/AIVoiceNotes";
import MedicalHistory from "./pages/MedicalHistory";
import PracticeAnalytics from "./pages/PracticeAnalytics";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/patient-dashboard" element={<Layout><PatientDashboard /></Layout>} />
          <Route path="/practice-dashboard" element={<Layout><PracticeDashboard /></Layout>} />
          <Route path="/dentist-dashboard" element={<Layout><DentistDashboard /></Layout>} />
          <Route path="/ai-marketing" element={<Layout><AIMarketing /></Layout>} />
          <Route path="/patients" element={<Layout><Patients /></Layout>} />
          <Route path="/patients/history" element={<Layout><MedicalHistory /></Layout>} />
          <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
          <Route path="/reports" element={<Layout><PracticeAnalytics /></Layout>} />
          <Route path="/ai-voice-notes" element={<Layout><AIVoiceNotes /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
