import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DentistAvailabilityForm } from "./DentistAvailabilityForm";
import { useDentistAvailability } from "@/hooks/useDentistAvailability";
import { useTenant } from "@/contexts/TenantContext";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface DentistAvailabilityManagerProps {
  dentistId?: string;
}

export function DentistAvailabilityManager({ dentistId }: DentistAvailabilityManagerProps) {
  const { availability, loading, deleteAvailability } = useDentistAvailability(dentistId);
  const { tenants, currentTenant } = useTenant();
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || 'Unknown';
  };

  const getAvailabilityByClinic = () => {
    const clinicGroups = {};
    availability.forEach(avail => {
      const clinicId = avail.tenant_id;
      if (!clinicGroups[clinicId]) {
        clinicGroups[clinicId] = {
          tenant: avail.tenant,
          availability: []
        };
      }
      clinicGroups[clinicId].availability.push(avail);
    });
    return clinicGroups;
  };

  const handleEdit = (avail) => {
    setEditingAvailability(avail);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this availability schedule?')) {
      await deleteAvailability(id);
    }
  };

  const clinicGroups = getAvailabilityByClinic();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Multi-Clinic Availability</h3>
          <p className="text-sm text-muted-foreground">
            Manage dentist schedules across different clinics
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAvailability(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAvailability ? 'Edit Schedule' : 'Add New Schedule'}
              </DialogTitle>
              <DialogDescription>
                Set dentist availability for a specific clinic and day
              </DialogDescription>
            </DialogHeader>
            <DentistAvailabilityForm
              dentistId={dentistId}
              availability={editingAvailability}
              onSuccess={() => {
                setDialogOpen(false);
                setEditingAvailability(null);
              }}
              onCancel={() => {
                setDialogOpen(false);
                setEditingAvailability(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(clinicGroups).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules set</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding availability schedules for different clinics
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAvailability(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Schedule</DialogTitle>
                  <DialogDescription>
                    Set dentist availability for a specific clinic and day
                  </DialogDescription>
                </DialogHeader>
                <DentistAvailabilityForm
                  dentistId={dentistId}
                  onSuccess={() => setDialogOpen(false)}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(clinicGroups).map(([clinicId, group]: [string, any]) => (
            <Card key={clinicId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {group.tenant?.name || 'Unknown Clinic'}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {group.tenant?.clinic_code?.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.availability.length} day{group.availability.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {group.availability
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((avail) => (
                    <div key={avail.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {getDayName(avail.day_of_week)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                          {avail.break_start_time && avail.break_end_time && (
                            <span className="ml-2">
                              (Break: {formatTime(avail.break_start_time)} - {formatTime(avail.break_end_time)})
                            </span>
                          )}
                        </div>
                        {!avail.is_available && (
                          <Badge variant="destructive" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(avail)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(avail.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}