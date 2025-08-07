import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Play, Clock, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";

const startVisitSchema = z.object({
  visitNotes: z.string().optional(),
  status: z.enum(["confirmed", "completed"]),
});

type StartVisitFormData = z.infer<typeof startVisitSchema>;

interface StartVisitDialogProps {
  appointment: {
    id: string;
    patient: string;
    time: string;
    type: string;
    duration: number;
  };
  onVisitStarted?: () => void;
  trigger?: React.ReactNode;
}

export default function StartVisitDialog({ appointment, onVisitStarted, trigger }: StartVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updateAppointment } = useAppointments();

  const form = useForm<StartVisitFormData>({
    resolver: zodResolver(startVisitSchema),
    defaultValues: {
      status: "confirmed",
      visitNotes: "",
    },
  });

  const watchedStatus = form.watch("status");

  const onSubmit = async (data: StartVisitFormData) => {
    try {
      const currentTime = new Date().toISOString();
      const notes = data.visitNotes 
        ? `Visit started at ${new Date().toLocaleTimeString()}\n${data.visitNotes}`
        : `Visit started at ${new Date().toLocaleTimeString()}`;

      await updateAppointment(appointment.id, {
        status: data.status,
        notes: notes,
      });

      const statusText = data.status === "completed" ? "completed" : "started";
      
      toast({
        title: `Visit ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        description: `${appointment.patient}'s ${appointment.type} appointment has been ${statusText}`,
      });

      onVisitStarted?.();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Start Visit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Start Visit
          </DialogTitle>
          <DialogDescription>
            Update the status for {appointment.patient}'s {appointment.type} appointment
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{appointment.time}</span>
            <span>•</span>
            <span>{appointment.duration} minutes</span>
          </div>
          <div className="font-medium mt-1">{appointment.type}</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confirmed">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-blue-600" />
                          Start Visit (In Progress)
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Complete Visit
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        watchedStatus === "completed" 
                          ? "Summary of treatment provided..."
                          : "Any initial observations or notes..."
                      }
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className={watchedStatus === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {watchedStatus === "completed" ? "Complete Visit" : "Start Visit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}