import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import { useModulePermissions, type ModuleKey } from "@/hooks/useModulePermissions";
import { useModuleFavorites } from "@/hooks/useModuleFavorites";
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
  ClipboardList,
  Brain,
  Cpu,
  Zap,
  TrendingUp,
  Eye,
  Microscope,
  Activity,
  Sparkles,
  Star,
  StarOff,
  Target
} from "lucide-react";

interface ChartingModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
  requiresPatient?: boolean;
  moduleKey?: ModuleKey;
}

const chartingModules: ChartingModule[] = [
  {
    id: "appointments",
    title: "Appointments",
    description: "Schedule and manage patient appointments",
    icon: Calendar,
    route: "/schedule",
    color: "bg-blue-500",
    requiresPatient: true,
    moduleKey: "schedule"
  },
  {
    id: "medical-history",
    title: "Medical History",
    description: "View and manage patient medical history records",
    icon: FileText,
    route: "/medical-history",
    color: "bg-green-500",
    requiresPatient: true,
    moduleKey: "medical_history"
  },
  {
    id: "tooth-charting",
    title: "Tooth Charting",
    description: "Interactive digital tooth charting and treatment tracking",
    icon: Target,
    route: "/tooth-charting",
    color: "bg-blue-600",
    requiresPatient: true,
    moduleKey: "tooth_charting"
  },
  {
    id: "xray-diagnostics",
    title: "X-Ray Diagnostics",
    description: "AI-powered X-ray analysis and diagnostics",
    icon: Scan,
    route: "/xray-diagnostics",
    color: "bg-purple-500",
    requiresPatient: true,
    moduleKey: "xray_diagnostics"
  },
  {
    id: "image-analysis",
    title: "Image Analysis",
    description: "AI-powered dental image analysis",
    icon: Camera,
    route: "/ai/image",
    color: "bg-orange-500",
    requiresPatient: true,
    moduleKey: "image_analysis"
  },
  {
    id: "treatment-plans",
    title: "Treatment Plans",
    description: "Create and manage patient treatment plans",
    icon: Stethoscope,
    route: "/treatment-plans",
    color: "bg-indigo-500",
    requiresPatient: true,
    moduleKey: "treatment_plans"
  },
  {
    id: "consent-forms",
    title: "Consent Forms",
    description: "Manage patient consent forms and documentation",
    icon: Shield,
    route: "/consent-forms",
    color: "bg-cyan-500",
    requiresPatient: true,
    moduleKey: "consent_forms"
  },
  {
    id: "chairside-assistant",
    title: "Chairside Assistant",
    description: "AI-powered chairside assistance during treatment",
    icon: ClipboardList,
    route: "/chairside-assistant",
    color: "bg-pink-500",
    requiresPatient: true,
    moduleKey: "chairside_assistant"
  },
  {
    id: "voice-to-chart",
    title: "Voice-to-Chart",
    description: "Convert voice notes to patient charts",
    icon: MicVocal,
    route: "/voice-to-chart",
    color: "bg-teal-500",
    requiresPatient: true,
    moduleKey: "voice_to_chart"
  },
  {
    id: "insurance-billing",
    title: "Insurance & Billing",
    description: "Manage patient insurance and billing",
    icon: CreditCard,
    route: "/insurance-billing",
    color: "bg-yellow-500",
    requiresPatient: true,
    moduleKey: "insurance_billing"
  },
  {
    id: "voice-transcription",
    title: "Voice Transcription",
    description: "AI-powered voice note transcription",
    icon: MicVocal,
    route: "/ai/voice",
    color: "bg-emerald-500",
    requiresPatient: true,
    moduleKey: "voice_transcription"
  },
  {
    id: "voice-agent",
    title: "Voice Agent",
    description: "AI voice assistant for patient interactions",
    icon: Brain,
    route: "/ai/agent",
    color: "bg-violet-500",
    requiresPatient: true,
    moduleKey: "voice_agent"
  },
  {
    id: "translation",
    title: "Translation",
    description: "Multi-language translation services",
    icon: Brain,
    route: "/ai/translation",
    color: "bg-rose-500",
    requiresPatient: true,
    moduleKey: "translation"
  },
  {
    id: "ai-patient-analytics",
    title: "AI Patient Analytics",
    description: "Real-time risk assessment and predictive insights",
    icon: Brain,
    route: "/ai/patient-analytics",
    color: "bg-violet-600",
    requiresPatient: true
  },
  {
    id: "3d-dental-modeling",
    title: "3D Dental Modeling",
    description: "Interactive 3D tooth visualization and treatment simulation",
    icon: Cpu,
    route: "/3d-dental-modeling",
    color: "bg-emerald-600",
    requiresPatient: true
  },
  {
    id: "smart-documentation",
    title: "Smart Documentation",
    description: "AI-powered auto-completion and intelligent templating",
    icon: Zap,
    route: "/smart-documentation",
    color: "bg-amber-500",
    requiresPatient: true
  },
  {
    id: "patient-journey-tracker",
    title: "Patient Journey Tracker",
    description: "Visual timeline with predictive treatment outcomes",
    icon: TrendingUp,
    route: "/patient-journey",
    color: "bg-rose-600",
    requiresPatient: true
  },
  {
    id: "real-time-monitoring",
    title: "Real-time Monitoring",
    description: "Live vital signs and procedure monitoring",
    icon: Activity,
    route: "/real-time-monitoring",
    color: "bg-sky-500",
    requiresPatient: true
  },
  {
    id: "ar-treatment-preview",
    title: "AR Treatment Preview",
    description: "Augmented reality treatment visualization",
    icon: Eye,
    route: "/ar-treatment-preview",
    color: "bg-fuchsia-500",
    requiresPatient: true
  },
  {
    id: "microscopic-analysis",
    title: "Microscopic Analysis",
    description: "AI-enhanced microscopic imaging and analysis",
    icon: Microscope,
    route: "/microscopic-analysis",
    color: "bg-slate-500",
    requiresPatient: true
  },
  {
    id: "predictive-treatment",
    title: "Predictive Treatment AI",
    description: "Machine learning treatment outcome predictions",
    icon: Sparkles,
    route: "/predictive-treatment",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    requiresPatient: true
  }
];

