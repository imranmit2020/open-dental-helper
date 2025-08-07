import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Plus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NewAppointmentForm from "@/components/NewAppointmentForm";
import { format } from "date-fns";

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  duration: number;
  status: string;
  description?: string;
  treatment_type?: string;
  notes?: string;
}

const MyAppointments = () => {
  const { t, formatDate } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      // First get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Then get appointments
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.appointment_date) >= new Date()
  );

  const pastAppointments = appointments.filter(
    apt => new Date(apt.appointment_date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Appointments
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your dental appointments and schedule new ones
            </p>
          </div>
          <NewAppointmentForm 
            onAppointmentAdded={fetchAppointments}
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            }
          />
        </div>

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
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium">{appointment.title}</h4>
                      {appointment.treatment_type && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.treatment_type}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), 'hh:mm a')}
                        </span>
                        <span>{appointment.duration} minutes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Past Appointments
            </CardTitle>
            <CardDescription>
              Your appointment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No past appointments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 10).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium">{appointment.title}</h4>
                      {appointment.treatment_type && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.treatment_type}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAppointments;