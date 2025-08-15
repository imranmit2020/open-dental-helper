import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Shield, User, CheckCircle, XCircle, Check, ChevronsUpDown } from "lucide-react";

interface PermissionsTabProps {
  userId?: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  clinic_code: string;
}

interface ModulePermission {
  id: string;
  tenant_id: string;
  module_key: string;
  role: string;
  allowed: boolean;
}

const MODULE_DEFINITIONS = [
  // Core Practice Management
  {
    key: 'practice_dashboard',
    name: 'Practice Dashboard',
    description: 'Main dashboard with practice overview and analytics'
  },
  {
    key: 'dentist_dashboard',
    name: 'Dentist Dashboard',
    description: 'Clinical dashboard for dentists'
  },
  {
    key: 'patients',
    name: 'Patient Management',
    description: 'Manage patient records and information'
  },
  {
    key: 'appointments',
    name: 'Appointment Scheduling',
    description: 'Schedule and manage appointments'
  },
  {
    key: 'schedule_management',
    name: 'Schedule Management',
    description: 'Advanced scheduling and calendar management'
  },
  
  // Clinical & Medical
  {
    key: 'medical_records',
    name: 'Medical Records',
    description: 'Access and manage medical records'
  },
  {
    key: 'medical_history',
    name: 'Medical History',
    description: 'Patient medical history management'
  },
  {
    key: 'patient_charting',
    name: 'Patient Charting',
    description: 'Digital patient charting and notes'
  },
  {
    key: 'consent_forms',
    name: 'Consent Forms',
    description: 'Digital consent form management'
  },
  {
    key: 'treatment_plan_generator',
    name: 'Treatment Plan Generator',
    description: 'Create and manage treatment plans'
  },
  
  // Imaging & Diagnostics
  {
    key: 'image_analysis',
    name: 'Image Analysis',
    description: 'AI-powered dental image analysis'
  },
  {
    key: 'xray_diagnostics',
    name: 'X-Ray Diagnostics',
    description: 'X-ray imaging and diagnostic tools'
  },
  {
    key: 'microscopic_analysis',
    name: 'Microscopic Analysis',
    description: 'Microscopic imaging analysis'
  },
  {
    key: 'dental_modeling_3d',
    name: '3D Dental Modeling',
    description: '3D dental modeling and visualization'
  },
  {
    key: 'ar_treatment_preview',
    name: 'AR Treatment Preview',
    description: 'Augmented reality treatment previews'
  },
  
  // Financial Management
  {
    key: 'billing',
    name: 'Billing & Invoicing',
    description: 'Manage billing and financial records'
  },
  {
    key: 'insurance_billing',
    name: 'Insurance Billing',
    description: 'Insurance claims and billing management'
  },
  {
    key: 'revenue_management',
    name: 'Revenue Management',
    description: 'Revenue tracking and optimization'
  },
  {
    key: 'competitive_fee_analyzer',
    name: 'Competitive Fee Analyzer',
    description: 'Analyze and optimize pricing strategies'
  },
  
  // Analytics & Intelligence
  {
    key: 'analytics',
    name: 'Analytics & Reports',
    description: 'View practice analytics and reports'
  },
  {
    key: 'practice_analytics',
    name: 'Practice Analytics',
    description: 'Detailed practice performance analytics'
  },
  {
    key: 'multi_practice_analytics',
    name: 'Multi-Practice Analytics',
    description: 'Cross-practice analytics and comparisons'
  },
  {
    key: 'predictive_analytics',
    name: 'Predictive Analytics',
    description: 'Predictive insights and forecasting'
  },
  {
    key: 'predictive_treatment',
    name: 'Predictive Treatment',
    description: 'AI-powered treatment predictions'
  },
  {
    key: 'market_intelligence',
    name: 'Market Intelligence',
    description: 'Market trends and competitive analysis'
  },
  
  // AI & Automation
  {
    key: 'ai_assistant',
    name: 'AI Assistant',
    description: 'AI-powered practice assistant'
  },
  {
    key: 'ai_marketing',
    name: 'AI Marketing',
    description: 'AI-driven marketing campaigns'
  },
  {
    key: 'ai_patient_analytics',
    name: 'AI Patient Analytics',
    description: 'AI-powered patient insights'
  },
  {
    key: 'ai_revenue_advisor',
    name: 'AI Revenue Advisor',
    description: 'AI-driven revenue optimization'
  },
  {
    key: 'ai_scheduling',
    name: 'AI Scheduling',
    description: 'Intelligent appointment scheduling'
  },
  {
    key: 'ai_voice_notes',
    name: 'AI Voice Notes',
    description: 'Voice-to-text note taking'
  },
  {
    key: 'quantum_dental_ai',
    name: 'Quantum Dental AI',
    description: 'Advanced AI diagnostic tools'
  },
  {
    key: 'quantum_scheduling',
    name: 'Quantum Scheduling',
    description: 'Advanced scheduling optimization'
  },
  
  // Communication & Marketing
  {
    key: 'marketing_automation',
    name: 'Marketing Automation',
    description: 'Automated marketing campaigns'
  },
  {
    key: 'lead_conversion',
    name: 'Lead Conversion',
    description: 'Lead management and conversion tools'
  },
  {
    key: 'reputation_management',
    name: 'Reputation Management',
    description: 'Online reputation monitoring and management'
  },
  {
    key: 'patient_concierge',
    name: 'Patient Concierge',
    description: 'Enhanced patient communication and support'
  },
  {
    key: 'patient_journey',
    name: 'Patient Journey',
    description: 'Patient journey mapping and optimization'
  },
  {
    key: 'voice_agent',
    name: 'Voice Agent',
    description: 'AI voice communication system'
  },
  
  // Operations & Management
  {
    key: 'team_management',
    name: 'Team Management',
    description: 'Staff and team management tools'
  },
  {
    key: 'employee_time_tracking',
    name: 'Employee Time Tracking',
    description: 'Staff time and attendance tracking'
  },
  {
    key: 'employee_time_analytics',
    name: 'Employee Time Analytics',
    description: 'Staff productivity and time analytics'
  },
  {
    key: 'smart_operations',
    name: 'Smart Operations',
    description: 'Operational efficiency tools'
  },
  {
    key: 'smart_documentation',
    name: 'Smart Documentation',
    description: 'Intelligent document management'
  },
  {
    key: 'realtime_monitoring',
    name: 'Realtime Monitoring',
    description: 'Real-time practice monitoring'
  },
  
  // Specialized Services
  {
    key: 'teledentistry',
    name: 'Teledentistry',
    description: 'Remote dental consultation platform'
  },
  {
    key: 'teledentistry_enhanced',
    name: 'Enhanced Teledentistry',
    description: 'Advanced teledentistry features'
  },
  {
    key: 'lab_management',
    name: 'Lab Management',
    description: 'Dental laboratory management'
  },
  {
    key: 'referral_network',
    name: 'Referral Network',
    description: 'Professional referral management'
  },
  {
    key: 'professional_profile',
    name: 'Professional Profile',
    description: 'Professional profile management'
  },
  
  // Tools & Utilities
  {
    key: 'chairside_assistant',
    name: 'Chairside Assistant',
    description: 'Clinical chairside support tools'
  },
  {
    key: 'voice_transcription',
    name: 'Voice Transcription',
    description: 'Voice-to-text transcription services'
  },
  {
    key: 'voice_to_chart',
    name: 'Voice to Chart',
    description: 'Voice dictation for patient charts'
  },
  {
    key: 'translation',
    name: 'Translation Services',
    description: 'Multi-language translation tools'
  },
  {
    key: 'personalized_preventive_care',
    name: 'Personalized Preventive Care',
    description: 'Customized preventive care programs'
  },
  {
    key: 'gamified_kids_app',
    name: 'Gamified Kids App',
    description: 'Interactive dental education for children'
  },
  
  // Security & Compliance
  {
    key: 'compliance_security',
    name: 'Compliance & Security',
    description: 'HIPAA compliance and security management'
  },
  {
    key: 'fraud_detection_system',
    name: 'Fraud Detection',
    description: 'AI-powered fraud detection and prevention'
  },
  {
    key: 'qa_checklist',
    name: 'QA Checklist',
    description: 'Quality assurance and compliance checklists'
  },
  
  // System Administration
  {
    key: 'admin_tools',
    name: 'Administrative Tools',
    description: 'Access administrative functions'
  },
  {
    key: 'data_migration',
    name: 'Data Migration',
    description: 'Data import and migration tools'
  },
  {
    key: 'module_flows',
    name: 'Module Flows',
    description: 'System workflow and module management'
  },
  {
    key: 'module_analysis_report',
    name: 'Module Analysis Report',
    description: 'System usage and module analysis'
  }
];

