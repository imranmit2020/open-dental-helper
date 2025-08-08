import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, UserPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

function setSEO() {
  document.title = "Add Employee | DentalAI Pro";
  const desc = "Admin: Add new employee to clinic or corporation";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + "/admin/employees/new");
}

const FormSchema = z.object({
  scope: z.enum(["tenant", "corporation"]),
  tenant_id: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "dentist", "hygienist", "staff"]).default("staff"),
  job_title: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  employment_type: z.enum(["full_time", "part_time", "contractor"]).default("full_time"),
  status: z.enum(["active", "inactive"]).default("active"),
  hire_date: z.date().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function AdminAddEmployee() {
  const navigate = useNavigate();
  const { tenants, currentTenant, corporation, userRole } = useTenant();
  const { toast } = useToast();
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    setSEO();
  }, []);

  const isCorpAdmin = useMemo(() => userRole === "admin" && !!corporation, [userRole, corporation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      scope: isCorpAdmin ? "corporation" : "tenant",
      tenant_id: currentTenant?.id,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "staff",
      job_title: "",
      department: "",
      employment_type: "full_time",
      status: "active",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const payload: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone || null,
        role: values.role,
        job_title: values.job_title || null,
        department: values.department || null,
        employment_type: values.employment_type,
        status: values.status,
        hire_date: values.hire_date ? values.hire_date.toISOString().slice(0, 10) : null,
        tenant_id: values.scope === "tenant" ? values.tenant_id : null,
        corporation_id: values.scope === "corporation" ? corporation?.id : null,
      };

      if (payload.tenant_id && payload.corporation_id) {
        toast({ title: "Invalid scope", description: "Select either clinic or corporation." });
        return;
      }

      if (values.scope === "tenant" && !payload.tenant_id) {
        toast({ title: "Clinic required", description: "Please choose a clinic." });
        return;
      }

      const { data, error } = await supabase
        .from("employees")
        .insert([payload])
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({ title: "Employee created", description: `ID: ${data?.employee_id || data?.id}` });
      navigate("/admin/team");
    } catch (err: any) {
      toast({ title: "Failed to create employee", description: err.message, variant: "destructive" });
    }
  }

  const clinicOptions = tenants || [];

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Add Employee</h1>
          <p className="text-muted-foreground">Create a new employee for a clinic or corporation.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/admin/team")}>Back to Team</Button>
      </header>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scope */}
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <Select
                      disabled={!isCorpAdmin}
                      onValueChange={(v) => field.onChange(v as FormValues["scope"])}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">Clinic</SelectItem>
                        {isCorpAdmin && <SelectItem value="corporation">Corporation</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Clinic selection */}
              {form.watch("scope") === "tenant" && (
                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinicOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.clinic_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="hygienist">Hygienist</SelectItem>
                        <SelectItem value="dentist">Dentist</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Hygienist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Orthodontics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hire Date</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? field.value.toDateString() : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => { field.onChange(d); setDateOpen(false); }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit">Create Employee</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
