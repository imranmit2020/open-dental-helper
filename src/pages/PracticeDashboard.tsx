import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Star,
  AlertCircle,
  CheckCircle,
  Building
} from "lucide-react";

const PracticeDashboard = () => {
  const stats = [
    {
      title: "Total Patients",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: "24",
      change: "+3",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Monthly Revenue",
      value: "$87,450",
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Efficiency Score",
      value: "94%",
      change: "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const practiceMetrics = [
    { label: "Patient Satisfaction", value: 96, target: 95 },
    { label: "Appointment Utilization", value: 88, target: 85 },
    { label: "Treatment Success Rate", value: 94, target: 90 },
    { label: "Revenue Growth", value: 76, target: 70 }
  ];

  const operationalAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Equipment Maintenance Due",
      message: "Dental X-ray machine needs scheduled maintenance",
      priority: "high"
    },
    {
      id: 2,
      type: "info",
      title: "Staff Training Reminder",
      message: "Annual CPR certification expires in 30 days",
      priority: "medium"
    },
    {
      id: 3,
      type: "success",
      title: "Quality Certification Renewed",
      message: "ADA certification successfully renewed",
      priority: "low"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New patient registration",
      patient: "Emily Rodriguez",
      time: "2 hours ago",
      type: "registration"
    },
    {
      id: 2,
      action: "Treatment plan approved",
      patient: "Michael Thompson",
      time: "4 hours ago",
      type: "treatment"
    },
    {
      id: 3,
      action: "Emergency appointment scheduled",
      patient: "Sarah Wilson",
      time: "6 hours ago",
      type: "emergency"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Practice Overview
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage your dental practice performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Building className="w-4 h-4 mr-2" />
              Manage Locations
            </Button>
            <Button>
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={`${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Practice Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Practice Performance
              </CardTitle>
              <CardDescription>
                Key performance indicators for your practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {practiceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-muted-foreground">
                      {metric.value}% / {metric.target}%
                    </span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Operational Alerts
              </CardTitle>
              <CardDescription>
                Important notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="mt-0.5">
                    {alert.type === "warning" && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    {alert.type === "info" && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    {alert.type === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge
                    variant={
                      alert.priority === "high" 
                        ? "destructive" 
                        : alert.priority === "medium" 
                        ? "default" 
                        : "secondary"
                    }
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest practice activities and patient interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{activity.action}</h4>
                    <p className="text-sm text-muted-foreground">
                      Patient: {activity.patient}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <Badge variant="outline" className="mt-1">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticeDashboard;