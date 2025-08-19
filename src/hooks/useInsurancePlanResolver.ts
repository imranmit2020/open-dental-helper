import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InsurancePlanMap {
  [key: string]: {
    provider_name: string;
    plan_name: string;
  };
}

export const useInsurancePlanResolver = () => {
  const [planMap, setPlanMap] = useState<InsurancePlanMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('id, provider_name, plan_name')
          .eq('is_active', true);

        if (error) throw error;

        const map: InsurancePlanMap = {};
        data?.forEach(plan => {
          map[plan.id] = {
            provider_name: plan.provider_name,
            plan_name: plan.plan_name
          };
        });
        
        setPlanMap(map);
      } catch (error) {
        console.error('Failed to fetch insurance plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlans();
  }, []);

  const getInsuranceDisplayName = (providerId: string | null | undefined): string => {
    if (!providerId) return 'No insurance';
    
    const plan = planMap[providerId];
    if (plan) {
      return `${plan.provider_name} - ${plan.plan_name}`;
    }
    
    // Fallback for legacy static values
    const legacyMap: { [key: string]: string } = {
      'delta-dental': 'Delta Dental',
      'metlife': 'MetLife',
      'cigna': 'Cigna',
      'aetna': 'Aetna',
      'blue-cross': 'Blue Cross Blue Shield',
      'other': 'Other'
    };
    
    return legacyMap[providerId] || providerId;
  };

  return { getInsuranceDisplayName, loading };
};