import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EquipmentCalibration, useIoTHardware } from '@/hooks/useIoTHardware';
import { Calendar, Clock, AlertTriangle, CheckCircle, Settings, History, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EquipmentCalibrationManager: React.FC = () => {
  const { equipmentCalibration, scheduleCalibration } = useIoTHardware();
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [newCalibrationDate, setNewCalibrationDate] = useState('');

  const getStatusColor = (status: EquipmentCalibration['status']) => {
    switch (status) {
      case 'calibrated': return 'bg-green-500 text-white';
      case 'due': return 'bg-yellow-500 text-white';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'maintenance': return 'bg-blue-500 text-white';
    }
  };

  const getStatusIcon = (status: EquipmentCalibration['status']) => {
    switch (status) {
      case 'calibrated': return <CheckCircle className="h-4 w-4" />;
      case 'due': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
    }
  };

  const getDaysUntilCalibration = (nextCalibration: string) => {
    const today = new Date();
    const calibrationDate = new Date(nextCalibration);
    const diffTime = calibrationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleScheduleCalibration = async (equipmentId: string) => {
    if (!newCalibrationDate) {
      toast({
        title: "Date Required",
        description: "Please select a calibration date.",
        variant: "destructive",
      });
      return;
    }

    await scheduleCalibration(equipmentId, new Date(newCalibrationDate).toISOString());
    setNewCalibrationDate('');
    setSelectedEquipment(null);
  };

  const getEquipmentIcon = (type: string) => {
    // You could expand this with more specific icons based on equipment type
    return <Settings className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Equipment Calibration Management</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {equipmentCalibration.filter(eq => eq.status === 'calibrated').length}
              </p>
              <p className="text-sm text-muted-foreground">Calibrated</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">
                {equipmentCalibration.filter(eq => eq.status === 'due').length}
              </p>
              <p className="text-sm text-muted-foreground">Due Soon</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {equipmentCalibration.filter(eq => eq.status === 'overdue').length}
              </p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">
                {equipmentCalibration.filter(eq => eq.status === 'maintenance').length}
              </p>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Equipment List */}
      <div className="grid gap-6">
        {equipmentCalibration.map((equipment) => {
          const daysUntil = getDaysUntilCalibration(equipment.next_calibration);
          
          return (
            <Card key={equipment.id} className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEquipmentIcon(equipment.equipment_type)}
                    <div>
                      <CardTitle className="text-lg">{equipment.equipment_name}</CardTitle>
                      <CardDescription>
                        {equipment.equipment_type} • {equipment.location}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(equipment.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(equipment.status)}
                      {equipment.status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Calibration Timeline */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Calibration</Label>
                    <p className="text-sm">
                      {new Date(equipment.last_calibration).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.abs(Math.ceil((new Date().getTime() - new Date(equipment.last_calibration).getTime()) / (1000 * 60 * 60 * 24)))} days ago
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Next Calibration</Label>
                    <p className="text-sm">
                      {new Date(equipment.next_calibration).toLocaleDateString()}
                    </p>
                    <p className={`text-xs font-medium ${
                      daysUntil < 0 ? 'text-red-600' : 
                      daysUntil <= 30 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                       daysUntil === 0 ? 'Due today' :
                       `${daysUntil} days remaining`}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Calibration History</Label>
                    <p className="text-sm">
                      {equipment.calibration_history.length} records
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {equipment.calibration_history.length > 0 ? 
                        `Last passed: ${equipment.calibration_history[0]?.passed ? 'Yes' : 'No'}` :
                        'No history available'
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedEquipment(equipment.id)}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Schedule Calibration
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Calibration</DialogTitle>
                        <DialogDescription>
                          Schedule next calibration for {equipment.equipment_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="calibration-date">Calibration Date</Label>
                          <Input
                            id="calibration-date"
                            type="date"
                            value={newCalibrationDate}
                            onChange={(e) => setNewCalibrationDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleScheduleCalibration(equipment.id)}
                            className="flex-1"
                          >
                            Schedule
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedEquipment(null);
                              setNewCalibrationDate('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Calibration History</DialogTitle>
                        <DialogDescription>
                          Calibration records for {equipment.equipment_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-96 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Technician</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {equipment.calibration_history.length > 0 ? (
                              equipment.calibration_history.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    {new Date(record.date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{record.technician}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={record.passed ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {record.passed ? 'Passed' : 'Failed'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {record.notes || 'No notes'}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  No calibration history available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};