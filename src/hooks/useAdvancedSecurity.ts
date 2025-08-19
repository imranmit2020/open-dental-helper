import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';

export interface BiometricSession {
  id: string;
  user_id: string;
  patient_id?: string;
  biometric_type: 'facial' | 'fingerprint' | 'voice' | 'iris';
  confidence_score: number;
  status: 'pending' | 'verified' | 'failed' | 'challenged';
  timestamp: Date;
  device_info: {
    device_id: string;
    location: string;
    ip_address: string;
  };
  verification_attempts: number;
  fraud_indicators: string[];
}

export interface SecurityThreat {
  id: string;
  threat_type: 'fraud' | 'unauthorized_access' | 'data_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_resources: string[];
  detection_timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  ml_confidence: number;
  recommended_actions: string[];
  evidence: {
    type: 'video' | 'photo' | 'log' | 'audio';
    url: string;
    timestamp: Date;
  }[];
}

export interface AuditTrailEntry {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  timestamp: Date;
  risk_score: number;
  biometric_verification: boolean;
  device_trusted: boolean;
  location_verified: boolean;
  evidence_captured: {
    photos: string[];
    videos: string[];
    screen_recordings: string[];
    audio_clips: string[];
  };
  anomaly_flags: string[];
}

export function useAdvancedSecurity() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [biometricSessions, setBiometricSessions] = useState<BiometricSession[]>([]);
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [zeroTrustScore, setZeroTrustScore] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize mock data and monitoring
  useEffect(() => {
    if (!currentTenant || !user) return;

    // Initialize mock biometric sessions
    const mockSessions: BiometricSession[] = [
      {
        id: 'session-1',
        user_id: user.id,
        patient_id: 'patient-1',
        biometric_type: 'facial',
        confidence_score: 96.5,
        status: 'verified',
        timestamp: new Date(Date.now() - 5 * 60000),
        device_info: {
          device_id: 'device-001',
          location: 'Front Desk',
          ip_address: '192.168.1.100'
        },
        verification_attempts: 1,
        fraud_indicators: []
      },
      {
        id: 'session-2',
        user_id: user.id,
        biometric_type: 'fingerprint',
        confidence_score: 89.2,
        status: 'challenged',
        timestamp: new Date(Date.now() - 15 * 60000),
        device_info: {
          device_id: 'device-002',
          location: 'Chair 3',
          ip_address: '192.168.1.103'
        },
        verification_attempts: 3,
        fraud_indicators: ['multiple_attempts', 'location_anomaly']
      }
    ];

    // Initialize mock security threats
    const mockThreats: SecurityThreat[] = [
      {
        id: 'threat-1',
        threat_type: 'suspicious_activity',
        severity: 'medium',
        description: 'Unusual access pattern detected for patient records',
        affected_resources: ['Patient Database', 'Medical Records'],
        detection_timestamp: new Date(Date.now() - 30 * 60000),
        status: 'investigating',
        ml_confidence: 78.3,
        recommended_actions: ['Review access logs', 'Verify user identity', 'Monitor additional activity'],
        evidence: [
          {
            type: 'video',
            url: '/mock-security-footage.mp4',
            timestamp: new Date(Date.now() - 30 * 60000)
          }
        ]
      }
    ];

    // Initialize mock audit trail
    const mockAuditTrail: AuditTrailEntry[] = [
      {
        id: 'audit-1',
        user_id: user.id,
        action: 'VIEW_PATIENT_RECORD',
        resource: 'Patient: Sarah Johnson',
        timestamp: new Date(Date.now() - 10 * 60000),
        risk_score: 2.1,
        biometric_verification: true,
        device_trusted: true,
        location_verified: true,
        evidence_captured: {
          photos: ['/audit-photo-1.jpg'],
          videos: [],
          screen_recordings: ['/screen-rec-1.mp4'],
          audio_clips: []
        },
        anomaly_flags: []
      },
      {
        id: 'audit-2',
        user_id: user.id,
        action: 'DELETE_APPOINTMENT',
        resource: 'Appointment: APT-2024-001',
        timestamp: new Date(Date.now() - 25 * 60000),
        risk_score: 6.7,
        biometric_verification: false,
        device_trusted: true,
        location_verified: false,
        evidence_captured: {
          photos: ['/audit-photo-2.jpg'],
          videos: ['/audit-video-2.mp4'],
          screen_recordings: ['/screen-rec-2.mp4'],
          audio_clips: []
        },
        anomaly_flags: ['high_risk_action', 'no_biometric_verification']
      }
    ];

    setBiometricSessions(mockSessions);
    setSecurityThreats(mockThreats);
    setAuditTrail(mockAuditTrail);
    setZeroTrustScore(87.5);
    setIsMonitoring(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update zero trust score
      setZeroTrustScore(prev => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(70, Math.min(100, prev + change));
      });

      // Occasionally add new events
      if (Math.random() < 0.1) {
        const newAuditEntry: AuditTrailEntry = {
          id: `audit-${Date.now()}`,
          user_id: user.id,
          action: getRandomAction(),
          resource: getRandomResource(),
          timestamp: new Date(),
          risk_score: Math.random() * 10,
          biometric_verification: Math.random() > 0.3,
          device_trusted: Math.random() > 0.1,
          location_verified: Math.random() > 0.2,
          evidence_captured: {
            photos: Math.random() > 0.5 ? ['/new-audit-photo.jpg'] : [],
            videos: Math.random() > 0.7 ? ['/new-audit-video.mp4'] : [],
            screen_recordings: ['/new-screen-rec.mp4'],
            audio_clips: []
          },
          anomaly_flags: Math.random() > 0.8 ? ['suspicious_timing'] : []
        };

        setAuditTrail(prev => [newAuditEntry, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTenant, user]);

  const performBiometricVerification = useCallback(async (type: BiometricSession['biometric_type'], patientId?: string) => {
    const session: BiometricSession = {
      id: `session-${Date.now()}`,
      user_id: user?.id || '',
      patient_id: patientId,
      biometric_type: type,
      confidence_score: Math.random() * 30 + 70, // 70-100%
      status: 'pending',
      timestamp: new Date(),
      device_info: {
        device_id: `device-${Math.floor(Math.random() * 100)}`,
        location: 'Front Desk',
        ip_address: '192.168.1.100'
      },
      verification_attempts: 1,
      fraud_indicators: []
    };

    setBiometricSessions(prev => [session, ...prev]);

    // Simulate verification process
    setTimeout(() => {
      const verified = session.confidence_score > 85;
      setBiometricSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, status: verified ? 'verified' : 'failed' }
          : s
      ));
    }, 2000);

    return session;
  }, [user]);

  const reportSecurityIncident = useCallback((incident: Omit<SecurityThreat, 'id' | 'detection_timestamp' | 'status'>) => {
    const threat: SecurityThreat = {
      ...incident,
      id: `threat-${Date.now()}`,
      detection_timestamp: new Date(),
      status: 'active'
    };

    setSecurityThreats(prev => [threat, ...prev]);
  }, []);

  const resolveSecurityThreat = useCallback((threatId: string, resolution: SecurityThreat['status']) => {
    setSecurityThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: resolution } : threat
    ));
  }, []);

  return {
    biometricSessions,
    securityThreats,
    auditTrail,
    zeroTrustScore,
    isMonitoring,
    performBiometricVerification,
    reportSecurityIncident,
    resolveSecurityThreat
  };
}

function getRandomAction(): string {
  const actions = [
    'VIEW_PATIENT_RECORD',
    'EDIT_MEDICAL_HISTORY',
    'CREATE_APPOINTMENT',
    'DELETE_APPOINTMENT',
    'ACCESS_FINANCIAL_DATA',
    'EXPORT_PATIENT_DATA',
    'LOGIN_SYSTEM',
    'LOGOUT_SYSTEM'
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function getRandomResource(): string {
  const resources = [
    'Patient: John Doe',
    'Medical Records DB',
    'Financial System',
    'Appointment Schedule',
    'Insurance Database',
    'Treatment Plans',
    'X-Ray Images',
    'Lab Results'
  ];
  return resources[Math.floor(Math.random() * resources.length)];
}