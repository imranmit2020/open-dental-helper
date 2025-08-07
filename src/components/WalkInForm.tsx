import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";

const walkInSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  urgencyLevel: z.enum(["low", "medium", "high", "emergency"]),
  estimatedDuration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

type WalkInFormData = z.infer<typeof walkInSchema>;

interface WalkInFormProps {
  onWalkInAdded?: () => void;
  trigger?: React.ReactNode;
}

const urgencyLevels = [
  { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-800" },
];

const durations = ["15", "30", "45", "60", "90", "120"];

export default function WalkInForm({ onWalkInAdded, trigger }: WalkInFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createAppointment } = useAppointments();
  const { createPatient } = usePatients();

  const form = useForm<WalkInFormData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      urgencyLevel: "medium",
      estimatedDuration: "30",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      chiefComplaint: "",
      notes: "",
    },
  });

  const selectedUrgency = form.watch("urgencyLevel");

  const onSubmit = async (data: WalkInFormData) => {
    try {
      // Create patient first
      const newPatient = await createPatient({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      // Create walk-in appointment (immediate)
      const now = new Date();
      const appointmentData = {
        patient_id: newPatient.id,
        appointment_date: now.toISOString(),
        title: `Walk-in: ${data.chiefComplaint}`,
        treatment_type: "walk-in",
        duration: parseInt(data.estimatedDuration),
        status: data.urgencyLevel === "emergency" ? "urgent" : "walk-in",
        description: data.chiefComplaint,
        notes: data.notes,
      };

      await createAppointment(appointmentData);

      toast({
        title: "Walk-in Added",
        description: `${data.firstName} ${data.lastName} has been added as a walk-in patient`,
      });

      onWalkInAdded?.();
      form.reset({
        urgencyLevel: "medium",
        estimatedDuration: "30",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        chiefComplaint: "",
        notes: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding walk-in:', error);
      toast({
        title: "Error",
        description: "Failed to add walk-in patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUrgencyInfo = (level: string) => {
    return urgencyLevels.find(u => u.value === level) || urgencyLevels[1];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Walk-in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Walk-in Patient
          </DialogTitle>
          <DialogDescription>
            Register a walk-in patient and add them to today's schedule.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
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
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="patient@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the reason for the visit..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={level.color}>
                                {level.label}
                              </Badge>
                            </div>
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
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information..."
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUrgency === "emergency" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  Emergency patients will be prioritized and may require immediate attention.
                </span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className={`${
                  selectedUrgency === "emergency" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-primary hover:bg-primary/90"
                } text-white`}
              >
                Add Walk-in
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}