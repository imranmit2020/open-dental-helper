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
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, Dr. Smith. Here's your practice overview.</p>
        </div>
        <Button variant="gradient" size="lg" className="shadow-glow">
          New Patient
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="professional-card hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="medical-stat-value">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 professional-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Today's Schedule
            </CardTitle>
            <CardDescription className="text-base">
              {upcomingAppointments.length} appointments scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/30 hover-lift transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-primary bg-primary-light px-3 py-1 rounded-lg">
                      {appointment.time}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">{appointment.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {appointment.status === "confirmed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      appointment.status === "confirmed" 
                        ? "status-success" 
                        : "status-warning"
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
        <Card className="professional-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-secondary">
                <Activity className="h-5 w-5 text-white" />
              </div>
              AI Insights
            </CardTitle>
            <CardDescription className="text-base">
              Real-time practice analytics powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gradient-card rounded-xl border border-border/30 hover-lift transition-all duration-300">
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === "success" && (
                      <div className="p-1.5 rounded-lg bg-success-light">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    )}
                    {insight.type === "warning" && (
                      <div className="p-1.5 rounded-lg bg-warning-light">
                        <AlertCircle className="h-4 w-4 text-warning" />
                      </div>
                    )}
                    {insight.type === "info" && (
                      <div className="p-1.5 rounded-lg bg-info-light">
                        <TrendingUp className="h-4 w-4 text-info" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground leading-relaxed">{insight.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Health */}
      <Card className="professional-card hover-lift animate-scale-in">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-2xl font-semibold gradient-text">Practice Health Score</CardTitle>
          <CardDescription className="text-base">
            Overall practice performance metrics and KPIs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Patient Satisfaction</span>
                <span className="text-2xl font-bold text-success">96%</span>
              </div>
              <Progress value={96} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground">Excellent patient feedback scores</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Schedule Efficiency</span>
                <span className="text-2xl font-bold text-info">89%</span>
              </div>
              <Progress value={89} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground">Optimized appointment scheduling</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Revenue Growth</span>
                <span className="text-2xl font-bold text-primary">112%</span>
              </div>
              <Progress value={100} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground">Above target performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}