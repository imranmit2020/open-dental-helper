import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TeledentistrySession {
  id: string;
  patient_id: string;
  dentist_id: string;
  session_type: 'consultation' | 'follow_up' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  recording_url?: string;
  ai_transcript?: string;
  ai_summary?: string;
  ai_soap_notes?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  follow_up_notes?: string;
  follow_up_required?: boolean;
  created_at: string;
  updated_at: string;
  // Related data
  patient_name?: string;
  dentist_name?: string;
}

export const useTeledentistry = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch today's sessions
  const { data: todaySessions = [], isLoading } = useQuery({
    queryKey: ['teledentistry-sessions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('teledentistry_sessions')
        .select(`
          *,
          patients!inner(first_name, last_name),
          profiles!teledentistry_sessions_dentist_id_fkey(first_name, last_name)
        `)
        .gte('scheduled_at', `${today}T00:00:00`)
        .lte('scheduled_at', `${today}T23:59:59`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return data.map((session: any) => ({
        ...session,
        patient_name: `${session.patients.first_name} ${session.patients.last_name}`,
        dentist_name: session.profiles ? `${session.profiles.first_name} ${session.profiles.last_name}` : 'Dr. Unknown'
      })) as TeledentistrySession[];
    },
    enabled: !!user,
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      patient_id: string;
      session_type: 'consultation' | 'follow_up' | 'emergency';
      scheduled_at: string;
    }) => {
      const { data, error } = await supabase
        .from('teledentistry_sessions')
        .insert([{
          ...sessionData,
          dentist_id: user?.id || '',
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teledentistry-sessions'] });
      toast({
        title: 'Session Created',
        description: 'Teledentistry session has been scheduled successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create teledentistry session.',
        variant: 'destructive',
      });
    },
  });

  // Start session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('teledentistry_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teledentistry-sessions'] });
    },
  });

  // End session with AI notes
  const endSessionMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      aiTranscript, 
      aiSoapNotes, 
      followUpRequired = false 
    }: {
      sessionId: string;
      aiTranscript?: string;
      aiSoapNotes?: any;
      followUpRequired?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('teledentistry_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          ai_transcript: aiTranscript,
          ai_soap_notes: aiSoapNotes,
          follow_up_required: followUpRequired
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teledentistry-sessions'] });
      toast({
        title: 'Session Completed',
        description: 'Session ended and notes saved successfully.',
      });
    },
  });

  // Update session notes
  const updateNoteseMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      aiSoapNotes, 
      aiTranscript 
    }: {
      sessionId: string;
      aiSoapNotes?: any;
      aiTranscript?: string;
    }) => {
      const { data, error } = await supabase
        .from('teledentistry_sessions')
        .update({
          ai_soap_notes: aiSoapNotes,
          ai_transcript: aiTranscript
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teledentistry-sessions'] });
    },
  });

  return {
    todaySessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    updateNotes: updateNoteseMutation.mutate,
    isCreating: createSessionMutation.isPending,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    isUpdating: updateNoteseMutation.isPending,
  };
};