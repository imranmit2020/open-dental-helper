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
  corporation_id?: string;
}

interface Corporation {
  id: string;
  name: string;
  corporate_code: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  corporation: Corporation | null;
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
  const [corporation, setCorporation] = useState<Corporation | null>(null);
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
      setCorporation(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserTenants = async () => {
    try {
      setLoading(true);
      
      // First check if user belongs to a corporation (which gives access to all clinics in that corporation)
      const { data: corporateUsers, error: corporateError } = await supabase
        .from('corporate_users')
        .select(`
          corporation_id,
          role,
          corporations (
            id,
            name,
            corporate_code,
            address,
            phone,
            email
          )
        `)
        .eq('user_id', user?.id);

      if (corporateError) throw corporateError;

      let allTenants: Tenant[] = [];
      let userCorporationRole = null;
      let userCorporation = null;

      if (corporateUsers && corporateUsers.length > 0) {
        // User belongs to a corporation - get all clinics in that corporation
        const corp = corporateUsers[0];
        userCorporation = corp.corporations as Corporation;
        userCorporationRole = corp.role;
        setCorporation(userCorporation);

        const { data: corporationTenants, error: corpTenantsError } = await supabase
          .from('tenants')
          .select(`
            id,
            name,
            clinic_code,
            address,
            phone,
            email,
            settings,
            corporation_id
          `)
          .eq('corporation_id', corp.corporation_id);

        if (corpTenantsError) throw corpTenantsError;

        allTenants = corporationTenants || [];
        setUserRole(userCorporationRole);
        
        console.log(`User belongs to corporation: ${userCorporation?.name} with ${allTenants.length} clinics as ${userCorporationRole}`);
      } else {
        // Fallback to individual tenant assignment
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
              settings,
              corporation_id
            )
          `)
          .eq('user_id', user?.id);

        if (tenantUsersError) throw tenantUsersError;

        allTenants = tenantUsers?.map(tu => tu.tenants).filter(Boolean) || [];
        if (tenantUsers && tenantUsers.length > 0) {
          setUserRole(tenantUsers[0]?.role || 'staff');
        }
      }

      setTenants(allTenants as Tenant[]);

      // Automatically set current tenant to the first one
      if (allTenants.length > 0) {
        const primaryTenant = allTenants[0] as Tenant;
        setCurrentTenant(primaryTenant);
        
        const accessType = userCorporation ? 'corporation' : 'direct assignment';
        console.log(`User automatically assigned to clinic: ${primaryTenant.name} (${primaryTenant.clinic_code}) via ${accessType}`);
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

  // Determine if user can switch between clinics
  // Corporation members (staff, dentist, admin) can switch between clinics in their corporation
  // Direct tenant users can only switch if they're admin with multiple clinic access
  const canSwitchTenants = corporation ? tenants.length > 1 : (userRole === 'admin' && tenants.length > 1);

  const value = {
    currentTenant,
    tenants,
    corporation,
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