import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Send, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ReferralProvider {
  id: string;
  name: string;
  specialty: string;
  practice: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  responseTime: string;
  acceptanceRate: number;
  networkStatus: "active" | "pending" | "inactive";
}

interface ReferralCase {
  id: string;
  patientName: string;
  patientAge: number;
  specialty: string;
  urgency: "routine" | "urgent" | "emergency";
  description: string;
  referredTo: string;
  referredBy: string;
  status: "pending" | "accepted" | "completed" | "declined";
  dateReferred: string;
  appointmentDate?: string;
  notes?: string;
}

export default function ReferralNetwork() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [newReferralOpen, setNewReferralOpen] = useState(false);

  const [providers] = useState<ReferralProvider[]>([
    {
      id: "1",
      name: "Dr. Sarah Mitchell",
      specialty: "Orthodontics",
      practice: "Smile Orthodontics",
      location: "Downtown Medical Center",
      phone: "(555) 123-4567",
      email: "s.mitchell@smileortho.com",
      rating: 4.9,
      responseTime: "< 24 hours",
      acceptanceRate: 95,
      networkStatus: "active"
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Oral Surgery",
      practice: "Precision Oral Surgery",
      location: "Westside Medical Plaza",
      phone: "(555) 234-5678",
      email: "m.chen@precisionsurgery.com",
      rating: 4.8,
      responseTime: "< 12 hours",
      acceptanceRate: 88,
      networkStatus: "active"
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Periodontics",
      practice: "Advanced Periodontal Care",
      location: "North Health Campus",
      phone: "(555) 345-6789",
      email: "e.rodriguez@advancedperio.com",
      rating: 4.7,
      responseTime: "< 2 hours",
      acceptanceRate: 92,
      networkStatus: "active"
    },
    {
      id: "4",
      name: "Dr. James Wilson",
      specialty: "Endodontics",
      practice: "Root Canal Specialists",
      location: "Central Dental Hub",
      phone: "(555) 456-7890",
      email: "j.wilson@rootcanal.com",
      rating: 4.6,
      responseTime: "< 6 hours",
      acceptanceRate: 90,
      networkStatus: "pending"
    }
  ]);

  const [referralCases] = useState<ReferralCase[]>([
    {
      id: "1",
      patientName: "Emma Johnson",
      patientAge: 14,
      specialty: "Orthodontics",
      urgency: "routine",
      description: "Class II malocclusion, requires comprehensive orthodontic treatment",
      referredTo: "Dr. Sarah Mitchell",
      referredBy: "Dr. John Smith",
      status: "accepted",
      dateReferred: "2024-01-15",
      appointmentDate: "2024-01-25",
      notes: "Initial consultation scheduled"
    },
    {
      id: "2",
      patientName: "Robert Davis",
      patientAge: 45,
      specialty: "Oral Surgery",
      urgency: "urgent",
      description: "Impacted wisdom tooth with infection, extraction needed",
      referredTo: "Dr. Michael Chen",
      referredBy: "Dr. John Smith",
      status: "pending",
      dateReferred: "2024-01-18"
    },
    {
      id: "3",
      patientName: "Lisa Wang",
      patientAge: 38,
      specialty: "Periodontics",
      urgency: "routine",
      description: "Advanced periodontal disease, requires deep cleaning and maintenance",
      referredTo: "Dr. Emily Rodriguez",
      referredBy: "Dr. John Smith",
      status: "completed",
      dateReferred: "2024-01-10",
      appointmentDate: "2024-01-20"
    }
  ]);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.practice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || provider.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "declined": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-100 text-red-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "declined": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleSendReferral = () => {
    toast.success("Referral sent successfully!");
    setNewReferralOpen(false);
  };

  const specialties = ["all", "Orthodontics", "Oral Surgery", "Periodontics", "Endodontics", "Prosthodontics", "Pediatric Dentistry"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Users className="h-8 w-8" />
            Referral Network
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage specialist referrals and network partnerships
          </p>
        </div>
        <Dialog open={newReferralOpen} onOpenChange={setNewReferralOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
              <DialogDescription>
                Send a patient referral to a specialist in your network
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input id="patient-name" placeholder="Enter patient name" />
                </div>
                <div>
                  <Label htmlFor="patient-age">Patient Age</Label>
                  <Input id="patient-age" type="number" placeholder="Age" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.slice(1).map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="provider">Refer To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} - {provider.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe the case and reason for referral..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewReferralOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReferral} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Referral
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralCases.filter(r => r.status === "pending" || r.status === "accepted").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 hrs</div>
            <p className="text-xs text-muted-foreground">
              -2 hrs from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Network Providers</TabsTrigger>
          <TabsTrigger value="referrals">Referral Cases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty === "all" ? "All Specialties" : specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Providers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.specialty}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(provider.networkStatus)}>
                      {provider.networkStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm font-medium">{provider.practice}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{provider.acceptanceRate}%</div>
                      <div className="text-xs text-muted-foreground">Acceptance</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">{provider.responseTime}</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>

                  <Button className="w-full" variant="outline">
                    Send Referral
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="space-y-4">
            {referralCases.map((referral) => (
              <Card key={referral.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{referral.patientName}</CardTitle>
                      <CardDescription>
                        Age {referral.patientAge} • {referral.specialty}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(referral.urgency)}>
                        {referral.urgency}
                      </Badge>
                      <Badge className={getReferralStatusColor(referral.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(referral.status)}
                          {referral.status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{referral.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Referred to:</span> {referral.referredTo}
                    </div>
                    <div>
                      <span className="font-medium">Referred by:</span> {referral.referredBy}
                    </div>
                    <div>
                      <span className="font-medium">Date referred:</span> {referral.dateReferred}
                    </div>
                    {referral.appointmentDate && (
                      <div>
                        <span className="font-medium">Appointment:</span> {referral.appointmentDate}
                      </div>
                    )}
                  </div>

                  {referral.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="font-medium text-sm">Notes:</span>
                      <p className="text-sm mt-1">{referral.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Send Follow-up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Referral Volume by Specialty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Orthodontics", "Oral Surgery", "Periodontics", "Endodontics"].map((specialty, index) => (
                    <div key={specialty} className="flex justify-between items-center">
                      <span className="text-sm">{specialty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${[75, 60, 45, 30][index]}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{[25, 20, 15, 10][index]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Acceptance Rate</span>
                    <span className="font-medium">91.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">8.2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed Referrals</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Patient Satisfaction</span>
                    <span className="font-medium">4.7/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}