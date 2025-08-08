import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import RescheduleDialog from "@/components/RescheduleDialog";
import StartVisitDialog from "@/components/StartVisitDialog";

export default function Schedule() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const { appointments, loading, refetch } = useAppointments(view === "day" ? currentDate : undefined);
  const [searchParams] = useSearchParams();
  const filter = (searchParams.get('filter') || 'today') as 'today' | 'today-open' | 'today-completed' | 'tomorrow-open';
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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

  // Initialize by filter param (e.g., tomorrow-open)
  useEffect(() => {
    if (filter === 'tomorrow-open') {
      const tomorrow = addDays(new Date(), 1);
      setCurrentDate(tomorrow);
      setView('day');
    } else if (filter === 'today-open' || filter === 'today-completed' || filter === 'today') {
      setView('day');
    }
  }, [filter]);

  // Load provider profile id to filter assignments to the logged-in provider
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) {
        setProviderId(data.id);
        setIsAdmin((data.role || '').toLowerCase() === 'admin');
      }

    }
    loadProfile();
  }, [user?.id]);

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

  // Transform and optionally filter appointments for display
  const displayAppointments = useMemo(() => {
    // Date window depending on view
    let start = startOfDay(currentDate);
    let end = endOfDay(currentDate);
    if (view === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (view === 'month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    }

    // Filter by date window when not day view (day view already filtered at query layer)
    let filtered = appointments.filter(apt => {
      const d = new Date(apt.appointment_date);
      return view === 'day' ? true : isWithinInterval(d, { start, end });
    });

    // Filter by provider (admins see all)
    if (providerId && !isAdmin) {
      filtered = filtered.filter(apt => apt.dentist_id === providerId);
    }

    // Apply status filters
    if (filter === 'today-open' || filter === 'tomorrow-open') {
      filtered = filtered.filter(apt => ['scheduled','confirmed','pending'].includes(apt.status || 'scheduled'));
    } else if (filter === 'today-completed') {
      filtered = filtered.filter(apt => (apt.status || '').toLowerCase() === 'completed');
    }

    const base = filtered.map(apt => ({
      id: apt.id,
      time: format(new Date(apt.appointment_date), 'h:mm a'),
      duration: apt.duration || 60,
      patient: apt.treatment_type === 'block' 
        ? apt.title // For blocked time, show the reason as the "patient"
        : apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown Patient',
      type: apt.treatment_type === 'block' ? 'Blocked Time' : apt.title,
      status: apt.status || 'scheduled',
      room: "Room 1", // Default room since not in database
      phone: apt.treatment_type === 'block' ? '' : (apt.patient?.phone || ''),
      treatment_type: apt.treatment_type,
      isBlockedTime: apt.treatment_type === 'block'
    }));

    return base;
  }, [appointments, filter, view, currentDate, providerId]);

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
                {view === 'day' ? "Day's Schedule" : `${view.charAt(0).toUpperCase() + view.slice(1)} Schedule`}
              </CardTitle>
              <CardDescription>
                {displayAppointments.length} {filter.includes('open') ? 'open' : filter.includes('completed') ? 'completed' : ''} appointments {view === 'day' ? 'for this day' : `in this ${view}`}
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
                    <p>No {filter.includes('open') ? 'open ' : filter.includes('completed') ? 'completed ' : ''}appointments {view === 'day' ? 'for this day' : `in this ${view}`}</p>
                  </div>
                ) : displayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      appointment.isBlockedTime 
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
                              appointment.isBlockedTime ? 'text-muted-foreground' : 'text-foreground'
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
                            {appointment.phone !== '-' && appointment.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!appointment.isBlockedTime && (
                        <div className="flex items-center gap-2">
                          <RescheduleDialog 
                            appointment={appointment}
                            onRescheduleComplete={refetch}
                            trigger={
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            }
                          />
                          <StartVisitDialog 
                            appointment={appointment}
                            onVisitStarted={refetch}
                            trigger={
                              <Button variant="outline" size="sm">
                                Start Visit
                              </Button>
                            }
                          />
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
              <CardTitle className="text-lg">{view === 'day' ? "Today's Summary" : `${view.charAt(0).toUpperCase() + view.slice(1)} Summary`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Appointments</span>
                <span className="font-semibold text-xl">{displayAppointments.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-semibold text-xl text-green-600">
                  {displayAppointments.filter(apt => apt.status === 'confirmed').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="font-semibold text-xl text-blue-600">
                  {displayAppointments.filter(apt => apt.status === 'scheduled').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-xl text-yellow-600">
                  {displayAppointments.filter(apt => apt.status === 'pending').length}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Hours</span>
                  <span className="font-semibold text-xl">
                    {(displayAppointments.reduce((total, apt) => 
                      total + apt.duration, 0
                    ) / 60).toFixed(1)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
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