import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LabAuthProvider } from '@/hooks/useLabAuth';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Lazy load lab provider components
const LabProviderSignUp = lazy(() => import('@/pages/LabProviderSignUp'));
const LabProviderAuth = lazy(() => import('@/pages/LabProviderAuth'));
const LabProviderDashboard = lazy(() => import('@/pages/LabProviderDashboard'));

export default function LabRoutes() {
  return (
    <LabAuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/signup" element={<LabProviderSignUp />} />
          <Route path="/auth" element={<LabProviderAuth />} />
          <Route path="/dashboard" element={<LabProviderDashboard />} />
        </Routes>
      </Suspense>
    </LabAuthProvider>
  );
}