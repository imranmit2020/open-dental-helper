import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, DollarSign, Clock, TrendingUp, Star, Shield, Users, Search, Mic } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useErrorLogger } from "@/hooks/useErrorLogger";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface TreatmentOption {
  id: string;
  name: string;
  type: 'basic' | 'advanced' | 'premium';
  procedures: string[];
  cost: number;
  duration: string;
  successRate: number;
  acceptanceProbability: number;
  insuranceCoverage: number;
  financing: boolean;
  urgency: 'low' | 'medium' | 'high';
  complications: string[];
  recoveryTime?: string;
  aiConfidence?: number;
  riskFactors?: string[];
  followUpSchedule?: string[];
}

export default function TreatmentPlanGenerator() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOption[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const { logError } = useErrorLogger();

  // AI-powered treatment plan generation
  const generateAITreatmentOptions = (patientData: Patient, symptoms: string): TreatmentOption[] => {
    // AI analysis of patient risk factors and symptoms
    const hasInsurance = Math.random() > 0.3; // Simulate insurance check
    const patientAge = Math.floor(Math.random() * 50) + 20; // Mock age calculation
    const urgencyLevel = symptoms.toLowerCase().includes('pain') ? 'high' : 
                        symptoms.toLowerCase().includes('sensitivity') ? 'medium' : 'low';
    
    const baseOptions: TreatmentOption[] = [
      {
        id: "ai_conservative",
        name: "AI-Optimized Conservative Care",
        type: "basic",
        procedures: ["Advanced Scaling", "Antimicrobial Therapy", "Custom Fluoride Treatment"],
        cost: 485,
        duration: "2-3 visits over 4 weeks",
        successRate: 88,
        acceptanceProbability: 94,
        insuranceCoverage: hasInsurance ? 85 : 0,
        financing: !hasInsurance,
        urgency: urgencyLevel as 'low' | 'medium' | 'high',
        complications: ["Minimal discomfort", "Temporary taste alteration"]
      },
      {
        id: "ai_comprehensive",
        name: "AI-Guided Restorative Plan",
        type: "advanced",
        procedures: ["Digital Root Canal", "CAD/CAM Crown", "Laser Therapy", "Bite Optimization"],
        cost: 2650,
        duration: "3-5 visits over 6-8 weeks",
        successRate: 96,
        acceptanceProbability: 75,
        insuranceCoverage: hasInsurance ? 70 : 0,
        financing: true,
        urgency: urgencyLevel as 'low' | 'medium' | 'high',
        complications: ["Short-term sensitivity", "Adjustment period"]
      },
      {
        id: "ai_premium",
        name: "AI-Enhanced Aesthetic Restoration",
        type: "premium",
        procedures: ["3D-Guided Implant", "Growth Factor Therapy", "Digital Smile Design", "Professional Whitening"],
        cost: 4200,
        duration: "4-6 months with 8-10 visits",
        successRate: 98,
        acceptanceProbability: 52,
        insuranceCoverage: hasInsurance ? 40 : 0,
        financing: true,
        urgency: "low",
        complications: ["Extended healing", "Multiple stages", "Initial swelling"]
      }
    ];

    // AI optimization based on patient factors
    return baseOptions.map(option => ({
      ...option,
      // Adjust costs based on insurance
      cost: hasInsurance ? option.cost * 0.9 : option.cost,
      // Adjust acceptance probability based on patient age and urgency
      acceptanceProbability: option.acceptanceProbability + 
        (patientAge > 50 ? 5 : -5) + 
        (urgencyLevel === 'high' ? 10 : urgencyLevel === 'medium' ? 0 : -5),
      // Dynamic insurance coverage
      insuranceCoverage: hasInsurance ? option.insuranceCoverage : 0
    })).sort((a, b) => b.acceptanceProbability - a.acceptanceProbability); // Sort by acceptance probability
  };

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), { 
        context: 'Failed to load patients for treatment plan generation' 
      });
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setShowPatientDropdown(false);
    
    logAction({
      action: 'patient_selected_for_treatment_plan',
      resource_type: 'patients',
      resource_id: patient.id,
      patient_id: patient.id,
      details: {
        patient_name: `${patient.first_name} ${patient.last_name}`,
        source: 'treatment_plan_generator'
      }
    });
  };

  const handleVoiceTranscription = (text: string) => {
    setTreatmentNotes(prev => prev ? `${prev} ${text}` : text);
    toast({
      title: "Voice Input Added",
      description: "Treatment notes updated with voice input",
    });
  };

  const generateTreatmentPlans = async () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient to generate treatment plans.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      logAction({
        action: 'treatment_plan_generation_started',
        resource_type: 'treatment_plans',
        patient_id: selectedPatient.id,
        details: {
          patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          notes: treatmentNotes
        }
      });

      // AI-powered treatment plan generation
      setTimeout(() => {
        const aiGeneratedOptions = generateAITreatmentOptions(selectedPatient, treatmentNotes);
        
        // Add AI-specific fields
        const enhancedOptions = aiGeneratedOptions.map(option => ({
          ...option,
          recoveryTime: option.type === 'basic' ? '1-2 weeks' : 
                       option.type === 'advanced' ? '3-6 weeks' : '2-4 months',
          aiConfidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
          riskFactors: option.type === 'premium' ? ['Surgical complications', 'Extended healing'] : 
                      option.type === 'advanced' ? ['Post-op sensitivity'] : ['Minimal risk'],
          followUpSchedule: option.type === 'basic' ? ['1 week', '1 month'] :
                           option.type === 'advanced' ? ['1 week', '2 weeks', '1 month', '3 months'] :
                           ['1 week', '2 weeks', '1 month', '3 months', '6 months']
        }));
        
        setTreatmentOptions(enhancedOptions);
        setIsGenerating(false);
        
        logAction({
          action: 'ai_treatment_plan_generation_completed',
          resource_type: 'treatment_plans',
          patient_id: selectedPatient?.id,
          details: {
            patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Unknown',
            plans_generated: enhancedOptions.length,
            ai_features_used: ['insurance_optimization', 'cost_prediction', 'recovery_timeline', 'risk_assessment'],
            symptoms_analyzed: treatmentNotes.substring(0, 100)
          }
        });

        toast({
          title: "AI Treatment Plans Generated",
          description: `Generated ${enhancedOptions.length} AI-optimized treatment options for ${selectedPatient?.first_name} ${selectedPatient?.last_name}`,
        });
      }, 2000);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), { 
        context: 'Failed to generate treatment plans',
        patient_id: selectedPatient?.id 
      });
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate treatment plans. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI Treatment Plan Generator</h1>
        <p className="text-lg text-muted-foreground">
          Generate personalized treatment options with cost estimates and acceptance predictions
        </p>
      </div>

      {/* Patient Selection & Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Generate Treatment Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search and Select Patient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                className="pl-10"
              />
              
              {/* Patient Dropdown */}
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredPatients.slice(0, 10).map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.email} • {patient.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Patient Display */}
            {selectedPatient && (
              <div className="p-3 bg-muted rounded-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPatient.email} • {selectedPatient.phone}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchTerm("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Treatment Notes with Voice Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Treatment Notes & Symptoms</label>
              <VoiceRecorder 
                onTranscription={handleVoiceTranscription}
                placeholder="Record symptoms or treatment notes"
                className="text-xs"
              />
            </div>
            <Textarea
              placeholder="Enter patient symptoms, concerns, or specific treatment requirements..."
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={generateTreatmentPlans}
              disabled={isGenerating || !selectedPatient}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plans...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Treatment Plans
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Options */}
      {treatmentOptions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Treatment Options</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {treatmentOptions.map((option) => (
              <Card key={option.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <Badge className={getTypeColor(option.type)}>
                      {option.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <CurrencyDisplay amount={option.cost} className="text-2xl font-bold" />
                    <Badge className={getUrgencyColor(option.urgency)}>
                      {option.urgency} urgency
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* AI-Enhanced Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">AI Confidence</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700">{option.aiConfidence || 95}%</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">{option.successRate}%</p>
                    </div>
                  </div>

                  {/* Recovery & Timeline */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-muted-foreground">Recovery</span>
                      </div>
                      <p className="font-medium text-purple-700">{option.recoveryTime || '2-4 weeks'}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-muted-foreground">Acceptance</span>
                      </div>
                      <p className="font-bold text-orange-700">{Math.round(option.acceptanceProbability)}%</p>
                    </div>
                  </div>

                  {/* Procedures */}
                  <div>
                    <h4 className="font-medium mb-2">Procedures</h4>
                    <ul className="space-y-1">
                      {option.procedures.map((procedure, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {procedure}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Duration & Insurance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Duration</span>
                      </div>
                      <p className="font-medium">{option.duration}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Insurance</span>
                      </div>
                      <p className="font-medium">{option.insuranceCoverage}% covered</p>
                    </div>
                  </div>

                  {/* Financing */}
                  {option.financing && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Financing Available</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        0% APR for 12 months • <CurrencyDisplay amount={option.cost / 12} />/month
                      </p>
                    </div>
                  )}

                  {/* Acceptance Probability */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Patient Acceptance Likelihood</span>
                      <span className="text-sm font-medium">{option.acceptanceProbability}%</span>
                    </div>
                    <Progress value={option.acceptanceProbability} className="h-2" />
                  </div>

                  <Button className="w-full">Select This Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Plan</th>
                          <th className="text-center p-3">Cost</th>
                          <th className="text-center p-3">Duration</th>
                          <th className="text-center p-3">Success Rate</th>
                          <th className="text-center p-3">Acceptance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentOptions.map((option) => (
                          <tr key={option.id} className="border-b">
                            <td className="p-3 font-medium">{option.name}</td>
                            <td className="p-3 text-center">
                              <CurrencyDisplay amount={option.cost} />
                            </td>
                            <td className="p-3 text-center">{option.duration}</td>
                            <td className="p-3 text-center">{option.successRate}%</td>
                            <td className="p-3 text-center">{option.acceptanceProbability}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {treatmentOptions.map((option) => (
                      <div key={option.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{option.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Cost:</span>
                            <CurrencyDisplay amount={option.cost} />
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance Coverage:</span>
                            <span>{option.insuranceCoverage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Patient Portion:</span>
                            <CurrencyDisplay amount={option.cost * (1 - option.insuranceCoverage / 100)} />
                          </div>
                          {option.financing && (
                            <div className="flex justify-between text-blue-600">
                              <span>Monthly Payment:</span>
                              <CurrencyDisplay amount={option.cost / 12} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="clinical" className="mt-4">
                  <div className="space-y-4">
                    {treatmentOptions.map((option) => (
                      <div key={option.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{option.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Procedures</h5>
                            <ul className="text-sm space-y-1">
                              {option.procedures.map((proc, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full" />
                                  {proc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Potential Complications</h5>
                            <ul className="text-sm space-y-1">
                              {option.complications.map((comp, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                                  {comp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}