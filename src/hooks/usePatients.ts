import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getTableName, getSchemaName, currentTenant } = useTenant();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // For now, use the public schema patients table
      // Filter by tenant if currentTenant is available
      let query = supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      // If we have a tenant, we could add tenant filtering here later
      
      const { data, error } = await query;

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForDuplicatePatient = async (
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    tenantId?: string
  ): Promise<Patient | null> => {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .eq('date_of_birth', dateOfBirth);

      // Add tenant filtering if tenantId is provided
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking for duplicate patient:', error);
      return null;
    }
  };

  const createPatient = async (patientData: CreatePatientData) => {
    try {
      // First check for duplicates
      const existingPatient = await checkForDuplicatePatient(
        patientData.first_name,
        patientData.last_name,
        patientData.date_of_birth || '',
        currentTenant?.id
      );

      if (existingPatient) {
        const duplicateError = new Error('DUPLICATE_PATIENT');
        (duplicateError as any).existingPatient = existingPatient;
        throw duplicateError;
      }

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

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505' && error.message.includes('unique_patient_per_clinic')) {
          const duplicateError = new Error('DUPLICATE_PATIENT_DB');
          throw duplicateError;
        }
        throw error;
      }

      setPatients(prev => [...prev, data]);
      
      toast({
        title: "Success",
        description: "Patient created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      
      if ((error as any).message === 'DUPLICATE_PATIENT') {
        // Re-throw with existing patient data for UI handling
        throw error;
      } else if ((error as any).message === 'DUPLICATE_PATIENT_DB') {
        toast({
          title: "Duplicate Patient",
          description: "A patient with the same name and date of birth already exists in this clinic",
          variant: "destructive",
        });
        throw new Error('DUPLICATE_PATIENT_DB');
      } else {
        toast({
          title: "Error",
          description: "Failed to create patient",
          variant: "destructive",
        });
        throw error;
      }
    }
  };

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

  useEffect(() => {
    fetchPatients();
  }, [currentTenant]); // React to tenant changes

  return {
    patients,
    loading,
    createPatient,
    searchPatients,
    checkForDuplicatePatient,
    refetch: fetchPatients,
  };
}