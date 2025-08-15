import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Building, Users, Plus, Trash2, User } from "lucide-react";

interface OrganizationTabProps {
  userId?: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Tenant {
  id: string;
  name: string;
  clinic_code: string;
  corporation_id?: string;
}

interface Corporation {
  id: string;
  name: string;
  corporate_code: string;
}

interface TenantUser {
  tenant_id: string;
  role: string;
  tenants: Tenant;
}

interface CorporateUser {
  corporation_id: string;
  role: string;
  corporations: Corporation;
}

export function OrganizationTab({ userId }: OrganizationTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [userTenants, setUserTenants] = useState<TenantUser[]>([]);
  const [userCorporations, setUserCorporations] = useState<CorporateUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [newTenantAssignment, setNewTenantAssignment] = useState({
    tenant_id: "",
    role: "staff"
  });

  const [newCorporateAssignment, setNewCorporateAssignment] = useState({
    corporation_id: "",
    role: "staff"
  });

  const ORGANIZATION_ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'hygienist', label: 'Hygienist' },
    { value: 'staff', label: 'Staff' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.user_id === userId);
      if (user) {
        setSelectedUser(user);
        fetchUserAssignments(userId);
      }
    }
  }, [userId, users]);

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

      // Fetch corporations
      const { data: corporationsData, error: corporationsError } = await supabase
        .from('corporations')
        .select('*')
        .order('name');

      if (corporationsError) throw corporationsError;
      setCorporations(corporationsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAssignments = async (userIdToFetch: string) => {
    try {
      // Fetch tenant assignments
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_users')
        .select(`
          tenant_id,
          role,
          tenants (
            id,
            name,
            clinic_code,
            corporation_id
          )
        `)
        .eq('user_id', userIdToFetch);

      if (tenantError) throw tenantError;
      setUserTenants(tenantData || []);

      // Fetch corporate assignments
      const { data: corporateData, error: corporateError } = await supabase
        .from('corporate_users')
        .select(`
          corporation_id,
          role,
          corporations (
            id,
            name,
            corporate_code
          )
        `)
        .eq('user_id', userIdToFetch);

      if (corporateError) throw corporateError;
      setUserCorporations(corporateData || []);

    } catch (error) {
      console.error('Error fetching user assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user assignments",
        variant: "destructive",
      });
    }
  };

  const handleUserSelect = (userIdToSelect: string) => {
    const user = users.find(u => u.user_id === userIdToSelect);
    if (user) {
      setSelectedUser(user);
      fetchUserAssignments(userIdToSelect);
    }
  };

  const addTenantAssignment = async () => {
    if (!selectedUser || !newTenantAssignment.tenant_id) {
      toast({
        title: "Error",
        description: "Please select a user and tenant",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('tenant_users')
        .insert({
          user_id: selectedUser.user_id,
          tenant_id: newTenantAssignment.tenant_id,
          role: newTenantAssignment.role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant assignment added successfully",
      });

      // Reset form and refresh data
      setNewTenantAssignment({ tenant_id: "", role: "staff" });
      fetchUserAssignments(selectedUser.user_id);

    } catch (error) {
      console.error('Error adding tenant assignment:', error);
      toast({
        title: "Error",
        description: "Failed to add tenant assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeTenantAssignment = async (tenantId: string) => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('tenant_users')
        .delete()
        .eq('user_id', selectedUser.user_id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant assignment removed successfully",
      });

      fetchUserAssignments(selectedUser.user_id);

    } catch (error) {
      console.error('Error removing tenant assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove tenant assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addCorporateAssignment = async () => {
    if (!selectedUser || !newCorporateAssignment.corporation_id) {
      toast({
        title: "Error",
        description: "Please select a user and corporation",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('corporate_users')
        .insert({
          user_id: selectedUser.user_id,
          corporation_id: newCorporateAssignment.corporation_id,
          role: newCorporateAssignment.role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Corporate assignment added successfully",
      });

      // Reset form and refresh data
      setNewCorporateAssignment({ corporation_id: "", role: "staff" });
      fetchUserAssignments(selectedUser.user_id);

    } catch (error) {
      console.error('Error adding corporate assignment:', error);
      toast({
        title: "Error",
        description: "Failed to add corporate assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeCorporateAssignment = async (corporationId: string) => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('corporate_users')
        .delete()
        .eq('user_id', selectedUser.user_id)
        .eq('corporation_id', corporationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Corporate assignment removed successfully",
      });

      fetchUserAssignments(selectedUser.user_id);

    } catch (error) {
      console.error('Error removing corporate assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove corporate assignment",
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
            Select User
          </CardTitle>
          <CardDescription>
            Choose a user to manage their organization assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>User</Label>
            <Select value={selectedUser?.user_id || ""} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clinic/Tenant Assignments */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Clinic Assignments
            </CardTitle>
            <CardDescription>
              Manage user's access to dental clinics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Assignments */}
            <div className="space-y-3">
              <h4 className="font-medium">Current Assignments</h4>
              {userTenants.length > 0 ? (
                <div className="space-y-2">
                  {userTenants.map((assignment) => (
                    <div key={assignment.tenant_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.tenants.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {assignment.tenants.clinic_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{assignment.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTenantAssignment(assignment.tenant_id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                  No clinic assignments
                </p>
              )}
            </div>

            {/* Add New Assignment */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Clinic Assignment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Clinic</Label>
                  <Select 
                    value={newTenantAssignment.tenant_id} 
                    onValueChange={(value) => setNewTenantAssignment(prev => ({ ...prev, tenant_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.filter(tenant => 
                        !userTenants.some(ut => ut.tenant_id === tenant.id)
                      ).map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.clinic_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={newTenantAssignment.role} 
                    onValueChange={(value) => setNewTenantAssignment(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addTenantAssignment} disabled={saving || !newTenantAssignment.tenant_id}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corporate Assignments */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Corporate Assignments
            </CardTitle>
            <CardDescription>
              Manage user's access to corporate organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Assignments */}
            <div className="space-y-3">
              <h4 className="font-medium">Current Assignments</h4>
              {userCorporations.length > 0 ? (
                <div className="space-y-2">
                  {userCorporations.map((assignment) => (
                    <div key={assignment.corporation_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.corporations.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {assignment.corporations.corporate_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{assignment.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCorporateAssignment(assignment.corporation_id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                  No corporate assignments
                </p>
              )}
            </div>

            {/* Add New Assignment */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Corporate Assignment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Corporation</Label>
                  <Select 
                    value={newCorporateAssignment.corporation_id} 
                    onValueChange={(value) => setNewCorporateAssignment(prev => ({ ...prev, corporation_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select corporation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {corporations.filter(corp => 
                        !userCorporations.some(uc => uc.corporation_id === corp.id)
                      ).map((corp) => (
                        <SelectItem key={corp.id} value={corp.id}>
                          {corp.name} ({corp.corporate_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={newCorporateAssignment.role} 
                    onValueChange={(value) => setNewCorporateAssignment(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addCorporateAssignment} disabled={saving || !newCorporateAssignment.corporation_id}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </Button>
                </div>
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