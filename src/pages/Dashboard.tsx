import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Today's Patients",
      value: "12",
      change: "+2 from yesterday",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Appointments",
      value: "15",
      change: "3 pending confirmation",
      icon: Calendar,
      color: "text-secondary"
    },
    {
      title: "Revenue Today",
      value: "$3,240",
      change: "+12% from last week",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Practice Efficiency",
      value: "94%",
      change: "+5% this month",
      icon: Activity,
      color: "text-warning"
    }
  ];

  const upcomingAppointments = [
    { time: "9:00 AM", patient: "Sarah Johnson", type: "Cleaning", status: "confirmed" },
    { time: "10:30 AM", patient: "Mike Davis", type: "Root Canal", status: "confirmed" },
    { time: "2:00 PM", patient: "Emily Chen", type: "Crown Prep", status: "pending" },
    { time: "3:30 PM", patient: "Robert Wilson", type: "Consultation", status: "confirmed" },
  ];

  const aiInsights = [
    { type: "success", message: "X-ray analysis detected no anomalies in 8 recent scans" },
    { type: "warning", message: "3 patients overdue for periodic cleaning" },
    { type: "info", message: "Voice notes transcribed for 12 patient visits today" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Smith. Here's your practice overview.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all">
          New Patient
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length} appointments scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {appointment.time}
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">{appointment.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.status === "confirmed" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === "confirmed" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Real-time practice analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  {insight.type === "success" && <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />}
                  {insight.type === "warning" && <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />}
                  {insight.type === "info" && <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />}
                  <div className="text-sm">{insight.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Health */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Health Score</CardTitle>
          <CardDescription>Overall practice performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Patient Satisfaction</span>
                <span>96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Schedule Efficiency</span>
                <span>89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Revenue Growth</span>
                <span>112%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}