import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  FileText, 
  Shield, 
  Stethoscope, 
  Camera, 
  CreditCard, 
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Scan,
  MicVocal,
  ClipboardList
} from "lucide-react";

interface ChartingModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
  requiresPatient?: boolean;
}

const chartingModules: ChartingModule[] = [
  {
    id: "appointments",
    title: "Appointments",
    description: "Schedule and manage patient appointments",
    icon: Calendar,
    route: "/schedule",
    color: "bg-blue-500",
    requiresPatient: true
  },
  {
    id: "medical-history",
    title: "Medical History",
    description: "View and manage patient medical history records",
    icon: FileText,
    route: "/medical-history",
    color: "bg-green-500",
    requiresPatient: true
  },
  {
    id: "image-analysis",
    title: "Image Analysis",
    description: "AI-powered dental image analysis",
    icon: Camera,
    route: "/ai/image",
    color: "bg-purple-500",
    requiresPatient: true
  },
  {
    id: "xray-diagnostics",
    title: "X-Ray Diagnostics",
    description: "AI-powered X-ray analysis and diagnostics",
    icon: Scan,
    route: "/xray-diagnostics",
    color: "bg-orange-500",
    requiresPatient: true
  },
  {
    id: "treatment-plans",
    title: "Treatment Plans",
    description: "Create and manage patient treatment plans",
    icon: Stethoscope,
    route: "/treatment-plans",
    color: "bg-indigo-500",
    requiresPatient: true
  },
  {
    id: "consent-forms",
    title: "Consent Forms",
    description: "Manage patient consent forms and documentation",
    icon: Shield,
    route: "/consent-forms",
    color: "bg-cyan-500",
    requiresPatient: true
  },
  {
    id: "chairside-assistant",
    title: "Chairside Assistant",
    description: "AI-powered chairside assistance during treatment",
    icon: ClipboardList,
    route: "/chairside-assistant",
    color: "bg-pink-500",
    requiresPatient: true
  },
  {
    id: "voice-to-chart",
    title: "Voice-to-Chart",
    description: "Convert voice notes to patient charts",
    icon: MicVocal,
    route: "/voice-to-chart",
    color: "bg-teal-500",
    requiresPatient: true
  },
  {
    id: "insurance-billing",
    title: "Insurance & Billing",
    description: "Manage patient insurance and billing",
    icon: CreditCard,
    route: "/insurance-billing",
    color: "bg-yellow-500",
    requiresPatient: true
  }
];

export default function PatientCharting() {
  const { patients, loading, searchPatients } = useOptimizedPatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = patients;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => {
        const status = getPatientStatus(patient);
        return status === statusFilter;
      });
    }

    // Filter by risk level
    if (riskFilter !== "all") {
      filtered = filtered.filter(patient => patient.risk_level === riskFilter);
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, statusFilter, riskFilter]);

  const getPatientStatus = (patient: any) => {
    if (!patient.last_visit) return "new";
    
    const lastVisit = new Date(patient.last_visit);
    const today = new Date();
    const daysSinceLastVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit <= 90) return "active";
    if (daysSinceLastVisit <= 180) return "due";
    return "overdue";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "due": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleModuleClick = (module: ChartingModule) => {
    if (module.requiresPatient && !selectedPatient) {
      // Could show a toast here
      return;
    }
    
    let route = module.route;
    if (module.requiresPatient && selectedPatient) {
      // Some routes might need patient ID in the URL
      if (module.id === "medical-history" || module.id === "treatment-plans") {
        route = `${module.route}?patientId=${selectedPatient.id}`;
      }
    }
    
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Patient Charting Hub</h1>
          <p className="text-muted-foreground">
            Select a patient and navigate to charting modules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Patient
              </CardTitle>
              <CardDescription>
                Choose a patient to access their charting modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => {
                  const status = getPatientStatus(patient);
                  const isSelected = selectedPatient?.id === patient.id;
                  
                  return (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {patient.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(status)}`}
                        >
                          {status}
                        </Badge>
                        {patient.risk_level && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getRiskColor(patient.risk_level)}`}
                          >
                            {patient.risk_level} risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {filteredPatients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charting Modules Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Charting Modules
                {selectedPatient && (
                  <Badge variant="outline" className="ml-2">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedPatient 
                  ? "Click on any module to access patient charting tools"
                  : "Select a patient first to enable charting modules"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {chartingModules.map((module) => {
                  const isDisabled = module.requiresPatient && !selectedPatient;
                  const IconComponent = module.icon;
                  
                  return (
                    <Card 
                      key={module.id}
                      className={`cursor-pointer transition-all hover:shadow-lg border ${
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:border-primary/50 hover:scale-105"
                      }`}
                      onClick={() => !isDisabled && handleModuleClick(module)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm">{module.title}</h3>
                              {!isDisabled && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Quick Actions */}
              {selectedPatient && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Quick Actions for {selectedPatient.first_name}
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                    >
                      View Full Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/schedule?patient=${selectedPatient.id}`)}
                    >
                      Schedule Appointment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/ai/voice?patient=${selectedPatient.id}`)}
                    >
                      Voice Notes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}