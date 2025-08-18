import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import type { ToothData, ChartingEntry } from "@/types/dental";

interface TreatmentPlannerProps {
  toothData: Record<number, ToothData>;
  chartingHistory: ChartingEntry[];
  patientId: string;
}

interface TreatmentPlan {
  id: string;
  toothNumber: number;
  procedure: string;
  priority: "urgent" | "high" | "medium" | "low";
  estimatedCost: number;
  estimatedDuration: number; // in minutes
  notes: string;
  scheduledDate?: Date;
  status: "planned" | "scheduled" | "in_progress" | "completed";
  prerequisites?: string[];
}

export function TreatmentPlanner({ toothData, chartingHistory, patientId }: TreatmentPlannerProps) {
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([
    {
      id: "1",
      toothNumber: 18,
      procedure: "Root Canal Treatment",
      priority: "urgent",
      estimatedCost: 1200,
      estimatedDuration: 120,
      notes: "Deep caries affecting pulp, immediate treatment required",
      status: "planned"
    },
    {
      id: "2",
      toothNumber: 11,
      procedure: "Professional Whitening",
      priority: "low",
      estimatedCost: 300,
      estimatedDuration: 60,
      notes: "Cosmetic whitening for intrinsic staining",
      status: "planned"
    }
  ]);

  const [newPlan, setNewPlan] = useState<{
    toothNumber: string;
    procedure: string;
    priority: "urgent" | "high" | "medium" | "low";
    estimatedCost: number;
    estimatedDuration: number;
    notes: string;
  }>({
    toothNumber: "",
    procedure: "",
    priority: "medium",
    estimatedCost: 0,
    estimatedDuration: 60,
    notes: ""
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPlan = () => {
    if (!newPlan.toothNumber || !newPlan.procedure) return;

    const plan: TreatmentPlan = {
      id: Date.now().toString(),
      toothNumber: parseInt(newPlan.toothNumber),
      procedure: newPlan.procedure,
      priority: newPlan.priority,
      estimatedCost: newPlan.estimatedCost,
      estimatedDuration: newPlan.estimatedDuration,
      notes: newPlan.notes,
      status: "planned"
    };

    setTreatmentPlans(prev => [...prev, plan]);
    setNewPlan({
      toothNumber: "",
      procedure: "",
      priority: "medium",
      estimatedCost: 0,
      estimatedDuration: 60,
      notes: ""
    });
    setShowAddForm(false);
  };

  const handleDeletePlan = (planId: string) => {
    setTreatmentPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  const handleUpdateStatus = (planId: string, newStatus: TreatmentPlan["status"]) => {
    setTreatmentPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, status: newStatus } : plan
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning border-warning/20";
      case "medium":
        return "bg-info/10 text-info border-info/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "in_progress":
        return "bg-info/10 text-info border-info/20";
      case "scheduled":
        return "bg-warning/10 text-warning border-warning/20";
      case "planned":
        return "bg-muted/10 text-muted-foreground border-muted/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "planned":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const sortedPlans = [...treatmentPlans].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const totalCost = treatmentPlans.reduce((sum, plan) => sum + plan.estimatedCost, 0);
  const totalDuration = treatmentPlans.reduce((sum, plan) => sum + plan.estimatedDuration, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{treatmentPlans.length}</p>
                <p className="text-sm text-muted-foreground">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {treatmentPlans.filter(p => p.priority === "urgent").length}
                </p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plans */}
      <Card className="professional-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Treatment Plans
              </CardTitle>
              <CardDescription>
                Planned treatments and procedures for this patient
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAddForm && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tooth Number</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 18"
                      value={newPlan.toothNumber}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, toothNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Procedure</Label>
                    <Select 
                      value={newPlan.procedure} 
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, procedure: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select procedure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Root Canal Treatment">Root Canal Treatment</SelectItem>
                        <SelectItem value="Crown">Crown</SelectItem>
                        <SelectItem value="Filling">Filling</SelectItem>
                        <SelectItem value="Extraction">Extraction</SelectItem>
                        <SelectItem value="Implant">Implant</SelectItem>
                        <SelectItem value="Professional Cleaning">Professional Cleaning</SelectItem>
                        <SelectItem value="Whitening">Whitening</SelectItem>
                        <SelectItem value="Scaling & Root Planing">Scaling & Root Planing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newPlan.priority} 
                      onValueChange={(value: "urgent" | "high" | "medium" | "low") => 
                        setNewPlan(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Cost ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newPlan.estimatedCost || ""}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={newPlan.notes}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPlan} className="btn-gradient">
                    Add Plan
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans List */}
          <div className="space-y-3">
            {sortedPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No treatment plans found. Click "Add Plan" to create one.</p>
              </div>
            ) : (
              sortedPlans.map((plan) => (
                <Card key={plan.id} className="hover-lift border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium">Tooth {plan.toothNumber}</span>
                          <Badge variant="outline" className={getPriorityColor(plan.priority)}>
                            {plan.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(plan.status)}>
                            {getStatusIcon(plan.status)}
                            <span className="ml-1 capitalize">{plan.status.replace("_", " ")}</span>
                          </Badge>
                        </div>

                        {/* Procedure */}
                        <h4 className="font-semibold text-lg">{plan.procedure}</h4>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${plan.estimatedCost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{plan.estimatedDuration} minutes</span>
                          </div>
                          {plan.scheduledDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{plan.scheduledDate.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {plan.notes && (
                          <p className="text-sm text-muted-foreground">{plan.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <Select 
                          value={plan.status} 
                          onValueChange={(value: TreatmentPlan["status"]) => 
                            handleUpdateStatus(plan.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}