const USER_ROLES = ['admin', 'dentist', 'hygienist', 'staff', 'patient'];

export function PermissionsTab({ userId }: PermissionsTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.user_id === userId);
      if (user) {
        setSelectedUser(user);
        setSelectedRole(user.role);
      }
    }
  }, [userId, users]);

  useEffect(() => {
    if (selectedTenant && selectedRole) {
      fetchPermissions();
    }
  }, [selectedTenant, selectedRole]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('name');

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    if (!selectedTenant || !selectedRole) return;

    try {
      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('tenant_id', selectedTenant)
        .eq('role', selectedRole);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      });
    }
  };

  const handleUserSelect = (userIdToSelect: string) => {
    const user = users.find(u => u.user_id === userIdToSelect);
    if (user) {
      setSelectedUser(user);
      setSelectedRole(user.role);
      setUserDropdownOpen(false);
    }
  };

  const isModuleAllowed = (moduleKey: string): boolean => {
    const permission = permissions.find(p => p.module_key === moduleKey);
    return permission?.allowed ?? false;
  };

  const toggleModulePermission = async (moduleKey: string, allowed: boolean) => {
    if (!selectedTenant || !selectedRole) return;

    try {
      setSaving(true);

      const existingPermission = permissions.find(p => p.module_key === moduleKey);

      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('module_permissions')
          .update({ allowed })
          .eq('id', existingPermission.id);

        if (error) throw error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('module_permissions')
          .insert({
            tenant_id: selectedTenant,
            module_key: moduleKey,
            role: selectedRole,
            allowed
          });

        if (error) throw error;
      }

      // Refresh permissions
      fetchPermissions();

      toast({
        title: "Success",
        description: `Module permission ${allowed ? 'granted' : 'revoked'}`,
      });

    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const applyRoleDefaults = async () => {
    if (!selectedTenant || !selectedRole) return;

    try {
      setSaving(true);

      // Define default permissions for each role
      const roleDefaults: Record<string, string[]> = {
        admin: MODULE_DEFINITIONS.map(m => m.key), // All modules
        dentist: ['practice_dashboard', 'dentist_dashboard', 'patients', 'appointments', 'medical_records', 'analytics'],
        hygienist: ['patients', 'appointments', 'medical_records'],
        staff: ['practice_dashboard', 'patients', 'appointments', 'billing'],
        patient: [] // No module access by default
      };

      const allowedModules = roleDefaults[selectedRole] || [];

      // Update all module permissions for this role/tenant
      for (const module of MODULE_DEFINITIONS) {
        const allowed = allowedModules.includes(module.key);
        const existingPermission = permissions.find(p => p.module_key === module.key);

        if (existingPermission) {
          await supabase
            .from('module_permissions')
            .update({ allowed })
            .eq('id', existingPermission.id);
        } else {
          await supabase
            .from('module_permissions')
            .insert({
              tenant_id: selectedTenant,
              module_key: module.key,
              role: selectedRole,
              allowed
            });
        }
      }

      // Refresh permissions
      fetchPermissions();

      toast({
        title: "Success",
        description: `Applied default permissions for ${selectedRole} role`,
      });

    } catch (error) {
      console.error('Error applying role defaults:', error);
      toast({
        title: "Error",
        description: "Failed to apply role defaults",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User & Context
          </CardTitle>
          <CardDescription>
            Choose a user, clinic, and role to manage module permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userDropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedUser ? (
                      `${selectedUser.first_name} ${selectedUser.last_name}`
                    ) : (
                      "Select a user..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.user_id}
                            value={`${user.first_name} ${user.last_name} ${user.email}`}
                            onSelect={() => handleUserSelect(user.user_id)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedUser?.user_id === user.user_id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {user.first_name} {user.last_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Clinic</Label>
              <Popover open={tenantDropdownOpen} onOpenChange={setTenantDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tenantDropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedTenant ? (
                      `${tenants.find(t => t.id === selectedTenant)?.name} (${tenants.find(t => t.id === selectedTenant)?.clinic_code})`
                    ) : (
                      "Select a clinic..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clinics..." />
                    <CommandList>
                      <CommandEmpty>No clinics found.</CommandEmpty>
                      <CommandGroup>
                        {tenants.map((tenant) => (
                          <CommandItem
                            key={tenant.id}
                            value={`${tenant.name} ${tenant.clinic_code}`}
                            onSelect={() => {
                              setSelectedTenant(tenant.id);
                              setTenantDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedTenant === tenant.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {tenant.name} ({tenant.clinic_code})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Role Context</Label>
              <Popover open={roleDropdownOpen} onOpenChange={setRoleDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={roleDropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedRole ? (
                      selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
                    ) : (
                      "Select a role..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search roles..." />
                    <CommandList>
                      <CommandEmpty>No roles found.</CommandEmpty>
                      <CommandGroup>
                        {USER_ROLES.map((role) => (
                          <CommandItem
                            key={role}
                            value={role}
                            onSelect={() => {
                              setSelectedRole(role);
                              setRoleDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedRole === role ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Permissions */}
      {selectedUser && selectedTenant && selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Module Permissions
            </CardTitle>
            <CardDescription>
              Configure access to specific system modules for {selectedUser.first_name} {selectedUser.last_name} as {selectedRole} in {tenants.find(t => t.id === selectedTenant)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Defaults Button */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h4 className="font-medium">Quick Setup</h4>
                <p className="text-sm text-muted-foreground">
                  Apply default permissions for the {selectedRole} role
                </p>
              </div>
              <Button onClick={applyRoleDefaults} disabled={saving} variant="outline">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Apply Role Defaults
              </Button>
            </div>

            {/* Module List */}
            <div className="space-y-4">
              {MODULE_DEFINITIONS.map((module) => {
                const isAllowed = isModuleAllowed(module.key);
                return (
                  <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {isAllowed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={isAllowed ? "default" : "secondary"}>
                        {isAllowed ? "Allowed" : "Denied"}
                      </Badge>
                      <Switch
                        checked={isAllowed}
                        onCheckedChange={(checked) => toggleModulePermission(module.key, checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permission Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Permission Summary</h4>
              <div className="flex flex-wrap gap-2">
                {MODULE_DEFINITIONS.filter(m => isModuleAllowed(m.key)).map((module) => (
                  <Badge key={module.key} variant="default">
                    {module.name}
                  </Badge>
                ))}
                {MODULE_DEFINITIONS.filter(m => !isModuleAllowed(m.key)).map((module) => (
                  <Badge key={module.key} variant="secondary">
                    {module.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}