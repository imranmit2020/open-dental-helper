import React from 'react';
import { ModuleFlowChart } from '@/components/ModuleFlowChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Share2 } from 'lucide-react';

export default function ModuleFlows() {
  const modules = [
    {
      name: 'Practice Dashboard',
      icon: '🏥',
      description: 'Central practice management and overview dashboard',
      features: ['Analytics Overview', 'Quick Actions', 'Staff Performance', 'Daily Schedule'],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'Dentist Dashboard',
      icon: '👨‍⚕️',
      description: 'Personalized dentist workspace and patient management',
      features: ['Patient Queue', 'Treatment Plans', 'Clinical Notes', 'Diagnostics'],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      name: 'Patient Management',
      icon: '👥',
      description: 'Complete patient lifecycle from registration to treatment',
      features: ['Registration', 'Profile Management', 'Medical History', 'Insurance Validation'],
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      name: 'Medical History',
      icon: '📋',
      description: 'Comprehensive medical records and history tracking',
      features: ['Medical Records', 'Allergies', 'Medications', 'Conditions'],
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      name: 'Consent Forms',
      icon: '📝',
      description: 'Digital consent management and patient agreements',
      features: ['Form Creation', 'Digital Signatures', 'Version Control', 'Compliance'],
      color: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      name: 'Treatment Plans',
      icon: '🦷',
      description: 'AI-powered treatment planning and recommendations',
      features: ['Treatment Design', 'Cost Estimation', 'Timeline Planning', 'Progress Tracking'],
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      name: 'Insurance & Billing',
      icon: '💳',
      description: 'Automated insurance claims and billing management',
      features: ['Claims Processing', 'Eligibility Check', 'Payment Tracking', 'Revenue Reports'],
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      name: 'Schedule Management',
      icon: '📅',
      description: 'Advanced scheduling with staff availability management',
      features: ['Appointment Booking', 'Staff Scheduling', 'Room Management', 'Wait Lists'],
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      name: 'AI Scheduling',
      icon: '🤖',
      description: 'Intelligent appointment scheduling with conflict resolution',
      features: ['Availability Check', 'AI Optimization', 'Staff Assignment', 'Smart Notifications'],
      color: 'bg-pink-100 text-pink-800 border-pink-200'
    },
    {
      name: 'Teledentistry',
      icon: '💻',
      description: 'Virtual consultations and remote patient care',
      features: ['Video Consultations', 'Remote Monitoring', 'Digital Prescriptions', 'Follow-ups'],
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    },
    {
      name: 'Voice Transcription',
      icon: '🎤',
      description: 'AI-powered voice notes and clinical documentation',
      features: ['Voice Recognition', 'Medical Transcription', 'Note Templates', 'Voice Commands'],
      color: 'bg-lime-100 text-lime-800 border-lime-200'
    },
    {
      name: 'Image Analysis',
      icon: '🔬',
      description: 'AI-powered dental imaging and diagnostic assistance',
      features: ['X-ray Analysis', 'Pattern Recognition', 'Diagnostic Reports', 'Quality Validation'],
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      name: 'Voice Agent',
      icon: '🗣️',
      description: 'AI voice assistant for hands-free practice management',
      features: ['Voice Commands', 'Patient Interaction', 'Appointment Booking', 'Information Retrieval'],
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      name: 'Translation Services',
      icon: '🌐',
      description: 'Multi-language support and real-time translation',
      features: ['Language Detection', 'Real-time Translation', 'Cultural Adaptation', 'Communication Bridge'],
      color: 'bg-violet-100 text-violet-800 border-violet-200'
    },
    {
      name: 'Practice Analytics',
      icon: '📊',
      description: 'Comprehensive practice performance and insights',
      features: ['Performance Metrics', 'Revenue Analytics', 'Patient Trends', 'Predictive Insights'],
      color: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      name: 'AI Marketing',
      icon: '📢',
      description: 'Automated marketing campaigns and lead management',
      features: ['Lead Scoring', 'Campaign Automation', 'Patient Engagement', 'ROI Tracking'],
      color: 'bg-sky-100 text-sky-800 border-sky-200'
    },
    {
      name: 'X-Ray Diagnostics',
      icon: '🩻',
      description: 'Advanced radiographic analysis and interpretation',
      features: ['Image Enhancement', 'Diagnostic AI', 'Report Generation', 'Comparison Tools'],
      color: 'bg-stone-100 text-stone-800 border-stone-200'
    },
    {
      name: 'Voice to Chart',
      icon: '📈',
      description: 'Convert voice notes directly into patient charts',
      features: ['Voice Processing', 'Chart Integration', 'Medical Coding', 'Quality Assurance'],
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    },
    {
      name: 'Chairside Assistant',
      icon: '🪑',
      description: 'Real-time assistance during patient procedures',
      features: ['Procedure Guidance', 'Tool Tracking', 'Timer Management', 'Quick Notes'],
      color: 'bg-zinc-100 text-zinc-800 border-zinc-200'
    },
    {
      name: 'Multi-Practice Analytics',
      icon: '🏢',
      description: 'Enterprise-level analytics across multiple locations',
      features: ['Cross-Practice Reports', 'Benchmarking', 'Consolidated Metrics', 'Performance Comparison'],
      color: 'bg-neutral-100 text-neutral-800 border-neutral-200'
    },
    {
      name: 'Marketing Automation',
      icon: '⚡',
      description: 'Automated patient engagement and retention campaigns',
      features: ['Email Campaigns', 'SMS Marketing', 'Social Media', 'Patient Lifecycle'],
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      name: 'Smart Operations',
      icon: '🧠',
      description: 'AI-driven operational efficiency and optimization',
      features: ['Resource Optimization', 'Workflow Automation', 'Predictive Maintenance', 'Cost Analysis'],
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      name: 'Revenue Management',
      icon: '💰',
      description: 'Financial optimization and revenue cycle management',
      features: ['Revenue Tracking', 'Payment Processing', 'Financial Forecasting', 'Profit Analysis'],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      name: 'Market Intelligence',
      icon: '🎯',
      description: 'Competitive analysis and market positioning insights',
      features: ['Competitor Analysis', 'Market Trends', 'Pricing Strategy', 'Growth Opportunities'],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'Reputation Management',
      icon: '⭐',
      description: 'Online reputation monitoring and enhancement',
      features: ['Review Monitoring', 'Response Management', 'Rating Analytics', 'Brand Protection'],
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      name: 'Lead Conversion',
      icon: '🎣',
      description: 'Convert prospects into patients with AI-driven insights',
      features: ['Lead Scoring', 'Conversion Tracking', 'Follow-up Automation', 'Success Analytics'],
      color: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      name: 'Compliance & Security',
      icon: '🔒',
      description: 'HIPAA compliance and data security management',
      features: ['Security Monitoring', 'Compliance Reports', 'Access Control', 'Audit Trails'],
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      name: 'Patient Concierge',
      icon: '🤝',
      description: 'Enhanced patient experience and communication hub',
      features: ['Appointment Reminders', 'Treatment Education', 'Support Chat', 'Satisfaction Surveys'],
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
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