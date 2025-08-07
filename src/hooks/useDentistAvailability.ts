import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface DentistAvailability {
  id: string;
  dentist_id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  dentist?: {
    first_name: string;
    last_name: string;
  } | null;
  tenant?: {
    name: string;
    clinic_code: string;
  } | null;
}

export interface CreateAvailabilityData {
  dentist_id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available?: boolean;
}

export function useDentistAvailability(dentistId?: string) {
  const [availability, setAvailability] = useState<DentistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('dentist_availability')
        .select(`
          *,
          dentist:profiles!dentist_availability_dentist_id_fkey(first_name, last_name),
          tenant:tenants!dentist_availability_tenant_id_fkey(name, clinic_code)
        `)
        .order('day_of_week', { ascending: true });

      if (dentistId) {
        query = query.eq('dentist_id', dentistId);
      }

      if (currentTenant) {
        query = query.eq('tenant_id', currentTenant.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailability((data as unknown as DentistAvailability[]) || []);
    } catch (error) {
      console.error('Error fetching dentist availability:', error);
      toast({
        title: "Error",
        description: "Failed to load dentist availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (availabilityData: CreateAvailabilityData) => {
    try {
      const { data, error } = await supabase
        .from('dentist_availability')
        .insert([availabilityData])
        .select(`
          *,
          dentist:profiles!dentist_availability_dentist_id_fkey(first_name, last_name),
          tenant:tenants!dentist_availability_tenant_id_fkey(name, clinic_code)
        `)
        .single();

      if (error) throw error;

      setAvailability(prev => [...prev, data as unknown as DentistAvailability]);
      
      toast({
        title: "Success",
        description: "Dentist availability created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating dentist availability:', error);
      toast({
        title: "Error",
        description: "Failed to create dentist availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAvailability = async (id: string, updates: Partial<CreateAvailabilityData>) => {
    try {
      const { data, error } = await supabase
        .from('dentist_availability')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          dentist:profiles!dentist_availability_dentist_id_fkey(first_name, last_name),
          tenant:tenants!dentist_availability_tenant_id_fkey(name, clinic_code)
        `)
        .single();

      if (error) throw error;

      setAvailability(prev => 
        prev.map(avail => avail.id === id ? data as unknown as DentistAvailability : avail)
      );

      toast({
        title: "Success",
        description: "Dentist availability updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating dentist availability:', error);
      toast({
        title: "Error",
        description: "Failed to update dentist availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dentist_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailability(prev => prev.filter(avail => avail.id !== id));

      toast({
        title: "Success",
        description: "Dentist availability deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting dentist availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete dentist availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkDentistAvailability = async (dentistId: string, tenantId: string, date: Date) => {
    try {
      const { data, error } = await supabase
        .rpc('get_dentist_availability_for_date', {
          _dentist_id: dentistId,
          _tenant_id: tenantId,
          _date: date.toISOString().split('T')[0]
        });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error checking dentist availability:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [dentistId, currentTenant]);

  return {
    availability,
    loading,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    checkDentistAvailability,
    refetch: fetchAvailability,
  };
}