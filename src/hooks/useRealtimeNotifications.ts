import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface RealtimeNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'emergency';
  title: string;
  message: string;
  timestamp: Date;
  priority: number;
  chair_id?: string;
  patient_id?: string;
  user_id?: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'acknowledge' | 'escalate' | 'respond' | 'redirect';
  url?: string;
}

export interface ChairStatus {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance' | 'emergency';
  patient_id?: string;
  dentist_id?: string;
  temperature: number;
  humidity: number;
  last_updated: Date;
  sensors: {
    pressure: number;
    motion: boolean;
    emergency_button: boolean;
    equipment_status: 'normal' | 'warning' | 'error';
  };
}

export interface EmergencyAlert {
  id: string;
  type: 'medical' | 'equipment' | 'security' | 'fire';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  chair_id?: string;
  message: string;
  responders: string[];
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: Date;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [chairStatuses, setChairStatuses] = useState<ChairStatus[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  // Initialize mock data
  useEffect(() => {
    if (!currentTenant) return;

    // Initialize mock chair statuses
    const mockChairs: ChairStatus[] = [
      {
        id: 'chair-1',
        name: 'Chair 1',
        status: 'occupied',
        patient_id: 'patient-1',
        dentist_id: 'dentist-1',
        temperature: 72.5,
        humidity: 45,
        last_updated: new Date(),
        sensors: {
          pressure: 85,
          motion: true,
          emergency_button: false,
          equipment_status: 'normal'
        }
      },
      {
        id: 'chair-2',
        name: 'Chair 2',
        status: 'available',
        temperature: 71.8,
        humidity: 43,
        last_updated: new Date(),
        sensors: {
          pressure: 0,
          motion: false,
          emergency_button: false,
          equipment_status: 'normal'
        }
      },
      {
        id: 'chair-3',
        name: 'Chair 3',
        status: 'maintenance',
        temperature: 73.1,
        humidity: 47,
        last_updated: new Date(),
        sensors: {
          pressure: 0,
          motion: false,
          emergency_button: false,
          equipment_status: 'warning'
        }
      }
    ];

    setChairStatuses(mockChairs);
  }, [currentTenant]);

  // Simulate real-time updates
  useEffect(() => {
    if (!currentTenant || !user) return;

    setConnectionStatus('connecting');
    
    const intervals: NodeJS.Timeout[] = [];

    // Simulate IoT sensor updates
    const sensorInterval = setInterval(() => {
      setChairStatuses(prev => prev.map(chair => ({
        ...chair,
        temperature: Number((chair.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)),
        humidity: Math.max(35, Math.min(55, chair.humidity + (Math.random() - 0.5) * 2)),
        last_updated: new Date(),
        sensors: {
          ...chair.sensors,
          pressure: chair.status === 'occupied' ? 
            Math.max(70, Math.min(100, chair.sensors.pressure + (Math.random() - 0.5) * 5)) : 0
        }
      })));
    }, 3000);

    intervals.push(sensorInterval);

    // Simulate random notifications
    const notificationInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newNotification: RealtimeNotification = {
          id: `notif-${Date.now()}`,
          type: Math.random() < 0.1 ? 'critical' : Math.random() < 0.3 ? 'warning' : 'info',
          title: getRandomNotificationTitle(),
          message: getRandomNotificationMessage(),
          timestamp: new Date(),
          priority: Math.floor(Math.random() * 10) + 1,
          chair_id: Math.random() < 0.5 ? `chair-${Math.floor(Math.random() * 3) + 1}` : undefined,
          read: false
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        
        if (newNotification.type === 'critical') {
          toast.error(newNotification.title, {
            description: newNotification.message,
            duration: 10000
          });
        } else if (newNotification.type === 'warning') {
          toast.warning(newNotification.title, {
            description: newNotification.message
          });
        }
      }
    }, 8000);

    intervals.push(notificationInterval);

    setConnectionStatus('connected');

    return () => {
      intervals.forEach(clearInterval);
      setConnectionStatus('disconnected');
    };
  }, [currentTenant, user]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const triggerEmergencyAlert = useCallback((alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => {
    const emergencyAlert: EmergencyAlert = {
      ...alert,
      id: `emergency-${Date.now()}`,
      timestamp: new Date(),
      status: 'active'
    };

    setEmergencyAlerts(prev => [emergencyAlert, ...prev]);

    // Update chair status if applicable
    if (alert.chair_id) {
      setChairStatuses(prev => prev.map(chair => 
        chair.id === alert.chair_id ? { ...chair, status: 'emergency' } : chair
      ));
    }

    // Show critical alert
    toast.error(`🚨 EMERGENCY: ${alert.type.toUpperCase()}`, {
      description: `${alert.location}: ${alert.message}`,
      duration: Infinity,
      action: {
        label: "Acknowledge",
        onClick: () => acknowledgeEmergency(emergencyAlert.id)
      }
    });
  }, []);

  const acknowledgeEmergency = useCallback((alertId: string) => {
    setEmergencyAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  }, []);

  const updateChairStatus = useCallback((chairId: string, status: ChairStatus['status']) => {
    setChairStatuses(prev => prev.map(chair => 
      chair.id === chairId ? { ...chair, status, last_updated: new Date() } : chair
    ));
  }, []);

  return {
    notifications,
    chairStatuses,
    emergencyAlerts,
    connectionStatus,
    markAsRead,
    triggerEmergencyAlert,
    acknowledgeEmergency,
    updateChairStatus
  };
}

function getRandomNotificationTitle(): string {
  const titles = [
    'Patient Arrived',
    'Equipment Calibration Due',
    'Temperature Alert',
    'Appointment Reminder',
    'Supply Low',
    'Maintenance Required',
    'Insurance Verification Complete',
    'Lab Results Available'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomNotificationMessage(): string {
  const messages = [
    'Chair 2 temperature has exceeded normal range',
    'Patient Sarah Johnson has checked in for 3:00 PM appointment',
    'X-ray machine calibration is due tomorrow',
    'Dental supply inventory is running low',
    'Dr. Smith appointment in 15 minutes',
    'Equipment maintenance scheduled for tonight',
    'Insurance pre-authorization approved',
    'Lab results ready for review'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}