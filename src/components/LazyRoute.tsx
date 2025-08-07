import { lazy, Suspense } from 'react';
import { ComponentType } from 'react';

interface LazyRouteProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export function LazyRoute({ component, fallback = <LoadingSpinner /> }: LazyRouteProps) {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}

// Pre-defined lazy components for common pages
export const LazyDashboard = () => <LazyRoute component={() => import('../pages/Dashboard')} />;
export const LazyPatients = () => <LazyRoute component={() => import('../pages/Patients')} />;
export const LazySchedule = () => <LazyRoute component={() => import('../pages/Schedule')} />;
export const LazyPracticeAnalytics = () => <LazyRoute component={() => import('../pages/PracticeAnalytics')} />;
export const LazyAIMarketing = () => <LazyRoute component={() => import('../pages/AIMarketing')} />;
export const LazyTeledentistry = () => <LazyRoute component={() => import('../pages/Teledentistry')} />;
export const LazySettings = () => <LazyRoute component={() => import('../pages/Settings')} />;