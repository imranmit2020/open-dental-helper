import { useMemo, useCallback } from 'react';
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: corporateRole, isLoading: corporateLoading } = useQuery({
    queryKey: ['corporate-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('corporate_users')
        .select('role, corporation_id, corporations(name)')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching corporate role:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const userRole: UserRole = (profile?.role as UserRole) || 'patient';
  const isCorporateAdmin = corporateRole?.role === 'admin';
  const isLoading = profileLoading || corporateLoading;
  
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.patient;
  }, [userRole]);

  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.includes(userRole);
  }, [userRole]);

  const hasPermission = useCallback((permission: keyof RolePermissions) => {
    return permissions[permission] || false;
  }, [permissions]);

  // Check if user can access admin approval dashboard
  const canAccessAdminApprovals = useCallback(() => {
    return userRole === 'admin' || isCorporateAdmin;
  }, [userRole, isCorporateAdmin]);

  // Helper computed values
  const isStaffMember = ['admin', 'dentist', 'staff'].includes(userRole);
  const isPatient = userRole === 'patient';
  const isAdmin = userRole === 'admin';

  return {
    userRole,
    permissions,
    hasRole,
    hasPermission,
    canAccessAdminApprovals,
    isStaffMember,
    isPatient,
    isAdmin,
    isCorporateAdmin,
    corporateInfo: corporateRole,
    isLoading,
  };
}