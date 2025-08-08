import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Row {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export default function AdminPasswordManagement() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // SEO
  useEffect(() => {
    const title = "Admin Password Management | DentalAI Pro";
    const desc = "Admin screen to change passwords for employees and staff.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!currentTenant?.id) return;
      setLoading(true);
      try {
        // 1) Get all assigned users for this clinic
        const { data: tenantUsers, error: tuErr } = await supabase
          .from('tenant_users')
          .select('user_id')
          .eq('tenant_id', currentTenant.id);
        if (tuErr) throw tuErr;

        const userIds = (tenantUsers || []).map((tu: any) => tu.user_id).filter(Boolean);
        if (userIds.length === 0) {
          setRows([]);
          return;
        }

        // 2) Load profiles for names/emails
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);
        if (profErr) throw profErr;

        const mapped: Row[] = (profiles || []).map((p: any) => ({
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
        }));

        // Sort by name
        mapped.sort((a, b) => `${a.first_name ?? ''} ${a.last_name ?? ''}`.localeCompare(`${b.first_name ?? ''} ${b.last_name ?? ''}`));
        setRows(mapped);
      } catch (e: any) {
        toast({ title: 'Failed to load users', description: e.message || 'Please try again.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentTenant?.id, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.first_name || '').toLowerCase().includes(q) ||
      (r.last_name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openSetPassword = (user_id: string) => {
    setPasswordUserId(user_id);
    setNewPassword("");
    setPasswordOpen(true);
  };

  const confirmSetPassword = async () => {
    if (!passwordUserId || !newPassword) {
      toast({ title: 'Password required', variant: 'destructive' });
      return;
    }
    setActionLoading(`set:${passwordUserId}`);
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'set_password', user_id: passwordUserId, new_password: newPassword },
      });
      if (error) throw error as any;
      toast({ title: 'Password updated' });
      setPasswordOpen(false);
      setPasswordUserId(null);
      setNewPassword("");
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const sendReset = async (email?: string | null) => {
    if (!email) {
      toast({ title: 'Missing email', variant: 'destructive' });
      return;
    }
    setActionLoading(`reset:${email}`);
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'send_reset', email, redirectTo: window.location.origin },
      });
      if (error) throw error as any;
      toast({ title: 'Reset email sent', description: `Password reset sent to ${email}` });
    } catch (e: any) {
      toast({ title: 'Reset failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <header className="px-4 md:px-6 py-4">
        <h1 className="text-2xl font-semibold">Password Management</h1>
      </header>
      <main className="px-4 md:px-6 pb-6">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Employees & Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-3 mb-4">
                <Input
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              {loading ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground">No users assigned to this clinic yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "—";
                      return (
                        <TableRow key={r.user_id}>
                          <TableCell>{name}</TableCell>
                          <TableCell>{r.email || '—'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => openSetPassword(r.user_id)}>
                                Set Password
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => sendReset(r.email)} disabled={actionLoading === `reset:${r.email}`}>
                                {actionLoading === `reset:${r.email}` ? 'Sending…' : 'Send Reset Link'}
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
        </section>
      </main>

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
            <Button onClick={confirmSetPassword} disabled={actionLoading?.startsWith('set:')}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
