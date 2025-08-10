import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Image as ImageIcon, Mail, Lock } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(80),
  avatarUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(8, "Min 8 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (!data.newPassword) return true;
  return data.newPassword === data.confirmPassword;
}, { message: "Passwords do not match", path: ["confirmPassword"] });

export default function MyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const defaults = useMemo(() => ({
    displayName: (user as any)?.user_metadata?.name || "",
    avatarUrl: (user as any)?.user_metadata?.avatar_url || "",
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  }), [user]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
    mode: "onChange",
  });

  useEffect(() => {
    // SEO basics
    const prevTitle = document.title;
    document.title = "My Profile | DentalAI Pro";
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', 'View and update your profile and password in DentalAI Pro.');
    document.head.appendChild(metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.origin + '/my-profile');
    document.head.appendChild(canonical);

    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      // Update metadata (name, avatar)
      const { error: metaErr } = await supabase.auth.updateUser({
        data: {
          name: values.displayName,
          avatar_url: values.avatarUrl || null,
        },
      });
      if (metaErr) throw metaErr;


      // Update password if provided
      if (values.newPassword) {
        const { error: passErr } = await supabase.auth.updateUser({ password: values.newPassword });
        if (passErr) throw passErr;
        toast({ title: "Password updated", description: "Your password has been changed." });
      }

      setEditing(false);
      toast({ title: "Profile saved", description: "Your profile details were updated." });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-elegant">
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <UserIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="leading-none">Profile</CardTitle>
                <CardDescription>View and edit your name and avatar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-1 ring-border">
                    <AvatarImage src={(user as any)?.user_metadata?.avatar_url || ""} alt="Profile avatar" />
                    <AvatarFallback>{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-medium">{(user as any)?.user_metadata?.name || "—"}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </div>
                </div>

                {(user as any)?.user_metadata?.avatar_url && (
                  <div className="text-sm text-muted-foreground break-all">
                    Avatar URL: {(user as any)?.user_metadata?.avatar_url}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setEditing(true)}>Edit</Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <Input className="pl-9" placeholder="Your name" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span>{user?.email}</span>
                      </div>
                      <FormDescription>Email changes are not allowed.</FormDescription>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <Input className="pl-9" placeholder="https://..." {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>Provide a public image URL for your avatar.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-1 ring-border">
                      <AvatarImage src={form.watch("avatarUrl") || (user as any)?.user_metadata?.avatar_url} alt="Profile avatar preview" />
                      <AvatarFallback>{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground">Preview</div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button type="button" variant="secondary" onClick={() => { form.reset(defaults); setEditing(false); }}>Cancel</Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="leading-none">Password</CardTitle>
                <CardDescription>Set a new password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <Input className="pl-9" type="password" autoComplete="new-password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <Input className="pl-9" type="password" autoComplete="new-password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button onClick={form.handleSubmit(onSubmit)} variant="outline">Update password</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
