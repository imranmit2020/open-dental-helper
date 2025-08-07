import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PatientNotesDialog from "@/components/PatientNotesDialog";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Brain,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Star,
  Loader2
} from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  duration: number;
  status: string;
  description?: string;
  treatment_type?: string;
  notes?: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  risk_level?: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  visit_date?: string;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Allergy {
  id: string;
  allergen: string;
  severity?: string;
  reaction?: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface MedicalCondition {
  id: string;
  condition_name: string;
  status: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

const DentistDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentTreatments, setRecentTreatments] = useState<MedicalRecord[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<(Allergy | MedicalCondition)[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    completedToday: 0,
    upcomingToday: 0,
    totalPatients: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      // Fetch today's appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name)
        `)
        .gte('appointment_date', startOfToday.toISOString())
        .lte('appointment_date', endOfToday.toISOString())
        .order('appointment_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Fetch recent medical records (last 10)
      const { data: medicalRecords, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          patient:patients(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recordsError) throw recordsError;

      // Fetch patient alerts (allergies and conditions)
      const [allergiesResult, conditionsResult] = await Promise.all([
        supabase
          .from('allergies')
          .select(`
            *,
            patient:patients(id, first_name, last_name)
          `)
          .in('severity', ['severe', 'moderate'])
          .limit(5),
        
        supabase
          .from('medical_conditions')
          .select(`
            *,
            patient:patients(id, first_name, last_name)
          `)
          .eq('status', 'active')
          .limit(5)
      ]);

      if (allergiesResult.error) throw allergiesResult.error;
      if (conditionsResult.error) throw conditionsResult.error;

      // Fetch dashboard stats
      const { data: allAppointments, error: allAppointmentsError } = await supabase
        .from('appointments')
        .select('id, status, appointment_date');

      if (allAppointmentsError) throw allAppointmentsError;

      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id');

      if (patientsError) throw patientsError;

      // Calculate stats
      const todayCount = allAppointments?.filter(apt => 
        isToday(new Date(apt.appointment_date))
      ).length || 0;

      const completedTodayCount = allAppointments?.filter(apt => 
        isToday(new Date(apt.appointment_date)) && apt.status === 'completed'
      ).length || 0;

      const upcomingTodayCount = allAppointments?.filter(apt => 
        isToday(new Date(apt.appointment_date)) && 
        ['scheduled', 'confirmed', 'pending'].includes(apt.status)
      ).length || 0;

      // Set state
      setTodayAppointments(appointments || []);
      setRecentTreatments(medicalRecords || []);
      setPatientAlerts([
        ...(allergiesResult.data || []),
        ...(conditionsResult.data || [])
      ]);
      setDashboardStats({
        totalAppointments: todayCount,
        completedToday: completedTodayCount,
        upcomingToday: upcomingTodayCount,
        totalPatients: patients?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
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
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAlertPriority = (item: Allergy | MedicalCondition) => {
    if ('severity' in item) {
      return item.severity === 'severe' ? 'high' : 'medium';
    }
    return 'medium';
  };

  const getAlertType = (item: Allergy | MedicalCondition) => {
    return 'severity' in item ? 'allergy' : 'medical';
  };

  const getAlertText = (item: Allergy | MedicalCondition) => {
    if ('severity' in item) {
      return `Allergic to ${item.allergen}${item.severity ? ` (${item.severity})` : ''}`;
    }
    return (item as MedicalCondition).condition_name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

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
                Dr. Dentist Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                General Dentistry • {dashboardStats.totalAppointments} appointments today
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PatientNotesDialog 
              trigger={
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Patient Notes
                </Button>
              }
            />
            <Button onClick={() => navigate('/schedule')}>
              <Calendar className="w-4 h-4 mr-2" />
              View Full Schedule
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{dashboardStats.totalAppointments}</p>
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">{dashboardStats.completedToday}</p>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.upcomingToday}</p>
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{dashboardStats.totalPatients}</p>
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
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
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-medium">
                            {format(new Date(appointment.appointment_date), 'h:mm a')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.duration} min
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {appointment.patient.first_name} {appointment.patient.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.treatment_type || appointment.title}
                          </p>
                          {appointment.description && (
                            <p className="text-xs text-muted-foreground">
                              {appointment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* AI Insights - Mock data for now */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Clinical Insights
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations (Demo)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Treatment Success Prediction</h4>
                    <Badge variant="outline" className="text-xs">
                      high confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on patient history, upcoming procedures have high success probability
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Appointment Optimization</h4>
                    <Badge variant="outline" className="text-xs">
                      medium confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consider scheduling longer appointments for complex procedures
                  </p>
                </div>
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
                {patientAlerts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                ) : (
                  patientAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-medium text-sm">
                          {alert.patient.first_name} {alert.patient.last_name}
                        </h5>
                        <Badge
                          variant={getAlertPriority(alert) === "high" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {getAlertPriority(alert)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getAlertText(alert)}
                      </p>
                    </div>
                  ))
                )}
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
                {recentTreatments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent treatments</p>
                  </div>
                ) : (
                  recentTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm">
                          {treatment.patient.first_name} {treatment.patient.last_name}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {treatment.title}
                        </p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            {treatment.visit_date 
                              ? format(new Date(treatment.visit_date), 'MMM dd, yyyy')
                              : format(new Date(treatment.created_at), 'MMM dd, yyyy')
                            }
                          </span>
                        </div>
                        {treatment.diagnosis && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{treatment.diagnosis}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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