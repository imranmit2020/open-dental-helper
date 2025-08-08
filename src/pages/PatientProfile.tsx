import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CreditCard,
  Brain,
  MessageCircle,
  ChevronLeft,
  Plus,
  Download,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Stethoscope,
  Pill
} from "lucide-react";

import NewAppointmentForm from "@/components/NewAppointmentForm";
import GenerateInvoiceDialog from "@/components/GenerateInvoiceDialog";
import SendConsentDialog from "@/components/SendConsentDialog";

export default function PatientProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { logPatientView } = useAuditLog();
  
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [consentForms, setConsentForms] = useState<any[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medicalConditions, setMedicalConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchPatientData();
      logPatientView(id);
    }
  }, [id, user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id)
        .order('appointment_date', { ascending: false });

      setAppointments(appointmentsData || []);

      // Fetch medical records
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', id)
        .order('visit_date', { ascending: false });

      setMedicalRecords(recordsData || []);

      // Fetch consent forms
      const { data: consentData } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      setConsentForms(consentData || []);

      // Fetch treatment plans
      const { data: treatmentData } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      setTreatmentPlans(treatmentData || []);

      // Fetch medications
      const { data: medicationsData } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      setMedications(medicationsData || []);

      // Fetch allergies
      const { data: allergiesData } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', id);

      setAllergies(allergiesData || []);

      // Fetch medical conditions
      const { data: conditionsData } = await supabase
        .from('medical_conditions')
        .select('*')
        .eq('patient_id', id);

      setMedicalConditions(conditionsData || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </div>
    );
  }

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getNextAppointment = () => {
    const future = appointments.filter(apt => new Date(apt.appointment_date) > new Date());
    return future.length > 0 ? new Date(future[0].appointment_date).toLocaleString() : 'No upcoming appointments';
  };

  const getRecentTreatments = () => {
    return medicalRecords.slice(0, 3).map(record => ({
      id: record.id,
      date: record.visit_date || record.created_at,
      procedure: record.title || record.record_type,
      status: record.status || 'completed',
      cost: '$0' // Would need billing data
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "approved": return "bg-success/10 text-success border-success/20";
      case "scheduled": case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "rejected": case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 space-y-6">
      {/* Header with patient info */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-border/50 shadow-xl animate-scale-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-2xl">
                  {(patient.first_name?.[0] || '') + (patient.last_name?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              
                 <div className="space-y-2">
                   <div className="flex items-center gap-4">
                     <h1 className="text-3xl font-bold">{patient.first_name} {patient.last_name}</h1>
                     <Badge variant="outline" className={`${getStatusColor('active')} font-medium px-3 py-1`}>
                       Active
                     </Badge>
                   </div>
                   <div className="flex items-center gap-6 text-muted-foreground">
                     <span className="flex items-center gap-2">
                       <Calendar className="h-4 w-4" />
                       Age {getAge(patient.date_of_birth)}
                     </span>
                     <span className="flex items-center gap-2">
                       <Clock className="h-4 w-4" />
                       Next: {getNextAppointment()}
                     </span>
                   </div>
                   <div className="flex items-center gap-6 text-muted-foreground">
                     <span className="flex items-center gap-2">
                       <Mail className="h-4 w-4" />
                       {patient.email || 'No email'}
                     </span>
                     <span className="flex items-center gap-2">
                       <Phone className="h-4 w-4" />
                       {patient.phone || 'No phone'}
                     </span>
                   </div>
                   <div className="flex items-center gap-6 text-muted-foreground">
                     <span className="flex items-center gap-2">
                       Risk Level: <Badge variant="outline" className={`${getStatusColor(patient.risk_level)} text-xs`}>
                         {patient.risk_level}
                       </Badge>
                     </span>
                     {patient.last_visit && (
                       <span className="flex items-center gap-2">
                         Last Visit: {new Date(patient.last_visit).toLocaleDateString()}
                       </span>
                     )}
                   </div>
                 </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col gap-3">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
              <NewAppointmentForm
                defaultPatient={{ id: patient.id, first_name: patient.first_name, last_name: patient.last_name, email: patient.email, phone: patient.phone } as any}
                trigger={
                  <Button variant="outline" className="hover:bg-primary/5">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                }
              />
              <GenerateInvoiceDialog
                patientId={id as string}
                patientName={`${patient.first_name} ${patient.last_name}`}
                trigger={
                  <Button variant="outline" className="hover:bg-primary/5">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                }
              />
              <SendConsentDialog
                patientId={id as string}
                trigger={
                  <Button variant="outline" className="hover:bg-primary/5">
                    <Send className="h-4 w-4 mr-2" />
                    Send Consent
                  </Button>
                }
                onSent={fetchPatientData}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="animate-fade-in">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/30 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-background">Insurance & Billing</TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="data-[state=active]:bg-background">AI Suggestions</TabsTrigger>
          <TabsTrigger value="communication" className="data-[state=active]:bg-background">Communication</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Treatment Summary */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Treatment History
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
               <CardContent className="space-y-4">
                 {getRecentTreatments().map((treatment) => (
                   <div key={treatment.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                     <div className="space-y-1">
                       <p className="font-semibold">{treatment.procedure}</p>
                       <p className="text-sm text-muted-foreground">{new Date(treatment.date).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <Badge variant="outline" className={getStatusColor(treatment.status)}>
                         {treatment.status}
                       </Badge>
                       <span className="font-semibold text-primary">{treatment.cost}</span>
                     </div>
                   </div>
                 ))}
                 {getRecentTreatments().length === 0 && (
                   <p className="text-muted-foreground text-center py-4">No treatment history available</p>
                 )}
              </CardContent>
            </Card>

            {/* Upcoming Procedures */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Procedures
                </CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                 {appointments.filter(apt => new Date(apt.appointment_date) > new Date()).slice(0, 2).map((appointment) => (
                   <div key={appointment.id} className="p-4 border border-warning/30 bg-warning/5 rounded-lg">
                     <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <p className="font-semibold">{appointment.title}</p>
                         <p className="text-sm text-muted-foreground">{new Date(appointment.appointment_date).toLocaleString()}</p>
                         {appointment.notes && (
                           <p className="text-xs text-warning">📝 {appointment.notes}</p>
                         )}
                       </div>
                       <div className="text-right space-y-1">
                         <p className="font-bold text-primary">Duration: {appointment.duration}min</p>
                         <Badge variant="outline" className={getStatusColor(appointment.status)}>
                           {appointment.status}
                         </Badge>
                       </div>
                     </div>
                   </div>
                 ))}
                 {appointments.filter(apt => new Date(apt.appointment_date) > new Date()).length === 0 && (
                   <p className="text-muted-foreground text-center py-4">No upcoming appointments scheduled</p>
                 )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insurance & Billing Tab */}
        <TabsContent value="insurance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insurance Info */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                 {patient.insurance_info ? (
                   <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                     <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <p className="font-semibold">{patient.insurance_info.provider || 'Insurance Provider'}</p>
                         <p className="text-sm text-muted-foreground">Member ID: {patient.insurance_info.member_id || 'N/A'}</p>
                         <p className="text-sm text-muted-foreground">Group: {patient.insurance_info.group || 'N/A'}</p>
                       </div>
                       <CheckCircle className="h-8 w-8 text-success" />
                     </div>
                     <div className="mt-3 pt-3 border-t border-success/20">
                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                           <p className="text-muted-foreground">Annual Max</p>
                           <p className="font-semibold">${patient.insurance_info.annual_max || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Used</p>
                           <p className="font-semibold">${patient.insurance_info.used || '0'}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Remaining</p>
                           <p className="font-semibold text-success">${(patient.insurance_info.annual_max || 0) - (patient.insurance_info.used || 0)}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Deductible</p>
                           <p className="font-semibold">${patient.insurance_info.deductible || 'N/A'}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="p-4 border border-border/50 rounded-lg text-center">
                     <p className="text-muted-foreground">No insurance information on file</p>
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Claims History */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Recent Claims
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
               <CardContent className="space-y-3">
                 {consentForms.slice(0, 3).map((form) => (
                   <div key={form.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                     <div className="space-y-1">
                       <p className="font-semibold text-sm">{form.treatment_type} Consent</p>
                       <p className="text-xs text-muted-foreground">{new Date(form.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-semibold">{form.submitted_at ? 'Signed' : 'Pending'}</span>
                       <Badge variant="outline" className={getStatusColor(form.status)}>
                         {form.status}
                       </Badge>
                     </div>
                   </div>
                 ))}
                 {consentForms.length === 0 && (
                   <p className="text-muted-foreground text-center py-4">No consent forms on file</p>
                 )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="space-y-6 mt-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Treatment Recommendations
              </CardTitle>
              <CardDescription>
                Based on X-ray analysis and treatment history
              </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
               {treatmentPlans.slice(0, 3).map((plan) => (
                 <div key={plan.id} className="p-6 border border-border/50 rounded-lg bg-gradient-to-r from-muted/10 to-accent/5 hover:shadow-lg transition-all">
                   <div className="flex items-start justify-between">
                     <div className="space-y-3 flex-1">
                       <div className="flex items-center gap-3">
                         <AlertTriangle className={`h-5 w-5 ${getPriorityColor(plan.priority)}`} />
                         <h3 className="font-semibold text-lg">{plan.plan_name}</h3>
                         <Badge variant="outline" className={`${getPriorityColor(plan.priority)} border-current`}>
                           {plan.priority} priority
                         </Badge>
                       </div>
                       <p className="text-muted-foreground">{plan.notes || 'Treatment plan details'}</p>
                       <div className="flex items-center gap-4 text-sm">
                         <span className="text-muted-foreground">Status: <strong>{plan.status}</strong></span>
                         {plan.total_cost && (
                           <span className="text-muted-foreground">Cost: <strong>${plan.total_cost}</strong></span>
                         )}
                         {plan.estimated_duration && (
                           <span className="text-muted-foreground">Duration: <strong>{plan.estimated_duration} weeks</strong></span>
                         )}
                       </div>
                     </div>
                     <div className="flex gap-2 ml-4">
                       <Button variant="outline" size="sm">
                         View Details
                       </Button>
                       <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                         Schedule
                       </Button>
                     </div>
                   </div>
                 </div>
               ))}
               {treatmentPlans.length === 0 && (
                 <div className="text-center py-8">
                   <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                   <p className="text-muted-foreground">No AI treatment recommendations available</p>
                   <p className="text-sm text-muted-foreground mt-2">Schedule an examination to get AI-powered insights</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6 mt-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Communication Log
                </CardTitle>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {consentForms.slice(0, 5).map((form) => (
                <div key={form.id} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{form.treatment_type} Consent Form</p>
                    <p className="text-sm text-muted-foreground">
                      {form.submitted_at ? `Signed on ${new Date(form.submitted_at).toLocaleDateString()}` : 'Awaiting signature'}
                    </p>
                    <p className="text-xs text-muted-foreground">Created: {new Date(form.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(form.status)}>
                    {form.status}
                  </Badge>
                </div>
              ))}
              {medications.slice(0, 3).map((medication) => (
                <div key={medication.id} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Prescribed: {medication.medication_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {medication.start_date} to {medication.end_date || 'Ongoing'}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(medication.status)}>
                    {medication.status}
                  </Badge>
                </div>
              ))}
              {consentForms.length === 0 && medications.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No communication history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}