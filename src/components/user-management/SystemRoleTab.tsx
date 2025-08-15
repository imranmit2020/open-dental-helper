import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Shield, User, CheckCircle, AlertCircle, Check, ChevronsUpDown } from "lucide-react";

interface SystemRoleTabProps {
  userId?: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const SYSTEM_ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access', color: 'destructive' },
  { value: 'admin', label: 'Admin', description: 'Administrative access', color: 'default' },
  { value: 'dentist', label: 'Dentist', description: 'Clinical and patient access', color: 'secondary' },
  { value: 'hygienist', label: 'Hygienist', description: 'Limited clinical access', color: 'secondary' },
  { value: 'staff', label: 'Staff', description: 'Administrative support', color: 'outline' },
  { value: 'patient', label: 'Patient', description: 'Patient portal access', color: 'outline' }
];

export function SystemRoleTab({ userId }: SystemRoleTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${SYSTEM_ROLES.find(r => r.value === selectedRole)?.label}`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return SYSTEM_ROLES.find(r => r.value === roleValue) || SYSTEM_ROLES[4]; // Default to staff
  };

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User
          </CardTitle>
          <CardDescription>
            Choose a user to manage their system role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <div className="flex items-center justify-between w-full">
                      <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                      <Badge variant={getRoleInfo(selectedUser.role).color as any} className="ml-2">
                        {getRoleInfo(selectedUser.role).label}
                      </Badge>
                    </div>
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
                          <div className="flex items-center justify-between w-full">
                            <span>{user.first_name} {user.last_name}</span>
                            <Badge variant={getRoleInfo(user.role).color as any} className="ml-2">
                              {getRoleInfo(user.role).label}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Current Role Display */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current System Role
            </CardTitle>
            <CardDescription>
              {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              {selectedUser.role === selectedRole ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getRoleInfo(selectedUser.role).color as any}>
                    {getRoleInfo(selectedUser.role).label}
                  </Badge>
                  {selectedUser.role !== selectedRole && (
                    <span className="text-sm text-muted-foreground">
                      → will change to {getRoleInfo(selectedRole).label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getRoleInfo(selectedUser.role).description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Assignment */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Assign System Role</CardTitle>
            <CardDescription>
              Select the appropriate system role for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {SYSTEM_ROLES.map((role) => (
                <div
                  key={role.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedRole === role.value && (
                          <div className="w-full h-full rounded-full bg-background scale-50"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{role.label}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <Badge variant={role.color as any}>
                      {role.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleRoleChange} 
                disabled={saving || !selectedUser || selectedRole === selectedUser.role}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Role
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Information */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              What this role can access in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedRole === 'super_admin' && (
                <div className="space-y-2">
                  <p className="font-medium text-red-600">⚠️ Super Admin Access</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Full system administration</li>
                    <li>Manage all users and roles</li>
                    <li>Access all tenants and corporations</li>
                    <li>System configuration and settings</li>
                    <li>Database and security management</li>
                  </ul>
                </div>
              )}
              {selectedRole === 'admin' && (
                <div className="space-y-2">
                  <p className="font-medium">🛡️ Admin Access</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Tenant administration</li>
                    <li>User management within organization</li>
                    <li>Analytics and reporting</li>
                    <li>Module permissions management</li>
                    <li>Practice settings and configuration</li>
                  </ul>
                </div>
              )}
              {selectedRole === 'dentist' && (
                <div className="space-y-2">
                  <p className="font-medium">🦷 Clinical Access</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Patient management and records</li>
                    <li>Appointment scheduling</li>
                    <li>Treatment planning and execution</li>
                    <li>Medical records and imaging</li>
                    <li>Prescription and lab orders</li>
                  </ul>
                </div>
              )}
              {(selectedRole === 'staff' || selectedRole === 'hygienist') && (
                <div className="space-y-2">
                  <p className="font-medium">👥 Staff Access</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Appointment scheduling</li>
                    <li>Patient communication</li>
                    <li>Basic patient information</li>
                    <li>Front desk operations</li>
                    <li>Limited administrative functions</li>
                  </ul>
                </div>
              )}
              {selectedRole === 'patient' && (
                <div className="space-y-2">
                  <p className="font-medium">🏥 Patient Portal</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>View own appointments</li>
                    <li>Access personal medical records</li>
                    <li>Complete consent forms</li>
                    <li>View treatment plans</li>
                    <li>Communicate with practice</li>
                  </ul>
                </div>
              )}
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