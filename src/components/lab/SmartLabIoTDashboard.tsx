import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, Thermometer, Droplets, Wind, Activity, Zap, 
  Shield, Gauge, TrendingUp, AlertTriangle, CheckCircle,
  Settings, Power, Bluetooth, Radio, Smartphone, Cpu
} from 'lucide-react';
import { toast } from 'sonner';

interface IoTDevice {
  id: string;
  name: string;
  type: 'furnace' | 'mill' | 'scanner' | 'printer' | 'environmental' | 'storage';
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  location: string;
  lastSeen: Date;
  metrics: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    vibration?: number;
    power?: number;
    usage?: number;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
  connectivity: {
    protocol: 'WiFi' | 'Bluetooth' | 'Zigbee' | 'LoRaWAN';
    signalStrength: number;
    dataRate: number;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered?: Date;
  executionCount: number;
}

export function SmartLabIoTDashboard() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: 22.5,
    humidity: 45.2,
    airQuality: 85,
    vibration: 0.2,
    soundLevel: 35,
    lightLevel: 450
  });
  const [realTimeData, setRealTimeData] = useState<Record<string, any>>({});

  useEffect(() => {
    initializeDevices();
    initializeAutomationRules();
    startRealTimeMonitoring();
  }, []);

  const initializeDevices = () => {
    const mockDevices: IoTDevice[] = [
      {
        id: 'dev-001',
        name: 'CAD/CAM Mill Unit',
        type: 'mill',
        status: 'online',
        location: 'Production Floor A',
        lastSeen: new Date(),
        metrics: {
          temperature: 45.2,
          vibration: 0.8,
          power: 2.4,
          usage: 78.5
        },
        alerts: [
          { type: 'info', message: 'Maintenance due in 72 hours', timestamp: new Date() }
        ],
        connectivity: {
          protocol: 'WiFi',
          signalStrength: 92,
          dataRate: 150.5
        }
      },
      {
        id: 'dev-002',
        name: 'Ceramic Furnace',
        type: 'furnace',
        status: 'online',
        location: 'Firing Station 1',
        lastSeen: new Date(),
        metrics: {
          temperature: 980.5,
          pressure: 1.02,
          power: 8.7,
          usage: 95.2
        },
        alerts: [
          { type: 'warning', message: 'Temperature slightly elevated', timestamp: new Date() }
        ],
        connectivity: {
          protocol: 'WiFi',
          signalStrength: 87,
          dataRate: 98.3
        }
      },
      {
        id: 'dev-003',
        name: '3D Printer Station',
        type: 'printer',
        status: 'online',
        location: 'Prototyping Lab',
        lastSeen: new Date(),
        metrics: {
          temperature: 210.0,
          humidity: 25.8,
          usage: 45.7
        },
        alerts: [],
        connectivity: {
          protocol: 'Bluetooth',
          signalStrength: 78,
          dataRate: 45.2
        }
      },
      {
        id: 'dev-004',
        name: 'Intraoral Scanner',
        type: 'scanner',
        status: 'online',
        location: 'Dental Office 2',
        lastSeen: new Date(),
        metrics: {
          temperature: 35.2,
          usage: 23.8
        },
        alerts: [],
        connectivity: {
          protocol: 'WiFi',
          signalStrength: 95,
          dataRate: 200.1
        }
      },
      {
        id: 'dev-005',
        name: 'Environmental Monitor',
        type: 'environmental',
        status: 'online',
        location: 'Clean Room',
        lastSeen: new Date(),
        metrics: {
          temperature: 22.5,
          humidity: 45.2,
          pressure: 1013.25
        },
        alerts: [],
        connectivity: {
          protocol: 'Zigbee',
          signalStrength: 89,
          dataRate: 12.5
        }
      },
      {
        id: 'dev-006',
        name: 'Smart Storage Unit',
        type: 'storage',
        status: 'maintenance',
        location: 'Material Storage',
        lastSeen: new Date(Date.now() - 30000),
        metrics: {
          temperature: 18.5,
          humidity: 35.0
        },
        alerts: [
          { type: 'error', message: 'Door sensor malfunction detected', timestamp: new Date() }
        ],
        connectivity: {
          protocol: 'LoRaWAN',
          signalStrength: 65,
          dataRate: 5.5
        }
      }
    ];

    setDevices(mockDevices);
  };

  const initializeAutomationRules = () => {
    const mockRules: AutomationRule[] = [
      {
        id: 'rule-001',
        name: 'Temperature Alert System',
        trigger: 'Temperature > 50°C',
        condition: 'Device type = Mill OR Furnace',
        action: 'Send alert + Reduce power by 10%',
        enabled: true,
        lastTriggered: new Date(Date.now() - 3600000),
        executionCount: 12
      },
      {
        id: 'rule-002',
        name: 'Automatic Maintenance Scheduling',
        trigger: 'Usage hours > 500',
        condition: 'Device status = Online',
        action: 'Schedule maintenance + Notify technician',
        enabled: true,
        lastTriggered: new Date(Date.now() - 86400000),
        executionCount: 3
      },
      {
        id: 'rule-003',
        name: 'Energy Optimization',
        trigger: 'After hours (6 PM - 6 AM)',
        condition: 'Usage < 10%',
        action: 'Switch to power saving mode',
        enabled: true,
        lastTriggered: new Date(Date.now() - 43200000),
        executionCount: 45
      },
      {
        id: 'rule-004',
        name: 'Quality Environment Control',
        trigger: 'Humidity > 60% OR < 30%',
        condition: 'Location = Clean Room',
        action: 'Adjust HVAC settings + Log event',
        enabled: false,
        executionCount: 8
      }
    ];

    setAutomationRules(mockRules);
  };

  const startRealTimeMonitoring = () => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          metrics: {
            ...device.metrics,
            temperature: device.metrics.temperature ? 
              device.metrics.temperature + (Math.random() - 0.5) * 2 : undefined,
            humidity: device.metrics.humidity ?
              device.metrics.humidity + (Math.random() - 0.5) * 5 : undefined,
            vibration: device.metrics.vibration ?
              Math.max(0, device.metrics.vibration + (Math.random() - 0.5) * 0.2) : undefined,
            usage: device.metrics.usage ?
              Math.max(0, Math.min(100, device.metrics.usage + (Math.random() - 0.5) * 10)) : undefined
          },
          lastSeen: new Date()
        }))
      );

      setEnvironmentalData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: prev.humidity + (Math.random() - 0.5) * 2,
        airQuality: Math.max(0, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 5)),
        vibration: Math.max(0, prev.vibration + (Math.random() - 0.5) * 0.1),
        soundLevel: Math.max(0, prev.soundLevel + (Math.random() - 0.5) * 5),
        lightLevel: Math.max(0, prev.lightLevel + (Math.random() - 0.5) * 50)
      }));
    }, 3000);

    return () => clearInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-gray-600';
      case 'maintenance': return 'text-amber-600';
      case 'warning': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <Power className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mill': return <Cpu className="w-5 h-5" />;
      case 'furnace': return <Thermometer className="w-5 h-5" />;
      case 'scanner': return <Smartphone className="w-5 h-5" />;
      case 'printer': return <Settings className="w-5 h-5" />;
      case 'environmental': return <Wind className="w-5 h-5" />;
      case 'storage': return <Shield className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getConnectivityIcon = (protocol: string) => {
    switch (protocol) {
      case 'WiFi': return <Wifi className="w-4 h-4" />;
      case 'Bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'Zigbee': return <Radio className="w-4 h-4" />;
      case 'LoRaWAN': return <Radio className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
    toast.success('Automation rule updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Smart Lab IoT Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring and automation control</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Connected Devices', 
            value: devices.filter(d => d.status === 'online').length + '/' + devices.length,
            icon: Wifi, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Active Automations', 
            value: automationRules.filter(r => r.enabled).length,
            icon: Zap, 
            color: 'text-green-600' 
          },
          { 
            label: 'Alerts Today', 
            value: devices.reduce((sum, d) => sum + d.alerts.length, 0),
            icon: AlertTriangle, 
            color: 'text-amber-600' 
          },
          { 
            label: 'Energy Efficiency', 
            value: '94.2%',
            icon: TrendingUp, 
            color: 'text-purple-600' 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Device Monitor</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
              <Card key={device.id} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <CardTitle className="text-base">{device.name}</CardTitle>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="text-sm font-medium capitalize">{device.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{device.location}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="space-y-3">
                    {device.metrics.temperature && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Temperature</span>
                        </div>
                        <span className="text-sm font-medium">
                          {device.metrics.temperature.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                    
                    {device.metrics.humidity && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Humidity</span>
                        </div>
                        <span className="text-sm font-medium">
                          {device.metrics.humidity.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {device.metrics.usage && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Usage</span>
                          <span className="text-sm font-medium">{device.metrics.usage.toFixed(1)}%</span>
                        </div>
                        <Progress value={device.metrics.usage} className="h-2" />
                      </div>
                    )}

                    {device.metrics.power && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Power</span>
                        </div>
                        <span className="text-sm font-medium">
                          {device.metrics.power.toFixed(1)} kW
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Connectivity */}
                  <div className="bg-accent/10 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {getConnectivityIcon(device.connectivity.protocol)}
                        <span className="text-sm font-medium">{device.connectivity.protocol}</span>
                      </div>
                      <Badge variant="outline">
                        {device.connectivity.signalStrength}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Data Rate: {device.connectivity.dataRate.toFixed(1)} Mbps
                    </div>
                  </div>

                  {/* Alerts */}
                  {device.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recent Alerts</h4>
                      {device.alerts.slice(0, 2).map((alert, index) => (
                        <div key={index} className={`p-2 rounded text-xs ${
                          alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                          alert.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last seen: {device.lastSeen.toLocaleTimeString()}
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          {/* Environmental Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                label: 'Temperature', 
                value: environmentalData.temperature.toFixed(1) + '°C', 
                icon: Thermometer, 
                color: 'text-red-500',
                optimal: '20-24°C',
                status: environmentalData.temperature >= 20 && environmentalData.temperature <= 24 ? 'optimal' : 'warning'
              },
              { 
                label: 'Humidity', 
                value: environmentalData.humidity.toFixed(1) + '%', 
                icon: Droplets, 
                color: 'text-blue-500',
                optimal: '40-60%',
                status: environmentalData.humidity >= 40 && environmentalData.humidity <= 60 ? 'optimal' : 'warning'
              },
              { 
                label: 'Air Quality', 
                value: environmentalData.airQuality.toFixed(0) + ' AQI', 
                icon: Wind, 
                color: 'text-green-500',
                optimal: '80-100 AQI',
                status: environmentalData.airQuality >= 80 ? 'optimal' : 'warning'
              },
              { 
                label: 'Vibration', 
                value: environmentalData.vibration.toFixed(2) + ' mm/s', 
                icon: Activity, 
                color: 'text-purple-500',
                optimal: '<0.5 mm/s',
                status: environmentalData.vibration < 0.5 ? 'optimal' : 'warning'
              },
              { 
                label: 'Sound Level', 
                value: environmentalData.soundLevel.toFixed(0) + ' dB', 
                icon: Gauge, 
                color: 'text-orange-500',
                optimal: '<50 dB',
                status: environmentalData.soundLevel < 50 ? 'optimal' : 'warning'
              },
              { 
                label: 'Light Level', 
                value: environmentalData.lightLevel.toFixed(0) + ' lux', 
                icon: Activity, 
                color: 'text-yellow-500',
                optimal: '300-500 lux',
                status: environmentalData.lightLevel >= 300 && environmentalData.lightLevel <= 500 ? 'optimal' : 'warning'
              }
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                        <span className="font-medium">{metric.label}</span>
                      </div>
                      <Badge variant={metric.status === 'optimal' ? 'default' : 'secondary'}>
                        {metric.status === 'optimal' ? 'Optimal' : 'Monitor'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">
                        Optimal: {metric.optimal}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Automation Rules */}
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAutomationRule(rule.id)}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-green-600 mb-1">Trigger</h4>
                      <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-amber-600 mb-1">Condition</h4>
                      <p className="text-sm text-muted-foreground">{rule.condition}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-blue-600 mb-1">Action</h4>
                      <p className="text-sm text-muted-foreground">{rule.action}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Executed {rule.executionCount} times
                      {rule.lastTriggered && (
                        <span> • Last: {rule.lastTriggered.toLocaleString()}</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}