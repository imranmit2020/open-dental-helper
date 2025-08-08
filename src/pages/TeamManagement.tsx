import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as AlertDlgContent, AlertDialogDescription, AlertDialogFooter as AlertDlgFooter, AlertDialogHeader as AlertDlgHeader, AlertDialogTitle as AlertDlgTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTenant } from "@/contexts/TenantContext";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["dentist", "hygienist", "staff", "admin", "super_admin"]).refine((r) => r !== "super_admin", {
    message: "Super Admin invites are restricted",
  }),
});

type FormValues = z.infer<typeof schema>;

function setSEO() {
  document.title = "Team Management | DentalAI Pro";
  const desc = "Invite dentists, hygienists, and staff to your clinic";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
  meta.setAttribute("content", desc);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
  canonical.setAttribute("href", window.location.origin + "/admin/team");
}

export default function TeamManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "staff" } });

  useEffect(() => { setSEO(); }, []);

  const [editing, setEditing] = useState<null | { user_id: string; first_name: string; last_name: string; email: string; role: FormValues["role"]; phone?: string }>(null);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [savingEmployee, setSavingEmployee] = useState(false);

  const { data: team, refetch, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone, role")
        .in("role", ["admin", "super_admin", "dentist", "hygienist", "staff"])
        .order("role", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: invitations, refetch: refetchInvites } = useQuery({
    queryKey: ["team-invitations", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, email, first_name, last_name, role, status, created_at, sent_at")
        .eq("tenant_id", currentTenant!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: employees, refetch: refetchEmployees } = useQuery({
    queryKey: ["employees", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, user_id, employee_id, job_title, department, employment_type, status, hire_date, tenant_id")
        .eq("tenant_id", currentTenant!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const employeeByUserId = useMemo(() => {
    const map: Record<string, string> = {};
    (employees || []).forEach((e: any) => {
      if (e.user_id && e.employee_id) map[e.user_id] = e.employee_id;
    });
    return map;
  }, [employees]);

  const employeeRecordByUserId = useMemo(() => {
    const map: Record<string, any> = {};
    (employees || []).forEach((e: any) => {
      if (e.user_id) map[e.user_id] = e;
    });
    return map;
  }, [employees]);

  const combinedRows = useMemo(() => {
    const members = (team || []).map((u: any) => ({ ...u, _type: "member" as const }));
    const invites = (invitations || []).map((i: any) => ({
      ...i,
      _type: "invite" as const,
      invite_id: i.id,
      user_id: null,
      phone: null,
      id: null,
    }));
    return [...members, ...invites];
  }, [team, invitations]);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: editing.first_name,
          last_name: editing.last_name,
          role: editing.role,
          phone: editing.phone ?? null,
        })
        .eq("user_id", editing.user_id)
        .select("user_id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No permission to update this member. Ask a Super Admin.");
      }
      toast({ title: "Updated", description: "Team member updated successfully." });
      setEditing(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      if (!inviteId) throw new Error("Missing invitation id");
      const { error } = await supabase.from("team_invitations").delete().eq("id", inviteId);
      if (error) throw error;
      toast({ title: "Invitation deleted", description: "The pending invite was removed." });
      await refetchInvites?.();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      if (!currentTenant?.id) throw new Error("No clinic selected.");
      if (!memberUserId) throw new Error("Missing user id");
      const { error } = await supabase
        .from("tenant_users")
        .delete()
        .eq("tenant_id", currentTenant.id)
        .eq("user_id", memberUserId);
      if (error) throw error;
      toast({ title: "Member removed", description: "Access to this clinic has been revoked." });
      await refetch();
    } catch (e: any) {
      toast({ title: "Remove failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  const openEditEmployee = (userId: string) => {
    const rec = (employeeRecordByUserId as any)?.[userId];
    if (rec) setEditingEmployee({ ...rec });
  };

  const saveEmployeeEdit = async () => {
    if (!editingEmployee) return;
    try {
      setSavingEmployee(true);
      const { id, job_title, department, employment_type, status, hire_date } = editingEmployee;
      const { error } = await supabase
        .from("employees")
        .update({ job_title, department, employment_type, status, hire_date })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Employee updated" });
      setEditingEmployee(null);
      await refetchEmployees?.();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setSavingEmployee(false);
    }
  };

  const deactivateEmployee = async (userId: string) => {
    const rec = (employeeRecordByUserId as any)?.[userId];
    if (!rec) return;
    try {
      const { error } = await supabase
        .from("employees")
        .update({ status: "inactive" })
        .eq("id", rec.id);
      if (error) throw error;
      toast({ title: "Employee deactivated" });
      await refetchEmployees?.();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  const [sortKey, setSortKey] = useState<'employee_id' | 'name' | 'email' | 'role'>('role');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const sortedTeam = useMemo(() => {
    const arr = [...(combinedRows || [])];
    arr.sort((a: any, b: any) => {
      const getVal = (u: any) => {
        switch (sortKey) {
          case 'name':
            return `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
          case 'employee_id':
            return (employeeByUserId[(u as any).user_id] || '').toLowerCase();
          default:
            return ((u as any)[sortKey] || '').toString().toLowerCase();
        }
      };
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [combinedRows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(((sortedTeam?.length) || 0) / pageSize));
  useEffect(() => { setPage(1); }, [combinedRows]);
  const paginatedTeam = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (sortedTeam || []).slice(start, start + pageSize);
  }, [sortedTeam, page]);

  const handleSort = (key: 'employee_id' | 'name' | 'email' | 'role') => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!user) throw new Error("You must be logged in.");
      if (!currentTenant?.id) throw new Error("No clinic selected. Please assign a clinic first.");
      const redirectUrl = `${window.location.origin}/`;

      // 1) Record invitation in DB
      const { data: invite, error: insertError } = await supabase
        .from("team_invitations")
        .insert({
          tenant_id: currentTenant.id,
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role,
          created_by: user.id,
        })
        .select("id")
        .maybeSingle();
      if (insertError) throw insertError;

      // 2) Send magic login link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: { emailRedirectTo: redirectUrl },
      });

      if (otpError) {
        if (invite?.id) {
          await supabase.from("team_invitations").update({ status: "failed" }).eq("id", invite.id);
        }
        throw otpError;
      } else if (invite?.id) {
        await supabase
          .from("team_invitations")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", invite.id);
      }

      toast({ title: "Invitation sent", description: "We emailed a login link to the user." });
      form.reset({ role: values.role } as any);
      setTimeout(() => { refetch(); refetchInvites?.(); }, 800);
    } catch (e: any) {
      toast({ title: "Invite failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">Invite dentists, hygienists, and staff, then approve and assign permissions.</p>
      </header>
      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Invite Team Member</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => { form.setValue("role","dentist"); form.setFocus("first_name"); }}>Add Dentist</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { form.setValue("role","hygienist"); form.setFocus("first_name"); }}>Add Hygienist</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { form.setValue("role","staff"); form.setFocus("first_name"); }}>Add Staff</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Quick role:</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue("role","dentist")}>Dentist</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue("role","hygienist")}>Hygienist</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue("role","staff")}>Staff</Button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="first_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl><Input placeholder="Jane" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="last_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="role" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="hygienist">Hygienist</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">Save & Send Invitation</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Existing Team</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => { form.setValue('role','dentist'); form.setFocus('first_name'); }}>Add Dentist</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { form.setValue('role','hygienist'); form.setFocus('first_name'); }}>Add Hygienist</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading team...</p>
          ) : (
            <> 
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('employee_id')}>Employee ID</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>Name</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>Email</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('role')}>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!combinedRows || combinedRows.length === 0) ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground">No team members yet.</TableCell></TableRow>
                ) : (
                  paginatedTeam.map((u: any) => (
                    <TableRow key={u._type === 'invite' ? `invite-${u.invite_id ?? u.email}` : `user-${u.user_id}`}>
                      <TableCell>{u._type === 'member' ? (employeeByUserId[u.user_id] || '—') : '—'}</TableCell>
                      <TableCell>
                        {u.first_name} {u.last_name}{u._type === 'invite' ? ' (Invited)' : ''}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>
                        {u._type === 'member' ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(u)}>Edit</Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditEmployee(u.user_id)}
                              disabled={!employeeRecordByUserId?.[u.user_id]}
                            >
                              Edit Employee
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => deactivateEmployee(u.user_id)}
                              disabled={!employeeRecordByUserId?.[u.user_id] || employeeRecordByUserId?.[u.user_id]?.status === 'inactive'}
                            >
                              Deactivate
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={u.user_id === user?.id}>Remove</Button>
                              </AlertDialogTrigger>
                              <AlertDlgContent>
                                <AlertDlgHeader>
                                  <AlertDlgTitle>Remove team member</AlertDlgTitle>
                                  <AlertDialogDescription>
                                    This will remove {u.first_name} {u.last_name} from this clinic. They will lose access. Continue?
                                  </AlertDialogDescription>
                                </AlertDlgHeader>
                                <AlertDlgFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(u.user_id)}>Remove</AlertDialogAction>
                                </AlertDlgFooter>
                              </AlertDlgContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">Delete invite</Button>
                            </AlertDialogTrigger>
                            <AlertDlgContent>
                              <AlertDlgHeader>
                                <AlertDlgTitle>Delete invitation</AlertDlgTitle>
                                <AlertDialogDescription>
                                  Delete the pending invitation for {u.email}?
                                </AlertDialogDescription>
                              </AlertDlgHeader>
                              <AlertDlgFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteInvite(u.invite_id)}>Delete</AlertDialogAction>
                              </AlertDlgFooter>
                            </AlertDlgContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">Page {page} of {totalPages} • {(sortedTeam?.length || 0)} total</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <Label>Employee ID</Label>
                <Input value={editingEmployee.employee_id || ''} disabled />
              </div>
              <div className="col-span-1">
                <Label>Job title</Label>
                <Input value={editingEmployee.job_title ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, job_title: e.target.value })} />
              </div>
              <div className="col-span-1">
                <Label>Department</Label>
                <Input value={editingEmployee.department ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} />
              </div>
              <div className="col-span-1">
                <Label>Employment type</Label>
                <Select value={editingEmployee.employment_type ?? 'full_time'} onValueChange={(v) => setEditingEmployee({ ...editingEmployee, employment_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label>Status</Label>
                <Select value={editingEmployee.status ?? 'active'} onValueChange={(v) => setEditingEmployee({ ...editingEmployee, status: v })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label>Hire date</Label>
                <Input type="date" value={(editingEmployee.hire_date || '').slice(0,10)} onChange={(e) => setEditingEmployee({ ...editingEmployee, hire_date: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingEmployee(null)}>Cancel</Button>
            <Button onClick={saveEmployeeEdit} disabled={savingEmployee}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit team member</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label>First name</Label>
                <Input value={editing.first_name} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} />
              </div>
              <div className="col-span-1">
                <Label>Last name</Label>
                <Input value={editing.last_name} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label>Email</Label>
                <Input value={editing.email} disabled />
              </div>
              <div className="col-span-1">
                <Label>Role</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as FormValues["role"] })}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="hygienist">Hygienist</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label>Phone</Label>
                <Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
