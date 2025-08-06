import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Settings,
  User,
  ChevronRight,
  Monitor,
  FileText,
  BarChart3,
  Boxes,
  Video,
  Phone,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  // Audit logging on dashboard access
  useEffect(() => {
    if (user) {
      logAction({
        action: 'VIEW_DASHBOARD',
        resource_type: 'dashboard',
        details: { timestamp: new Date().toISOString() }
      }).catch(error => {
        console.error('Failed to log dashboard access:', error);
        toast({
          title: "Logging Error",
          description: "Failed to record audit log",
          variant: "destructive"
        });
      });
    }
  }, [user, logAction]);

  // Log navigation actions
  const handleNavigation = (route: string, title: string) => {
    if (user) {
      logAction({
        action: 'NAVIGATE_FROM_DASHBOARD',
        resource_type: 'navigation',
        details: { target_route: route, target_title: title }
      }).catch(error => {
        console.error('Failed to log navigation:', error);
      });
    }
    navigate(route);
  };

  const mainKPIs = [
    {
      title: "Today's Appointments",
      value: "12 / 15",
      subtitle: "scheduled",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Revenue Forecast",
      value: 4560,
      subtitle: "Week",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "AI Alerts",
      value: "5 alerts",
      subtitle: "2 likely no-shows, 3 pending claims",
      icon: Bot,
      color: "text-warning"
    },
    {
      title: "Chair Utilization",
      value: "75%",
      subtitle: "current efficiency",
      icon: Activity,
      color: "text-info"
    }
  ];

  const aiInsights = [
    { 
      type: "revenue", 
      title: "Revenue Recovery", 
      message: "Call these 3 patients to recover lost revenue", 
      action: "View List",
      priority: "high"
    },
    { 
      type: "scheduling", 
      title: "Smart Scheduling", 
      message: "2 cancellations predicted, auto-fill?", 
      action: "Auto-Fill",
      priority: "medium"
    },
    { 
      type: "claims", 
      title: "Insurance Claims", 
      message: "3 claims ready for submission", 
      action: "Submit",
      priority: "low"
    },
  ];

  const quickNavigationTiles = [
    { title: "Schedule", icon: Calendar, route: "/schedule", color: "bg-primary" },
    { title: "Patients", icon: Users, route: "/patients", color: "bg-secondary" },
    { title: "Insurance", icon: FileText, route: "/insurance-billing", color: "bg-success" },
    { title: "Analytics", icon: BarChart3, route: "/practice-analytics", color: "bg-warning" },
    { title: "Inventory", icon: Boxes, route: "/inventory", color: "bg-info" },
    { title: "Teledentistry", icon: Video, route: "/teledentistry", color: "bg-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">AI Dental Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Dr. Smith. Here's your AI-powered practice overview.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {mainKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="professional-card hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {kpi.title}
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {kpi.title === "Revenue Forecast" ? (
                    <CurrencyDisplay amount={kpi.value as number} variant="large" />
                  ) : (
                    kpi.value
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{kpi.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights Section */}
      <Card className="professional-card hover-lift">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-secondary">
              <Bot className="h-5 w-5 text-white" />
            </div>
            AI Insights
          </CardTitle>
          <CardDescription className="text-base">
            Smart recommendations to optimize your practice
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-card rounded-xl border border-border/30 hover-lift transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-shrink-0">
                    {insight.type === "revenue" && (
                      <div className="p-2 rounded-lg bg-success-light">
                        <DollarSign className="h-4 w-4 text-success" />
                      </div>
                    )}
                    {insight.type === "scheduling" && (
                      <div className="p-2 rounded-lg bg-primary-light">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {insight.type === "claims" && (
                      <div className="p-2 rounded-lg bg-warning-light">
                        <FileText className="h-4 w-4 text-warning" />
                      </div>
                    )}
                  </div>
                  <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "secondary" : "outline"}>
                    {insight.priority}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {insight.action}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card className="professional-card hover-lift">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-xl">Quick Navigation</CardTitle>
          <CardDescription>
            Access key practice management features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickNavigationTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Button
                  key={tile.title}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:scale-105 transition-transform"
                  onClick={() => handleNavigation(tile.route, tile.title)}
                >
                  <div className={`p-2 rounded-lg ${tile.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{tile.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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