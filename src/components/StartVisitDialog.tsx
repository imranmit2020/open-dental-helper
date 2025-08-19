import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Play, Clock, CheckCircle, FileText, Camera, Upload, Send, Shield, Scan, Cloud, Calendar, DollarSign, MessageSquare, Star, Printer, Pill, ArrowRight, Brain, Heart, Mic, Volume2, ThumbsUp, Plus, Trash2, Loader2, FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import GenerateInvoiceDialog from "@/components/GenerateInvoiceDialog";
import { AINotesGenerator } from "@/components/AINotesGenerator";
import VoiceRecorder from "@/components/VoiceRecorder";
import ReviewRequestDialog from "@/components/ReviewRequestDialog";

const startVisitSchema = z.object({
  visitNotes: z.string().optional(),
  status: z.enum(["confirmed", "completed"]),
  consentFormsSent: z.boolean().default(false),
  idScanned: z.boolean().default(false),
  documentsUploaded: z.array(z.string()).default([]),
  // Complete visit fields
  treatmentCodes: z.array(z.string()).default([]),
  prescriptions: z.array(z.object({
    medication: z.string(),
    dosage: z.string(),
    instructions: z.string(),
  })).default([]),
  postVisitInstructions: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().optional(),
  paymentAmount: z.number().optional(),
  patientSatisfaction: z.number().min(1).max(5).optional(),
  nextAppointmentRecommended: z.boolean().default(false),
});

type StartVisitFormData = z.infer<typeof startVisitSchema>;

interface StartVisitDialogProps {
  appointment: {
    id: string;
    patient_id?: string;
    patient: string;
    time: string;
    type: string;
    duration: number;
    patient_email?: string;
    patient_phone?: string;
  };
  onVisitStarted?: () => void;
  trigger?: React.ReactNode;
  defaultTab?: string;
}

