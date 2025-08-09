import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useRoleAccess } from './useRoleAccess';

export type ModuleKey =
  | 'practice_dashboard'
  | 'dentist_dashboard'
  | 'patients'
  | 'medical_history'
  | 'consent_forms'
  | 'treatment_plans'
  | 'insurance_billing'
  | 'schedule'
  | 'schedule_management'
  | 'ai_scheduling'
  | 'teledentistry'
  | 'teledentistry_enhanced'
  | 'voice_transcription'
  | 'image_analysis'
  | 'voice_agent'
  | 'translation'
  | 'analytics'
  | 'ai_marketing'
  | 'xray_diagnostics'
  | 'voice_to_chart'
  | 'chairside_assistant'
  | 'reports'
  | 'reports_patients'
  | 'multi_practice_analytics'
  | 'marketing_automation'
  | 'smart_operations'
  | 'revenue_management'
  | 'market_intelligence'
  | 'reputation_management'
  | 'lead_conversion'
  | 'compliance_security'
  | 'patient_concierge'
  | 'admin_user_approvals'
  | 'admin_employees'
  | 'admin_roles'
  | 'admin_passwords'
  | 'admin_add_employee'
  | 'patient_dashboard'
  | 'patient_my_appointments'
  | 'patient_medical_records'
  | 'patient_treatment_plans'
  | 'patient_consent_forms'
  | 'admin_navigation_permissions';

interface ModulePermissionRow {
  id: string;
  tenant_id: string;
  corporation_id: string | null;
  module_key: ModuleKey;
  role: 'admin' | 'dentist' | 'hygienist' | 'staff' | 'patient';
  allowed: boolean;
}

export function useModulePermissions(override?: { tenantId?: string; corporationId?: string | null }) {
  const { currentTenant, corporation } = useTenant();
  const { userRole } = useRoleAccess();
  const queryClient = useQueryClient();

  const tenantId = override?.tenantId ?? currentTenant?.id;
  const corpId = override?.corporationId ?? corporation?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['module-permissions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as ModulePermissionRow[];
      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('tenant_id', tenantId);
      if (error) {
        console.error('Failed to load module permissions', error);
        return [] as ModulePermissionRow[];
      }
      return (data || []) as ModulePermissionRow[];
    },
    enabled: !!tenantId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (input: { module_key: ModuleKey; role: ModulePermissionRow['role']; allowed: boolean }) => {
      if (!tenantId) throw new Error('No tenant selected');
      const payload = {
        tenant_id: tenantId,
        corporation_id: corpId,
        module_key: input.module_key,
        role: input.role,
        allowed: input.allowed,
      };
      const { error } = await supabase.from('module_permissions').upsert(payload, { onConflict: 'tenant_id,module_key,role' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-permissions', tenantId] });
    },
  });

  const canAccessModule = (module_key: ModuleKey, role?: ModulePermissionRow['role']) => {
    const checkRole = (role || (userRole as ModulePermissionRow['role']) || 'staff');
    const rec = data?.find((r) => r.module_key === module_key && r.role === checkRole);
    // Default allow when no record exists
    return rec ? !!rec.allowed : true;
  };

  return {
    permissions: data || [],
    loading: isLoading,
    canAccessModule,
    setPermission: (module_key: ModuleKey, role: ModulePermissionRow['role'], allowed: boolean) =>
      upsertMutation.mutate({ module_key, role, allowed }),
  };
}
