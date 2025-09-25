import { Bell, Calendar, Clock, Heart, MessageSquare, Shield, TrendingUp, Users, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const RightNavigation = () => {
  const quickStats = [
    { label: "Patients Today", value: "24", trend: "+12%", icon: Users, color: "text-medical-blue" },
    { label: "Revenue", value: "$8.2k", trend: "+8%", icon: TrendingUp, color: "text-medical-mint" },
    { label: "Appointments", value: "18", trend: "+5%", icon: Calendar, color: "text-medical-blue" },
    { label: "Success Rate", value: "98%", trend: "+2%", icon: Heart, color: "text-medical-mint" },
  ];

  const notifications = [
    { id: 1, text: "Dr. Smith's 3PM appointment confirmed", time: "5 min ago", type: "info", priority: "normal" },
    { id: 2, text: "Emergency patient arriving soon", time: "10 min ago", type: "warning", priority: "high" },
    { id: 3, text: "Lab results ready for John Doe", time: "15 min ago", type: "success", priority: "normal" },
    { id: 4, text: "Equipment maintenance scheduled", time: "1 hour ago", type: "info", priority: "low" },
  ];

  const recentActivities = [
    { id: 1, action: "Patient check-in", patient: "Sarah Wilson", time: "2 min ago" },
    { id: 2, action: "X-ray completed", patient: "Mike Johnson", time: "8 min ago" },
    { id: 3, action: "Treatment completed", patient: "Emma Davis", time: "12 min ago" },
    { id: 4, action: "Appointment scheduled", patient: "Tom Brown", time: "18 min ago" },
  ];

  const systemStatus = [
    { name: "Patient Database", status: "online", uptime: "99.9%" },
    { name: "Imaging System", status: "online", uptime: "98.5%" },
    { name: "Appointment System", status: "maintenance", uptime: "95.2%" },
    { name: "Billing System", status: "online", uptime: "99.7%" },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <Heart className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4 text-info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'maintenance': return 'bg-warning';
      case 'offline': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-gradient-to-b from-medical-blue/5 via-background to-medical-mint/5 border-l border-border glass-effect z-40">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg font-semibold gradient-text">Dashboard Overview</h2>
            <p className="text-sm text-muted-foreground">Real-time practice insights</p>
          </div>

          {/* Quick Stats */}
          <Card className="professional-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-medical-blue" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{stat.value}</div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="professional-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-medical-mint" />
                  Notifications
                </div>
                <Badge variant="outline" className="text-xs">4 new</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="p-2 rounded-lg bg-muted/20 border border-muted/40">
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-xs text-foreground">{notification.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {notification.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="professional-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-medical-blue" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <div>
                    <p className="text-xs font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.patient}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="professional-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Calendar className="h-4 w-4" />
                New Appointment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Users className="h-4 w-4" />
                Add Patient
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <MessageSquare className="h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="professional-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-medical-mint" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(system.status)}`}></div>
                    <span className="text-xs font-medium">{system.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{system.uptime}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
};

export default RightNavigation;