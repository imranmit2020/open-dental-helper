import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Target, 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  Bell,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface PreventivePlan {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  riskLevel: "low" | "medium" | "high";
  planType: "basic" | "comprehensive" | "intensive";
  createdDate: string;
  lastUpdated: string;
  nextReview: string;
  compliance: number;
  goals: PreventiveGoal[];
  recommendations: Recommendation[];
  progress: ProgressMetric[];
}

interface PreventiveGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  current: string;
  progress: number;
  deadline: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "overdue";
}

interface Recommendation {
  id: string;
  category: "oral_hygiene" | "diet" | "lifestyle" | "professional_care";
  title: string;
  description: string;
  frequency: string;
  importance: "low" | "medium" | "high";
  completed: boolean;
  dueDate?: string;
}

interface ProgressMetric {
  id: string;
  metric: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  lastMeasured: string;
}

export default function PersonalizedPreventiveCare() {
  const [selectedPatient, setSelectedPatient] = useState<string>("patient1");
  const [newPlanOpen, setNewPlanOpen] = useState(false);

  const [preventivePlans] = useState<PreventivePlan[]>([
    {
      id: "plan1",
      patientId: "patient1",
      patientName: "Sarah Johnson",
      age: 34,
      riskLevel: "medium",
      planType: "comprehensive",
      createdDate: "2024-01-01",
      lastUpdated: "2024-01-15",
      nextReview: "2024-04-15",
      compliance: 78,
      goals: [
        {
          id: "goal1",
          title: "Improve Brushing Frequency",
          description: "Brush teeth twice daily with fluoride toothpaste",
          target: "2x daily",
          current: "1.5x daily",
          progress: 75,
          deadline: "2024-03-01",
          priority: "high",
          status: "in_progress"
        },
        {
          id: "goal2",
          title: "Reduce Sugar Intake",
          description: "Limit sugary drinks and snacks",
          target: "< 2 servings/day",
          current: "3 servings/day",
          progress: 40,
          deadline: "2024-02-15",
          priority: "medium",
          status: "in_progress"
        },
        {
          id: "goal3",
          title: "Regular Flossing",
          description: "Floss daily to prevent gum disease",
          target: "Daily",
          current: "3x/week",
          progress: 60,
          deadline: "2024-02-28",
          priority: "high",
          status: "in_progress"
        }
      ],
      recommendations: [
        {
          id: "rec1",
          category: "oral_hygiene",
          title: "Use Electric Toothbrush",
          description: "Upgrade to an electric toothbrush for better plaque removal",
          frequency: "Daily",
          importance: "high",
          completed: false
        },
        {
          id: "rec2",
          category: "diet",
          title: "Increase Water Intake",
          description: "Drink more water throughout the day to maintain oral hydration",
          frequency: "8 glasses/day",
          importance: "medium",
          completed: true
        },
        {
          id: "rec3",
          category: "professional_care",
          title: "Fluoride Treatment",
          description: "Professional fluoride application during next visit",
          frequency: "Every 6 months",
          importance: "high",
          completed: false,
          dueDate: "2024-02-20"
        }
      ],
      progress: [
        {
          id: "metric1",
          metric: "Plaque Index",
          value: 2.1,
          target: 1.5,
          unit: "score",
          trend: "down",
          lastMeasured: "2024-01-15"
        },
        {
          id: "metric2",
          metric: "Gum Health Score",
          value: 7.5,
          target: 8.5,
          unit: "score",
          trend: "up",
          lastMeasured: "2024-01-15"
        },
        {
          id: "metric3",
          metric: "Cavity Risk",
          value: 3.2,
          target: 2.0,
          unit: "risk score",
          trend: "down",
          lastMeasured: "2024-01-15"
        }
      ]
    }
  ]);

  const currentPlan = preventivePlans.find(p => p.patientId === selectedPatient);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case "stable": return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const handleCreatePlan = () => {
    toast.success("New preventive care plan created successfully!");
    setNewPlanOpen(false);
  };

  const handleUpdateGoal = (goalId: string) => {
    toast.success("Goal updated successfully!");
  };

  const handleSendReminder = () => {
    toast.success("Reminder sent to patient!");
  };

  if (!currentPlan) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No plan found for selected patient</h2>
          <Button onClick={() => setNewPlanOpen(true)}>Create New Plan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Heart className="h-8 w-8" />
            Personalized Preventive Care
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered personalized dental care plans and prevention strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-48">
              <User className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient1">Sarah Johnson</SelectItem>
              <SelectItem value="patient2">Michael Chen</SelectItem>
              <SelectItem value="patient3">Emily Rodriguez</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Personalized Preventive Care Plan</DialogTitle>
                <DialogDescription>
                  Generate an AI-powered preventive care plan based on patient risk assessment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient1">Sarah Johnson</SelectItem>
                        <SelectItem value="patient2">Michael Chen</SelectItem>
                        <SelectItem value="patient3">Emily Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Plan Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Prevention</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Care</SelectItem>
                        <SelectItem value="intensive">Intensive Prevention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Risk Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter any specific risk factors or considerations..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewPlanOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Generate AI Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Patient Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{currentPlan.patientName}</CardTitle>
              <CardDescription className="text-lg">
                Age {currentPlan.age} • {currentPlan.planType} preventive plan
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getRiskColor(currentPlan.riskLevel)}>
                {currentPlan.riskLevel} risk
              </Badge>
              <Badge variant="outline">
                {currentPlan.compliance}% compliance
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentPlan.goals.length}</div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentPlan.compliance}%</div>
              <div className="text-sm text-muted-foreground">Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {currentPlan.recommendations.filter(r => !r.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Date(currentPlan.nextReview).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Next Review</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
          <TabsTrigger value="timeline">Care Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <div className="space-y-4">
            {currentPlan.goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Target:</span> {goal.target}
                    </div>
                    <div>
                      <span className="font-medium">Current:</span> {goal.current}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {goal.deadline}
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span> {goal.progress}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateGoal(goal.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSendReminder}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Remind
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4">
            {currentPlan.recommendations.map((rec) => (
              <Card key={rec.id} className={rec.completed ? "bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {rec.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {rec.title}
                      </CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {rec.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(rec.importance)}>
                        {rec.importance}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frequency:</span> {rec.frequency}
                    </div>
                    {rec.dueDate && (
                      <div>
                        <span className="font-medium">Due:</span> {rec.dueDate}
                      </div>
                    )}
                  </div>
                  
                  {!rec.completed && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Mark Complete
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send to Patient
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentPlan.progress.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {metric.metric}
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {metric.value} {metric.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {metric.target} {metric.unit}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to Target</span>
                        <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Last measured: {metric.lastMeasured}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Preventive Care Timeline
              </CardTitle>
              <CardDescription>
                Scheduled activities and milestones for optimal oral health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted"></div>
                  
                  {[
                    { date: "2024-02-15", title: "Fluoride Treatment", type: "professional", status: "upcoming" },
                    { date: "2024-02-20", title: "Brushing Goal Check", type: "goal", status: "upcoming" },
                    { date: "2024-03-01", title: "Professional Cleaning", type: "professional", status: "scheduled" },
                    { date: "2024-04-15", title: "Plan Review", type: "review", status: "scheduled" }
                  ].map((event, index) => (
                    <div key={index} className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium z-10">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}