import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CurrencySelector } from '@/components/CurrencySelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Globe, CreditCard, Settings as SettingsIcon, Shield } from 'lucide-react';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { StaffAvailabilityManager } from '@/components/StaffAvailabilityManager';
import { Clock } from 'lucide-react';

export default function Settings() {
  const { selectedLanguage, isRTL, formatDate, t } = useLanguage();
  const { selectedCurrency } = useCurrency();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const { logUIError } = useErrorLogger();
  const { toast } = useToast();

  // Check if user has admin role for audit logs
  const [userProfile, setUserProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      // Log settings page access
      logAction({
        action: 'VIEW_SETTINGS',
        resource_type: 'settings',
        details: { timestamp: new Date().toISOString() }
      }).catch(error => {
        logUIError(error, 'Settings', 'page_access');
        toast({
          title: "Logging Error",
          description: "Failed to record audit log",
          variant: "destructive"
        });
      });

      const fetchProfile = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          setUserProfile(data);
        } catch (error) {
          logUIError(error as Error, 'Settings', 'fetch_profile');
          console.error('Failed to fetch user profile:', error);
        }
      };
      fetchProfile();
    }
  }, [user, logAction, logUIError]);

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your regional preferences and system settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="behavior">Application</TabsTrigger>
          <TabsTrigger value="availability">Staff Schedule</TabsTrigger>
          {isAdmin && <TabsTrigger value="audit">HIPAA Audit Logs</TabsTrigger>}
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
                <CardDescription>
                  Set your preferred language and regional formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="language">Display Language</Label>
                  <LanguageSelector variant="default" />
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {selectedLanguage.nativeName}
                    </Badge>
                    {isRTL && <Badge variant="outline">RTL</Badge>}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Regional Information</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language Code:</span>
                      <span className="font-mono">{selectedLanguage.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Text Direction:</span>
                      <span>{isRTL ? 'Right-to-Left' : 'Left-to-Right'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date Format:</span>
                      <span>{formatDate(new Date())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Currency & Financial
                </CardTitle>
                <CardDescription>
                  Configure your preferred currency and financial display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="currency">Primary Currency</Label>
                  <CurrencySelector variant="default" showRefreshButton={true} />
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {selectedCurrency.symbol} {selectedCurrency.code}
                    </Badge>
                    <Badge variant="outline">
                      Rate: {selectedCurrency.rate.toFixed(4)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Currency Information</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency Name:</span>
                      <span>{selectedCurrency.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="font-mono">{selectedCurrency.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange Rate:</span>
                      <span>{selectedCurrency.rate.toFixed(4)} USD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior">
          {/* Application Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>Application Behavior</CardTitle>
              <CardDescription>
                How these settings affect your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Language Effects</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Interface text and labels</li>
                    <li>• Date and time formatting</li>
                    <li>• Number formatting</li>
                    <li>• Text direction (RTL support)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Currency Effects</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All monetary amounts display</li>
                    <li>• Invoice and billing formats</li>
                    <li>• Financial reports and analytics</li>
                    <li>• Treatment cost calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Staff Availability Management
              </CardTitle>
              <CardDescription>
                Manage staff schedules and availability across different clinics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffAvailabilityManager />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}