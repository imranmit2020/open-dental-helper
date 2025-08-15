import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Shield, User, CheckCircle, XCircle } from "lucide-react";

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
    key: 'medical_records',
    name: 'Medical Records',
    description: 'Access and manage medical records'
  },
  {
    key: 'billing',
    name: 'Billing & Invoicing',
    description: 'Manage billing and financial records'
  },
  {
    key: 'analytics',
    name: 'Analytics & Reports',
    description: 'View practice analytics and reports'
  },
  {
    key: 'admin_tools',
    name: 'Administrative Tools',
    description: 'Access administrative functions'
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
              <Select value={selectedUser?.user_id || ""} onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Clinic</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a clinic..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.clinic_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role Context</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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