import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, User, Phone, Mail, Calendar, Shield, Building, AlertTriangle, Brain, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/TenantContext";
import { useInsurancePlans } from "@/hooks/useInsurancePlans";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  insurance: z.string().min(1, "Insurance provider is required"),
  emergencyContact: z.string().min(2, "Emergency contact name is required"),
  emergencyPhone: z.string().min(10, "Emergency contact phone is required"),
  medicalHistory: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewPatientFormProps {
  onPatientAdded?: (patient: any) => void;
}

export default function NewPatientForm({ onPatientAdded }: NewPatientFormProps) {
  const [open, setOpen] = useState(false);
  const [duplicateAlertOpen, setDuplicateAlertOpen] = useState(false);
  const [existingPatient, setExistingPatient] = useState<any>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [aiTimeoutRef, setAiTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { plans: insurancePlans, loading: insurancePlansLoading } = useInsurancePlans();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: undefined,
      address: "",
      insurance: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: "",
    },
  });

  const analyzeWithAI = async (medicalHistory: string) => {
    if (!medicalHistory.trim() || !aiEnabled) return;
    
    setAiAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-medical-analysis', {
        body: {
          medicalHistory,
          analysisType: 'comprehensive',
          patientAge: form.getValues('dateOfBirth') ? 
            Math.floor((Date.now() - new Date(form.getValues('dateOfBirth')).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
            null
        }
      });

      if (error) throw error;

      setAiSuggestions(data.analysis);
      toast({
        title: "AI Analysis Complete",
        description: "Medical history has been analyzed. Review the suggestions below.",
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI Analysis Error",
        description: "Unable to analyze medical history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add patients.",
          variant: "destructive",
        });
        return;
      }

      // Insert patient into Supabase database
      const { data: patientData, error } = await supabase
        .from('patients')
        .insert({
          user_id: null, // Staff creates patients without linking to their own user account
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          emergency_contact: `${data.emergencyContact} - ${data.emergencyPhone}`,
          insurance_info: { provider: data.insurance },
          risk_level: "low",
          tenant_id: currentTenant?.id || null
        })
        .select()
        .single();

      if (error) {
        // Check for duplicate patient constraint violation
        if (error.code === '23505' && error.message.includes('unique_patient_per_clinic')) {
          // Fetch existing patient data for confirmation dialog
          const { data: existingData } = await supabase
            .from('patients')
            .select('*')
            .eq('email', data.email)
            .eq('tenant_id', currentTenant?.id)
            .single();
          
          setExistingPatient(existingData);
          setDuplicateAlertOpen(true);
          return;
        }
        throw error;
      }

      // If medical history is provided, store it in medical_records table
      if (data.medicalHistory && data.medicalHistory.trim()) {
        const { error: medicalRecordError } = await supabase
          .from('medical_records')
          .insert({
            patient_id: patientData.id,
            dentist_id: user.id,
            record_type: 'medical_history',
            title: 'Initial Medical History',
            description: data.medicalHistory,
            visit_date: new Date().toISOString().split('T')[0],
            status: 'active'
          });

        if (medicalRecordError) {
          console.error('Failed to save medical history:', medicalRecordError);
          // Don't fail the entire patient creation for medical history error
        }
      }

      if (error) {
        // Check for duplicate patient constraint violation
        if (error.code === '23505' && error.message.includes('unique_patient_per_clinic')) {
          // Try to find the existing patient for display
          const { data: existing } = await supabase
            .from('patients')
            .select('*')
            .eq('first_name', data.firstName)
            .eq('last_name', data.lastName)
            .eq('date_of_birth', data.dateOfBirth)
            .eq('tenant_id', currentTenant?.id || null)
            .maybeSingle();
          
          setExistingPatient(existing);
          setDuplicateAlertOpen(true);
          return;
        }
        throw error;
      }

      // Create the patient object for local state update
      const newPatient = {
        id: patientData.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        insurance: data.insurance,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        medicalHistory: data.medicalHistory,
        status: "active",
        riskLevel: "low",
        lastVisit: null,
        nextAppointment: null,
        avatar: "",
        age: Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      };

      onPatientAdded?.(newPatient);
      
      toast({
        title: "Patient Added Successfully",
        description: `${data.firstName} ${data.lastName} has been added to your patient records.`,
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl px-6 py-3">
          <Plus className="h-5 w-5 mr-2" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter the patient's information to create a new record in the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
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
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">Other</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="patient@example.com" {...field} />
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
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Insurance & Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance & Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={insurancePlansLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              insurancePlansLoading 
                                ? "Loading insurance plans..." 
                                : insurancePlans.length === 0 
                                  ? "No insurance plans configured" 
                                  : "Select insurance provider"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!insurancePlansLoading && insurancePlans.length > 0 && (
                            insurancePlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.provider_name} - {plan.plan_name}
                              </SelectItem>
                            ))
                          )}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Medical History
                  <div className="ml-auto flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-normal">AI Assistant</span>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={setAiEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </CardTitle>
                <CardDescription>
                  {aiEnabled 
                    ? "AI analysis is enabled. Enter medical history to get intelligent suggestions and risk assessments."
                    : "Enable AI assistant to get intelligent analysis of medical history and risk factors."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History & Notes</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea 
                            placeholder="Enter any relevant medical history, allergies, or notes..."
                            className="min-h-[100px]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (aiEnabled && e.target.value.length > 50) {
                                // Debounce AI analysis
                                if (aiTimeoutRef) {
                                  clearTimeout(aiTimeoutRef);
                                }
                                const timeout = setTimeout(() => {
                                  analyzeWithAI(e.target.value);
                                }, 2000);
                                setAiTimeoutRef(timeout);
                              }
                            }}
                          />
                          {aiEnabled && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => analyzeWithAI(field.value)}
                              disabled={!field.value?.trim() || aiAnalyzing}
                              className="w-full"
                            >
                              {aiAnalyzing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Analyzing with AI...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Analyze with AI
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Include any allergies, current medications, or important medical conditions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {aiEnabled && aiSuggestions && (
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-primary">AI Analysis & Suggestions</h4>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {aiSuggestions}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAiSuggestions("")}
                      className="mt-2"
                    >
                      Clear Suggestions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-secondary text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Adding Patient..." : "Add Patient"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Duplicate Patient Alert Dialog */}
      <AlertDialog open={duplicateAlertOpen} onOpenChange={setDuplicateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Duplicate Patient Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>A patient with the same name and date of birth already exists in this clinic:</p>
              {existingPatient && (
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p><strong>Name:</strong> {existingPatient.first_name} {existingPatient.last_name}</p>
                  <p><strong>Date of Birth:</strong> {existingPatient.date_of_birth}</p>
                  <p><strong>Email:</strong> {existingPatient.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {existingPatient.phone || 'Not provided'}</p>
                  <p><strong>Patient ID:</strong> {existingPatient.id}</p>
                </div>
              )}
              <p>Would you like to view the existing patient record instead?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // You can implement navigation to patient profile here
                toast({
                  title: "Feature Coming Soon",
                  description: "Patient profile navigation will be implemented soon.",
                });
                setDuplicateAlertOpen(false);
              }}
            >
              View Existing Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}