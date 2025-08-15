import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, PlayCircle, FileText, Users, Settings, Shield } from "lucide-react";
import { ModuleFlowChart } from "@/components/ModuleFlowChart";

const ONBOARDING_CONTENT = {
  "dentist": {
    title: "Welcome, Dentist!",
    description: "Get familiar with your clinical tools and patient management features",
    modules: [
      { key: "patient-charting", title: "Patient Charting", icon: FileText },
      { key: "schedule", title: "Appointment Scheduling", icon: Users },
      { key: "xray-diagnostics", title: "X-Ray Diagnostics", icon: Shield },
      { key: "treatment-plan-generator", title: "Treatment Planning", icon: Settings }
    ],
    videos: [
      { title: "Patient Management Overview", url: "https://www.youtube.com/watch?v=9KHLTZaJcR8", duration: "8 min" },
      { title: "Digital Charting System", url: "https://www.youtube.com/watch?v=example2", duration: "12 min" },
      { title: "Treatment Planning Workflow", url: "https://www.youtube.com/watch?v=example3", duration: "15 min" }
    ]
  },
  "hygienist": {
    title: "Welcome, Hygienist!",
    description: "Learn about preventive care tools and patient communication features",
    modules: [
      { key: "patient-charting", title: "Patient Charting", icon: FileText },
      { key: "schedule", title: "Schedule Management", icon: Users },
      { key: "personalized-preventive-care", title: "Preventive Care", icon: Shield },
      { key: "patient-concierge", title: "Patient Communication", icon: Settings }
    ],
    videos: [
      { title: "Hygienist Dashboard Tour", url: "https://www.youtube.com/watch?v=example4", duration: "10 min" },
      { title: "Preventive Care Protocols", url: "https://www.youtube.com/watch?v=example5", duration: "14 min" }
    ]
  },
  "staff": {
    title: "Welcome, Staff Member!",
    description: "Discover front desk operations and practice management tools",
    modules: [
      { key: "schedule", title: "Schedule Management", icon: Users },
      { key: "patients", title: "Patient Records", icon: FileText },
      { key: "insurance-billing", title: "Insurance & Billing", icon: Settings },
      { key: "patient-concierge", title: "Patient Communication", icon: Shield }
    ],
    videos: [
      { title: "Front Desk Operations", url: "https://www.youtube.com/watch?v=example6", duration: "12 min" },
      { title: "Patient Check-in Process", url: "https://www.youtube.com/watch?v=example7", duration: "8 min" }
    ]
  },
  "admin": {
    title: "Welcome, Administrator!",
    description: "Master practice analytics, user management, and system configuration",
    modules: [
      { key: "practice-analytics", title: "Practice Analytics", icon: FileText },
      { key: "admin-user-management", title: "User Management", icon: Users },
      { key: "settings", title: "System Settings", icon: Settings },
      { key: "compliance-security", title: "Compliance & Security", icon: Shield }
    ],
    videos: [
      { title: "Admin Dashboard Overview", url: "https://www.youtube.com/watch?v=example8", duration: "16 min" },
      { title: "User & Role Management", url: "https://www.youtube.com/watch?v=example9", duration: "12 min" },
      { title: "Analytics & Reporting", url: "https://www.youtube.com/watch?v=example10", duration: "18 min" }
    ]
  }
};

export default function EmployeeOnboarding() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "staff";
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onboardingData = ONBOARDING_CONTENT[role as keyof typeof ONBOARDING_CONTENT] || ONBOARDING_CONTENT.staff;

  useEffect(() => {
    document.title = `Employee Onboarding - ${onboardingData.title}`;
    
    // Simulate progress loading
    const timer = setTimeout(() => setProgress(20), 500);
    return () => clearTimeout(timer);
  }, [onboardingData.title]);

  const markStepComplete = (step: string) => {
    if (!completedSteps.includes(step)) {
      const newCompleted = [...completedSteps, step];
      setCompletedSteps(newCompleted);
      setProgress((newCompleted.length / 6) * 100);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="px-3 py-1">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
          <Progress value={progress} className="flex-1 max-w-md" />
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <h1 className="text-3xl font-bold">{onboardingData.title}</h1>
        <p className="text-muted-foreground mt-2">{onboardingData.description}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          <TabsTrigger value="modules">System Modules</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Diagram</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Getting Started Checklist
              </CardTitle>
              <CardDescription>
                Complete these steps to get familiar with your role and responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "account", title: "Set up your account profile", completed: false },
                { id: "videos", title: "Watch role-specific training videos", completed: false },
                { id: "modules", title: "Explore relevant system modules", completed: false },
                { id: "workflow", title: "Review your daily workflow diagram", completed: false },
                { id: "practice", title: "Complete practice exercises", completed: false },
                { id: "questions", title: "Ask questions to your supervisor", completed: false }
              ].map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <CheckCircle 
                      className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} 
                    />
                    <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{step.title}</span>
                    {!isCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => markStepComplete(step.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onboardingData.videos.map((video, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    {video.title}
                  </CardTitle>
                  <CardDescription>Duration: {video.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      Watch Video
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Learning Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" asChild className="w-full justify-start">
                <a href="https://www.youtube.com/playlist?list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO" target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Complete Training Playlist
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <a href="https://docs.lovable.dev/" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  System Documentation
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onboardingData.modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card key={module.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href={`/${module.key}`}>
                        Explore Module
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Daily Workflow</CardTitle>
              <CardDescription>
                Understanding how different modules connect in your daily routine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full border rounded-lg bg-background/50">
                <ModuleFlowChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}