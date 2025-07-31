import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(1);

  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 32,
      avatar: "",
      lastVisit: "2024-01-15",
      conditions: ["Gingivitis", "Cavity"],
      riskLevel: "low"
    },
    {
      id: 2,
      name: "Mike Davis", 
      age: 45,
      avatar: "",
      lastVisit: "2024-01-10",
      conditions: ["Periodontitis", "Crown Replacement"],
      riskLevel: "medium"
    },
    {
      id: 3,
      name: "Emily Chen",
      age: 28,
      avatar: "",
      lastVisit: "2023-12-20", 
      conditions: ["Root Canal", "Wisdom Teeth"],
      riskLevel: "high"
    }
  ];

  const medicalRecords = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Routine Checkup",
      dentist: "Dr. Smith",
      diagnosis: "Mild gingivitis, cavity in tooth #14",
      treatment: "Scaling, filling placement",
      notes: "Patient showed improvement in oral hygiene. Recommend fluoride toothpaste.",
      images: 2,
      status: "completed"
    },
    {
      id: 2,
      date: "2023-11-20",
      type: "Follow-up",
      dentist: "Dr. Johnson",
      diagnosis: "Healing well post-extraction",
      treatment: "Suture removal, wound check",
      notes: "Extraction site healing normally. No complications observed.",
      images: 1,
      status: "completed"
    },
    {
      id: 3,
      date: "2023-10-05",
      type: "Emergency Visit",
      dentist: "Dr. Smith",
      diagnosis: "Severe toothache, infected molar",
      treatment: "Root canal therapy initiated",
      notes: "Patient experienced severe pain. Emergency root canal performed.",
      images: 3,
      status: "in-progress"
    }
  ];

  const medications = [
    { name: "Amoxicillin", dosage: "500mg", frequency: "3x daily", duration: "7 days", prescribed: "2024-01-15" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", duration: "PRN", prescribed: "2024-01-15" },
    { name: "Chlorhexidine", dosage: "0.2%", frequency: "2x daily", duration: "14 days", prescribed: "2023-11-20" }
  ];

  const allergies = ["Penicillin", "Latex"];
  const medicalConditions = ["Diabetes Type 2", "Hypertension"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
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

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

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
          <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl px-6">
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
            {patients.map((patient) => (
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
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">Age {patient.age}</p>
                    <p className={`text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                      {patient.riskLevel} risk
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
                        <AvatarImage src={selectedPatientData.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-lg">
                          {selectedPatientData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedPatientData.name}</h2>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Age: {selectedPatientData.age}</span>
                          <span>Last Visit: {new Date(selectedPatientData.lastVisit).toLocaleDateString()}</span>
                          <span className={`font-medium ${getRiskColor(selectedPatientData.riskLevel)}`}>
                            Risk: {selectedPatientData.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="hover:bg-primary/5 rounded-xl">
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
                  {medicalRecords.map((record, index) => (
                    <Card key={record.id} className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold">{record.type}</h3>
                              <Badge variant="outline" className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {record.dentist}
                              </span>
                              <span className="flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {record.images} images
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
                              <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.diagnosis}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Treatment</p>
                              <p className="text-sm bg-muted/30 p-3 rounded-lg">{record.treatment}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm bg-muted/30 p-3 rounded-lg h-full">{record.notes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                      {medications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <p className="font-semibold">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Prescribed: {new Date(med.prescribed).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
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
                          {allergies.map((allergy, index) => (
                            <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                              {allergy}
                            </Badge>
                          ))}
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
                          {medicalConditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              {condition}
                            </Badge>
                          ))}
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