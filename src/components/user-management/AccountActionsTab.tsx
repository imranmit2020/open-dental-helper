import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Loader2, Key, Mail, Send, Search, UserCog } from "lucide-react";

interface UserRow {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
}

export function AccountActionsTab() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentTenant?.id) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: tenantUsers, error: tuErr } = await supabase
          .from("tenant_users")
          .select("user_id, role")
          .eq("tenant_id", currentTenant.id);
        if (tuErr) throw tuErr;

        const userIds = (tenantUsers || []).map((tu) => tu.user_id).filter(Boolean);
        if (userIds.length === 0) {
          setRows([]);
          return;
        }

        const roleMap: Record<string, string> = {};
        (tenantUsers || []).forEach((tu) => { roleMap[tu.user_id] = tu.role; });

        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds);
        if (profErr) throw profErr;

        const mapped: UserRow[] = (profiles || []).map((p) => ({
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          role: roleMap[p.user_id] || "staff",
        }));
        mapped.sort((a, b) =>
          `${a.first_name ?? ""} ${a.last_name ?? ""}`.localeCompare(
            `${b.first_name ?? ""} ${b.last_name ?? ""}`
          )
        );
        setRows(mapped);
      } catch (e: any) {
        toast({ title: "Failed to load users", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentTenant?.id, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.first_name || "").toLowerCase().includes(q) ||
        (r.last_name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const sendInvite = async (email?: string | null) => {
    if (!email) { toast({ title: "Missing email", variant: "destructive" }); return; }
    setActionLoading(`invite:${email}`);
    try {
      const { error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "invite", email, redirectTo: window.location.origin },
      });
      if (error) throw error as any;
      toast({ title: "Invite sent", description: `Invitation email sent to ${email}` });
    } catch (e: any) {
      toast({ title: "Invite failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const sendReset = async (email?: string | null) => {
    if (!email) { toast({ title: "Missing email", variant: "destructive" }); return; }
    setActionLoading(`reset:${email}`);
    try {
      const { error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "send_reset", email, redirectTo: `${window.location.origin}/reset-password` },
      });
      if (error) throw error as any;
      toast({ title: "Reset email sent", description: `Password reset sent to ${email}` });
    } catch (e: any) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
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
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Send invites, reset passwords, and manage account credentials for users in {currentTenant?.name || "your clinic"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !currentTenant?.id ? (
            <p className="text-sm text-muted-foreground">Please select a clinic first.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users assigned to this clinic yet.</p>
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
                {filtered.map((r) => {
                  const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "—";
                  return (
                    <TableRow key={r.user_id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{r.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {r.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendInvite(r.email)}
                            disabled={actionLoading === `invite:${r.email}`}
                          >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            {actionLoading === `invite:${r.email}` ? "Sending…" : "Invite"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendReset(r.email)}
                            disabled={actionLoading === `reset:${r.email}`}
                          >
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            {actionLoading === `reset:${r.email}` ? "Sending…" : "Reset Link"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openSetPassword(r.user_id)}
                          >
                            <Key className="h-3.5 w-3.5 mr-1.5" />
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
            <Button onClick={confirmSetPassword} disabled={actionLoading?.startsWith("set:")}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
