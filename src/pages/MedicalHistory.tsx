import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoiceRecorder from "@/components/VoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Filter,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Heart,
  Activity,
  Pill,
  Camera,
  Download,
  Eye
} from "lucide-react";

export default function MedicalHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medicalConditions, setMedicalConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isNewMedicationOpen, setIsNewMedicationOpen] = useState(false);
  
  const [newRecordForm, setNewRecordForm] = useState({
    title: '',
    record_type: '',
    diagnosis: '',
    treatment: '',
    description: '',
    visit_date: new Date().toISOString().split('T')[0],
    status: 'completed'
  });

  const [newMedicationForm, setNewMedicationForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPatients(data || []);
      if (data && data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const [recordsData, medicationsData, allergiesData, conditionsData] = await Promise.all([
        supabase.from('medical_records').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false }),
        supabase.from('medications').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
        supabase.from('allergies').select('*').eq('patient_id', patientId),
        supabase.from('medical_conditions').select('*').eq('patient_id', patientId)
      ]);

      setMedicalRecords(recordsData.data || []);
      setMedications(medicationsData.data || []);
      setAllergies(allergiesData.data || []);
      setMedicalConditions(conditionsData.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedPatient || !newRecordForm.title || !newRecordForm.record_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: selectedPatient,
          title: newRecordForm.title,
          record_type: newRecordForm.record_type,
          diagnosis: newRecordForm.diagnosis,
          treatment: newRecordForm.treatment,
          description: newRecordForm.description,
          visit_date: newRecordForm.visit_date,
          status: newRecordForm.status,
          dentist_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record created successfully",
      });

      setNewRecordForm({
        title: '',
        record_type: '',
        diagnosis: '',
        treatment: '',
        description: '',
        visit_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      });
      setIsNewRecordOpen(false);
      fetchPatientData(selectedPatient);
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
    }
  };

  const handleCreateMedication = async () => {
    if (!selectedPatient || !newMedicationForm.medication_name) {
      toast({
        title: "Missing Information",
        description: "Please enter medication name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          patient_id: selectedPatient,
          medication_name: newMedicationForm.medication_name,
          dosage: newMedicationForm.dosage,
          frequency: newMedicationForm.frequency,
          status: newMedicationForm.status,
          start_date: newMedicationForm.start_date,
          end_date: newMedicationForm.end_date || null,
          notes: newMedicationForm.notes,
          prescribed_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      setNewMedicationForm({
        medication_name: '',
        dosage: '',
        frequency: '',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
      setIsNewMedicationOpen(false);
      fetchPatientData(selectedPatient);
    } catch (error) {
      console.error('Error creating medication:', error);
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    }
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": 
      case "active": 
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": 
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending": 
        return "bg-gray-100 text-gray-800 border-gray-200";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-yellow-100 text-yellow-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      case "severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const filteredPatients = patients.filter(patient => 
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Live analytics from medical data
  const medicalAnalytics = {
    totalRecords: medicalRecords.length,
    activeMedications: medications.filter(m => m.status === 'active').length,
    totalAllergies: allergies.length,
    severeAllergies: allergies.filter(a => a.severity === 'severe').length,
    activeConditions: medicalConditions.filter(c => c.status === 'active').length,
    recentRecords: medicalRecords.filter(r => {
      const recordDate = new Date(r.visit_date || r.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading medical records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Live Data Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical History Management</h1>
          <p className="text-muted-foreground">
            Comprehensive patient medical records with live data • {patients.length} patients • {medicalAnalytics.totalRecords} records
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Record
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isNewMedicationOpen} onOpenChange={setIsNewMedicationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Pill className="w-4 h-4" />
                Add Medication
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Live Medical Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalAnalytics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">All patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalAnalytics.activeMedications}</div>
            <p className="text-xs text-muted-foreground">Currently prescribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalAnalytics.totalAllergies}</div>
            <p className="text-xs text-muted-foreground">{medicalAnalytics.severeAllergies} severe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conditions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalAnalytics.activeConditions}</div>
            <p className="text-xs text-muted-foreground">Being monitored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Records</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalAnalytics.recentRecords}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patients ({filteredPatients.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPatient === patient.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {patient.email || 'No email'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Age: {getAge(patient.date_of_birth)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRiskColor(patient.risk_level)}`}
                      >
                        {patient.risk_level} risk
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Medical Details */}
        <div className="lg:col-span-3">
          {selectedPatientData ? (
            <>
              {/* Patient Header */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {selectedPatientData.first_name?.[0]}{selectedPatientData.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {selectedPatientData.first_name} {selectedPatientData.last_name}
                      </h2>
                      <p className="text-muted-foreground">{selectedPatientData.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">Age: {getAge(selectedPatientData.date_of_birth)}</Badge>
                        <Badge variant="outline">Gender: {selectedPatientData.gender || 'Not specified'}</Badge>
                        <Badge variant="outline" className={getRiskColor(selectedPatientData.risk_level)}>
                          Risk: {selectedPatientData.risk_level}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/patients/${selectedPatient}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Medical Data Tabs */}
              <Tabs defaultValue="records" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="records">Medical Records</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions & Allergies</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-4">
                  {medicalRecords.length > 0 ? medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{record.title}</CardTitle>
                            <CardDescription>
                              {record.record_type} • {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'No date'}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                            <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.diagnosis || 'No diagnosis recorded'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Treatment</p>
                            <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.treatment || 'No treatment recorded'}</p>
                          </div>
                        </div>
                        {record.description && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No medical records found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Current Medications ({medications.filter(m => m.status === 'active').length} active)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {medications.length > 0 ? medications.map((med) => (
                        <div key={med.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <p className="font-semibold">{med.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency}
                            </p>
                            {med.notes && (
                              <p className="text-xs text-muted-foreground">{med.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(med.status)}>
                              {med.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Start: {med.start_date ? new Date(med.start_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Pill className="h-12 w-12 mx-auto mb-2" />
                          <p>No medications recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Allergies ({allergies.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {allergies.length > 0 ? allergies.map((allergy) => (
                            <div key={allergy.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{allergy.allergen}</span>
                                <Badge className={getSeverityColor(allergy.severity)}>
                                  {allergy.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Reaction: {allergy.reaction}
                              </p>
                              {allergy.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{allergy.notes}</p>
                              )}
                            </div>
                          )) : (
                            <div className="text-center text-muted-foreground py-8">
                              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">No allergies recorded</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <Heart className="h-5 w-5" />
                          Medical Conditions ({medicalConditions.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {medicalConditions.length > 0 ? medicalConditions.map((condition) => (
                            <div key={condition.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{condition.condition_name}</span>
                                <Badge className={getStatusColor(condition.status)}>
                                  {condition.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Diagnosed: {condition.diagnosed_date ? new Date(condition.diagnosed_date).toLocaleDateString() : 'Unknown'}
                              </p>
                              {condition.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{condition.notes}</p>
                              )}
                            </div>
                          )) : (
                            <div className="text-center text-muted-foreground py-8">
                              <Heart className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">No conditions recorded</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Medical Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...medicalRecords]
                          .sort((a, b) => new Date(b.visit_date || b.created_at).getTime() - new Date(a.visit_date || a.created_at).getTime())
                          .slice(0, 10)
                          .map((record) => (
                          <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{record.title}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'No date'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{record.record_type}</p>
                              {record.diagnosis && (
                                <p className="text-sm mt-1">Diagnosis: {record.diagnosis}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {medicalRecords.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            <Calendar className="h-12 w-12 mx-auto mb-2" />
                            <p>No medical history available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
                <p className="text-muted-foreground">Select a patient from the list to view their medical history</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Components */}
      <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Medical Record</DialogTitle>
            <DialogDescription>
              Add a new medical record for {selectedPatientData ? `${selectedPatientData.first_name} ${selectedPatientData.last_name}` : 'the selected patient'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title *</Label>
              <Input
                id="title"
                value={newRecordForm.title}
                onChange={(e) => setNewRecordForm({...newRecordForm, title: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Routine Checkup"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="record_type" className="text-right">Type *</Label>
              <Select onValueChange={(value) => setNewRecordForm({...newRecordForm, record_type: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="filling">Filling</SelectItem>
                  <SelectItem value="root_canal">Root Canal</SelectItem>
                  <SelectItem value="extraction">Extraction</SelectItem>
                  <SelectItem value="crown">Crown</SelectItem>
                  <SelectItem value="emergency">Emergency Visit</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visit_date" className="text-right">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={newRecordForm.visit_date}
                onChange={(e) => setNewRecordForm({...newRecordForm, visit_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diagnosis" className="text-right">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={newRecordForm.diagnosis}
                onChange={(e) => setNewRecordForm({...newRecordForm, diagnosis: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Mild gingivitis"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treatment" className="text-right">Treatment</Label>
              <Input
                id="treatment"
                value={newRecordForm.treatment}
                onChange={(e) => setNewRecordForm({...newRecordForm, treatment: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Scaling and polishing"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Notes</Label>
              <Textarea
                id="description"
                value={newRecordForm.description}
                onChange={(e) => setNewRecordForm({...newRecordForm, description: e.target.value})}
                className="col-span-3"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRecordOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRecord}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewMedicationOpen} onOpenChange={setIsNewMedicationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Add a new medication for {selectedPatientData ? `${selectedPatientData.first_name} ${selectedPatientData.last_name}` : 'the selected patient'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medication_name" className="text-right">Medication *</Label>
              <Input
                id="medication_name"
                value={newMedicationForm.medication_name}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, medication_name: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Amoxicillin"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">Dosage</Label>
              <Input
                id="dosage"
                value={newMedicationForm.dosage}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, dosage: e.target.value})}
                className="col-span-3"
                placeholder="e.g., 500mg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequency</Label>
              <Select value={newMedicationForm.frequency} onValueChange={(value) => setNewMedicationForm({...newMedicationForm, frequency: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                  <SelectItem value="Before meals">Before meals</SelectItem>
                  <SelectItem value="After meals">After meals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={newMedicationForm.start_date}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, start_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea
                id="notes"
                value={newMedicationForm.notes}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, notes: e.target.value})}
                className="col-span-3"
                placeholder="Special instructions..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMedicationOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMedication}>Add Medication</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}