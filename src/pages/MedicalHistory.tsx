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
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState('');
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
      // Fetch medical records
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      // Fetch medications
      const { data: medicationsData } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Fetch allergies
      const { data: allergiesData } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', patientId);

      // Fetch medical conditions
      const { data: conditionsData } = await supabase
        .from('medical_conditions')
        .select('*')
        .eq('patient_id', patientId);

      setMedicalRecords(recordsData || []);
      setMedications(medicationsData || []);
      setAllergies(allergiesData || []);
      setMedicalConditions(conditionsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    }
  };

  const handleNewRecord = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }
    setIsNewRecordOpen(true);
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
      // Get the current user's profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Could not find user profile');
      }

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
          dentist_id: profileData.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record created successfully",
      });

      // Reset form and close dialog
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

      // Refresh patient data
      if (selectedPatient) {
        fetchPatientData(selectedPatient);
      }
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
    }
  };

  const handleNewMedication = () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }
    setIsNewMedicationOpen(true);
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
      // Get the current user's profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Could not find user profile');
      }

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
          prescribed_by: profileData.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      // Reset form and close dialog
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

      // Refresh patient data
      if (selectedPatient) {
        fetchPatientData(selectedPatient);
      }
    } catch (error) {
      console.error('Error creating medication:', error);
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    }
  };

  const handleVoiceTranscription = (text: string) => {
    // Parse the voice input and fill form fields intelligently
    const lowerText = text.toLowerCase();
    
    // Extract medication name (usually the first drug name mentioned)
    const medicationMatch = lowerText.match(/(?:take|prescribe|give|medication|drug)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
    if (medicationMatch && !newMedicationForm.medication_name) {
      setNewMedicationForm(prev => ({
        ...prev,
        medication_name: medicationMatch[1].split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }));
    }

    // Extract dosage
    const dosageMatch = lowerText.match(/(\d+(?:\.\d+)?\s*(?:mg|milligrams?|g|grams?|ml|milliliters?|units?|tablets?|capsules?|pills?))/i);
    if (dosageMatch && !newMedicationForm.dosage) {
      setNewMedicationForm(prev => ({
        ...prev,
        dosage: dosageMatch[1]
      }));
    }

    // Extract frequency
    if (lowerText.includes('once a day') || lowerText.includes('once daily') || lowerText.includes('one time a day')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'Once daily' }));
    } else if (lowerText.includes('twice a day') || lowerText.includes('twice daily') || lowerText.includes('two times a day')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'Twice daily' }));
    } else if (lowerText.includes('three times a day') || lowerText.includes('three times daily')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'Three times daily' }));
    } else if (lowerText.includes('four times a day') || lowerText.includes('four times daily')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'Four times daily' }));
    } else if (lowerText.includes('as needed') || lowerText.includes('when needed') || lowerText.includes('prn')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'As needed' }));
    } else if (lowerText.includes('before meals') || lowerText.includes('before eating')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'Before meals' }));
    } else if (lowerText.includes('after meals') || lowerText.includes('after eating')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'After meals' }));
    } else if (lowerText.includes('at bedtime') || lowerText.includes('before bed')) {
      setNewMedicationForm(prev => ({ ...prev, frequency: 'At bedtime' }));
    }

    // Extract duration or notes
    const durationMatch = lowerText.match(/for\s+(\d+)\s+(days?|weeks?|months?)/);
    if (durationMatch && !newMedicationForm.notes) {
      setNewMedicationForm(prev => ({
        ...prev,
        notes: `Take for ${durationMatch[1]} ${durationMatch[2]}`
      }));
    }

    // If no specific fields were filled, put the full text in notes
    if (!medicationMatch && !dosageMatch && !newMedicationForm.notes) {
      setNewMedicationForm(prev => ({
        ...prev,
        notes: text
      }));
    }

    toast({
      title: "Voice Input Processed",
      description: "Medication details have been extracted from your voice input",
    });
  };

  const generatePrescription = async () => {
    if (!selectedPatientData || !newMedicationForm.medication_name) {
      toast({
        title: "Missing Information",
        description: "Please ensure patient is selected and medication name is provided",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-prescription', {
        body: {
          medicationName: newMedicationForm.medication_name,
          patientInfo: {
            name: `${selectedPatientData.first_name} ${selectedPatientData.last_name}`,
            age: getAge(selectedPatientData.date_of_birth)
          },
          diagnosis: 'General dental treatment',
          dosage: newMedicationForm.dosage,
          frequency: newMedicationForm.frequency
        }
      });

      if (error) throw error;

      setGeneratedPrescription(data.prescription);
      setIsPrescriptionOpen(true);

      toast({
        title: "Prescription Generated",
        description: "AI-powered prescription has been created",
      });
    } catch (error) {
      console.error('Error generating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to generate prescription",
        variant: "destructive",
      });
    }
  };

  const speakPrescription = async () => {
    if (!generatedPrescription) return;

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: generatedPrescription,
          voice: 'alloy'
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        // Convert base64 to audio and play
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech Error",
        description: "Failed to convert text to speech",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient}`);
    } else {
      toast({
        title: "No Patient Selected", 
        description: "Please select a patient first",
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
      case "completed": return "bg-success/10 text-success border-success/20";
      case "active": return "bg-success/10 text-success border-success/20";
      case "in-progress": return "bg-warning/10 text-warning border-warning/20";
      case "pending": return "bg-muted/10 text-muted-foreground border-muted/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 space-y-8">
      {/* Animated Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Medical History
          </h1>
          <p className="text-muted-foreground text-lg">Comprehensive patient medical records and history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button 
            onClick={handleNewRecord}
            className="bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Selector Sidebar */}
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-scale-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Select Patient
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPatient === patient.id 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg' 
                    : 'hover:bg-muted/30 border border-border/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                      {`${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{`${patient.first_name || ''} ${patient.last_name || ''}`}</p>
                    <p className="text-xs text-muted-foreground">Age {getAge(patient.date_of_birth)}</p>
                    <p className={`text-xs font-medium ${getRiskColor(patient.risk_level || 'low')}`}>
                      {patient.risk_level || 'low'} risk
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPatientData && (
            <>
              {/* Patient Overview */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg">
                         <AvatarImage src="" />
                         <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-lg">
                           {selectedPatientData ? `${selectedPatientData.first_name?.[0] || ''}${selectedPatientData.last_name?.[0] || ''}` : 'P'}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <h2 className="text-2xl font-bold">
                           {selectedPatientData ? `${selectedPatientData.first_name || ''} ${selectedPatientData.last_name || ''}` : 'Loading...'}
                         </h2>
                         <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                           <span>Age: {selectedPatientData ? getAge(selectedPatientData.date_of_birth) : 'N/A'}</span>
                           <span>Last Visit: {selectedPatientData?.last_visit ? new Date(selectedPatientData.last_visit).toLocaleDateString() : 'N/A'}</span>
                           <span className={`font-medium ${getRiskColor(selectedPatientData?.risk_level || 'low')}`}>
                             Risk: {selectedPatientData?.risk_level || 'low'}
                           </span>
                         </div>
                       </div>
                     </div>
                    <Button 
                      onClick={handleViewProfile}
                      variant="outline" 
                      className="hover:bg-primary/5 rounded-xl"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Medical Information Tabs */}
              <Tabs defaultValue="records" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30 backdrop-blur-sm p-1 rounded-xl">
                  <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">
                    <FileText className="h-4 w-4 mr-2" />
                    Records
                  </TabsTrigger>
                  <TabsTrigger value="medications" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">
                    <Pill className="h-4 w-4 mr-2" />
                    Medications
                  </TabsTrigger>
                  <TabsTrigger value="conditions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">
                    <Heart className="h-4 w-4 mr-2" />
                    Conditions
                  </TabsTrigger>
                  <TabsTrigger value="images" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md">
                    <Camera className="h-4 w-4 mr-2" />
                    Images
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-4">
                  {medicalRecords.length > 0 ? medicalRecords.map((record, index) => (
                    <Card key={record.id} className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold">{record.record_type || record.title}</h3>
                              <Badge variant="outline" className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {record.dentist_id || 'Dr. Smith'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {record.attachments?.length || 0} images
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-primary/10 rounded-lg">
                            View Details
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                              <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.diagnosis || 'No diagnosis recorded'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Treatment</p>
                              <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.treatment || 'No treatment recorded'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm bg-muted/30 p-3 rounded-lg h-full">{record.description || 'No notes available'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
                      <CardContent className="p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No medical records found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Pill className="h-5 w-5" />
                          Current Medications
                        </CardTitle>
                        <Button 
                          onClick={handleNewMedication}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 transition-all duration-300"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medication
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {medications.length > 0 ? medications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <p className="font-semibold">{med.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.status}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Start: {med.start_date ? new Date(med.start_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-muted-foreground py-4">
                          <Pill className="h-12 w-12 mx-auto mb-2" />
                          <p>No medications recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Allergies
                        </CardTitle>
                      </CardHeader>
                       <CardContent>
                         <div className="space-y-2">
                           {allergies.length > 0 ? allergies.map((allergy, index) => (
                             <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                               {allergy.allergen}
                             </Badge>
                           )) : (
                             <div className="text-center text-muted-foreground py-4">
                               <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                               <p className="text-sm">No allergies recorded</p>
                             </div>
                           )}
                         </div>
                       </CardContent>
                     </Card>

                     <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
                       <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-warning">
                           <Heart className="h-5 w-5" />
                           Medical Conditions
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <div className="space-y-2">
                           {medicalConditions.length > 0 ? medicalConditions.map((condition, index) => (
                             <Badge key={index} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                               {condition.condition_name}
                             </Badge>
                           )) : (
                             <div className="text-center text-muted-foreground py-4">
                               <Heart className="h-8 w-8 mx-auto mb-2" />
                               <p className="text-sm">No conditions recorded</p>
                             </div>
                           )}
                         </div>
                       </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Medical Images & X-Rays
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="text-center">
                              <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">X-Ray {i}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* New Record Dialog */}
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
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={newRecordForm.title}
                onChange={(e) => setNewRecordForm({...newRecordForm, title: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Routine Checkup"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="record_type" className="text-right">
                Type *
              </Label>
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
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visit_date" className="text-right">
                Visit Date
              </Label>
              <Input
                id="visit_date"
                type="date"
                value={newRecordForm.visit_date}
                onChange={(e) => setNewRecordForm({...newRecordForm, visit_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diagnosis" className="text-right">
                Diagnosis
              </Label>
              <Input
                id="diagnosis"
                value={newRecordForm.diagnosis}
                onChange={(e) => setNewRecordForm({...newRecordForm, diagnosis: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Mild gingivitis, cavity in tooth #14"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treatment" className="text-right">
                Treatment
              </Label>
              <Input
                id="treatment"
                value={newRecordForm.treatment}
                onChange={(e) => setNewRecordForm({...newRecordForm, treatment: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Scaling, filling placement"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Notes
              </Label>
              <Textarea
                id="description"
                value={newRecordForm.description}
                onChange={(e) => setNewRecordForm({...newRecordForm, description: e.target.value})}
                className="col-span-3"
                placeholder="Additional notes and observations..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newRecordForm.status} onValueChange={(value) => setNewRecordForm({...newRecordForm, status: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRecordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecord}>
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Medication Dialog */}
      <Dialog open={isNewMedicationOpen} onOpenChange={setIsNewMedicationOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Add New Medication
              <VoiceRecorder 
                onTranscription={handleVoiceTranscription}
                className="ml-auto"
              />
            </DialogTitle>
            <DialogDescription>
              Add a new medication for {selectedPatientData ? `${selectedPatientData.first_name} ${selectedPatientData.last_name}` : 'the selected patient'}. Use voice input or fill the form manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medication_name" className="text-right">
                Medication *
              </Label>
              <Input
                id="medication_name"
                value={newMedicationForm.medication_name}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, medication_name: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Amoxicillin"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">
                Dosage
              </Label>
              <Input
                id="dosage"
                value={newMedicationForm.dosage}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, dosage: e.target.value})}
                className="col-span-3"
                placeholder="e.g., 500mg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select value={newMedicationForm.frequency} onValueChange={(value) => setNewMedicationForm({...newMedicationForm, frequency: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  <SelectItem value="As needed">As needed (PRN)</SelectItem>
                  <SelectItem value="Before meals">Before meals</SelectItem>
                  <SelectItem value="After meals">After meals</SelectItem>
                  <SelectItem value="At bedtime">At bedtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={newMedicationForm.start_date}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, start_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={newMedicationForm.end_date}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, end_date: e.target.value})}
                className="col-span-3"
                placeholder="Leave empty for ongoing"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="med_status" className="text-right">
                Status
              </Label>
              <Select value={newMedicationForm.status} onValueChange={(value) => setNewMedicationForm({...newMedicationForm, status: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="med_notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="med_notes"
                value={newMedicationForm.notes}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, notes: e.target.value})}
                className="col-span-3"
                placeholder="Special instructions, side effects, etc..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsNewMedicationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={generatePrescription}
              disabled={!newMedicationForm.medication_name}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate Prescription
            </Button>
            <Button onClick={handleCreateMedication}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Generated Prescription
              <Button
                variant="outline"
                size="sm"
                onClick={speakPrescription}
                className="ml-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                Listen
              </Button>
            </DialogTitle>
            <DialogDescription>
              AI-generated prescription based on medication details
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedPrescription}
              </pre>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPrescriptionOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(generatedPrescription);
                toast({
                  title: "Copied",
                  description: "Prescription copied to clipboard",
                });
              }}
            >
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}