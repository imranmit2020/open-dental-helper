import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EquipmentPrediction, useNextGenAI } from '@/hooks/useNextGenAI';
import { Settings, AlertTriangle, TrendingDown, Calendar, DollarSign, Clock, Wrench } from 'lucide-react';

export const PredictiveEquipmentMaintenance: React.FC = () => {
  const { equipmentPredictions } = useNextGenAI();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFailureProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'bg-red-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDowntimeRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysUntilFailure = (failureDate: string) => {
    const today = new Date();
    const failure = new Date(failureDate);
    const diffTime = failure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const scheduleMaintenanceAction = (equipmentId: string, action: string) => {
    console.log(`Scheduling ${action} for equipment ${equipmentId} on ${maintenanceDate}`);
    setSelectedEquipment(null);
    setMaintenanceDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Predictive Equipment Maintenance</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {equipmentPredictions.filter(eq => eq.current_health_score >= 0.8).length}
              </p>
              <p className="text-sm text-muted-foreground">Healthy Equipment</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {equipmentPredictions.filter(eq => eq.current_health_score < 0.8 && eq.current_health_score >= 0.6).length}
              </p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {equipmentPredictions.filter(eq => eq.current_health_score < 0.6).length}
              </p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${equipmentPredictions.reduce((acc, eq) => acc + eq.cost_impact, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Cost Impact</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Equipment Predictions */}
      <div className="grid gap-6">
        {equipmentPredictions.map((equipment) => {
          const daysUntilFailure = getDaysUntilFailure(equipment.predicted_failure_date);
          
          return (
            <Card key={equipment.id} className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{equipment.equipment_name}</CardTitle>
                    <CardDescription>
                      {equipment.equipment_type} • Health Score: {Math.round(equipment.current_health_score * 100)}%
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getHealthColor(equipment.current_health_score)}>
                      {equipment.current_health_score >= 0.8 ? 'Healthy' : 
                       equipment.current_health_score >= 0.6 ? 'Degrading' : 'Critical'}
                    </Badge>
                    <Badge className={getDowntimeRiskColor(equipment.downtime_risk)}>
                      {equipment.downtime_risk} downtime risk
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Health Score Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Equipment Health</span>
                    <span>{Math.round(equipment.current_health_score * 100)}%</span>
                  </div>
                  <Progress value={equipment.current_health_score * 100} className="h-3" />
                </div>

                {/* Failure Prediction */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Failure Probability</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getFailureProbabilityColor(equipment.failure_probability)}`}
                          style={{ width: `${equipment.failure_probability * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(equipment.failure_probability * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Predicted Failure</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {daysUntilFailure > 0 ? `${daysUntilFailure} days` : 'Overdue'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(equipment.predicted_failure_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cost Impact</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-bold">${equipment.cost_impact.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Replacement Urgency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Replacement Urgency</span>
                    <span>{Math.round(equipment.replacement_urgency * 100)}%</span>
                  </div>
                  <Progress value={equipment.replacement_urgency * 100} className="h-2" />
                </div>

                {/* Maintenance Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance Recommendations
                  </h4>
                  
                  <div className="space-y-3">
                    {equipment.maintenance_recommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{recommendation.action}</h5>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedEquipment(equipment.id)}
                                >
                                  Schedule
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Schedule Maintenance</DialogTitle>
                                  <DialogDescription>
                                    Schedule {recommendation.action} for {equipment.equipment_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="maintenance-date">Maintenance Date</Label>
                                    <Input
                                      id="maintenance-date"
                                      type="date"
                                      value={maintenanceDate}
                                      onChange={(e) => setMaintenanceDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label>Estimated Cost</Label>
                                      <p className="font-medium">${recommendation.estimated_cost}</p>
                                    </div>
                                    <div>
                                      <Label>Estimated Time</Label>
                                      <p className="font-medium">{recommendation.estimated_time}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {recommendation.description}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => scheduleMaintenanceAction(equipment.id, recommendation.action)}
                                      className="flex-1"
                                      disabled={!maintenanceDate}
                                    >
                                      Schedule Maintenance
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${recommendation.estimated_cost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{recommendation.estimated_time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};