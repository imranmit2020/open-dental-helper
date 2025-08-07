import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface StaffAvailability {
  id: string;
  staff_id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
  } | null;
  tenant?: {
    name: string;
    clinic_code: string;
  } | null;
}

export interface CreateStaffAvailabilityData {
  staff_id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available?: boolean;
}

export function useStaffAvailability(staffId?: string) {
  const [availability, setAvailability] = useState<StaffAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('staff_availability')
        .select(`
          *,
          staff:profiles!staff_availability_staff_id_fkey(first_name, last_name),
          tenant:tenants!staff_availability_tenant_id_fkey(name, clinic_code)
        `)
        .order('day_of_week', { ascending: true });

      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      if (currentTenant) {
        query = query.eq('tenant_id', currentTenant.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailability((data as unknown as StaffAvailability[]) || []);
    } catch (error) {
      console.error('Error fetching staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to load staff availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (availabilityData: CreateStaffAvailabilityData) => {
    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .insert([availabilityData])
        .select(`
          *,
          staff:profiles!staff_availability_staff_id_fkey(first_name, last_name),
          tenant:tenants!staff_availability_tenant_id_fkey(name, clinic_code)
        `)
        .single();

      if (error) throw error;

      setAvailability(prev => [...prev, data as unknown as StaffAvailability]);
      
      toast({
        title: "Success",
        description: "Staff availability created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to create staff availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAvailability = async (id: string, updates: Partial<CreateStaffAvailabilityData>) => {
    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          staff:profiles!staff_availability_staff_id_fkey(first_name, last_name),
          tenant:tenants!staff_availability_tenant_id_fkey(name, clinic_code)
        `)
        .single();

      if (error) throw error;

      setAvailability(prev => 
        prev.map(avail => avail.id === id ? data as unknown as StaffAvailability : avail)
      );

      toast({
        title: "Success",
        description: "Staff availability updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to update staff availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailability(prev => prev.filter(avail => avail.id !== id));

      toast({
        title: "Success",
        description: "Staff availability deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff availability",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkStaffAvailability = async (staffId: string, tenantId: string, date: Date) => {
    try {
      const dayOfWeek = date.getDay();
      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
        .eq('tenant_id', tenantId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error checking staff availability:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [staffId, currentTenant]);

  return {
    availability,
    loading,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    checkStaffAvailability,
    refetch: fetchAvailability,
  };
}