import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnvironmentalData, useIoTHardware } from '@/hooks/useIoTHardware';
import { Thermometer, Droplets, Wind, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export const IoTEnvironmentalMonitoring: React.FC = () => {
  const { environmentalData } = useIoTHardware();

  const getStatusColor = (status: EnvironmentalData['status']) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getStatusIcon = (status: EnvironmentalData['status']) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAirQualityLevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-600' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-600' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'text-orange-600' };
    return { level: 'Unhealthy', color: 'text-red-600' };
  };

  const getCO2Level = (co2: number) => {
    if (co2 <= 400) return { level: 'Excellent', color: 'text-green-600' };
    if (co2 <= 600) return { level: 'Good', color: 'text-yellow-600' };
    if (co2 <= 800) return { level: 'Acceptable', color: 'text-orange-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Environmental Monitoring</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {environmentalData.map((sensor) => {
          const airQuality = getAirQualityLevel(sensor.air_quality);
          const co2Quality = getCO2Level(sensor.co2_level);

          return (
            <Card key={sensor.sensor_id} className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sensor.location}</CardTitle>
                  <Badge className={getStatusColor(sensor.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(sensor.status)}
                      {sensor.status}
                    </div>
                  </Badge>
                </div>
                <CardDescription>
                  Sensor ID: {sensor.sensor_id}
                  <br />
                  Last updated: {new Date(sensor.last_updated).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <span className="text-2xl font-bold">{sensor.temperature}°C</span>
                  </div>
                  <Progress 
                    value={(sensor.temperature - 18) * 10} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optimal range: 20-24°C
                  </p>
                </div>

                {/* Humidity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <span className="text-2xl font-bold">{sensor.humidity}%</span>
                  </div>
                  <Progress 
                    value={sensor.humidity} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optimal range: 40-60%
                  </p>
                </div>

                {/* Air Quality */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Air Quality</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{sensor.air_quality}</span>
                      <span className="text-sm text-muted-foreground ml-1">AQI</span>
                    </div>
                  </div>
                  <Progress 
                    value={(sensor.air_quality / 150) * 100} 
                    className="h-2"
                  />
                  <p className={`text-xs font-medium ${airQuality.color}`}>
                    {airQuality.level}
                  </p>
                </div>

                {/* CO2 Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">CO₂ Level</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{sensor.co2_level}</span>
                      <span className="text-sm text-muted-foreground ml-1">PPM</span>
                    </div>
                  </div>
                  <Progress 
                    value={(sensor.co2_level / 1000) * 100} 
                    className="h-2"
                  />
                  <p className={`text-xs font-medium ${co2Quality.color}`}>
                    {co2Quality.level}
                  </p>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">Ventilation</p>
                    <p className="font-medium">
                      {sensor.co2_level < 600 ? 'Adequate' : 'Insufficient'}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">Comfort</p>
                    <p className="font-medium">
                      {sensor.temperature >= 20 && sensor.temperature <= 24 && 
                       sensor.humidity >= 40 && sensor.humidity <= 60 ? 'Optimal' : 'Suboptimal'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Environmental Summary</CardTitle>
          <CardDescription>Overall facility environmental status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {environmentalData.filter(s => s.status === 'normal').length}
              </p>
              <p className="text-sm text-muted-foreground">Normal Sensors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {environmentalData.filter(s => s.status === 'warning').length}
              </p>
              <p className="text-sm text-muted-foreground">Warning Sensors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {environmentalData.filter(s => s.status === 'critical').length}
              </p>
              <p className="text-sm text-muted-foreground">Critical Sensors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.round(environmentalData.reduce((acc, s) => acc + s.temperature, 0) / environmentalData.length)}°C
              </p>
              <p className="text-sm text-muted-foreground">Avg Temperature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};