import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComputerVisionGuidance } from '@/components/ComputerVisionGuidance';
import { AIDiagnosisAssistance } from '@/components/AIDiagnosisAssistance';
import { PredictiveEquipmentMaintenance } from '@/components/PredictiveEquipmentMaintenance';
import { AdvancedPatientRiskStratification } from '@/components/AdvancedPatientRiskStratification';
import { Brain, Eye, Settings, TrendingUp, Activity, Sparkles, Cpu, Zap } from 'lucide-react';
import { useNextGenAI } from '@/hooks/useNextGenAI';

const NextGenAIDashboard: React.FC = () => {
  const { 
    procedureGuidance, 
    diagnosisAssistance, 
    equipmentPredictions, 
    patientRiskProfiles,
    activeGuidanceSession,
    isLoading 
  } = useNextGenAI();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading Next-Gen AI Systems...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const activeGuidanceSessions = procedureGuidance.filter(p => p.id === activeGuidanceSession).length;
  const highConfidenceDiagnoses = diagnosisAssistance.filter(d => d.confidence_score >= 0.8).length;
  const criticalEquipment = equipmentPredictions.filter(e => e.current_health_score < 0.6).length;
  const highRiskPatients = patientRiskProfiles.filter(p => p.risk_category === 'high' || p.risk_category === 'critical').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Next-Gen AI Features</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered systems for enhanced dental care
          </p>
        </div>
      </div>

      {/* Overview Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGuidanceSessions}</p>
              <p className="text-sm text-muted-foreground">Active Guidance</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highConfidenceDiagnoses}</p>
              <p className="text-sm text-muted-foreground">High Confidence Diagnoses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalEquipment}</p>
              <p className="text-sm text-muted-foreground">Critical Equipment</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highRiskPatients}</p>
              <p className="text-sm text-muted-foreground">High Risk Patients</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Systems Status */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Systems Status
          </CardTitle>
          <CardDescription>Real-time status of next-generation AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Computer Vision: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">AI Diagnosis: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Predictive Analytics: Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Risk Stratification: Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Capabilities
            </CardTitle>
            <CardDescription>Advanced artificial intelligence features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Computer Vision</h4>
                <p className="text-sm text-muted-foreground">Real-time procedure guidance with visual annotations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Diagnosis Assistance</h4>
                <p className="text-sm text-muted-foreground">AI-powered diagnostic support with confidence scoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium">Predictive Maintenance</h4>
                <p className="text-sm text-muted-foreground">Machine learning for equipment failure prediction</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium">Risk Stratification</h4>
                <p className="text-sm text-muted-foreground">Advanced patient risk analysis using multiple data sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              Technology Stack
            </CardTitle>
            <CardDescription>Next-generation AI technologies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Machine Learning Models</h4>
                <p className="text-sm text-muted-foreground">Deep learning and neural networks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-cyan-500" />
              <div>
                <h4 className="font-medium">Computer Vision</h4>
                <p className="text-sm text-muted-foreground">Real-time image processing and analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Natural Language Processing</h4>
                <p className="text-sm text-muted-foreground">Advanced text analysis and understanding</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Predictive Analytics</h4>
                <p className="text-sm text-muted-foreground">Time series analysis and forecasting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="vision" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vision" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Computer Vision
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Diagnosis
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Predictive Maintenance
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Stratification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vision" className="space-y-6">
          <ComputerVisionGuidance />
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-6">
          <AIDiagnosisAssistance />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <PredictiveEquipmentMaintenance />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <AdvancedPatientRiskStratification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NextGenAIDashboard;