import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { Appointment, CreateAppointmentData } from './useAppointments';
import { useEffect } from 'react';

const APPOINTMENTS_QUERY_KEY = 'appointments';

export function useOptimizedAppointments(date?: Date) {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const queryKey = [APPOINTMENTS_QUERY_KEY, currentTenant?.id, date?.toDateString()];

  const {
    data: appointments = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          dentist:profiles!appointments_dentist_id_fkey(first_name, last_name)
        `)
        .order('appointment_date', { ascending: true });

      // Filter by current tenant/clinic
      if (currentTenant) {
        query = query.eq('tenant_id', currentTenant.id);
      }

      if (date) {
        // Get start and end of the selected day in local timezone
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant,
    staleTime: 2 * 60 * 1000, // 2 minutes for appointments
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: CreateAppointmentData) => {
      const dataWithTenant = {
        ...appointmentData,
        tenant_id: appointmentData.tenant_id || currentTenant?.id,
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([dataWithTenant])
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          dentist:profiles!appointments_dentist_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newAppointment) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: Appointment[] = []) => [
        ...old,
        newAppointment
      ]);
      
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAppointmentData> }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          dentist:profiles!appointments_dentist_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedAppointment) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: Appointment[] = []) =>
        old.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
      );
      
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: Appointment[] = []) =>
        old.filter(apt => apt.id !== deletedId)
      );
      
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription with optimized debouncing
  useEffect(() => {
    const channel = supabase
      .channel(`appointments-${currentTenant?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          // Invalidate and refetch after a short delay to batch updates
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey });
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient, queryKey]);

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  return {
    appointments,
    loading,
    error,
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: (id: string, updates: Partial<CreateAppointmentData>) => 
      updateAppointmentMutation.mutate({ id, updates }),
    deleteAppointment: deleteAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending,
    refetch,
  };
}