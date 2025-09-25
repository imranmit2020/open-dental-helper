import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Activity,
  TrendingUp,
  Star,
  Shield,
  Heart,
  User,
  FileText,
  Settings
} from "lucide-react";

const RightNavigation = () => {
  const notifications = [
    {
      id: 1,
      title: "New Appointment",
      message: "Sarah Johnson scheduled for 2:00 PM",
      time: "5 min ago",
      type: "appointment",
      icon: Calendar,
      priority: "high"
    },
    {
      id: 2,
      title: "Patient Check-in",
      message: "Michael Davis has arrived",
      time: "12 min ago",
      type: "checkin",
      icon: CheckCircle,
      priority: "medium"
    },
    {
      id: 3,
      title: "Lab Results",
      message: "X-ray results ready for review",
      time: "1 hour ago",
      type: "lab",
      icon: FileText,
      priority: "medium"
    }
  ];

  const quickStats = [
    {
      label: "Today's Patients",
      value: "12",
      icon: Users,
      trend: "+8%",
      color: "text-primary"
    },
    {
      label: "Pending Reviews",
      value: "5",
      icon: FileText,
      trend: "-2",
      color: "text-warning"
    },
    {
      label: "Revenue Today",
      value: "$2,450",
      icon: TrendingUp,
      trend: "+15%",
      color: "text-success"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Completed treatment",
      patient: "Emma Wilson",
      time: "30 min ago",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      id: 2,
      action: "Updated medical record",
      patient: "James Brown",
      time: "1 hour ago",
      icon: FileText,
      color: "text-primary"
    },
    {
      id: 3,
      action: "Scheduled follow-up",
      patient: "Lisa Garcia",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-secondary"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 border-destructive/20 text-destructive";
      case "medium": return "bg-warning/10 border-warning/20 text-warning";
      case "low": return "bg-success/10 border-success/20 text-success";
      default: return "bg-muted/50 border-border text-muted-foreground";
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-l border-border/50 backdrop-blur-sm">
      <div className="p-6 space-y-6 h-full">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Practice Overview
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time updates and insights
          </p>
        </div>

        <ScrollArea className="h-[calc(100%-6rem)]">
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Quick Stats</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} cursor-pointer hover:bg-opacity-80 transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                        <notification.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Recent Activity</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                      <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">Patient: {activity.patient}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Quick Actions</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Add New Patient
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <h3 className="font-medium">System Status</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Server Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">Current</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security</span>
                  <Badge className="bg-success/10 text-success border-success/20">Secured</Badge>
                </div>
                <Separator />
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RightNavigation;