import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Send, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const schema = z.object({
  treatment_type: z.string().min(2, "Treatment is required"),
  expires_at: z.date().optional(),
});

type Values = z.infer<typeof schema>;

interface SendConsentDialogProps {
  patientId: string;
  trigger?: React.ReactNode;
  onSent?: () => void;
}

export default function SendConsentDialog({ patientId, trigger, onSent }: SendConsentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: {} as any });

  const onSubmit = async (values: Values) => {
    try {
      const payload: any = {
        patient_id: patientId,
        treatment_type: values.treatment_type,
        status: "pending",
      };
      if (values.expires_at) payload.expires_at = values.expires_at.toISOString();

      const { error } = await supabase.from("consent_forms").insert(payload);
      if (error) throw error;

      toast({ title: "Consent sent", description: "A consent request has been created for the patient." });
      setOpen(false);
      onSent?.();
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Consent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send consent request</DialogTitle>
          <DialogDescription>Create a pending consent for this patient.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="treatment_type" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Root Canal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="expires_at" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expires (optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? field.value.toLocaleDateString() : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value as any} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">
                <FileText className="h-4 w-4 mr-2" /> Create Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
