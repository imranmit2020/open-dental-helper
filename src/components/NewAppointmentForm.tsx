import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, MapPin, FileText, Phone, Mail, Search } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients, type Patient } from "@/hooks/usePatients";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const appointmentSchema = z.object({
  // Patient Information
  patientType: z.enum(["existing", "new"]),
  patientId: z.string().uuid("Please select a valid patient").optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number is required"),
  
  // Appointment Details
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.string().min(1, "Duration is required"),
  appointmentType: z.string().min(1, "Appointment type is required"),
  provider: z.string().min(1, "Provider is required"),
  room: z.string().min(1, "Room is required"),
  
  // Additional Information
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  insuranceProvider: z.string().optional(),
  emergencyContact: z.string().optional(),
  
  // Preferences
  reminderPreference: z.enum(["sms", "email", "both", "none"]),
  isUrgent: z.boolean().default(false),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface NewAppointmentFormProps {
  onAppointmentAdded?: (appointment: any) => void;
  trigger?: React.ReactNode;
}

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

const appointmentTypes = [
  { value: "consultation", label: "Consultation", duration: "30", color: "bg-blue-500" },
  { value: "cleaning", label: "Routine Cleaning", duration: "60", color: "bg-green-500" },
  { value: "filling", label: "Filling", duration: "45", color: "bg-yellow-500" },
  { value: "crown", label: "Crown Preparation", duration: "90", color: "bg-purple-500" },
  { value: "root-canal", label: "Root Canal", duration: "120", color: "bg-red-500" },
  { value: "extraction", label: "Tooth Extraction", duration: "60", color: "bg-orange-500" },
  { value: "orthodontic", label: "Orthodontic Adjustment", duration: "30", color: "bg-indigo-500" },
  { value: "emergency", label: "Emergency Visit", duration: "45", color: "bg-red-600" },
];

const providers = [
  "Dr. Sarah Johnson",
  "Dr. Michael Chen", 
  "Dr. Emily Rodriguez",
  "Dr. David Kim"
];

const rooms = ["Room 1", "Room 2", "Room 3", "Consultation Room"];

export default function NewAppointmentForm({ onAppointmentAdded, trigger }: NewAppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const { createAppointment } = useAppointments();
  const { createPatient, searchPatients } = usePatients();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientType: "existing",
      reminderPreference: "both",
      isUrgent: false,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  const selectedType = form.watch("appointmentType");
  const patientType = form.watch("patientType");

  // Auto-set duration when appointment type changes
  const handleTypeChange = (type: string) => {
    const appointmentType = appointmentTypes.find(t => t.value === type);
    if (appointmentType) {
      form.setValue("duration", appointmentType.duration);
    }
  };

  // Handle patient search
  const handlePatientSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchPatients(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.id);
    form.setValue("firstName", patient.first_name);
    form.setValue("lastName", patient.last_name);
    form.setValue("phone", patient.phone || "");
    form.setValue("email", patient.email || "");
    setSearchQuery(`${patient.first_name} ${patient.last_name}`);
    setSearchResults([]);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      let patientId = data.patientId;

      // If new patient, create patient first
      if (data.patientType === "new") {
        const newPatient = await createPatient({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          emergency_contact: data.emergencyContact,
        });
        patientId = newPatient.id;
      }

      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      // Convert appointment time to proper datetime
      const appointmentDateTime = new Date(data.appointmentDate);
      const [time, period] = data.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let adjustedHours = hours;
      if (period === 'PM' && hours !== 12) {
        adjustedHours += 12;
      } else if (period === 'AM' && hours === 12) {
        adjustedHours = 0;
      }
      
      appointmentDateTime.setHours(adjustedHours, minutes, 0, 0);

      const appointmentData = {
        patient_id: patientId,
        appointment_date: appointmentDateTime.toISOString(),
        title: appointmentTypes.find(t => t.value === data.appointmentType)?.label || data.appointmentType,
        treatment_type: data.appointmentType,
        duration: parseInt(data.duration),
        status: data.isUrgent ? "urgent" : "scheduled",
        description: data.chiefComplaint,
        notes: data.notes,
      };

      const newAppointment = await createAppointment(appointmentData);
      onAppointmentAdded?.(newAppointment);

      toast({
        title: "Appointment Scheduled",
        description: `Successfully scheduled ${data.firstName} ${data.lastName} for ${data.appointmentTime} on ${format(data.appointmentDate, "PPP")}`,
      });

      form.reset({
        patientType: "existing",
        reminderPreference: "both",
        isUrgent: false,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      });
      setSelectedPatient(null);
      setSearchQuery("");
      setSearchResults([]);
      setOpen(false);
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
            <CalendarIcon className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Schedule New Appointment
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="patientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="existing" id="existing" />
                              <label htmlFor="existing">Existing Patient</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="new" id="new" />
                              <label htmlFor="new">New Patient</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {patientType === "existing" && (
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Search Patient</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Search by name or email" 
                                value={searchQuery}
                                onChange={(e) => handlePatientSearch(e.target.value)}
                                className="pl-10"
                              />
                              {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                  {searchResults.map((patient) => (
                                    <div
                                      key={patient.id}
                                      className="p-2 hover:bg-accent cursor-pointer"
                                      onClick={() => handlePatientSelect(patient)}
                                    >
                                      <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                                      <div className="text-sm text-muted-foreground">{patient.email}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="First name" 
                              {...field} 
                              value={field.value || ""}
                              disabled={patientType === "existing" && selectedPatient !== null}
                            />
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
                            <Input 
                              placeholder="Last name" 
                              {...field} 
                              value={field.value || ""}
                              disabled={patientType === "existing" && selectedPatient !== null}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(555) 123-4567" 
                              {...field} 
                              value={field.value || ""}
                              disabled={patientType === "existing" && selectedPatient !== null}
                            />
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
                            <Input 
                              placeholder="patient@email.com" 
                              {...field} 
                              value={field.value || ""}
                              disabled={patientType === "existing" && selectedPatient !== null}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-4 w-4" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
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
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleTypeChange(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appointmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                  {type.label} ({type.duration} min)
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
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {provider}
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
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room} value={room}>
                                {room}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-4 w-4" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chief Complaint</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What brings the patient in today?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sms">SMS Only</SelectItem>
                          <SelectItem value="email">Email Only</SelectItem>
                          <SelectItem value="both">SMS & Email</SelectItem>
                          <SelectItem value="none">No Reminders</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-secondary text-white">
                Schedule Appointment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}