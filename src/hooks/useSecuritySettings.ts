import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface SecuritySettings {
  face_verification_enabled: boolean;
  otp_enabled: boolean;
  device_remembering_enabled: boolean;
}

export function useSecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings>({
    face_verification_enabled: true,
    otp_enabled: true,
    device_remembering_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const { currentTenant } = useTenant();

  useEffect(() => {
    fetchSettings();
  }, [currentTenant]);

  const fetchSettings = async () => {
    if (!currentTenant) return;
    
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          face_verification_enabled: data.face_verification_enabled,
          otp_enabled: data.otp_enabled,
          device_remembering_enabled: data.device_remembering_enabled,
        });
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const getDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    
    return btoa(
      navigator.userAgent +
      screen.width + screen.height +
      new Date().getTimezoneOffset() +
      navigator.language +
      (canvas.toDataURL() || '')
    ).slice(0, 32);
  };

  const checkTrustedDevice = async (userId: string): Promise<boolean> => {
    try {
      const deviceFingerprint = getDeviceFingerprint();
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .gt('trusted_until', new Date().toISOString())
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error('Failed to check trusted device:', error);
      return false;
    }
  };

  const trustDevice = async (userId: string, deviceName?: string): Promise<boolean> => {
    try {
      const deviceFingerprint = getDeviceFingerprint();
      const trustedUntil = new Date();
      trustedUntil.setDate(trustedUntil.getDate() + 30);

      const { error } = await supabase
        .from('trusted_devices')
        .upsert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName || navigator.userAgent,
          trusted_until: trustedUntil.toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Failed to trust device:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    generateOTP,
    checkTrustedDevice,
    trustDevice,
    refresh: fetchSettings,
  };
}