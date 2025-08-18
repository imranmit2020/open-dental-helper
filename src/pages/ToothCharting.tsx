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
import { 
  Target, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle, 
  Clock,
  Save,
  Printer,
  Share
} from "lucide-react";
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tooth Diagram */}
          <div className="lg:col-span-2">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tooth Diagram
                </CardTitle>
                <CardDescription>
                  Click on a tooth to view details and add charting entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ToothDiagram
                  toothData={toothData}
                  selectedTooth={selectedTooth}
                  onToothSelect={handleToothSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Charting Panel */}
          <div className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chart Entry
                  {selectedTooth && (
                    <Badge variant="outline">Tooth {selectedTooth}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={currentCondition} onValueChange={setCurrentCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caries">Caries</SelectItem>
                      <SelectItem value="filling">Existing Filling</SelectItem>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="bridge">Bridge</SelectItem>
                      <SelectItem value="implant">Implant</SelectItem>
                      <SelectItem value="extraction">Extraction Needed</SelectItem>
                      <SelectItem value="root_canal">Root Canal</SelectItem>
                      <SelectItem value="periodontal">Periodontal Disease</SelectItem>
                      <SelectItem value="discoloration">Discoloration</SelectItem>
                      <SelectItem value="fracture">Fracture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Select value={currentTreatment} onValueChange={setCurrentTreatment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="composite_filling">Composite Filling</SelectItem>
                      <SelectItem value="amalgam_filling">Amalgam Filling</SelectItem>
                      <SelectItem value="crown_prep">Crown Preparation</SelectItem>
                      <SelectItem value="root_canal">Root Canal Treatment</SelectItem>
                      <SelectItem value="extraction">Extraction</SelectItem>
                      <SelectItem value="implant_placement">Implant Placement</SelectItem>
                      <SelectItem value="cleaning">Professional Cleaning</SelectItem>
                      <SelectItem value="whitening">Whitening</SelectItem>
                      <SelectItem value="scaling">Scaling & Root Planing</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={currentSeverity} onValueChange={(value: "mild" | "moderate" | "severe") => setCurrentSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add clinical notes..."
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSaveChart} 
                  className="w-full btn-gradient"
                  disabled={!selectedTooth || !currentCondition}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Chart Entry
                </Button>
              </CardContent>
            </Card>

            {selectedTooth && (
              <ToothDetails
                tooth={toothData[selectedTooth]}
                toothNumber={selectedTooth}
              />
            )}
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Charting History</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

          <TabsContent value="treatment">
            <TreatmentPlanner
              toothData={toothData}
              chartingHistory={chartingHistory}
              patientId={selectedPatient.id}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Dental Analytics</CardTitle>
                <CardDescription>
                  Overview of dental conditions and treatment progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{Object.keys(toothData).length}</p>
                    <p className="text-sm text-muted-foreground">Teeth with Records</p>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      {Math.round((Object.values(toothData).filter(t => t.status === "treated").length / Object.keys(toothData).length) * 100) || 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Treatment Complete</p>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <p className="text-2xl font-bold text-warning">
                      {Object.values(toothData).filter(t => t.status === "in_progress").length}
                    </p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}