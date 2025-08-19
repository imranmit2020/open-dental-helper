import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PatientRiskProfile, useNextGenAI } from '@/hooks/useNextGenAI';
import { TrendingUp, AlertTriangle, Shield, Activity, User, Calendar, Database, CheckCircle } from 'lucide-react';

export const AdvancedPatientRiskStratification: React.FC = () => {
  const { patientRiskProfiles, updatePatientRisk } = useNextGenAI();
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'severe': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDataSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'medical history': return <User className="h-3 w-3" />;
      case 'patient interview': return <User className="h-3 w-3" />;
      case 'genetic analysis': return <Database className="h-3 w-3" />;
      case 'lab results': return <Activity className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Advanced Patient Risk Stratification</h2>
      </div>

      {/* Risk Update Tool */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment Tool
          </CardTitle>
          <CardDescription>
            Update patient risk profiles using AI-powered analysis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="patient-risk-id">Patient ID</Label>
              <Input
                id="patient-risk-id"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                placeholder="Enter patient ID for risk analysis"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => updatePatientRisk(selectedPatientId)}
                disabled={!selectedPatientId}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Update Risk Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Profiles */}
      <div className="space-y-6">
        {patientRiskProfiles.map((profile) => (
          <Card key={profile.id} className="p-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Patient Risk Profile</CardTitle>
                  <CardDescription>
                    Patient ID: {profile.patient_id} • 
                    Last Updated: {new Date(profile.last_updated).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getRiskCategoryColor(profile.risk_category)}>
                  {profile.risk_category.toUpperCase()} RISK
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Overall Risk Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Risk Score</span>
                  <span>{Math.round(profile.overall_risk_score * 100)}%</span>
                </div>
                <Progress value={profile.overall_risk_score * 100} className="h-4" />
                <p className="text-xs text-muted-foreground">
                  Monitoring Frequency: {profile.monitoring_frequency}
                </p>
              </div>

              {/* Risk Factors */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risk Factors Analysis
                </h4>
                
                <div className="space-y-4">
                  {profile.risk_factors.map((factor, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">{factor.factor}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Severity: {factor.severity}/10
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(factor.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                      </div>

                      {/* Severity Visualization */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Impact Score</span>
                          <span>{Math.round(factor.impact_score * 100)}%</span>
                        </div>
                        <Progress value={factor.impact_score * 100} className="h-2" />
                      </div>

                      {/* Data Source */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getDataSourceIcon(factor.data_source)}
                        <span>Data Source: {factor.data_source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complication Predictions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  Complication Predictions
                </h4>
                
                <div className="space-y-4">
                  {profile.complication_predictions.map((complication, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-red-900">{complication.complication}</h5>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSeverityColor(complication.severity)} text-white text-xs`}>
                            {complication.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(complication.probability * 100)}% Risk
                          </Badge>
                        </div>
                      </div>

                      {/* Probability Visualization */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm text-red-800">
                          <span>Probability in {complication.time_frame}</span>
                          <span>{Math.round(complication.probability * 100)}%</span>
                        </div>
                        <Progress value={complication.probability * 100} className="h-2" />
                      </div>

                      {/* Prevention Strategies */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-red-900">Prevention Strategies</Label>
                        <div className="space-y-1">
                          {complication.prevention_strategies.map((strategy, strategyIndex) => (
                            <div key={strategyIndex} className="flex items-center gap-2 text-sm text-red-800">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{strategy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Interventions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Interventions
                </h4>
                
                <div className="grid gap-2 md:grid-cols-2">
                  {profile.recommended_interventions.map((intervention, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-green-800">{intervention}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Timeline */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monitoring Schedule
                </h4>
                <p className="text-blue-800 text-sm">
                  <strong>Frequency:</strong> {profile.monitoring_frequency}
                </p>
                <p className="text-blue-800 text-sm mt-1">
                  <strong>Next Assessment:</strong> Based on risk level and recent changes
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Risk Distribution Summary</CardTitle>
          <CardDescription>Overview of patient risk categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {['low', 'moderate', 'high', 'critical'].map(category => {
              const count = patientRiskProfiles.filter(p => p.risk_category === category).length;
              const percentage = patientRiskProfiles.length > 0 ? (count / patientRiskProfiles.length) * 100 : 0;
              
              return (
                <div key={category} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskCategoryColor(category)}`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Risk
                  </div>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(percentage)}% of patients</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};