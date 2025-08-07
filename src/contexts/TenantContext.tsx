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
  switchTenant: (tenantId: string) => void;
  getTableName: (baseTableName: string) => string;
  getSchemaName: () => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserTenants();
    }
  }, [user]);

  const fetchUserTenants = async () => {
    try {
      setLoading(true);
      
      // Get all tenants user belongs to
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

      // Set current tenant to the first one if not already set
      if (userTenants.length > 0 && !currentTenant) {
        setCurrentTenant(userTenants[0] as Tenant);
      }
    } catch (error) {
      console.error('Error fetching user tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
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

  const value = {
    currentTenant,
    tenants,
    loading,
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