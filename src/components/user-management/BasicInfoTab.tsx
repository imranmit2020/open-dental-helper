import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, User, Mail, Phone, Calendar, MapPin, Briefcase } from "lucide-react";

interface BasicInfoTabProps {
  userId?: string;
  onUserSelect?: (userId: string) => void;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Employee {
  id: string;
  user_id: string;
  job_title?: string;
  department?: string;
  hire_date?: string;
  employment_type?: string;
  status: string;
}

export function BasicInfoTab({ userId, onUserSelect }: BasicInfoTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    hire_date: "",
    employment_type: "full_time",
    status: "active"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.user_id === userId);
      if (user) {
        setSelectedUser(user);
        fetchEmployeeData(userId);
        populateForm(user);
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

  const fetchEmployeeData = async (userIdToFetch: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userIdToFetch)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setEmployee(data || null);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const populateForm = (user: UserProfile) => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      job_title: employee?.job_title || "",
      department: employee?.department || "",
      hire_date: employee?.hire_date || "",
      employment_type: employee?.employment_type || "full_time",
      status: employee?.status || "active"
    });
  };

  const handleUserSelect = (userIdToSelect: string) => {
    const user = users.find(u => u.user_id === userIdToSelect);
    if (user) {
      setSelectedUser(user);
      fetchEmployeeData(userIdToSelect);
      populateForm(user);
      onUserSelect?.(userIdToSelect);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
        .eq('user_id', selectedUser.user_id);

      if (profileError) throw profileError;

      // Update or create employee record
      if (employee) {
        const { error: employeeError } = await supabase
          .from('employees')
          .update({
            job_title: formData.job_title,
            department: formData.department,
            hire_date: formData.hire_date || null,
            employment_type: formData.employment_type,
            status: formData.status
          })
          .eq('id', employee.id);

        if (employeeError) throw employeeError;
      } else if (formData.job_title || formData.department) {
        const { error: createError } = await supabase
          .from('employees')
          .insert({
            user_id: selectedUser.user_id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            job_title: formData.job_title,
            department: formData.department,
            hire_date: formData.hire_date || null,
            employment_type: formData.employment_type,
            status: formData.status
          });

        if (createError) throw createError;
      }

      toast({
        title: "Success",
        description: "User information updated successfully",
      });

      // Refresh data
      fetchUsers();
      if (selectedUser) {
        fetchEmployeeData(selectedUser.user_id);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        title: "Error",
        description: "Failed to save user information",
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
            Choose a user to view and edit their basic information
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

      {/* Basic Information Form */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update user's personal and professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="Email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hire Date
                  </Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={formData.employment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving || !selectedUser}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
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