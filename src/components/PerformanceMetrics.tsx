import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
  });

  useEffect(() => {
    // Only run in production or when specifically needed
    if (process.env.NODE_ENV !== 'production') return;

    // Observe First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });

    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return metrics;
}

// Dev-only performance monitor component
export function PerformanceMonitor() {
  const metrics = usePerformanceMetrics();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
      <div>FCP: {metrics.fcp?.toFixed(0)}ms</div>
      <div>LCP: {metrics.lcp?.toFixed(0)}ms</div>
      <div>FID: {metrics.fid?.toFixed(0)}ms</div>
      <div>CLS: {metrics.cls?.toFixed(3)}</div>
    </div>
  );
}