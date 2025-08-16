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
import { useTenant } from "@/contexts/TenantContext";
import PatientNotesDialog from "@/components/PatientNotesDialog";
import BlockTimeForm from "@/components/BlockTimeForm";
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
import ReviewRequestDialog from "@/components/ReviewRequestDialog";
import { DentistDashboardSkeleton } from "@/components/DentistDashboardSkeleton";

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  duration: number;
  status: string;
  description?: string;
  treatment_type?: string;
  notes?: string;
  patient?: {
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
  patient?: {
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
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface MedicalCondition {
  id: string;
  condition_name: string;
  status: string;
  patient?: {
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
  const { currentTenant } = useTenant();
  
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentTreatments, setRecentTreatments] = useState<MedicalRecord[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<(Allergy | MedicalCondition)[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    completedToday: 0,
    upcomingTomorrow: 0,
    totalPatients: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);
    
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const startOfTomorrow = startOfDay(tomorrow);
      const endOfTomorrow = endOfDay(tomorrow);

      // Fetch user profile and tenant info first
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!isMounted) return;

      const providerId = profileRow?.id;
      const isAdmin = (profileRow?.role || '').toLowerCase() === 'admin';
      const tenantId = currentTenant?.id;

      // Build base query conditions
      const baseConditions = tenantId ? { tenant_id: tenantId } : {};
      const providerConditions = !isAdmin && providerId ? { dentist_id: providerId } : {};

      // Parallel fetch all required data
      const [
        todayApptsResult,
        allApptsResult,
        medicalRecordsResult,
        allergiesResult,
        conditionsResult,
        patientsResult
      ] = await Promise.all([
        // Today's appointments
        supabase
          .from('appointments')
          .select(`
            *,
            patient:patients(id, first_name, last_name)
          `)
          .gte('appointment_date', startOfToday.toISOString())
          .lte('appointment_date', endOfToday.toISOString())
          .match({ ...baseConditions, ...providerConditions })
          .order('appointment_date', { ascending: true }),

        // All appointments for stats (optimized with select)
        supabase
          .from('appointments')
          .select('id, status, appointment_date')
          .match({ ...baseConditions, ...providerConditions }),

        // Recent medical records (limit early)
        supabase
          .from('medical_records')
          .select(`
            *,
            patient:patients!inner(id, first_name, last_name, tenant_id)
          `)
          .match(tenantId ? { 'patient.tenant_id': tenantId } : {})
          .order('created_at', { ascending: false })
          .limit(10),

        // Patient alerts - allergies
        supabase
          .from('allergies')
          .select(`
            *,
            patient:patients!inner(id, first_name, last_name, tenant_id)
          `)
          .in('severity', ['severe', 'moderate'])
          .match(tenantId ? { 'patient.tenant_id': tenantId } : {})
          .limit(5),

        // Patient alerts - conditions
        supabase
          .from('medical_conditions')
          .select(`
            *,
            patient:patients!inner(id, first_name, last_name, tenant_id)
          `)
          .eq('status', 'active')
          .match(tenantId ? { 'patient.tenant_id': tenantId } : {})
          .limit(5),

        // Total patients count
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .match(tenantId ? { tenant_id: tenantId } : {})
      ]);

      // Check for errors
      const errors = [
        todayApptsResult.error,
        allApptsResult.error,
        medicalRecordsResult.error,
        allergiesResult.error,
        conditionsResult.error,
        patientsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e?.message).join(', ')}`);
      }

      if (!isMounted) return;

      // Process stats efficiently
      const allAppointments = allApptsResult.data || [];
      const todayOpenCount = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfToday && 
               aptDate <= endOfToday && 
               ['scheduled', 'confirmed', 'pending'].includes(apt.status || 'scheduled');
      }).length;

      const completedTodayCount = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfToday && 
               aptDate <= endOfToday && 
               apt.status === 'completed';
      }).length;

      const upcomingTomorrowCount = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfTomorrow && 
               aptDate <= endOfTomorrow && 
               ['scheduled', 'confirmed', 'pending'].includes(apt.status || 'scheduled');
      }).length;

      // Update state
      setTodayAppointments(todayApptsResult.data || []);
      setRecentTreatments(medicalRecordsResult.data || []);
      setPatientAlerts([
        ...(allergiesResult.data || []),
        ...(conditionsResult.data || [])
      ]);
      setDashboardStats({
        totalAppointments: todayOpenCount,
        completedToday: completedTodayCount,
        upcomingTomorrow: upcomingTomorrowCount,
        totalPatients: patientsResult.count || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isMounted) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
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
    return <DentistDashboardSkeleton />;
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
          <Card onClick={() => navigate('/schedule?filter=today-open')} className="cursor-pointer hover:ring-2 ring-primary/30 transition">
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

          <Card onClick={() => navigate('/schedule?filter=today-completed')} className="cursor-pointer hover:ring-2 ring-primary/30 transition">
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

          <Card onClick={() => navigate('/schedule?filter=tomorrow-open')} className="cursor-pointer hover:ring-2 ring-primary/30 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.upcomingTomorrow}</p>
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
                            {(appointment.patient?.first_name ?? 'Unknown')} {(appointment.patient?.last_name ?? '')}
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
                          {(alert.patient?.first_name ?? 'Unknown')} {(alert.patient?.last_name ?? '')}
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
                          {(treatment.patient?.first_name ?? 'Unknown')} {(treatment.patient?.last_name ?? '')}
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
<BlockTimeForm
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Add Emergency Slot
                    </Button>
                  }
                />
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/treatment-plans')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Treatment Plan
                </Button>
<ReviewRequestDialog
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="w-4 h-4 mr-2" />
                      Request Feedback
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistDashboard;