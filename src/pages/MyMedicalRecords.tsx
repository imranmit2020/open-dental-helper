import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Heart, Pill, AlertTriangle, Download, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  visit_date?: string;
  record_type: string;
  status: string;
  created_at: string;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  notes?: string;
}

interface Allergy {
  id: string;
  allergen: string;
  severity?: string;
  reaction?: string;
  notes?: string;
}

interface MedicalCondition {
  id: string;
  condition_name: string;
  diagnosed_date?: string;
  status: string;
  notes?: string;
}

const MyMedicalRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);

  useEffect(() => {
    fetchAllMedicalData();
  }, [user]);

  const fetchAllMedicalData = async () => {
    if (!user) return;

    try {
      // First get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      const patientId = patient.id;

      // Fetch all medical data in parallel
      const [recordsResult, medicationsResult, allergiesResult, conditionsResult] = await Promise.all([
        supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('allergies')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('medical_conditions')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
      ]);

      if (recordsResult.error) throw recordsResult.error;
      if (medicationsResult.error) throw medicationsResult.error;
      if (allergiesResult.error) throw allergiesResult.error;
      if (conditionsResult.error) throw conditionsResult.error;

      setMedicalRecords(recordsResult.data || []);
      setMedications(medicationsResult.data || []);
      setAllergies(allergiesResult.data || []);
      setConditions(conditionsResult.data || []);

    } catch (error) {
      console.error('Error fetching medical data:', error);
      toast({
        title: "Error",
        description: "Failed to load medical records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      case 'mild':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Medical Records
            </h1>
            <p className="text-muted-foreground mt-2">
              View your complete dental health history and records
            </p>
          </div>
        </div>

        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
          </TabsList>

          {/* Medical Records Tab */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Medical Records
                </CardTitle>
                <CardDescription>
                  Your dental treatment and diagnosis history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medical records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{record.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {record.record_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            {record.visit_date && (
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        {record.description && (
                          <p className="text-sm">{record.description}</p>
                        )}
                        {record.diagnosis && (
                          <div>
                            <span className="font-medium text-sm">Diagnosis: </span>
                            <span className="text-sm">{record.diagnosis}</span>
                          </div>
                        )}
                        {record.treatment && (
                          <div>
                            <span className="font-medium text-sm">Treatment: </span>
                            <span className="text-sm">{record.treatment}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Current Medications
                </CardTitle>
                <CardDescription>
                  Your prescribed medications and supplements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medications recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <div
                        key={medication.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{medication.medication_name}</h4>
                            {medication.dosage && (
                              <p className="text-sm text-muted-foreground">
                                {medication.dosage}
                              </p>
                            )}
                          </div>
                          <Badge variant={getStatusColor(medication.status)}>
                            {medication.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {medication.frequency && (
                            <div>
                              <span className="font-medium">Frequency: </span>
                              <span>{medication.frequency}</span>
                            </div>
                          )}
                          {medication.start_date && (
                            <div>
                              <span className="font-medium">Start Date: </span>
                              <span>{format(new Date(medication.start_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                        {medication.notes && (
                          <p className="text-sm text-muted-foreground">{medication.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allergies Tab */}
          <TabsContent value="allergies">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Allergies & Sensitivities
                </CardTitle>
                <CardDescription>
                  Important allergy information for your safety
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allergies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No allergies recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allergies.map((allergy) => (
                      <div
                        key={allergy.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{allergy.allergen}</h4>
                            {allergy.reaction && (
                              <p className="text-sm text-muted-foreground">
                                Reaction: {allergy.reaction}
                              </p>
                            )}
                          </div>
                          {allergy.severity && (
                            <Badge variant={getSeverityColor(allergy.severity)}>
                              {allergy.severity}
                            </Badge>
                          )}
                        </div>
                        {allergy.notes && (
                          <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Conditions Tab */}
          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Medical Conditions
                </CardTitle>
                <CardDescription>
                  Your ongoing medical conditions and health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medical conditions recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{condition.condition_name}</h4>
                            {condition.diagnosed_date && (
                              <p className="text-sm text-muted-foreground">
                                Diagnosed: {format(new Date(condition.diagnosed_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                          <Badge variant={getStatusColor(condition.status)}>
                            {condition.status}
                          </Badge>
                        </div>
                        {condition.notes && (
                          <p className="text-sm text-muted-foreground">{condition.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyMedicalRecords;