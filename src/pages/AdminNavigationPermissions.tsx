import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModulePermissions, ModuleKey } from '@/hooks/useModulePermissions';
import { useTenant } from '@/contexts/TenantContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MODULES: { key: ModuleKey; label: string }[] = [
  { key: 'practice_dashboard', label: 'Practice Overview' },
  { key: 'dentist_dashboard', label: 'Dentist Workspace' },
  { key: 'patients', label: 'Patient Management' },
  { key: 'medical_history', label: 'Medical History' },
  { key: 'consent_forms', label: 'Consent Forms' },
  { key: 'treatment_plans', label: 'Treatment Plans' },
  { key: 'insurance_billing', label: 'Insurance & Billing' },
  { key: 'schedule', label: 'Appointment Calendar' },
  { key: 'schedule_management', label: 'Schedule Management' },
  { key: 'ai_scheduling', label: 'AI Smart Scheduling' },
  { key: 'teledentistry', label: 'Teledentistry' },
  { key: 'teledentistry_enhanced', label: 'Enhanced Teledentistry' },
  { key: 'voice_transcription', label: 'Voice Transcription' },
  { key: 'image_analysis', label: 'Image Analysis' },
  { key: 'voice_agent', label: 'Voice Agent' },
  { key: 'translation', label: 'Translation' },
  { key: 'analytics', label: 'Predictive/Practice Analytics' },
  { key: 'ai_marketing', label: 'AI Marketing' },
  { key: 'xray_diagnostics', label: 'X-Ray Diagnostics' },
  { key: 'voice_to_chart', label: 'Voice-to-Chart' },
  { key: 'chairside_assistant', label: 'Chairside Assistant' },
  { key: 'reports', label: 'Practice Reports' },
  { key: 'reports_patients', label: 'Patient Insights' },
  { key: 'multi_practice_analytics', label: 'Multi-Practice Analytics' },
  { key: 'marketing_automation', label: 'Marketing Automation' },
  { key: 'smart_operations', label: 'Smart Operations' },
  { key: 'revenue_management', label: 'Revenue Management' },
  { key: 'market_intelligence', label: 'Market Intelligence' },
  { key: 'reputation_management', label: 'Reputation Management' },
  { key: 'lead_conversion', label: 'Lead Conversion AI' },
  { key: 'compliance_security', label: 'Compliance & Security' },
  { key: 'patient_concierge', label: 'Patient Concierge' },
  { key: 'admin_user_approvals', label: 'Admin • User Approvals' },
  { key: 'admin_employees', label: 'Admin • Employees' },
  { key: 'admin_roles', label: 'Admin • Role Assignment' },
  { key: 'admin_passwords', label: 'Admin • Password Management' },
  { key: 'admin_add_employee', label: 'Admin • Add Employee' },
  { key: 'admin_navigation_permissions', label: 'Admin • Module Access' },
];

const ROLES: Array<'admin' | 'dentist' | 'hygienist' | 'staff'> = ['admin', 'dentist', 'hygienist', 'staff'];

export default function AdminNavigationPermissions() {
  const { currentTenant, tenants, corporation } = useTenant();
  const { isAdmin, isCorporateAdmin, isSuperAdmin } = useRoleAccess();
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(currentTenant?.id);

  // Load all clinics for super admins
  const { data: allTenants } = useQuery({
    queryKey: ['all-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, clinic_code, corporation_id')
        .order('name');
      if (error) {
        console.error('Failed to load tenants', error);
        return [] as any[];
      }
      return (data || []) as any[];
    },
    enabled: !!isSuperAdmin,
  });

  useEffect(() => {
    document.title = 'Module Access Control | DentalAI Pro';
  }, []);

  // Initialize selection from current tenant when available
  useEffect(() => {
    if (currentTenant?.id && !selectedTenantId) {
      setSelectedTenantId(currentTenant.id);
    }
  }, [currentTenant?.id, selectedTenantId]);

  const tenantOptions: any[] = (isSuperAdmin ? (allTenants || []) : (tenants || [])) as any[];
  const selectedTenant: any = tenantOptions.find((t) => t.id === selectedTenantId) || currentTenant || null;

  const { permissions, loading, setPermission } = useModulePermissions({
    tenantId: selectedTenant?.id,
    corporationId: isSuperAdmin ? (selectedTenant?.corporation_id ?? null) : (corporation?.id ?? null),
  });

  useEffect(() => {
    const desc = `Manage module access per clinic${selectedTenant?.name ? ' - ' + selectedTenant.name : ''}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc.slice(0, 160));

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/admin/navigation-permissions');
  }, [selectedTenant?.name]);

  const permissionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const m of permissions) {
      map.set(`${m.module_key}:${m.role}`, !!m.allowed);
    }
    return map;
  }, [permissions]);

  const handleToggle = async (module_key: ModuleKey, role: (typeof ROLES)[number], value: boolean) => {
    try {
      setPermission(module_key, role, value);
      toast.success('Permission updated');
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to update permission');
    }
  };
  if (!currentTenant) return null;
  if (!isAdmin && !isSuperAdmin && !isCorporateAdmin) return (
    <main className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          You do not have permission to view this page.
        </CardContent>
      </Card>
    </main>
  );

  return (
    <main className="p-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Module Access Control (Per Clinic)</h1>
          <p className="text-muted-foreground">Toggle which roles can see modules in the left navigation for this clinic.</p>
        </div>
        {(isSuperAdmin || (tenantOptions?.length ?? 0) > 1) && (
          <div className="w-full md:w-80">
            <label className="mb-1 block text-sm text-muted-foreground">Clinic</label>
            <Select value={selectedTenantId} onValueChange={(v) => setSelectedTenantId(v)}>
              <SelectTrigger aria-label="Select clinic">
                <SelectValue placeholder="Select clinic" />
              </SelectTrigger>
              <SelectContent>
                {tenantOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}{t.clinic_code ? ` (${t.clinic_code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Clinic: {selectedTenant?.name || currentTenant.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {ROLES.map((r) => (
                    <TableHead key={r} className="text-center capitalize">{r}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES.map((m) => (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    {ROLES.map((r) => {
                      const current = permissionMap.get(`${m.key}:${r}`);
                      const checked = current ?? true; // default allow
                      return (
                        <TableCell key={r} className="text-center">
                          <Switch
                            checked={checked}
                            disabled={!selectedTenantId || loading}
                            onCheckedChange={(v) => handleToggle(m.key, r, v)}
                            aria-label={`Allow ${r} to access ${m.label}`}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
