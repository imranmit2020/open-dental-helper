import React, { useState } from 'react';
import { Activity, Bell, Users, AlertTriangle, Wifi, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RealtimeNotificationCenter } from '@/components/RealtimeNotificationCenter';
import { IoTChairStatusGrid } from '@/components/IoTChairStatusGrid';
import { EmergencyAlertSystem } from '@/components/EmergencyAlertSystem';
import { LiveWaitingRoom } from '@/components/LiveWaitingRoom';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

export default function RealtimeSystemsDashboard() {
  const { notifications, chairStatuses, emergencyAlerts, connectionStatus } = useRealtimeNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const activeEmergencies = emergencyAlerts.filter(a => a.status === 'active').length;
  const availableChairs = chairStatuses.filter(c => c.status === 'available').length;
  const occupiedChairs = chairStatuses.filter(c => c.status === 'occupied').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-500" />
            Real-Time Systems Dashboard
          </h1>
          <p className="text-muted-foreground">
            Live monitoring, notifications, and emergency management
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <Wifi className="h-5 w-5 text-red-500" />
            )}
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
          </div>
          
          <RealtimeNotificationCenter />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <Bell className="h-5 w-5" />
              Live Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{unreadNotifications}</div>
            <p className="text-sm text-blue-600">Unread alerts</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Activity className="h-5 w-5" />
              Chair Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{availableChairs}/{availableChairs + occupiedChairs}</div>
            <p className="text-sm text-green-600">Available chairs</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{activeEmergencies}</div>
            <p className="text-sm text-red-600">Active emergencies</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Users className="h-5 w-5" />
              Waiting Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">3</div>
            <p className="text-sm text-purple-600">In queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chairs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            IoT Chairs
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Waiting Room
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time system health monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">IoT Sensors</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Notification System</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Emergency Protocol</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Database Sync</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center gap-3 p-2 border rounded">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🚀 Real-Time Systems Active
                </h3>
                <p className="text-blue-800 text-sm">
                  All systems are operational with live IoT sensor monitoring, instant notifications, 
                  emergency alert protocols, and real-time waiting room management. 
                  Your practice is fully connected and monitored 24/7.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chairs">
          <IoTChairStatusGrid />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyAlertSystem />
        </TabsContent>

        <TabsContent value="waiting">
          <LiveWaitingRoom />
        </TabsContent>
      </Tabs>
    </div>
  );
}