export default function PatientCharting() {
  const { patients, loading, searchPatients } = useOptimizedPatients();
  const { canAccessModule } = useModulePermissions();
  const { favorites, isFavorite, toggleFavorite } = useModuleFavorites();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  // Filter modules based on permissions and favorites
  const getFilteredModules = () => {
    let filtered = chartingModules.filter(module => {
      // Check module permissions if moduleKey exists
      if (module.moduleKey && !canAccessModule(module.moduleKey)) {
        return false;
      }
      return true;
    });

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(module => isFavorite(module.id));
    }

    return filtered;
  };

  const filteredModules = getFilteredModules();

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
              <CardDescription className="flex items-center justify-between">
                <span>
                  {selectedPatient 
                    ? "Click on any module to access patient charting tools"
                    : "Select a patient first to enable charting modules"
                  }
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="ml-4"
                >
                  {showFavoritesOnly ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Show All
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Favorites Only
                    </>
                  )}
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredModules.map((module) => {
                  const isDisabled = module.requiresPatient && !selectedPatient;
                  const IconComponent = module.icon;
                  const moduleIsFavorite = isFavorite(module.id);
                  
                  return (
                    <Card 
                      key={module.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed border-gray-200" 
                          : "hover:border-primary/50 hover:scale-105 hover:shadow-2xl border-gray-200 hover:border-primary"
                      } group relative`}
                      onClick={() => !isDisabled && handleModuleClick(module)}
                    >
                      <CardContent className="p-4 relative overflow-hidden">
                        {/* Background gradient overlay for innovation effect */}
                        {!isDisabled && (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        
                        {/* Favorite toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(module.id);
                          }}
                        >
                          {moduleIsFavorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <div className="flex items-start gap-3 relative z-10">
                          <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors duration-300">{module.title}</h3>
                              {!isDisabled && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
                              {module.description}
                            </p>
                            
                            {/* AI-powered badges for all innovative modules */}
                            {["xray-diagnostics", "image-analysis", "chairside-assistant", "voice-to-chart", "voice-transcription", "voice-agent", "translation", "ai-patient-analytics", "3d-dental-modeling", "smart-documentation", "patient-journey-tracker", "real-time-monitoring", "ar-treatment-preview", "microscopic-analysis", "predictive-treatment"].includes(module.id) && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {["ai-patient-analytics", "3d-dental-modeling", "smart-documentation", "patient-journey-tracker", "real-time-monitoring", "ar-treatment-preview", "microscopic-analysis", "predictive-treatment"].includes(module.id) ? "Next-Gen AI" : "AI-Powered"}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Next-Gen AI Features Showcase */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold text-purple-700">🚀 Next-Generation AI Features</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 animate-fade-in">
                    <h5 className="font-medium text-purple-800 mb-2">🧠 AI Patient Analytics</h5>
                    <p className="text-purple-600 text-xs">Real-time risk assessment with predictive modeling for early intervention</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 animate-fade-in">
                    <h5 className="font-medium text-blue-800 mb-2">🦷 3D Dental Modeling</h5>
                    <p className="text-blue-600 text-xs">Interactive 3D visualization for precise treatment planning</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 animate-fade-in">
                    <h5 className="font-medium text-green-800 mb-2">⚡ Smart Documentation</h5>
                    <p className="text-green-600 text-xs">AI-powered auto-completion reduces charting time by 70%</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200 animate-fade-in">
                    <h5 className="font-medium text-orange-800 mb-2">📊 Patient Journey Tracker</h5>
                    <p className="text-orange-600 text-xs">Visual timeline with predictive treatment outcomes</p>
                  </div>
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-lg border border-sky-200 animate-fade-in">
                    <h5 className="font-medium text-sky-800 mb-2">📱 Real-time Monitoring</h5>
                    <p className="text-sky-600 text-xs">Live vital signs and procedure monitoring</p>
                  </div>
                  <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 p-4 rounded-lg border border-fuchsia-200 animate-fade-in">
                    <h5 className="font-medium text-fuchsia-800 mb-2">🥽 AR Treatment Preview</h5>
                    <p className="text-fuchsia-600 text-xs">Augmented reality treatment visualization</p>
                  </div>
                </div>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                      onClick={() => navigate(`/ai/patient-analytics?patient=${selectedPatient.id}`)}
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      AI Insights
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