export default function StartVisitDialog({ appointment, onVisitStarted, trigger, defaultTab = "overview" }: StartVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [sendingConsent, setSendingConsent] = useState(false);
  const [consentSent, setConsentSent] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [prescriptions, setPrescriptions] = useState<Array<{medication: string, dosage: string, instructions: string}>>([]);
  const [generatingInstructions, setGeneratingInstructions] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateAppointment } = useAppointments();

  const form = useForm<StartVisitFormData>({
    resolver: zodResolver(startVisitSchema),
    defaultValues: {
      status: "confirmed",
      visitNotes: "",
      consentFormsSent: false,
      idScanned: false,
      documentsUploaded: [],
      treatmentCodes: [],
      prescriptions: [],
      followUpRequired: false,
      paymentAmount: 0,
      nextAppointmentRecommended: false,
    },
  });

  const watchedStatus = form.watch("status");

  // Common treatment codes for dental procedures
  const treatmentCodes = [
    { code: "D0150", description: "Comprehensive oral evaluation", fee: 150 },
    { code: "D1110", description: "Prophylaxis - adult", fee: 120 },
    { code: "D2140", description: "Amalgam - one surface, primary or permanent", fee: 180 },
    { code: "D2150", description: "Amalgam - two surfaces, primary or permanent", fee: 220 },
    { code: "D2740", description: "Crown - porcelain/ceramic substrate", fee: 1200 },
    { code: "D3220", description: "Therapeutic pulpotomy", fee: 300 },
    { code: "D7140", description: "Extraction, erupted tooth or exposed root", fee: 200 },
    { code: "D9110", description: "Palliative (emergency) treatment of dental pain", fee: 100 },
  ];

  // Generate AI-powered post-visit instructions
  const generatePostVisitInstructions = async () => {
    setGeneratingInstructions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-visit-instructions', {
        body: {
          treatmentCodes: selectedTreatments,
          appointmentType: appointment.type,
          patientName: appointment.patient,
          visitNotes: form.getValues("visitNotes"),
        }
      });

      if (error) throw error;

      form.setValue("postVisitInstructions", data.instructions);
      toast({
        title: "Instructions Generated",
        description: "AI-powered post-visit instructions have been created",
      });
    } catch (error) {
      console.error('Error generating instructions:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate instructions. Please write manually.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInstructions(false);
    }
  };

  // Add prescription
  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: "", dosage: "", instructions: "" }]);
  };

  // Remove prescription
  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Process payment
  const processPayment = async (amount: number) => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Processed",
        description: `Successfully processed payment of $${amount}`,
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Could not process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle file upload to Supabase Storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUploadedFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${appointment.id}_${Date.now()}.${fileExt}`;
        const filePath = `patient-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('analyses')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        newUploadedFiles.push(fileName);
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      form.setValue("documentsUploaded", [...uploadedFiles, ...newUploadedFiles]);
      form.setValue("idScanned", true);

      toast({
        title: "Documents Uploaded Successfully",
        description: `${newUploadedFiles.length} document(s) uploaded to secure cloud storage`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Send consent forms to patient
  const handleSendConsentForms = async () => {
    if (!appointment.patient_email && !appointment.patient_phone) {
      toast({
        title: "Contact Information Missing",
        description: "Patient email or phone number is required to send consent forms.",
        variant: "destructive",
      });
      return;
    }

    setSendingConsent(true);
    try {
      // Call edge function to send consent forms
      const { error } = await supabase.functions.invoke('send-consent-forms', {
        body: {
          patient_id: appointment.patient_id,
          patient_name: appointment.patient,
          patient_email: appointment.patient_email,
          patient_phone: appointment.patient_phone,
          appointment_id: appointment.id,
          appointment_type: appointment.type,
        }
      });

      if (error) throw error;

      setConsentSent(true);
      form.setValue("consentFormsSent", true);
      
      toast({
        title: "Consent Forms Sent",
        description: `Digital consent forms sent to ${appointment.patient_email || appointment.patient_phone}`,
      });
    } catch (error) {
      console.error('Error sending consent forms:', error);
      toast({
        title: "Failed to Send Consent Forms",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSendingConsent(false);
    }
  };

  const onSubmit = async (data: StartVisitFormData) => {
    try {
      const currentTime = new Date().toISOString();
      const notes = data.visitNotes 
        ? `Visit started at ${new Date().toLocaleTimeString()}\n${data.visitNotes}`
        : `Visit started at ${new Date().toLocaleTimeString()}`;

      // Create visit summary
      const visitSummary = {
        consent_forms_sent: data.consentFormsSent,
        id_documents_scanned: data.idScanned,
        documents_uploaded: data.documentsUploaded.length,
        uploaded_files: data.documentsUploaded,
      };

      await updateAppointment(appointment.id, {
        status: data.status,
        notes: `${notes}\n\nVisit Summary: ${JSON.stringify(visitSummary, null, 2)}`,
      });

      const statusText = data.status === "completed" ? "completed" : "started";
      
      toast({
        title: `Visit ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        description: `${appointment.patient}'s visit has been ${statusText} with all required documentation`,
      });

      onVisitStarted?.();
      form.reset();
      setOpen(false);
      setUploadedFiles([]);
      setConsentSent(false);
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
          <Button variant="outline" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700">
            <Play className="h-4 w-4 mr-2" />
            Start Visit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Play className="h-5 w-5 text-green-600" />
            Smart Visit Management
          </DialogTitle>
          <DialogDescription>
            Comprehensive visit start workflow for {appointment.patient}'s {appointment.type} appointment
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{appointment.time}</span>
            <span>•</span>
            <span>{appointment.duration} minutes</span>
            <span>•</span>
            <Badge variant="secondary">{appointment.type}</Badge>
          </div>
          <div className="font-medium mt-1 text-blue-900">{appointment.patient}</div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Consent
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="complete" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Visit
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`border-2 ${consentSent ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Shield className={`h-4 w-4 ${consentSent ? 'text-green-600' : 'text-orange-600'}`} />
                        Consent Forms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {consentSent ? 'Digital forms sent successfully' : 'Send digital consent forms to patient'}
                      </p>
                      <Badge variant={consentSent ? "secondary" : "outline"}>
                        {consentSent ? 'Completed' : 'Pending'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${uploadedFiles.length > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Cloud className={`h-4 w-4 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-600'}`} />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} files uploaded` : 'Scan and store ID documents'}
                      </p>
                      <Badge variant={uploadedFiles.length > 0 ? "secondary" : "outline"}>
                        {uploadedFiles.length > 0 ? 'Completed' : 'Pending'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Play className="h-4 w-4 text-blue-600" />
                        Visit Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="confirmed">
                                  <div className="flex items-center gap-2">
                                    <Play className="h-4 w-4 text-blue-600" />
                                    Start Visit
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
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="consent" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Digital Consent Forms
                    </CardTitle>
                    <CardDescription>
                      Send digital consent forms to the patient for pre-visit completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Patient Contact Information</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.patient_email || appointment.patient_phone || 'No contact information available'}
                        </p>
                      </div>
                      <Button 
                        type="button"
                        onClick={handleSendConsentForms}
                        disabled={sendingConsent || consentSent || (!appointment.patient_email && !appointment.patient_phone)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {sendingConsent ? (
                          <>Sending...</>
                        ) : consentSent ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Forms
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {consentSent && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Consent forms sent successfully!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Patient will receive digital forms with secure e-signature capabilities.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scan className="h-5 w-5 text-purple-600" />
                      ID Document Scanning & Storage
                    </CardTitle>
                    <CardDescription>
                      Scan and securely store patient identification documents in the cloud
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Camera className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Upload ID Documents</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Supports: Driver's License, Passport, Insurance Cards, etc.
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            {uploading ? (
                              <>Uploading...</>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Select Files
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Uploaded Documents:</h5>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">{file}</span>
                            <Badge variant="secondary" className="ml-auto">
                              <Cloud className="h-3 w-3 mr-1" />
                              Stored Securely
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complete" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Treatment Summary & AI Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Treatment Summary & Notes
                      </CardTitle>
                      <CardDescription>
                        Select procedures and add intelligent notes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {treatmentCodes.map((treatment) => (
                        <div key={treatment.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={treatment.code}
                              checked={selectedTreatments.includes(treatment.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTreatments([...selectedTreatments, treatment.code]);
                                } else {
                                  setSelectedTreatments(selectedTreatments.filter(code => code !== treatment.code));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <div>
                              <label htmlFor={treatment.code} className="font-medium cursor-pointer">
                                {treatment.code}
                              </label>
                              <p className="text-sm text-muted-foreground">{treatment.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">${treatment.fee}</Badge>
                        </div>
                      ))}
                      
                      {selectedTreatments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Smart Treatment Notes</h4>
                          <AINotesGenerator
                            procedure={selectedTreatments.join(", ")}
                            toothNumber={0}
                            priority="normal"
                            notes={form.getValues("visitNotes") || ""}
                            onNotesChange={(notes) => form.setValue("visitNotes", notes)}
                            patientId={appointment.patient_id}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Voice Notes & Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-purple-600" />
                        Voice Notes & Instructions
                      </CardTitle>
                      <CardDescription>
                        Voice-to-text notes and AI instructions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Voice Notes</h5>
                        <VoiceRecorder
                          onTranscription={(text) => {
                            const currentNotes = form.getValues("visitNotes") || "";
                            form.setValue("visitNotes", currentNotes + (currentNotes ? "\n" : "") + text);
                          }}
                          placeholder="Click microphone to record visit notes"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          onClick={generatePostVisitInstructions}
                          disabled={generatingInstructions || selectedTreatments.length === 0}
                          variant="outline"
                          className="flex-1"
                        >
                          {generatingInstructions ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          {generatingInstructions ? "Generating..." : "AI Instructions"}
                        </Button>
                        <Button type="button" variant="outline" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="postVisitInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="AI-generated post-visit instructions..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Prescriptions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-purple-600" />
                        Prescriptions & Medications
                      </CardTitle>
                      <CardDescription>
                        Comprehensive prescription management
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prescriptions.map((prescription, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3 bg-gradient-to-r from-purple-50 to-pink-50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-purple-700">Prescription {index + 1}</span>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePrescription(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input 
                            placeholder="Medication name (e.g., Amoxicillin)"
                            value={prescription.medication}
                            onChange={(e) => {
                              const updated = [...prescriptions];
                              updated[index].medication = e.target.value;
                              setPrescriptions(updated);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              placeholder="Dosage (500mg)"
                              value={prescription.dosage}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].dosage = e.target.value;
                                setPrescriptions(updated);
                              }}
                            />
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once">Once daily</SelectItem>
                                <SelectItem value="twice">Twice daily</SelectItem>
                                <SelectItem value="three">Three times daily</SelectItem>
                                <SelectItem value="four">Four times daily</SelectItem>
                                <SelectItem value="asneeded">As needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Textarea 
                            placeholder="Detailed instructions and warnings..."
                            value={prescription.instructions}
                            onChange={(e) => {
                              const updated = [...prescriptions];
                              updated[index].instructions = e.target.value;
                              setPrescriptions(updated);
                            }}
                            className="min-h-[60px]"
                          />
                        </div>
                      ))}
                      
                      <Button 
                        type="button"
                        onClick={addPrescription}
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prescription
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Payment & Invoice Generation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Payment & Invoice
                      </CardTitle>
                      <CardDescription>
                        Process payment and generate professional invoice
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Total Amount:</span>
                          <span className="text-xl font-bold text-green-700">
                            ${selectedTreatments.reduce((total, code) => {
                              const treatment = treatmentCodes.find(t => t.code === code);
                              return total + (treatment?.fee || 0);
                            }, 0)}
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {selectedTreatments.length} procedure(s) selected
                        </p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="paymentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button"
                          onClick={() => processPayment(form.getValues("paymentAmount") || 0)}
                          disabled={processingPayment}
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          {processingPayment ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <DollarSign className="h-4 w-4 mr-2" />
                          )}
                          {processingPayment ? "Processing..." : "Process Payment"}
                        </Button>
                        
                        <GenerateInvoiceDialog
                          patientId={appointment.patient_id || ""}
                          patientName={appointment.patient}
                          trigger={
                            <Button variant="outline" className="w-full">
                              <FileCheck className="h-4 w-4 mr-2" />
                              Generate Invoice
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Follow-up & Next Appointment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        Follow-up Care & Scheduling
                      </CardTitle>
                      <CardDescription>
                        Smart follow-up recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="followUpRequired"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Follow-up appointment required</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("followUpRequired") && (
                        <FormField
                          control={form.control}
                          name="followUpDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommended Follow-up Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="nextAppointmentRecommended"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Recommend regular checkup (6 months)</FormLabel>
                          </FormItem>
                        )}
                      />

                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-700">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Smart scheduling will suggest optimal appointment times based on patient preferences
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Satisfaction & Reviews */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-pink-600" />
                        Patient Experience & Reviews
                      </CardTitle>
                      <CardDescription>
                        Rate experience and request reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="patientSatisfaction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Satisfaction Rating</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Button
                                    key={rating}
                                    type="button"
                                    variant={field.value === rating ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => field.onChange(rating)}
                                    className="p-2"
                                  >
                                    <Star 
                                      className={`h-4 w-4 ${
                                        field.value && rating <= field.value 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  </Button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <ReviewRequestDialog
                          trigger={
                            <Button variant="outline" className="w-full border-pink-200 text-pink-700 hover:bg-pink-50">
                              <Star className="h-4 w-4 mr-2" />
                              Request Review
                            </Button>
                          }
                        />
                        
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            Automated feedback survey will be sent via email/SMS
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Quick Actions & Smart Features
                    </CardTitle>
                    <CardDescription>
                      Complete visit with intelligent automation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                        <Volume2 className="h-5 w-5 text-blue-600" />
                        <span className="text-xs">Text-to-Speech</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                        <Printer className="h-5 w-5 text-green-600" />
                        <span className="text-xs">Print Summary</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                        <Send className="h-5 w-5 text-purple-600" />
                        <span className="text-xs">Email Patient</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        <span className="text-xs">AI Summary</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Visit Notes
                    </CardTitle>
                    <CardDescription>
                      Add any initial observations or treatment summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="visitNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={
                                watchedStatus === "completed" 
                                  ? "Summary of treatment provided, patient response, next steps..."
                                  : "Initial observations, patient concerns, planned procedures..."
                              }
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end space-x-2 pt-4 border-t">
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
                    watchedStatus === "completed" 
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  } text-white`}
                >
                  {watchedStatus === "completed" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Visit
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Visit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}