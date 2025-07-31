import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewPatientForm from "@/components/NewPatientForm";
import { 
  Search, 
  Plus, 
  Filter,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([

    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-02-01",
      status: "active",
      riskLevel: "low",
      avatar: "",
      age: 32,
      insurance: "Delta Dental"
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike.davis@email.com",
      phone: "(555) 234-5678",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-25",
      status: "treatment",
      riskLevel: "medium",
      avatar: "",
      age: 45,
      insurance: "MetLife"
    },
    {
      id: 3,
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "(555) 345-6789",
      lastVisit: "2023-12-20",
      nextAppointment: null,
      status: "overdue",
      riskLevel: "high",
      avatar: "",
      age: 28,
      insurance: "Cigna"
    },
    {
      id: 4,
      name: "Robert Wilson",
      email: "robert.wilson@email.com",
      phone: "(555) 456-7890",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-02-05",
      status: "active",
      riskLevel: "low",
      avatar: "",
      age: 38,
      insurance: "Aetna"
    }
  ]);

  const handlePatientAdded = (newPatient: any) => {
    setPatients(prev => [...prev, newPatient]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "treatment": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
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
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 space-y-8">
      {/* Animated Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Patient Management
          </h1>
          <p className="text-muted-foreground text-lg">Manage your patient records with AI-powered insights</p>
        </div>
        <NewPatientForm onPatientAdded={handlePatientAdded} />
      </div>

      {/* Enhanced Search Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-scale-in">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <Button variant="outline" className="h-12 px-6 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 rounded-xl">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Patients</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">1,247</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1 h-1 bg-success rounded-full"></span>
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Active Treatments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-500 bg-clip-text text-transparent">32</p>
                <p className="text-xs text-warning flex items-center gap-1">
                  <span className="w-1 h-1 bg-warning rounded-full"></span>
                  4 urgent cases
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Overdue Checkups</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent">18</p>
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">This Month</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">156</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1 h-1 bg-success rounded-full"></span>
                  Appointments completed
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Patient List */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-scale-in">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Patient Records
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {filteredPatients.length} patients found • AI-powered insights available
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">Export</Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">Import</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="group flex items-center justify-between p-6 border border-border/50 rounded-2xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-accent/5 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg group-hover:ring-primary/30 transition-all duration-300">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-lg">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{patient.name}</h3>
                    <Badge variant="outline" className={`${getStatusColor(patient.status)} font-medium px-3 py-1`}>
                      {patient.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <span className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </span>
                    <span className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                      {patient.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Age</p>
                  <p className="text-lg font-bold">{patient.age}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Last Visit</p>
                  <p className="text-sm font-semibold">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Risk Level</p>
                  <p className={`text-sm font-bold ${getRiskColor(patient.riskLevel)} uppercase tracking-wide`}>
                    {patient.riskLevel}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Insurance</p>
                  <p className="text-sm font-semibold">{patient.insurance}</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}