import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  patient_id?: string;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = useCallback(async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      // Get client info for audit trail
      const userAgent = navigator.userAgent;
      const sessionId = user.id + '-' + Date.now();

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        patient_id: entry.patient_id,
        details: entry.details,
        user_agent: userAgent,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }, [user]);

  const logPatientView = useCallback(async (patientId: string, details?: Record<string, any>) => {
    await logAction({
      action: 'VIEW_PATIENT',
      resource_type: 'patients',
      resource_id: patientId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  const logPatientUpdate = useCallback(async (patientId: string, details?: Record<string, any>) => {
    await logAction({
      action: 'UPDATE_PATIENT',
      resource_type: 'patients',
      resource_id: patientId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  const logMedicalRecordView = useCallback(async (recordId: string, patientId: string, details?: Record<string, any>) => {
    await logAction({
      action: 'VIEW_MEDICAL_RECORD',
      resource_type: 'medical_records',
      resource_id: recordId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  const logAppointmentAccess = useCallback(async (appointmentId: string, patientId: string, action: string, details?: Record<string, any>) => {
    await logAction({
      action: action,
      resource_type: 'appointments',
      resource_id: appointmentId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  const logConsentFormAccess = useCallback(async (formId: string, patientId: string, action: string, details?: Record<string, any>) => {
    await logAction({
      action: action,
      resource_type: 'consent_forms',
      resource_id: formId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  const logImageAnalysisAccess = useCallback(async (analysisId: string, patientId: string, action: string, details?: Record<string, any>) => {
    await logAction({
      action: action,
      resource_type: 'image_analyses',
      resource_id: analysisId,
      patient_id: patientId,
      details,
    });
  }, [logAction]);

  return {
    logAction,
    logPatientView,
    logPatientUpdate,
    logMedicalRecordView,
    logAppointmentAccess,
    logConsentFormAccess,
    logImageAnalysisAccess,
  };
}