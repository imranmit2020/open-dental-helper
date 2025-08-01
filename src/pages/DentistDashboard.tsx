import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Brain,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

const DentistDashboard = () => {
  const todaySchedule = [
    {
      id: 1,
      time: "9:00 AM",
      patient: "Sarah Johnson",
      treatment: "Routine Cleaning",
      duration: "30 min",
      status: "confirmed",
      room: "Room 1"
    },
    {
      id: 2,
      time: "10:00 AM",
      patient: "Michael Chen",
      treatment: "Crown Preparation",
      duration: "60 min",
      status: "in-progress",
      room: "Room 2"
    },
    {
      id: 3,
      time: "11:30 AM",
      patient: "Emily Rodriguez",
      treatment: "Cavity Filling",
      duration: "45 min",
      status: "upcoming",
      room: "Room 1"
    },
    {
      id: 4,
      time: "2:00 PM",
      patient: "David Wilson",
      treatment: "Root Canal Follow-up",
      duration: "30 min",
      status: "upcoming",
      room: "Room 3"
    }
  ];

  const patientAlerts = [
    {
      id: 1,
      patient: "Maria Garcia",
      alert: "Allergic to Penicillin",
      type: "allergy",
      priority: "high"
    },
    {
      id: 2,
      patient: "John Smith",
      alert: "High blood pressure medication",
      type: "medical",
      priority: "medium"
    },
    {
      id: 3,
      patient: "Lisa Brown",
      alert: "Diabetes - Monitor blood sugar",
      type: "medical",
      priority: "high"
    }
  ];

  const aiInsights = [
    {
      id: 1,
      title: "Treatment Success Prediction",
      insight: "Root canal treatment for Patient #1247 has 94% success probability",
      type: "prediction",
      confidence: "high"
    },
    {
      id: 2,
      title: "Cavity Risk Assessment",
      insight: "Patient Sarah Johnson shows early signs of cavity formation",
      type: "warning",
      confidence: "medium"
    },
    {
      id: 3,
      title: "Appointment Optimization",
      insight: "Consider scheduling longer appointments for complex procedures",
      type: "suggestion",
      confidence: "high"
    }
  ];

  const recentTreatments = [
    {
      id: 1,
      patient: "Robert Taylor",
      treatment: "Wisdom Tooth Extraction",
      date: "Yesterday",
      outcome: "Successful",
      followUp: "1 week"
    },
    {
      id: 2,
      patient: "Amanda Lee",
      treatment: "Dental Implant",
      date: "3 days ago",
      outcome: "Successful",
      followUp: "2 weeks"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg font-bold">
                DS
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dr. Sarah Wilson
              </h1>
              <p className="text-muted-foreground mt-1">
                General Dentistry • 8 appointments today
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Patient Notes
            </Button>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              View Full Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  Your appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-medium">{appointment.time}</p>
                        <p className="text-sm text-muted-foreground">{appointment.duration}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{appointment.patient}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.treatment}</p>
                        <p className="text-xs text-muted-foreground">{appointment.room}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "confirmed" 
                          ? "default" 
                          : appointment.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Clinical Insights
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations and predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Patient Alerts
                </CardTitle>
                <CardDescription>
                  Important medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm">{alert.patient}</h5>
                      <Badge
                        variant={alert.priority === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.alert}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Treatments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Recent Treatments
                </CardTitle>
                <CardDescription>
                  Latest completed procedures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTreatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <h5 className="font-medium text-sm">{treatment.patient}</h5>
                      <p className="text-sm text-muted-foreground">{treatment.treatment}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{treatment.date}</span>
                        <span>Follow-up: {treatment.followUp}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">{treatment.outcome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Add Emergency Slot
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Treatment Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Request Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistDashboard;