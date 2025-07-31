import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Phone
} from "lucide-react";
import NewAppointmentForm from "@/components/NewAppointmentForm";

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');

  const appointments = [
    {
      id: 1,
      time: "9:00 AM",
      duration: 60,
      patient: "Sarah Johnson",
      type: "Routine Cleaning",
      status: "confirmed",
      room: "Room 1",
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      time: "10:30 AM",
      duration: 90,
      patient: "Mike Davis",
      type: "Root Canal",
      status: "confirmed",
      room: "Room 2",
      phone: "(555) 234-5678"
    },
    {
      id: 3,
      time: "12:00 PM",
      duration: 30,
      patient: "Lunch Break",
      type: "break",
      status: "blocked",
      room: "-",
      phone: "-"
    },
    {
      id: 4,
      time: "2:00 PM",
      duration: 75,
      patient: "Emily Chen",
      type: "Crown Preparation",
      status: "pending",
      room: "Room 1",
      phone: "(555) 345-6789"
    },
    {
      id: 5,
      time: "3:30 PM",
      duration: 45,
      patient: "Robert Wilson",
      type: "Consultation",
      status: "confirmed",
      room: "Room 3",
      phone: "(555) 456-7890"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "blocked": return "bg-muted/10 text-muted-foreground border-muted/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "routine cleaning": return "bg-primary/10 text-primary";
      case "root canal": return "bg-destructive/10 text-destructive";
      case "crown preparation": return "bg-secondary/10 text-secondary";
      case "consultation": return "bg-accent/40 text-accent-foreground";
      case "break": return "bg-muted/20 text-muted-foreground";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointment Calendar</h1>
          <p className="text-muted-foreground">Manage your daily schedule and appointments</p>
        </div>
        <NewAppointmentForm />
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[300px] text-center">
                {formatDate(currentDate)}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {(['day', 'week', 'month'] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(viewType)}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Schedule Overview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {appointments.filter(apt => apt.type !== 'break').length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      appointment.type === 'break' 
                        ? 'border-dashed border-muted bg-muted/20' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                          <span className="text-xs text-muted-foreground">{appointment.duration}min</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${
                              appointment.type === 'break' ? 'text-muted-foreground' : 'text-foreground'
                            }`}>
                              {appointment.patient}
                            </h3>
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="secondary" className={getTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            {appointment.room !== '-' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {appointment.room}
                              </span>
                            )}
                            {appointment.phone !== '-' && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.type !== 'break' && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            Start Visit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Appointments</span>
                <span className="font-semibold">{appointments.filter(apt => apt.type !== 'break').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-semibold text-success">
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-warning">
                  {appointments.filter(apt => apt.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Hours</span>
                <span className="font-semibold">
                  {Math.round(appointments.reduce((total, apt) => 
                    apt.type !== 'break' ? total + apt.duration : total, 0
                  ) / 60 * 10) / 10}h
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Add Walk-in
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Block Time
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Week
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}