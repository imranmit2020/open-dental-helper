import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CreditCard,
  Brain,
  MessageCircle,
  ChevronLeft,
  Plus,
  Download,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Stethoscope,
  Pill
} from "lucide-react";

export default function PatientProfile() {
  const { id } = useParams();
  
  // Mock patient data - would come from database
  const patient = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    age: 32,
    nextAppointment: "2024-02-01 10:30 AM",
    lastVisit: "2024-01-15",
    status: "active",
    riskLevel: "low",
    avatar: "",
    insurance: "Delta Dental",
    address: "123 Main St, Boston, MA 02101",
    emergencyContact: "John Johnson - (555) 987-6543"
  };

  const treatments = [
    { id: 1, date: "2024-01-15", procedure: "Dental Cleaning", status: "completed", cost: "$120" },
    { id: 2, date: "2024-02-01", procedure: "Crown Replacement", status: "scheduled", cost: "$850" },
    { id: 3, date: "2024-02-15", procedure: "Follow-up", status: "pending", cost: "$75" }
  ];

  const insuranceClaims = [
    { id: 1, date: "2024-01-15", amount: "$120", status: "approved", claimNumber: "CLM-2024-001" },
    { id: 2, date: "2024-01-10", amount: "$350", status: "pending", claimNumber: "CLM-2024-002" },
    { id: 3, date: "2023-12-20", amount: "$200", status: "rejected", claimNumber: "CLM-2023-089" }
  ];

  const aiSuggestions = [
    {
      id: 1,
      type: "treatment",
      priority: "high",
      title: "Crown Recommended - Tooth #14",
      description: "Based on X-ray analysis, significant decay detected. Recommend crown placement within 30 days.",
      confidence: 89
    },
    {
      id: 2,
      type: "prevention", 
      priority: "medium",
      title: "Gum Health Alert",
      description: "Early signs of gingivitis detected. Recommend more frequent cleanings and improved oral hygiene.",
      confidence: 76
    }
  ];

  const communications = [
    { id: 1, type: "call", date: "2024-01-20", content: "Reminder call for upcoming appointment", status: "completed" },
    { id: 2, type: "sms", date: "2024-01-18", content: "Appointment confirmation sent", status: "delivered" },
    { id: 3, type: "email", date: "2024-01-15", content: "Post-treatment care instructions", status: "opened" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "approved": return "bg-success/10 text-success border-success/20";
      case "scheduled": case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "rejected": case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 space-y-6">
      {/* Header with patient info */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-border/50 shadow-xl animate-scale-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-2xl">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold">{patient.name}</h1>
                  <Badge variant="outline" className={`${getStatusColor(patient.status)} font-medium px-3 py-1`}>
                    {patient.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age {patient.age}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next: {patient.nextAppointment}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {patient.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col gap-3">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
              <Button variant="outline" className="hover:bg-primary/5">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" className="hover:bg-primary/5">
                <DollarSign className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="hover:bg-primary/5">
                <Send className="h-4 w-4 mr-2" />
                Send Consent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="animate-fade-in">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/30 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-background">Insurance & Billing</TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="data-[state=active]:bg-background">AI Suggestions</TabsTrigger>
          <TabsTrigger value="communication" className="data-[state=active]:bg-background">Communication</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Treatment Summary */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Treatment History
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold">{treatment.procedure}</p>
                      <p className="text-sm text-muted-foreground">{treatment.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(treatment.status)}>
                        {treatment.status}
                      </Badge>
                      <span className="font-semibold text-primary">{treatment.cost}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Procedures */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-warning/30 bg-warning/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">Crown Replacement</p>
                      <p className="text-sm text-muted-foreground">February 1, 2024 at 10:30 AM</p>
                      <p className="text-xs text-warning">⚠️ Pre-medication required</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-primary">$850</p>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-border/50 rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">Follow-up Checkup</p>
                      <p className="text-sm text-muted-foreground">February 15, 2024 at 2:00 PM</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-primary">$75</p>
                      <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/20">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insurance & Billing Tab */}
        <TabsContent value="insurance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insurance Info */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">Delta Dental PPO</p>
                      <p className="text-sm text-muted-foreground">Member ID: DD123456789</p>
                      <p className="text-sm text-muted-foreground">Group: 00123</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-success/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Annual Max</p>
                        <p className="font-semibold">$1,500</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Used</p>
                        <p className="font-semibold">$420</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-semibold text-success">$1,080</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductible</p>
                        <p className="font-semibold">$50 (Met)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claims History */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Recent Claims
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {insuranceClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{claim.claimNumber}</p>
                      <p className="text-xs text-muted-foreground">{claim.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{claim.amount}</span>
                      <Badge variant="outline" className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="space-y-6 mt-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Treatment Recommendations
              </CardTitle>
              <CardDescription>
                Based on X-ray analysis and treatment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-6 border border-border/50 rounded-lg bg-gradient-to-r from-muted/10 to-accent/5 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${getPriorityColor(suggestion.priority)}`} />
                        <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                        <Badge variant="outline" className={`${getPriorityColor(suggestion.priority)} border-current`}>
                          {suggestion.priority} priority
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{suggestion.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">AI Confidence:</span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${suggestion.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{suggestion.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        Review X-ray
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6 mt-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Communication Log
                </CardTitle>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {communications.map((comm) => (
                <div key={comm.id} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {comm.type === 'call' && <Phone className="h-4 w-4 text-primary" />}
                    {comm.type === 'sms' && <MessageCircle className="h-4 w-4 text-primary" />}
                    {comm.type === 'email' && <Mail className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold capitalize">{comm.type}</p>
                    <p className="text-sm text-muted-foreground">{comm.content}</p>
                    <p className="text-xs text-muted-foreground">{comm.date}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(comm.status)}>
                    {comm.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}