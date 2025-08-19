import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface InsurancePlan {
  id: string;
  plan_name: string;
  provider_name: string;
  is_active: boolean;
}

export const useInsurancePlans = () => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenant();

  useEffect(() => {
    const fetchInsurancePlans = async () => {
      if (!currentTenant?.id) {
        setPlans([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('id, plan_name, provider_name, is_active')
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true)
          .order('provider_name');

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch insurance plans');
      } finally {
        setLoading(false);
      }
    };

    fetchInsurancePlans();
  }, [currentTenant?.id]);

  return { plans, loading, error };
};