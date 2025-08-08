import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AssignmentRow {
  user_id: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

const ROLE_OPTIONS = ["admin", "dentist", "hygienist", "staff"] as const;

export default function AdminRoleAssignment() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const title = useMemo(() => `Role Assignment — ${currentTenant?.name ?? "Select Clinic"}`,[currentTenant?.name]);


  useEffect(() => {
    const loadData = async () => {
      if (!currentTenant?.id) return;
      setLoading(true);
      try {
        // 1) Fetch existing assignments for this tenant
        const { data: tenantUsers, error: tuErr } = await supabase
          .from("tenant_users")
          .select("user_id, role")
          .eq("tenant_id", currentTenant.id);
        if (tuErr) throw tuErr;

        const assignedUserIds = (tenantUsers ?? []).map((tu) => tu.user_id).filter(Boolean) as string[];

        // 2) Fetch employees with linked users for this tenant
        const { data: employees, error: empErr } = await supabase
          .from("employees")
          .select("user_id, first_name, last_name, email")
          .eq("tenant_id", currentTenant.id)
          .not("user_id", "is", null);
        if (empErr) throw empErr;

        const allUserIds = Array.from(new Set([...(assignedUserIds || []), ...((employees||[]).map(e=>e.user_id).filter(Boolean) as string[])]));

        // 3) Fetch profiles for those users to get names/emails
        let profilesByUserId: Record<string, { first_name?: string|null; last_name?: string|null; email?: string|null }> = {};
        if (allUserIds.length > 0) {
          const { data: profiles, error: profErr } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, email")
            .in("user_id", allUserIds);
          if (profErr) throw profErr;
          profilesByUserId = Object.fromEntries((profiles||[]).map(p => [p.user_id, { first_name: p.first_name, last_name: p.last_name, email: p.email }]));
        }

        // 4) Build row set combining tenant_users and employees (dedup by user_id)
        const map: Record<string, AssignmentRow> = {};

        (employees || []).forEach((e:any) => {
          if (!e.user_id) return;
          map[e.user_id] = {
            user_id: e.user_id,
            role: "staff", // default for unassigned below
            first_name: e.first_name,
            last_name: e.last_name,
            email: e.email,
          };
        });

        (tenantUsers || []).forEach((tu:any) => {
          const profile = profilesByUserId[tu.user_id] || {};
          map[tu.user_id] = {
            user_id: tu.user_id,
            role: tu.role,
            first_name: profile.first_name ?? map[tu.user_id]?.first_name ?? null,
            last_name: profile.last_name ?? map[tu.user_id]?.last_name ?? null,
            email: profile.email ?? map[tu.user_id]?.email ?? null,
          };
        });

        setRows(Object.values(map).sort((a,b)=>{
          const an = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim().toLowerCase();
          const bn = `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim().toLowerCase();
          return an.localeCompare(bn);
        }));
      } catch (e:any) {
        toast({ title: "Failed to load assignments", description: e.message || "Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentTenant?.id, toast]);

  const updateRole = (user_id: string, role: string) => {
    setRows(prev => prev.map(r => r.user_id === user_id ? { ...r, role } : r));
  };

  const saveRole = async (user_id: string) => {
    if (!currentTenant?.id) {
      toast({ title: "No clinic selected", variant: "destructive"});
      return;
    }
    const row = rows.find(r => r.user_id === user_id);
    if (!row) return;
    setSavingId(user_id);
    try {
      const { error } = await supabase
        .from("tenant_users")
        .upsert({ tenant_id: currentTenant.id, user_id, role: row.role }, { onConflict: "tenant_id,user_id" });
      if (error) throw error;
      toast({ title: "Role updated" });
    } catch (e:any) {
      toast({ title: "Update failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  // Admin actions: invite, reset link, set password
  const sendInvite = async (email?: string | null) => {
    if (!email) {
      toast({ title: "Missing email", variant: "destructive" });
      return;
    }
    setActionLoading(`invite:${email}`);
    try {
      const { error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "invite", email, redirectTo: window.location.origin },
      });
      if (error) throw error as any;
      toast({ title: "Invite sent", description: `Invitation email sent to ${email}` });
    } catch (e: any) {
      toast({ title: "Invite failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const sendReset = async (email?: string | null) => {
    if (!email) {
      toast({ title: "Missing email", variant: "destructive" });
      return;
    }
    setActionLoading(`reset:${email}`);
    try {
      const { error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "send_reset", email, redirectTo: window.location.origin },
      });
      if (error) throw error as any;
      toast({ title: "Reset email sent", description: `Password reset sent to ${email}` });
    } catch (e: any) {
      toast({ title: "Reset failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const openSetPassword = (user_id: string) => {
    setPasswordUserId(user_id);
    setNewPassword("");
    setPasswordOpen(true);
  };

  const confirmSetPassword = async () => {
    if (!passwordUserId || !newPassword) {
      toast({ title: "Password required", variant: "destructive" });
      return;
    }
    setActionLoading(`set:${passwordUserId}`);
    try {
      const { error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "set_password", user_id: passwordUserId, new_password: newPassword },
      });
      if (error) throw error as any;
      toast({ title: "Password updated" });
      setPasswordOpen(false);
      setPasswordUserId(null);
      setNewPassword("");
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No linked employees with user accounts found for this clinic.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "—";
                  return (
                    <TableRow key={r.user_id}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{r.email || "—"}</TableCell>
                      <TableCell>
                        <Select value={r.role} onValueChange={(val) => updateRole(r.user_id, val)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt.charAt(0).toUpperCase()+opt.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" onClick={() => saveRole(r.user_id)} disabled={savingId === r.user_id}>
                            {savingId === r.user_id ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => sendInvite(r.email)} disabled={actionLoading === `invite:${r.email}`}>
                            {actionLoading === `invite:${r.email}` ? "Sending..." : "Send Invite"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => sendReset(r.email)} disabled={actionLoading === `reset:${r.email}`}>
                            {actionLoading === `reset:${r.email}` ? "Sending..." : "Send Reset Link"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openSetPassword(r.user_id)}>
                            Set Password
                          </Button>
                        </div>

                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set New Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button onClick={confirmSetPassword} disabled={actionLoading?.startsWith("set:")}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

