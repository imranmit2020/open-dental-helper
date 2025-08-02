import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleAccess, UserRole } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: string;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermission,
  fallbackPath = '/dashboard' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasRole, hasPermission } = useRoleAccess();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}