import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";

interface SecuritySettings {
  face_verification_enabled: boolean;
  otp_enabled: boolean;
  device_remembering_enabled: boolean;
}

export default function AdminSecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings>({
    face_verification_enabled: true,
    otp_enabled: true,
    device_remembering_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  useEffect(() => {
    fetchSettings();
  }, [currentTenant]);

  const fetchSettings = async () => {
    if (!currentTenant) return;
    
    setLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to fetch security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!currentTenant) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('security_settings')
        .upsert({
          tenant_id: currentTenant.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Configure authentication methods for employee time tracking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="face-verification" className="text-base">
                Face Verification
              </Label>
              <p className="text-sm text-muted-foreground">
                Require biometric facial recognition for clock in/out
              </p>
            </div>
            <Switch
              id="face-verification"
              checked={settings.face_verification_enabled}
              onCheckedChange={(checked) => updateSetting('face_verification_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="otp" className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                OTP Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow one-time password as alternative to face verification
              </p>
            </div>
            <Switch
              id="otp"
              checked={settings.otp_enabled}
              onCheckedChange={(checked) => updateSetting('otp_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="device-remembering" className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Remember Device
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow devices to be remembered for 30 days after verification
              </p>
            </div>
            <Switch
              id="device-remembering"
              checked={settings.device_remembering_enabled}
              onCheckedChange={(checked) => updateSetting('device_remembering_enabled', checked)}
            />
          </div>

          <div className="pt-4">
            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}