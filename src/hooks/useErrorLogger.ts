import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ErrorLogEntry {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  page_url: string;
  user_agent: string;
  additional_data?: Record<string, any>;
}

export function useErrorLogger() {
  const { user } = useAuth();
  const { toast } = useToast();

  const logError = useCallback(async (error: Error | string, context?: Record<string, any>) => {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const stackTrace = error instanceof Error ? error.stack : undefined;
      
      const errorEntry: ErrorLogEntry = {
        error_type: error instanceof Error ? error.constructor.name : 'GenericError',
        error_message: errorMessage,
        stack_trace: stackTrace,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        additional_data: {
          timestamp: new Date().toISOString(),
          user_id: user?.id || 'anonymous',
          context: context || {}
        }
      };

      // Log to console for development
      console.error('Error logged:', errorEntry);

      // Log to Supabase for tracking (would need error_logs table)
      // await supabase.from('error_logs').insert(errorEntry);
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }, [user]);

  const logUIError = useCallback(async (error: Error | string, componentName: string, action?: string) => {
    await logError(error, {
      component: componentName,
      action: action || 'unknown',
      error_category: 'UI_ERROR'
    });
  }, [logError]);

  const logAPIError = useCallback(async (error: Error | string, endpoint: string, method?: string) => {
    await logError(error, {
      endpoint,
      method: method || 'unknown',
      error_category: 'API_ERROR'
    });
  }, [logError]);

  const logValidationError = useCallback(async (error: Error | string, formName: string, field?: string) => {
    await logError(error, {
      form: formName,
      field: field || 'unknown',
      error_category: 'VALIDATION_ERROR'
    });
  }, [logError]);

  return {
    logError,
    logUIError,
    logAPIError,
    logValidationError
  };
}