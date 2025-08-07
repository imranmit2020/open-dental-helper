import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'dentist' | 'staff' | 'patient';

interface RolePermissions {
  canViewAllPatients: boolean;
  canEditPatients: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canManageAppointments: boolean;
  canViewConsentForms: boolean;
  canManageConsentForms: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllPatients: true,
    canEditPatients: true,
    canViewAuditLogs: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canManageAppointments: true,
    canViewConsentForms: true,
    canManageConsentForms: true,
  },
  dentist: {
    canViewAllPatients: true,
    canEditPatients: true,
    canViewAuditLogs: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canManageAppointments: true,
    canViewConsentForms: true,
    canManageConsentForms: true,
  },
  staff: {
    canViewAllPatients: true,
    canEditPatients: true,
    canViewAuditLogs: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canViewMedicalRecords: true,
    canEditMedicalRecords: false,
    canManageAppointments: true,
    canViewConsentForms: true,
    canManageConsentForms: false,
  },
  patient: {
    canViewAllPatients: false,
    canEditPatients: false,
    canViewAuditLogs: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: true, // Patients can manage their own settings
    canViewMedicalRecords: true, // Patients can view their own medical records
    canEditMedicalRecords: false,
    canManageAppointments: true, // Patients can view/schedule their own appointments
    canViewConsentForms: true, // Patients can view their own consent forms
    canManageConsentForms: false,
  },
};

export function useRoleAccess() {
  const { user } = useAuth();

  // Fetch user profile to get role
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const userRole = (profile?.role as UserRole) || 'patient';

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[userRole];
  }, [userRole]);

  const hasRole = (role: UserRole | UserRole[]) => {
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  const hasPermission = (permission: keyof RolePermissions) => {
    return permissions[permission];
  };

  const isStaffMember = hasRole(['admin', 'dentist', 'staff']);
  const isPatient = hasRole('patient');
  const isAdmin = hasRole('admin');

  return {
    userRole,
    permissions,
    hasRole,
    hasPermission,
    isStaffMember,
    isPatient,
    isAdmin,
  };
}