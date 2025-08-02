import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Heart, MapPin, Phone, User } from "lucide-react";
import NewAppointmentForm from "@/components/NewAppointmentForm";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      type: "Routine Cleaning",
      date: "2024-02-15",
      time: "10:00 AM",
      doctor: "Dr. Sarah Johnson",
      status: "confirmed"
    },
    {
      id: 2,
      type: "Crown Fitting",
      date: "2024-02-28",
      time: "2:30 PM",
      doctor: "Dr. Michael Chen",
      status: "pending"
    }
  ]);

  const handleAppointmentAdded = (newAppointment: any) => {
    setAppointments(prev => [...prev, {
      id: newAppointment.id,
      type: newAppointment.type,
      date: newAppointment.date,
      time: newAppointment.time,
      doctor: newAppointment.provider,
      status: newAppointment.status
    }]);
  };

  const recentTreatments = [
    {
      id: 1,
      treatment: "Dental Cleaning",
      date: "2024-01-15",
      doctor: "Dr. Sarah Johnson",
      status: "completed"
    },
    {
      id: 2,
      treatment: "Cavity Filling",
      date: "2024-01-08",
      doctor: "Dr. Michael Chen",
      status: "completed"
    }
  ];

  const healthMetrics = [
    { label: "Last Cleaning", value: "1 month ago", status: "good" },
    { label: "Oral Health Score", value: "8.5/10", status: "excellent" },
    { label: "Next Checkup", value: "Due in 2 months", status: "scheduled" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back, John!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's your dental health overview and upcoming appointments
            </p>
          </div>
          <NewAppointmentForm 
            onAppointmentAdded={handleAppointmentAdded}
            trigger={
              <Button className="lg:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            }
          />
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthMetrics.map((metric, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <Badge variant={metric.status === "excellent" ? "default" : "secondary"}>
                    {metric.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your scheduled dental visits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{appointment.type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctor}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Treatments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Treatments
              </CardTitle>
              <CardDescription>
                Your treatment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{treatment.treatment}</h4>
                    <p className="text-sm text-muted-foreground">
                      {treatment.doctor}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.date}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {treatment.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your dental care easily
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-6 flex flex-col gap-2">
                <User className="w-8 h-8" />
                <span>Update Profile</span>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col gap-2">
                <FileText className="w-8 h-8" />
                <span>View Records</span>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col gap-2">
                <Heart className="w-8 h-8" />
                <span>Health Tips</span>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col gap-2">
                <Phone className="w-8 h-8" />
                <span>Contact Office</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;