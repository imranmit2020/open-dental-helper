import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStaffAvailability } from "@/hooks/useStaffAvailability";
import { useTenant } from "@/contexts/TenantContext";

const availabilitySchema = z.object({
  staff_id: z.string().min(1, "Staff member is required"),
  tenant_id: z.string().min(1, "Clinic is required"),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  break_start_time: z.string().optional(),
  break_end_time: z.string().optional(),
  is_available: z.boolean().default(true),
});

type StaffAvailabilityFormData = z.infer<typeof availabilitySchema>;

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface StaffAvailabilityFormProps {
  staffId?: string;
  availability?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StaffAvailabilityForm({ 
  staffId, 
  availability, 
  onSuccess, 
  onCancel 
}: StaffAvailabilityFormProps) {
  const { createAvailability, updateAvailability } = useStaffAvailability();
  const { tenants, currentTenant } = useTenant();

  const form = useForm<StaffAvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      staff_id: staffId || availability?.staff_id || undefined,
      tenant_id: availability?.tenant_id || currentTenant?.id || undefined,
      day_of_week: availability?.day_of_week ?? 1,
      start_time: availability?.start_time || "09:00",
      end_time: availability?.end_time || "17:00",
      break_start_time: availability?.break_start_time || "",
      break_end_time: availability?.break_end_time || "",
      is_available: availability?.is_available ?? true,
    },
  });

  const onSubmit = async (data: StaffAvailabilityFormData) => {
    try {
      const cleanData: any = {
        ...data,
        break_start_time: data.break_start_time || undefined,
        break_end_time: data.break_end_time || undefined,
      };

      if (availability?.id) {
        await updateAvailability(availability.id, cleanData);
      } else {
        await createAvailability(cleanData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving staff availability:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!staffId && (
          <FormField
            control={form.control}
            name="staff_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Placeholder for staff list - will be populated when staff data is available */}
                    <SelectItem value="staff-placeholder" disabled>
                      No staff available
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tenant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.clinic_code.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="day_of_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="break_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Start (Optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="break_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break End (Optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Available</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Toggle staff availability for this schedule
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex space-x-2 pt-4">
          <Button type="submit" className="flex-1">
            {availability ? 'Update' : 'Create'} Schedule
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}