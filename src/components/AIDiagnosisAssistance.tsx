import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DiagnosisAssistance, useNextGenAI } from '@/hooks/useNextGenAI';
import { Brain, FileText, TrendingUp, AlertCircle, CheckCircle, BookOpen, TestTube } from 'lucide-react';

export const AIDiagnosisAssistance: React.FC = () => {
  const { diagnosisAssistance, generateDiagnosis } = useNextGenAI();
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [findings, setFindings] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerateDiagnosis = async () => {
    if (!patientId || !symptoms) return;

    setIsAnalyzing(true);
    const symptomList = symptoms.split(',').map(s => s.trim()).filter(s => s);
    const findingsList = findings.split(',').map(f => f.trim()).filter(f => f);
    
    await generateDiagnosis(patientId, symptomList, findingsList);
    setIsAnalyzing(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'bg-red-100 text-red-800';
    if (probability >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">AI-Powered Diagnosis Assistance</h2>
      </div>

      {/* Input Form */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Patient Analysis Input
          </CardTitle>
          <CardDescription>
            Enter patient information for AI-powered diagnostic assistance
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Analysis Status</Label>
              <div className="flex items-center gap-2 pt-2">
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Ready for analysis</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Patient Symptoms</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter symptoms separated by commas (e.g., tooth pain, sensitivity to cold, swelling)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">Clinical Findings</Label>
            <Textarea
              id="findings"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Enter clinical findings separated by commas (e.g., deep caries on tooth #14, percussion positive, radiographic findings)"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateDiagnosis}
            disabled={!patientId || !symptoms || isAnalyzing}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Generate AI Diagnosis'}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnosis Results */}
      {diagnosisAssistance.length > 0 && (
        <div className="space-y-6">
          {diagnosisAssistance.map((diagnosis) => (
            <Card key={diagnosis.id} className="p-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI Diagnosis: {diagnosis.condition_name}
                  </CardTitle>
                  <Badge className={getConfidenceColor(diagnosis.confidence_score)}>
                    {Math.round(diagnosis.confidence_score * 100)}% Confidence
                  </Badge>
                </div>
                <CardDescription>
                  Patient ID: {diagnosis.patient_id}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Confidence Score Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Diagnostic Confidence</span>
                    <span>{Math.round(diagnosis.confidence_score * 100)}%</span>
                  </div>
                  <Progress value={diagnosis.confidence_score * 100} className="h-3" />
                </div>

                {/* Supporting Evidence */}
                {diagnosis.supporting_evidence.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Supporting Evidence
                    </h4>
                    <div className="grid gap-2">
                      {diagnosis.supporting_evidence.map((evidence, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-800">{evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Differential Diagnoses */}
                {diagnosis.differential_diagnoses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Differential Diagnoses
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.differential_diagnoses.map((diff, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{diff.condition}</h5>
                            <Badge className={getProbabilityColor(diff.probability)}>
                              {Math.round(diff.probability * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{diff.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Tests */}
                {diagnosis.recommended_tests.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-blue-500" />
                      Recommended Tests
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {diagnosis.recommended_tests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <TestTube className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-blue-800">{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {diagnosis.risk_factors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Risk Factors
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {diagnosis.risk_factors.map((risk, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-800">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Suggestions */}
                {diagnosis.treatment_suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Treatment Suggestions
                    </h4>
                    <div className="space-y-2">
                      {diagnosis.treatment_suggestions.map((treatment, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-green-800">{treatment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Literature References */}
                {diagnosis.literature_references.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      Literature References
                    </h4>
                    <div className="space-y-1">
                      {diagnosis.literature_references.map((reference, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                          <BookOpen className="h-3 w-3 text-purple-500" />
                          <span className="text-sm text-purple-800">{reference}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {diagnosisAssistance.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Diagnoses Generated Yet</h3>
            <p className="text-muted-foreground">
              Enter patient symptoms and clinical findings to get AI-powered diagnostic assistance
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};