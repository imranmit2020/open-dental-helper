import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  title: string;
  treatment_type?: string;
  duration?: number;
  status?: string;
  description?: string;
  notes?: string;
  dentist_id?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
  dentist?: {
    first_name: string;
    last_name: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  appointment_date: string;
  title: string;
  treatment_type?: string;
  duration?: number;
  status?: string;
  description?: string;
  notes?: string;
  dentist_id?: string;
}

export function useAppointments(date?: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          dentist:profiles!appointments_dentist_id_fkey(first_name, last_name)
        `)
        .order('appointment_date', { ascending: true });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(4, 0, 0, 0); // UTC+4 timezone adjustment
        
        const endOfDay = new Date(date);
        endOfDay.setHours(3, 59, 59, 999);
        endOfDay.setDate(endOfDay.getDate() + 1); // Next day at 3:59:59

        query = query
          .gte('appointment_date', startOfDay.toISOString())
          .lt('appointment_date', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          dentist:profiles!appointments_dentist_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      setAppointments(prev => [...prev, data]);
      
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<CreateAppointmentData>) => {
    try {
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

      setAppointments(prev => 
        prev.map(apt => apt.id === id ? data : apt)
      );

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(apt => apt.id !== id));

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}