import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["dentist", "hygienist", "staff", "admin", "super_admin"]),
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
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "staff" } });

  useEffect(() => { setSEO(); }, []);

  const { data: team, refetch, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, role")
        .in("role", ["admin", "super_admin", "dentist", "hygienist", "staff"])
        .order("role", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { super_admin: [], admin: [], dentist: [], hygienist: [], staff: [] };
    (team || []).forEach((u) => g[u.role]?.push(u));
    return g;
  }, [team]);

  const onSubmit = async (values: FormValues) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const randomPwd = crypto.getRandomValues(new Uint32Array(4)).join("-");
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: randomPwd,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: values.role,
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone || "",
            organization_type: "clinic",
          },
        },
      });
      if (error) throw error;
      toast({ title: "Invitation sent", description: "They'll receive an email to complete signup." });
      form.reset({ role: values.role } as any);
      setTimeout(() => refetch(), 800);
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
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="submit" className="w-full">Send Invitation</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Team</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading team...</p>
          ) : (
            <div className="space-y-6">
              {(["super_admin","admin","dentist","hygienist","staff"] as const).map((r) => (
                <div key={r} className="space-y-2">
                  <h3 className="font-medium capitalize">{r}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped[r].length === 0 ? (
                        <TableRow><TableCell colSpan={2} className="text-muted-foreground">No {r}s yet.</TableCell></TableRow>
                      ) : (
                        grouped[r].map((u) => (
                          <TableRow key={u.user_id}>
                            <TableCell>{u.first_name} {u.last_name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
