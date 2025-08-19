import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartDentalChair } from '@/components/SmartDentalChair';
import { IoTEnvironmentalMonitoring } from '@/components/IoTEnvironmentalMonitoring';
import { SmartCabinetManager } from '@/components/SmartCabinetManager';
import { EquipmentCalibrationManager } from '@/components/EquipmentCalibrationManager';
import { Settings, Thermometer, Lock, Calendar, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useIoTHardware } from '@/hooks/useIoTHardware';

const IoTHardwareDashboard: React.FC = () => {
  const { chairs, environmentalData, smartCabinets, equipmentCalibration, isLoading } = useIoTHardware();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading IoT Systems...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalChairs = chairs.length;
  const occupiedChairs = chairs.filter(c => c.status === 'occupied').length;
  const environmentalAlerts = environmentalData.filter(e => e.status !== 'normal').length;
  const lockedCabinets = smartCabinets.filter(c => c.status === 'locked').length;
  const overdueEquipment = equipmentCalibration.filter(e => e.status === 'overdue').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IoT & Hardware Integration</h1>
          <p className="text-muted-foreground">
            Manage smart dental chairs, environmental monitoring, cabinet access, and equipment calibration
          </p>
        </div>
      </div>

      {/* Overview Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{occupiedChairs}/{totalChairs}</p>
              <p className="text-sm text-muted-foreground">Chairs Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Thermometer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{environmentalData.length - environmentalAlerts}</p>
              <p className="text-sm text-muted-foreground">Environmental Normal</p>
              {environmentalAlerts > 0 && (
                <p className="text-xs text-red-600">{environmentalAlerts} alerts</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lockedCabinets}</p>
              <p className="text-sm text-muted-foreground">Cabinets Secured</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{equipmentCalibration.length - overdueEquipment}</p>
              <p className="text-sm text-muted-foreground">Equipment Current</p>
              {overdueEquipment > 0 && (
                <p className="text-xs text-red-600">{overdueEquipment} overdue</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status Overview
          </CardTitle>
          <CardDescription>Real-time status of all IoT systems and hardware</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Smart Chairs: Online</span>
            </div>
            <div className="flex items-center gap-2">
              {environmentalAlerts === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm">Environmental: {environmentalAlerts === 0 ? 'Normal' : 'Alerts'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Cabinet Access: Secure</span>
            </div>
            <div className="flex items-center gap-2">
              {overdueEquipment === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">Calibration: {overdueEquipment === 0 ? 'Current' : 'Needs Attention'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="chairs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chairs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Smart Chairs
          </TabsTrigger>
          <TabsTrigger value="environmental" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="cabinets" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Smart Cabinets
          </TabsTrigger>
          <TabsTrigger value="calibration" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calibration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chairs" className="space-y-6">
          <SmartDentalChair />
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <IoTEnvironmentalMonitoring />
        </TabsContent>

        <TabsContent value="cabinets" className="space-y-6">
          <SmartCabinetManager />
        </TabsContent>

        <TabsContent value="calibration" className="space-y-6">
          <EquipmentCalibrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTHardwareDashboard;