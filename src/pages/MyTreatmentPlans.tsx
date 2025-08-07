import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Stethoscope, Clock, DollarSign, Calendar, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { format } from "date-fns";

interface TreatmentPlan {
  id: string;
  plan_name: string;
  status: string;
  priority: string;
  total_cost?: number;
  estimated_duration?: number;
  phases?: any;
  notes?: string;
  created_at: string;
}

const MyTreatmentPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);

  useEffect(() => {
    fetchTreatmentPlans();
  }, [user]);

  const fetchTreatmentPlans = async () => {
    if (!user) return;

    try {
      // First get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Then get treatment plans
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTreatmentPlans(data || []);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      toast({
        title: "Error",
        description: "Failed to load treatment plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'proposed':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const calculateProgress = (phases: any) => {
    if (!phases || !Array.isArray(phases)) return 0;
    
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    return phases.length > 0 ? (completedPhases / phases.length) * 100 : 0;
  };

  const getPhaseIcon = (status: string) => {
    return status === 'completed' ? CheckCircle : Circle;
  };

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
              My Treatment Plans
            </h1>
            <p className="text-muted-foreground mt-2">
              View your proposed and ongoing dental treatment plans
            </p>
          </div>
        </div>

        {treatmentPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Treatment Plans</h3>
              <p className="text-muted-foreground">
                You don't have any treatment plans yet. Your dentist will create one for you based on your examination.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {treatmentPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        {plan.plan_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(plan.priority)}>
                          {plan.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {plan.total_cost && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <CurrencyDisplay amount={plan.total_cost} />
                        </div>
                      )}
                      {plan.estimated_duration && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="w-3 h-3" />
                          {plan.estimated_duration} weeks
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {plan.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{plan.notes}</p>
                    </div>
                  )}

                  {plan.phases && Array.isArray(plan.phases) && plan.phases.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Treatment Progress</h4>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(calculateProgress(plan.phases))}% Complete
                        </span>
                      </div>
                      
                      <Progress value={calculateProgress(plan.phases)} className="mb-4" />
                      
                      <div className="space-y-3">
                        {plan.phases.map((phase: any, index: number) => {
                          const PhaseIcon = getPhaseIcon(phase.status);
                          return (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                              <PhaseIcon 
                                className={`w-5 h-5 mt-0.5 ${
                                  phase.status === 'completed' 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                }`}
                              />
                              <div className="flex-1 space-y-1">
                                <h5 className="font-medium text-sm">{phase.name || `Phase ${index + 1}`}</h5>
                                {phase.description && (
                                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {phase.estimated_duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {phase.estimated_duration} weeks
                                    </span>
                                  )}
                                  {phase.cost && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      <CurrencyDisplay amount={phase.cost} variant="small" />
                                    </span>
                                  )}
                                  <Badge 
                                    variant={getStatusColor(phase.status)} 
                                    className="text-xs px-2 py-0"
                                  >
                                    {phase.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(plan.created_at), 'MMM dd, yyyy')}
                    </div>
                    {plan.status === 'proposed' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Request Changes
                        </Button>
                        <Button size="sm">
                          Accept Plan
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTreatmentPlans;