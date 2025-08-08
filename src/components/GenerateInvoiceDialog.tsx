import { useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, DollarSign, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  description: z.string().min(2),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
});

const schema = z.object({
  currency: z.string().default("USD"),
  due_date: z.date().optional(),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

type Values = z.infer<typeof schema>;

interface GenerateInvoiceDialogProps {
  patientId: string;
  patientName?: string;
  trigger?: React.ReactNode;
  onCreated?: (invoiceId: string) => void;
}

export default function GenerateInvoiceDialog({ patientId, patientName, trigger, onCreated }: GenerateInvoiceDialogProps) {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", tax_rate: 0, items: [{ description: "", quantity: 1, unit_price: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const subtotal = useMemo(() => {
    const vals = form.getValues();
    return (vals.items || []).reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  }, [form.watch("items")]);

  const totals = useMemo(() => {
    const rate = Number(form.watch("tax_rate")) || 0;
    const tax = subtotal * (rate / 100);
    return { tax, total: subtotal + tax };
  }, [subtotal, form.watch("tax_rate")]);

  const onSubmit = async (values: Values) => {
    try {
      if (!currentTenant?.id) throw new Error("No clinic selected");
      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({
          tenant_id: currentTenant.id,
          patient_id: patientId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          currency: values.currency,
          subtotal,
          tax: totals.tax,
          total: totals.total,
          notes: values.notes || null,
          due_date: values.due_date ? values.due_date.toISOString() : null,
          status: "unpaid",
        })
        .select("id")
        .single();
      if (invErr) throw invErr;

      const itemsPayload = values.items.map((it) => ({
        invoice_id: inv!.id,
        description: it.description,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        total: Number(it.quantity) * Number(it.unit_price),
      }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      toast({ title: "Invoice created", description: `Total ${values.currency} ${totals.total.toFixed(2)}` });
      setOpen(false);
      onCreated?.(inv!.id);
    } catch (e: any) {
      toast({ title: "Failed to create invoice", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <DollarSign className="h-4 w-4 mr-2" /> Generate Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate invoice{patientName ? ` for ${patientName}` : ''}</DialogTitle>
          <DialogDescription>Enter line items and totals, then save.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField name="currency" control={form.control} render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="tax_rate" control={form.control} render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tax %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="due_date" control={form.control} render={({ field }) => (
                <FormItem className="col-span-1 flex flex-col">
                  <FormLabel>Due date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground") }>
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
            </div>

            <Card>
              <CardContent className="pt-6 space-y-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <Controller
                      control={form.control}
                      name={`items.${idx}.description` as const}
                      render={({ field }) => (
                        <Input placeholder="Description" className="col-span-6" {...field} />
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`items.${idx}.quantity` as const}
                      render={({ field }) => (
                        <Input type="number" step="1" min={1} placeholder="Qty" className="col-span-2" {...field} />
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`items.${idx}.unit_price` as const}
                      render={({ field }) => (
                        <Input type="number" step="0.01" min={0} placeholder="Unit Price" className="col-span-3" {...field} />
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" className="col-span-1" onClick={() => remove(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="secondary" onClick={() => append({ description: "", quantity: 1, unit_price: 0 })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>

                <Separator />
                <div className="flex justify-end text-sm text-muted-foreground">
                  <div className="space-y-1 text-right">
                    <div>Subtotal: {form.getValues().currency} {subtotal.toFixed(2)}</div>
                    <div>Tax: {form.getValues().currency} {totals.tax.toFixed(2)}</div>
                    <div className="font-semibold">Total: {form.getValues().currency} {totals.total.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">
                <DollarSign className="h-4 w-4 mr-2" /> Save Invoice
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
