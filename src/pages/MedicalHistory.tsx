import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p className="font-semibold text-sm truncate">{`${patient.first_name} ${patient.last_name}`}</p>
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
                          {`${selectedPatientData.first_name?.[0] || ''}${selectedPatientData.last_name?.[0] || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{`${selectedPatientData.first_name} ${selectedPatientData.last_name}`}</h2>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Age: {getAge(selectedPatientData.date_of_birth)}</span>
                          <span>Last Visit: {selectedPatientData.last_visit ? new Date(selectedPatientData.last_visit).toLocaleDateString() : 'N/A'}</span>
                          <span className={`font-medium ${getRiskColor(selectedPatientData.risk_level || 'low')}`}>
                            Risk: {selectedPatientData.risk_level || 'low'}
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
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Current Medications
                      </CardTitle>
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
    </div>
  );
}