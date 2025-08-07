import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Tenant {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: any;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  userRole: string | null;
  canSwitchTenants: boolean;
  switchTenant: (tenantId: string) => void;
  getTableName: (baseTableName: string) => string;
  getSchemaName: () => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserTenants();
    } else {
      // Reset tenant data when user logs out
      setCurrentTenant(null);
      setTenants([]);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserTenants = async () => {
    try {
      setLoading(true);
      
      // Get all tenants user belongs to with their role
      const { data: tenantUsers, error: tenantUsersError } = await supabase
        .from('tenant_users')
        .select(`
          tenant_id,
          role,
          tenants (
            id,
            name,
            clinic_code,
            address,
            phone,
            email,
            settings
          )
        `)
        .eq('user_id', user?.id);

      if (tenantUsersError) throw tenantUsersError;

      const userTenants = tenantUsers?.map(tu => tu.tenants).filter(Boolean) || [];
      setTenants(userTenants as Tenant[]);

      // Automatically set current tenant to the first one (primary clinic for user)
      if (userTenants.length > 0) {
        const primaryTenant = userTenants[0] as Tenant;
        const primaryRole = tenantUsers?.[0]?.role || 'staff';
        
        setCurrentTenant(primaryTenant);
        setUserRole(primaryRole);
        
        console.log(`User automatically assigned to clinic: ${primaryTenant.name} (${primaryTenant.clinic_code}) as ${primaryRole}`);
      } else {
        console.warn('User is not assigned to any clinic. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error fetching user tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (tenantId: string) => {
    // Only allow switching if user has access to multiple clinics (admin/super-admin)
    if (!canSwitchTenants) {
      console.warn('User does not have permission to switch clinics');
      return;
    }
    
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      console.log(`Switched to clinic: ${tenant.name} (${tenant.clinic_code})`);
    }
  };

  const getTableName = (baseTableName: string) => {
    if (!currentTenant) return baseTableName;
    return `${currentTenant.clinic_code}_${baseTableName}`;
  };

  const getSchemaName = () => {
    if (!currentTenant) return 'public';
    return `clinic_${currentTenant.clinic_code}`;
  };

  // Determine if user can switch between clinics (admin users with multiple clinic access)
  const canSwitchTenants = userRole === 'admin' && tenants.length > 1;

  const value = {
    currentTenant,
    tenants,
    loading,
    userRole,
    canSwitchTenants,
    switchTenant,
    getTableName,
    getSchemaName,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}