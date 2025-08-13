import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

interface TimeTrackingRecord {
  id: string;
  employee_id: string;
  tenant_id: string;
  action_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  location_data?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  biometric_data?: {
    confidence_score: number;
    face_match_id: string;
    verification_method: string;
  };
  device_info?: {
    device_id: string;
    ip_address: string;
    user_agent: string;
    browser: string;
  };
  notes?: string;
  verification_status: 'verified' | 'flagged' | 'manual_review';
}

interface WorkSession {
  id: string;
  employee_id: string;
  tenant_id: string;
  date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  total_hours?: number;
  break_duration: number;
  overtime_hours: number;
  status: 'in_progress' | 'completed' | 'incomplete';
  ai_insights?: any;
  anomalies?: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
}

export function useTimeTracking(employeeId?: string) {
  const [timeRecords, setTimeRecords] = useState<TimeTrackingRecord[]>([]);
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocoding simulation (in real app, use Google Maps API)
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          resolve({
            latitude,
            longitude,
            address,
            accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // Simulate biometric verification
  const simulateBiometricVerification = async (): Promise<{
    confidence_score: number;
    face_match_id: string;
    verification_method: string;
  }> => {
    // Simulate camera access and face recognition
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
    
    return {
      confidence_score: confidence,
      face_match_id: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      verification_method: confidence > 0.85 ? 'facial_recognition' : 'manual_verification'
    };
  };

  // Get device information
  const getDeviceInfo = async () => {
    const userAgent = navigator.userAgent;
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    
    // Simulate IP address fetch
    const ip = '192.168.1.' + Math.floor(Math.random() * 255);
    
    return {
      device_id: `device_${Date.now()}`,
      ip_address: ip,
      user_agent: userAgent,
      browser
    };
  };

  // Clock in/out with innovative features
  const clockAction = async (
    employeeId: string, 
    actionType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end',
    notes?: string
  ) => {
    if (!currentTenant) {
      toast({
        title: "Error",
        description: "No tenant selected",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Gather innovative data
      const [locationData, biometricData, deviceInfo] = await Promise.all([
        getCurrentLocation().catch(() => null),
        simulateBiometricVerification(),
        getDeviceInfo()
      ]);

      // Determine verification status based on biometric confidence
      let verification_status: 'verified' | 'flagged' | 'manual_review' = 'verified';
      if (biometricData.confidence_score < 0.8) {
        verification_status = 'manual_review';
      } else if (biometricData.confidence_score < 0.9) {
        verification_status = 'flagged';
      }

      const timeRecord = {
        employee_id: employeeId,
        tenant_id: currentTenant.id,
        action_type: actionType,
        timestamp: new Date().toISOString(),
        location_data: locationData,
        biometric_data: biometricData,
        device_info: deviceInfo,
        notes,
        verification_status
      };

      const { data, error } = await supabase
        .from('time_tracking')
        .insert([timeRecord])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${actionType.replace('_', ' ').toUpperCase()} recorded successfully`,
        variant: verification_status === 'verified' ? 'default' : 'destructive'
      });

      fetchTimeRecords();
      fetchWorkSessions();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch time records
  const fetchTimeRecords = async () => {
    if (!currentTenant) return;

    try {
      let query = supabase
        .from('time_tracking')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('timestamp', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setTimeRecords((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching time records:', error);
    }
  };

  // Fetch work sessions
  const fetchWorkSessions = async () => {
    if (!currentTenant) return;

    try {
      let query = supabase
        .from('work_sessions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('date', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setWorkSessions((data || []) as any);
      
      // Find current session (today's in-progress session)
      const today = new Date().toISOString().split('T')[0];
      const todaySession = (data as any)?.find((session: any) => 
        session.date === today && 
        session.status === 'in_progress' &&
        (!employeeId || session.employee_id === employeeId)
      );
      
      setCurrentSession(todaySession || null);
    } catch (error: any) {
      console.error('Error fetching work sessions:', error);
    }
  };

  // Generate AI insights for work patterns
  const generateAIInsights = (sessions: WorkSession[]) => {
    if (sessions.length < 5) return null;

    const avgHours = sessions
      .filter(s => s.total_hours)
      .reduce((sum, s) => sum + (s.total_hours || 0), 0) / sessions.length;

    const punctualityScore = sessions
      .filter(s => s.clock_in_time)
      .map(s => {
        const clockIn = new Date(s.clock_in_time!);
        const hour = clockIn.getHours();
        return hour <= 9 ? 1 : 0; // Assuming 9 AM is expected start
      })
      .reduce((sum, score) => sum + score, 0) / sessions.length;

    return {
      avg_hours_per_day: avgHours,
      punctuality_score: punctualityScore,
      productivity_trend: avgHours > 8 ? 'high' : avgHours > 6 ? 'medium' : 'low',
      recommendations: [
        punctualityScore < 0.8 ? 'Consider earlier start times' : 'Excellent punctuality',
        avgHours < 6 ? 'Monitor attendance patterns' : 'Good work consistency'
      ]
    };
  };

  useEffect(() => {
    if (currentTenant) {
      fetchTimeRecords();
      fetchWorkSessions();
    }
  }, [currentTenant, employeeId]);

  return {
    timeRecords,
    workSessions,
    currentSession,
    loading,
    clockAction,
    fetchTimeRecords,
    fetchWorkSessions,
    generateAIInsights
  };
}