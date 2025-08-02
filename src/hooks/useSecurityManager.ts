import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SecurityConfig {
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  sessionTimeoutMinutes: 30,
  maxFailedLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

export function useSecurityManager(config: Partial<SecurityConfig> = {}) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const lastActivityRef = useRef<Date>(new Date());
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  
  const securityConfig = { ...DEFAULT_CONFIG, ...config };

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    lastActivityRef.current = new Date();
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    if (user) {
      sessionTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Session Expired",
          description: "You have been automatically logged out due to inactivity.",
          variant: "destructive",
        });
        signOut();
      }, securityConfig.sessionTimeoutMinutes * 60 * 1000);
    }
  }, [user, signOut, toast, securityConfig.sessionTimeoutMinutes]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => resetSessionTimeout();
    
    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetSessionTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [user, resetSessionTimeout]);

  // Track failed login attempts
  const trackFailedLogin = useCallback(async (email: string, reason?: string) => {
    try {
      await supabase.from('failed_login_attempts').insert({
        email,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        reason: reason || 'Invalid credentials',
      });
    } catch (error) {
      console.error('Failed to track login attempt:', error);
    }
  }, []);

  // Check if account is locked
  const checkAccountLock = useCallback(async (email: string): Promise<boolean> => {
    try {
      const since = new Date(Date.now() - securityConfig.lockoutDurationMinutes * 60 * 1000);
      
      const { data, error } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .eq('email', email)
        .gte('created_at', since.toISOString());

      if (error) throw error;

      return (data?.length || 0) >= securityConfig.maxFailedLoginAttempts;
    } catch (error) {
      console.error('Failed to check account lock:', error);
      return false;
    }
  }, [securityConfig.maxFailedLoginAttempts, securityConfig.lockoutDurationMinutes]);

  return {
    trackFailedLogin,
    checkAccountLock,
    sessionTimeoutMinutes: securityConfig.sessionTimeoutMinutes,
    lastActivity: lastActivityRef.current,
    resetSessionTimeout,
  };
}

// Helper function to get client IP (simplified)
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}