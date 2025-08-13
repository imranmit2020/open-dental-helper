import React from 'react';
import { ModuleFlowChart } from '@/components/ModuleFlowChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Share2 } from 'lucide-react';

export default function ModuleFlows() {
  const modules = [
    {
      name: 'Patient Management',
      icon: '👥',
      description: 'Complete patient lifecycle from registration to treatment',
      features: ['Registration', 'Profile Management', 'Medical History', 'Insurance Validation'],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'AI Scheduling',
      icon: '📅',
      description: 'Intelligent appointment scheduling with conflict resolution',
      features: ['Availability Check', 'AI Optimization', 'Staff Assignment', 'Notifications'],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      name: 'AI Marketing',
      icon: '🤖',
      description: 'Automated lead capture and conversion optimization',
      features: ['Lead Scoring', 'Personalization', 'Follow-up Automation', 'Campaign Analytics'],
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      name: 'Image Analysis',
      icon: '🔬',
      description: 'AI-powered dental imaging and diagnostic assistance',
      features: ['Image Processing', 'Pattern Recognition', 'Diagnostic Reports', 'Quality Validation'],
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      name: 'Data Migration',
      icon: '📊',
      description: 'Seamless import from legacy dental management systems',
      features: ['File Processing', 'Field Mapping', 'Data Validation', 'Conflict Resolution'],
      color: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      name: 'Revenue Management',
      icon: '💰',
      description: 'Financial optimization and billing automation',
      features: ['Invoice Generation', 'Payment Processing', 'Revenue Analytics', 'Insurance Claims'],
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Module Workflow Visualization</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore how each module in our dental management system works through interactive flow diagrams
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Flows
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Documentation
          </Button>
        </div>
      </div>

      {/* Interactive Flow Chart */}
      <ModuleFlowChart />

      {/* Module Overview Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Module Overview</h2>
          <p className="text-muted-foreground mt-2">
            Comprehensive breakdown of all system modules and their capabilities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card key={module.name} className="hover-scale group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {module.icon}
                </div>
                <CardTitle className="text-xl">{module.name}</CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="secondary"
                        className="text-xs justify-center"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Step {index + 1} of {modules.length}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-2 group-hover:gap-3 transition-all">
                    View Flow
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Why Workflow Visualization Matters</CardTitle>
          <CardDescription>
            Understanding your system's processes leads to better efficiency and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl">📈</div>
              <h3 className="font-semibold">Improved Efficiency</h3>
              <p className="text-sm text-muted-foreground">
                Clear process flows help staff understand their roles and optimize workflows
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <h3 className="font-semibold">Better Training</h3>
              <p className="text-sm text-muted-foreground">
                Visual guides make onboarding new team members faster and more effective
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl">⚡</div>
              <h3 className="font-semibold">Process Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Identify bottlenecks and improvement opportunities at a glance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}