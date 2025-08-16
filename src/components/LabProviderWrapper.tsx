import { LabAuthProvider } from '@/hooks/useLabAuth';

interface LabProviderWrapperProps {
  children: React.ReactNode;
}

export default function LabProviderWrapper({ children }: LabProviderWrapperProps) {
  return (
    <LabAuthProvider>
      {children}
    </LabAuthProvider>
  );
}