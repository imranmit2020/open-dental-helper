import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Users, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const consentFormSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  treatmentType: z.string().min(1, "Treatment type is required"),
  risks: z.boolean().refine(val => val === true, {
    message: "You must acknowledge understanding of risks"
  }),
  alternatives: z.boolean().refine(val => val === true, {
    message: "You must acknowledge understanding of alternatives"
  }),
  financialResponsibility: z.boolean().refine(val => val === true, {
    message: "You must accept financial responsibility"
  }),
  emergencyContact: z.boolean().refine(val => val === true, {
    message: "You must acknowledge emergency contact procedures"
  }),
  photoConsent: z.boolean(),
  dataProcessing: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing"
  }),
  signature: z.string().min(2, "Digital signature is required"),
  date: z.string().min(1, "Date is required"),
  additionalNotes: z.string().optional(),
});

type ConsentFormData = z.infer<typeof consentFormSchema>;

interface PatientConsentFormProps {
  onConsentSubmitted?: (consent: ConsentFormData) => void;
}

export const PatientConsentForm: React.FC<PatientConsentFormProps> = ({
  onConsentSubmitted,
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: {
      patientName: "",
      dateOfBirth: "",
      treatmentType: "",
      risks: false,
      alternatives: false,
      financialResponsibility: false,
      emergencyContact: false,
      photoConsent: false,
      dataProcessing: false,
      signature: "",
      date: new Date().toISOString().split('T')[0],
      additionalNotes: "",
    },
  });

  const onSubmit = async (data: ConsentFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const consentRecord = {
        ...data,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
      };

      onConsentSubmitted?.(consentRecord);
      
      toast({
        title: "Consent Form Submitted",
        description: "Patient consent has been recorded successfully.",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit consent form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Patient Consent Form
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Consent for Dental Treatment</DialogTitle>
          <DialogDescription>
            Please read and acknowledge all sections below before proceeding with treatment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter patient full name" {...field} />
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
                </div>
                <FormField
                  control={form.control}
                  name="treatmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment/Procedure</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dental Cleaning, Root Canal, Crown Placement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Treatment Consent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Treatment Acknowledgment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="risks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I understand the risks and potential complications of this treatment
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          The dentist has explained the nature of the treatment, potential risks, and complications that may arise.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternatives"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I understand alternative treatment options
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Alternative treatments, including no treatment, have been explained to me.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="financialResponsibility"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept financial responsibility for this treatment
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          I understand the fees associated with this treatment and agree to pay them.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Privacy & Data Consent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Privacy & Emergency Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I understand emergency contact procedures
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          I have been informed about emergency contact procedures and after-hours care.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I consent to clinical photography (Optional)
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          I allow the taking of clinical photographs for treatment documentation purposes.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataProcessing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I consent to processing of my medical data
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          I consent to the processing of my personal and medical data for treatment purposes.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes or Concerns (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information, allergies, or concerns you'd like to note..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Signature */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Digital Signature</FormLabel>
                        <FormControl>
                          <Input placeholder="Type your full name as signature" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Consent Form
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};