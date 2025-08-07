import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { Patient, CreatePatientData } from './usePatients';

const PATIENTS_QUERY_KEY = 'patients';

export function useOptimizedPatients() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const {
    data: patients = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: [PATIENTS_QUERY_KEY, currentTenant?.id],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: CreatePatientData) => {
      // Add tenant_id if available
      const patientWithTenant = {
        ...patientData,
        tenant_id: currentTenant?.id || null
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientWithTenant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newPatient) => {
      // Optimistic update
      queryClient.setQueryData([PATIENTS_QUERY_KEY, currentTenant?.id], (old: Patient[] = []) => [
        ...old,
        newPatient
      ]);
      
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
    }
  });

  const searchPatients = async (query: string): Promise<Patient[]> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('last_name', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY, currentTenant?.id] });

  return {
    patients,
    loading,
    error,
    createPatient: createPatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    searchPatients,
    refetch,
  };
}