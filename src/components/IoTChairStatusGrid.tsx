import React, { useState } from 'react';
import { Armchair, Thermometer, Droplets, Activity, AlertTriangle, Settings, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRealtimeNotifications, ChairStatus } from '@/hooks/useRealtimeNotifications';

export function IoTChairStatusGrid() {
  const { chairStatuses, updateChairStatus } = useRealtimeNotifications();
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const getStatusColor = (status: ChairStatus['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 border-red-300 text-red-800 animate-pulse';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: ChairStatus['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <Users className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 animate-pulse" />;
      default:
        return <Armchair className="h-4 w-4" />;
    }
  };

  const getEquipmentStatusColor = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">IoT Chair Monitoring</h2>
          <p className="text-muted-foreground">Real-time sensor data and chair status</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-700">
          {chairStatuses.filter(c => c.status === 'available').length} Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chairStatuses.map((chair) => (
          <Card 
            key={chair.id}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedChair === chair.id ? 'ring-2 ring-blue-500' : ''
            } ${getStatusColor(chair.status)}`}
            onClick={() => setSelectedChair(selectedChair === chair.id ? null : chair.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Armchair className="h-5 w-5" />
                  {chair.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {getStatusIcon(chair.status)}
                  <span className="text-sm font-medium capitalize">
                    {chair.status}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Environmental Sensors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-muted-foreground">Temperature</span>
                  </div>
                  <div className="text-lg font-semibold">{chair.temperature}°F</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                  </div>
                  <div className="text-lg font-semibold">{chair.humidity}%</div>
                </div>
              </div>

              {/* Pressure Sensor */}
              {chair.status === 'occupied' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-purple-500" />
                      <span className="text-xs text-muted-foreground">Pressure</span>
                    </div>
                    <span className="text-xs font-medium">{chair.sensors.pressure}%</span>
                  </div>
                  <Progress value={chair.sensors.pressure} className="h-2" />
                </div>
              )}

              {/* Equipment Status */}
              <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                <span className="text-xs text-muted-foreground">Equipment Status</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getEquipmentStatusColor(chair.sensors.equipment_status)}`}
                >
                  {chair.sensors.equipment_status}
                </Badge>
              </div>

              {/* Motion & Emergency */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${
                    chair.sensors.motion ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs">Motion</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${
                    chair.sensors.emergency_button ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs">Emergency</span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Last updated: {formatTimestamp(chair.last_updated)}
              </div>

              {/* Quick Actions */}
              {selectedChair === chair.id && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateChairStatus(chair.id, 'maintenance');
                    }}
                    disabled={chair.status === 'emergency'}
                  >
                    Maintenance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateChairStatus(chair.id, 'available');
                    }}
                    disabled={chair.status === 'emergency'}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Sensor Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Sensor Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {chairStatuses.map((chair) => (
              <div key={`feed-${chair.id}`} className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{chair.name}: {chair.temperature}°F, {chair.humidity}% humidity</span>
                <Badge variant="outline" className="text-xs">
                  {formatTimestamp(chair.last_updated)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}