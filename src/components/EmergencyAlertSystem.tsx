import React, { useState } from 'react';
import { AlertTriangle, Phone, Users, MapPin, Clock, Shield, Flame, Wrench, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useRealtimeNotifications, EmergencyAlert } from '@/hooks/useRealtimeNotifications';

export function EmergencyAlertSystem() {
  const { emergencyAlerts, triggerEmergencyAlert, acknowledgeEmergency } = useRealtimeNotifications();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'medical' as EmergencyAlert['type'],
    severity: 'high' as EmergencyAlert['severity'],
    location: '',
    chair_id: '',
    message: '',
    responders: [] as string[]
  });

  const getAlertIcon = (type: EmergencyAlert['type']) => {
    switch (type) {
      case 'medical':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'fire':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'equipment':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getStatusColor = (status: EmergencyAlert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-500 text-white animate-pulse';
      case 'acknowledged':
        return 'bg-yellow-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleCreateAlert = () => {
    if (!newAlert.location || !newAlert.message) return;

    triggerEmergencyAlert({
      type: newAlert.type,
      severity: newAlert.severity,
      location: newAlert.location,
      chair_id: newAlert.chair_id || undefined,
      message: newAlert.message,
      responders: newAlert.responders
    });

    setNewAlert({
      type: 'medical',
      severity: 'high',
      location: '',
      chair_id: '',
      message: '',
      responders: []
    });
    setIsCreateDialogOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const activeAlerts = emergencyAlerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = emergencyAlerts.filter(alert => alert.status === 'acknowledged');
  const resolvedAlerts = emergencyAlerts.filter(alert => alert.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            Emergency Alert System
          </h2>
          <p className="text-muted-foreground">Real-time emergency monitoring and response</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="animate-pulse">
            {activeAlerts.length} Active
          </Badge>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Alert
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Create Emergency Alert</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newAlert.type} onValueChange={(value: EmergencyAlert['type']) => 
                      setNewAlert(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <Select value={newAlert.severity} onValueChange={(value: EmergencyAlert['severity']) => 
                      setNewAlert(prev => ({ ...prev, severity: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g., Chair 3, Reception, Lab"
                    value={newAlert.location}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Chair ID (Optional)</label>
                  <Input
                    placeholder="e.g., chair-3"
                    value={newAlert.chair_id}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, chair_id: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Describe the emergency situation..."
                    value={newAlert.message}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateAlert}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!newAlert.location || !newAlert.message}
                >
                  Trigger Emergency Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600">🚨 Active Emergencies</h3>
          {activeAlerts.map((alert) => (
            <Alert key={alert.id} className="border-red-500 bg-red-50 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="font-semibold text-red-900 uppercase">
                        {alert.type} Emergency - {alert.severity}
                      </span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(alert.timestamp)}
                      </div>
                    </div>
                    <p className="text-red-800">{alert.message}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => acknowledgeEmergency(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Alert History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...acknowledgedAlerts, ...resolvedAlerts].slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{alert.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.location} • {formatTimestamp(alert.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {emergencyAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No emergency alerts</p>
                <p className="text-sm">System monitoring active</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}