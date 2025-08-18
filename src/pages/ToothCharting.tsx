import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import { ToothDiagram } from "@/components/ToothDiagram";
import { ToothDetails } from "@/components/ToothDetails";
import { ChartingHistory } from "@/components/ChartingHistory";
import { TreatmentPlanner } from "@/components/TreatmentPlanner";
import { InnovativeToolbar } from "@/components/InnovativeToolbar";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { 
  Target, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle, 
  Clock,
  Save,
  Printer,
  Share,
  Sparkles,
  TrendingUp,
  Activity,
  Brain
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { ToothData, ChartingEntry } from "@/types/dental";

export default function ToothCharting() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { patients } = useOptimizedPatients();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothData, setToothData] = useState<Record<number, ToothData>>({});
  const [chartingHistory, setChartingHistory] = useState<ChartingEntry[]>([]);
  const [currentCondition, setCurrentCondition] = useState("");
  const [currentTreatment, setCurrentTreatment] = useState("");
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentSeverity, setCurrentSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [showToothImages, setShowToothImages] = useState(true);

  useEffect(() => {
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        loadToothData(patientId);
        loadChartingHistory(patientId);
      }
    }
  }, [patientId, patients]);

  const loadToothData = async (patientId: string) => {
    // Simulate loading existing tooth data
    const mockData: Record<number, ToothData> = {
      18: {
        id: 18,
        number: "18",
        name: "Third Molar",
        quadrant: 1,
        conditions: ["caries"],
        treatments: ["filling"],
        status: "treated",
        severity: "moderate",
        notes: "MOD composite restoration",
        lastUpdated: new Date("2024-01-15")
      },
      11: {
        id: 11,
        number: "11",
        name: "Central Incisor",
        quadrant: 1,
        conditions: ["discoloration"],
        treatments: ["whitening"],
        status: "in_progress",
        severity: "mild",
        notes: "Intrinsic staining, whitening treatment ongoing",
        lastUpdated: new Date("2024-01-20")
      }
    };
    setToothData(mockData);
  };

  const loadChartingHistory = async (patientId: string) => {
    // Simulate loading charting history
    const mockHistory: ChartingEntry[] = [
      {
        id: "1",
        toothNumber: 18,
        condition: "caries",
        treatment: "composite_filling",
        severity: "moderate",
        notes: "MOD cavity restored with composite",
        date: new Date("2024-01-15"),
        dentistId: "doc1",
        dentistName: "Dr. Smith"
      },
      {
        id: "2",
        toothNumber: 11,
        condition: "discoloration",
        treatment: "whitening",
        severity: "mild",
        notes: "Started whitening treatment",
        date: new Date("2024-01-20"),
        dentistId: "doc1",
        dentistName: "Dr. Smith"
      }
    ];
    setChartingHistory(mockHistory);
  };

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    const tooth = toothData[toothNumber];
    if (tooth) {
      setCurrentCondition(tooth.conditions[0] || "");
      setCurrentTreatment(tooth.treatments[0] || "");
      setCurrentNotes(tooth.notes || "");
      setCurrentSeverity(tooth.severity || "mild");
    } else {
      setCurrentCondition("");
      setCurrentTreatment("");
      setCurrentNotes("");
      setCurrentSeverity("mild");
    }
  };

  const handleSaveChart = () => {
    if (!selectedTooth || !currentCondition) {
      toast.error("Please select a tooth and specify a condition");
      return;
    }

    const newEntry: ChartingEntry = {
      id: Date.now().toString(),
      toothNumber: selectedTooth,
      condition: currentCondition,
      treatment: currentTreatment,
      severity: currentSeverity,
      notes: currentNotes,
      date: new Date(),
      dentistId: "current-user",
      dentistName: "Current Dentist"
    };

    setChartingHistory(prev => [newEntry, ...prev]);

    const updatedTooth: ToothData = {
      id: selectedTooth,
      number: selectedTooth.toString(),
      name: getToothName(selectedTooth),
      quadrant: Math.ceil(selectedTooth / 10),
      conditions: currentCondition ? [currentCondition] : [],
      treatments: currentTreatment ? [currentTreatment] : [],
      status: currentTreatment ? "in_progress" : "diagnosed",
      severity: currentSeverity,
      notes: currentNotes,
      lastUpdated: new Date()
    };

    setToothData(prev => ({
      ...prev,
      [selectedTooth]: updatedTooth
    }));

    toast.success("Chart entry saved successfully");
    
    // Clear form
    setCurrentCondition("");
    setCurrentTreatment("");
    setCurrentNotes("");
    setCurrentSeverity("mild");
  };

  const getToothName = (number: number): string => {
    const toothNames: Record<number, string> = {
      18: "Third Molar", 17: "Second Molar", 16: "First Molar", 15: "Second Premolar",
      14: "First Premolar", 13: "Canine", 12: "Lateral Incisor", 11: "Central Incisor",
      21: "Central Incisor", 22: "Lateral Incisor", 23: "Canine", 24: "First Premolar",
      25: "Second Premolar", 26: "First Molar", 27: "Second Molar", 28: "Third Molar",
      38: "Third Molar", 37: "Second Molar", 36: "First Molar", 35: "Second Premolar",
      34: "First Premolar", 33: "Canine", 32: "Lateral Incisor", 31: "Central Incisor",
      41: "Central Incisor", 42: "Lateral Incisor", 43: "Canine", 44: "First Premolar",
      45: "Second Premolar", 46: "First Molar", 47: "Second Molar", 48: "Third Molar"
    };
    return toothNames[number] || "Unknown";
  };

  const getConditionCount = (severity: string) => {
    return chartingHistory.filter(entry => entry.severity === severity).length;
  };

  if (!selectedPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <Target className="h-6 w-6" />
              Tooth Charting
            </CardTitle>
            <CardDescription>
              Please select a patient to access their dental chart
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Target className="h-8 w-8" />
              Tooth Charting
            </h1>
            <p className="text-muted-foreground">
              Digital dental charting for {selectedPatient.first_name} {selectedPatient.last_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Chart
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getConditionCount("severe")}</p>
                  <p className="text-sm text-muted-foreground">Severe Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getConditionCount("moderate")}</p>
                  <p className="text-sm text-muted-foreground">Moderate Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.values(toothData).filter(t => t.status === "treated").length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{chartingHistory.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Tooth Diagram - Takes up 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="professional-card border-primary/20 overflow-hidden">
              <CardHeader className="bg-gradient-subtle">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interactive Tooth Diagram
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    AI-Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Click on teeth for detailed analysis and smart charting
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={showToothImages ? "images" : "simple"} onValueChange={(value) => setShowToothImages(value === "images")}>
                  <div className="px-6 pt-4 pb-2 bg-gradient-subtle border-b">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="images" className="flex items-center gap-2">
                        📷 Realistic Images
                      </TabsTrigger>
                      <TabsTrigger value="simple" className="flex items-center gap-2">
                        📊 Simple View
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="images" className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 m-0">
                    <ToothDiagram
                      toothData={toothData}
                      selectedTooth={selectedTooth}
                      onToothSelect={handleToothSelect}
                      showImages={true}
                    />
                  </TabsContent>
                  
                  <TabsContent value="simple" className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 m-0">
                    <ToothDiagram
                      toothData={toothData}
                      selectedTooth={selectedTooth}
                      onToothSelect={handleToothSelect}
                      showImages={false}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Predictive Analytics */}
            <PredictiveAnalytics 
              toothData={toothData}
              selectedTooth={selectedTooth}
            />
          </div>

          {/* Side Panels */}
          <div className="xl:col-span-2 space-y-6">
            {/* Innovative Toolbar */}
            <InnovativeToolbar
              selectedTooth={selectedTooth}
              onAIAnalysis={() => toast.success("AI analysis initiated")}
              onVoiceCommand={() => {}}
              onImageCapture={() => {}}
              on3DToggle={() => toast.info("3D visualization mode activated")}
              onARMode={() => toast.info("AR mode requires compatible device")}
            />
            
            {/* Chart Entry Panel */}
            <Card className="professional-card border-success/20">
              <CardHeader className="bg-gradient-to-r from-success/5 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Smart Chart Entry
                  {selectedTooth && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Tooth {selectedTooth}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-assisted charting with smart suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condition" className="flex items-center gap-2">
                    <span>Condition</span>
                    {selectedTooth && (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Select value={currentCondition} onValueChange={setCurrentCondition}>
                    <SelectTrigger className="border-primary/20 focus:border-primary hover:border-primary/40 transition-colors">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caries">🦷 Caries</SelectItem>
                      <SelectItem value="filling">🔧 Existing Filling</SelectItem>
                      <SelectItem value="crown">👑 Crown</SelectItem>
                      <SelectItem value="bridge">🌉 Bridge</SelectItem>
                      <SelectItem value="implant">⚡ Implant</SelectItem>
                      <SelectItem value="extraction">❌ Extraction Needed</SelectItem>
                      <SelectItem value="root_canal">🩺 Root Canal</SelectItem>
                      <SelectItem value="periodontal">🦠 Periodontal Disease</SelectItem>
                      <SelectItem value="discoloration">🎨 Discoloration</SelectItem>
                      <SelectItem value="fracture">💥 Fracture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment" className="flex items-center gap-2">
                    <span>Treatment</span>
                    <Badge variant="outline" className="text-xs bg-info/10 text-info border-info/20">
                      Smart Match
                    </Badge>
                  </Label>
                  <Select value={currentTreatment} onValueChange={setCurrentTreatment}>
                    <SelectTrigger className="border-primary/20 focus:border-primary hover:border-primary/40 transition-colors">
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="composite_filling">🔧 Composite Filling</SelectItem>
                      <SelectItem value="amalgam_filling">⚙️ Amalgam Filling</SelectItem>
                      <SelectItem value="crown_prep">👑 Crown Preparation</SelectItem>
                      <SelectItem value="root_canal">🩺 Root Canal Treatment</SelectItem>
                      <SelectItem value="extraction">❌ Extraction</SelectItem>
                      <SelectItem value="implant_placement">⚡ Implant Placement</SelectItem>
                      <SelectItem value="cleaning">✨ Professional Cleaning</SelectItem>
                      <SelectItem value="whitening">🎨 Whitening</SelectItem>
                      <SelectItem value="scaling">🦠 Scaling & Root Planing</SelectItem>
                      <SelectItem value="observation">👁️ Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Assessment</Label>
                  <Select value={currentSeverity} onValueChange={(value: "mild" | "moderate" | "severe") => setCurrentSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">🟢 Mild</SelectItem>
                      <SelectItem value="moderate">🟡 Moderate</SelectItem>
                      <SelectItem value="severe">🔴 Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add clinical notes... (Voice recognition available)"
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    rows={3}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <Button 
                  onClick={handleSaveChart} 
                  className="w-full btn-gradient hover:scale-105 transition-all duration-300"
                  disabled={!selectedTooth || !currentCondition}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Chart Entry
                  <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                </Button>
              </CardContent>
            </Card>

            {/* Tooth Details */}
            {selectedTooth && (
              <div className="animate-slide-in-right">
                <ToothDetails
                  tooth={toothData[selectedTooth]}
                  toothNumber={selectedTooth}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tabbed Content */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-subtle">
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📊 Charting History
            </TabsTrigger>
            <TabsTrigger value="treatment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🗓️ Treatment Plan
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📈 Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🧠 AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <ChartingHistory
              entries={chartingHistory}
              onEditEntry={(entry) => {
                setSelectedTooth(entry.toothNumber);
                setCurrentCondition(entry.condition);
                setCurrentTreatment(entry.treatment);
                setCurrentNotes(entry.notes);
                setCurrentSeverity(entry.severity);
              }}
            />
          </TabsContent>

          <TabsContent value="treatment" className="animate-fade-in">
            <TreatmentPlanner
              toothData={toothData}
              chartingHistory={chartingHistory}
              patientId={selectedPatient.id}
            />
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="professional-card border-primary/20">
                <CardHeader className="bg-gradient-subtle">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Dental Health Overview
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of dental conditions and treatment progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <p className="text-3xl font-bold text-primary animate-pulse">{Object.keys(toothData).length}</p>
                      <p className="text-sm text-muted-foreground">Teeth with Records</p>
                      <div className="mt-2 w-full bg-primary/20 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(Object.keys(toothData).length / 32) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
                      <p className="text-3xl font-bold text-success animate-pulse">
                        {Math.round((Object.values(toothData).filter(t => t.status === "treated").length / Object.keys(toothData).length) * 100) || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Treatment Complete</p>
                      <div className="mt-2 w-full bg-success/20 rounded-full h-2">
                        <div className="bg-success h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.round((Object.values(toothData).filter(t => t.status === "treated").length / Object.keys(toothData).length) * 100) || 0}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold">Risk Distribution</h4>
                    <div className="space-y-2">
                      {["severe", "moderate", "mild"].map(severity => {
                        const count = Object.values(toothData).filter(t => t.severity === severity).length;
                        const percentage = count > 0 ? (count / Object.keys(toothData).length) * 100 : 0;
                        return (
                          <div key={severity} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              severity === "severe" ? "bg-destructive" :
                              severity === "moderate" ? "bg-warning" : "bg-success"
                            }`} />
                            <span className="text-sm capitalize flex-1">{severity}</span>
                            <span className="text-sm font-medium">{count} teeth</span>
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  severity === "severe" ? "bg-destructive" :
                                  severity === "moderate" ? "bg-warning" : "bg-success"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card border-info/20">
                <CardHeader className="bg-gradient-subtle">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-info" />
                    Treatment Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20">
                      <p className="text-2xl font-bold text-warning">
                        {Object.values(toothData).filter(t => t.status === "in_progress").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Treatments in Progress</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Next Appointments Needed</h4>
                      <div className="space-y-2">
                        {Object.values(toothData)
                          .filter(t => t.status === "in_progress")
                          .slice(0, 3)
                          .map((tooth, index) => (
                            <div key={tooth.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm">Tooth {tooth.number}</span>
                              <Badge variant="outline" className="text-xs">
                                {tooth.treatments[0]?.replace("_", " ") || "Follow-up"}
                              </Badge>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="professional-card border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary animate-pulse" />
                    AI Health Score
                  </CardTitle>
                  <CardDescription>
                    Comprehensive dental health assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {85 - (Object.values(toothData).filter(t => t.severity === "severe").length * 20)}
                    </div>
                    <p className="text-lg font-medium">Overall Health Score</p>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Good Health
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Preventive Care</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Treatment Compliance</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Management</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card border-warning/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Smart Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 animate-pulse">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="font-medium text-sm">High Priority</span>
                    </div>
                    <p className="text-sm">Tooth 18 requires immediate attention - severe caries detected</p>
                  </div>
                  
                  <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-info" />
                      <span className="font-medium text-sm">Scheduling</span>
                    </div>
                    <p className="text-sm">3 teeth require follow-up appointments within 30 days</p>
                  </div>
                  
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="font-medium text-sm">Treatment Success</span>
                    </div>
                    <p className="text-sm">Recent restorations showing excellent healing progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}