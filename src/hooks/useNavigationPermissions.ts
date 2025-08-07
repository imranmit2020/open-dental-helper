import { useRoleAccess } from './useRoleAccess';
import { useSubscription } from './useSubscription';

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  requiredRoles?: string[];
  requiredFeature?: string;
  requiresSubscription?: boolean;
}

export function useNavigationPermissions() {
  const { userRole, hasRole, isStaffMember, isPatient, isAdmin } = useRoleAccess();
  const { subscribed, hasFeature } = useSubscription();

  const canAccessItem = (item: NavigationItem): boolean => {
    // Check role requirements
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!hasRole(item.requiredRoles as any)) {
        return false;
      }
    }

    // Check subscription requirements
    if (item.requiresSubscription && !subscribed) {
      return false;
    }

    // Check feature requirements
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) {
      return false;
    }

    return true;
  };

  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(canAccessItem);
  };

  // Define navigation permissions
  const navigationConfig = {
    // Basic access for all staff
    basic: {
      requiredRoles: ['admin', 'dentist', 'staff'],
    },
    // Admin only
    adminOnly: {
      requiredRoles: ['admin'],
    },
    // Staff with subscription
    staffWithSubscription: {
      requiredRoles: ['admin', 'dentist', 'staff'],
      requiresSubscription: true,
    },
    // Premium features
    premiumFeatures: {
      requiredRoles: ['admin', 'dentist', 'staff'],
      requiredFeature: 'ai_features',
    },
    // Enterprise features
    enterpriseFeatures: {
      requiredRoles: ['admin', 'dentist'],
      requiredFeature: 'multi_practice',
    },
    // Patient access
    patientAccess: {
      requiredRoles: ['patient'],
    },
  };

  return {
    canAccessItem,
    filterNavigationItems,
    navigationConfig,
    userRole,
    subscribed,
    isStaffMember,
    isPatient,
    isAdmin,
  };
}