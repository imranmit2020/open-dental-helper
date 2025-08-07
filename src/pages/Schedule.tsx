import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
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
import BlockTimeForm from "@/components/BlockTimeForm";
import WalkInForm from "@/components/WalkInForm";

export default function Schedule() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const { appointments, loading, refetch } = useAppointments(view === "day" ? currentDate : undefined);

  // Audit logging on page access
  useEffect(() => {
    if (user) {
      logAction({
        action: 'VIEW_SCHEDULE',
        resource_type: 'schedule',
        details: { date: currentDate.toISOString(), view }
      }).catch(error => {
        console.error('Failed to log schedule access:', error);
        toast({
          title: "Logging Error",
          description: "Failed to record audit log",
          variant: "destructive"
        });
      });
    }
  }, [user, logAction]);

  // Log view changes
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
    if (user) {
      logAction({
        action: 'CHANGE_SCHEDULE_VIEW',
        resource_type: 'schedule',
        details: { previous_view: view, new_view: newView }
      }).catch(error => {
        console.error('Failed to log view change:', error);
      });
    }
  };

  // Log date navigation
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
    
    if (user) {
      logAction({
        action: 'NAVIGATE_SCHEDULE',
        resource_type: 'schedule',
        details: { 
          direction, 
          previous_date: currentDate.toISOString(), 
          new_date: newDate.toISOString(),
          view 
        }
      }).catch(error => {
        console.error('Failed to log date navigation:', error);
      });
    }
  };

  // Transform appointments for display
  const displayAppointments = appointments.map(apt => ({
    id: apt.id,
    time: format(new Date(apt.appointment_date), 'h:mm a'),
    duration: apt.duration || 60,
    patient: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown Patient',
    type: apt.title,
    status: apt.status || 'scheduled',
    room: "Room 1", // Default room since not in database
    phone: apt.patient?.phone || '',
    treatment_type: apt.treatment_type
  }));

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
    handleDateNavigation(direction);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointment Calendar</h1>
          <p className="text-muted-foreground">Manage your daily schedule and appointments</p>
        </div>
        <NewAppointmentForm onAppointmentAdded={refetch} />
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
                  onClick={() => handleViewChange(viewType)}
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
                {displayAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-pulse">Loading appointments...</div>
                  </div>
                ) : displayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for this day</p>
                  </div>
                ) : displayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg transition-all hover:shadow-md border-border hover:border-primary/30"
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
                            <h3 className="font-semibold text-foreground">
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
                            {appointment.phone !== '-' && appointment.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          {t('schedule.reschedule', 'Reschedule')}
                        </Button>
                        <Button variant="outline" size="sm">
                          {t('schedule.startVisit', 'Start Visit')}
                        </Button>
                      </div>
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
              <CardTitle className="text-lg">{t('schedule.todaySummary', "schedule.todaySummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Appointments</span>
                <span className="font-semibold">{displayAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-semibold text-success">
                  {displayAppointments.filter(apt => apt.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="font-semibold text-primary">
                  {displayAppointments.filter(apt => apt.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-warning">
                  {displayAppointments.filter(apt => apt.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Hours</span>
                <span className="font-semibold">
                  {Math.round(displayAppointments.reduce((total, apt) => 
                    total + apt.duration, 0
                  ) / 60 * 10) / 10}h
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('schedule.quickActions', 'schedule.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <WalkInForm 
                onWalkInAdded={refetch}
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Add Walk-in
                  </Button>
                }
              />
              <BlockTimeForm 
                onBlockTimeAdded={refetch}
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Block Time
                  </Button>
                }
              />
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleViewChange('week')}
              >
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