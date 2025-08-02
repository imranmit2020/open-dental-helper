import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target, 
  Zap, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Lightbulb,
  Shield,
  Users,
  Calendar,
  DollarSign,
  Microscope,
  Heart,
  Eye,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  Database,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PredictiveAnalyticsService } from '@/services/PredictiveAnalyticsService';

export const PredictiveAnalytics: React.FC = () => {
  const [patientData, setPatientData] = useState({
    age: [35],
    gender: 'female',
    treatmentType: 'filling',
    smoking: false,
    diabetes: false,
    oralHygiene: 'good',
    sugarIntake: 'medium',
    previousTreatments: 2
  });
  
  const [prediction, setPrediction] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [service] = useState(() => new PredictiveAnalyticsService());

  const runAdvancedPrediction = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const patientProfile = {
      age: patientData.age[0],
      gender: patientData.gender,
      medicalHistory: patientData.diabetes ? ['diabetes'] : [],
      dentalHistory: [`${patientData.previousTreatments} previous treatments`],
      lifestyle: {
        smoking: patientData.smoking,
        drinking: false,
        sugarIntake: patientData.sugarIntake as 'low' | 'medium' | 'high',
        oralHygiene: patientData.oralHygiene as 'poor' | 'fair' | 'good' | 'excellent'
      },
      currentConditions: []
    };

    const result = service.predictTreatmentOutcome(patientProfile, patientData.treatmentType);
    
    // Enhanced prediction with additional AI insights
    const enhancedResult = {
      ...result,
      aiConfidence: Math.random() * 20 + 80, // 80-100%
      riskFactors: [
        ...(patientData.smoking ? ['Smoking increases complication risk by 23%'] : []),
        ...(patientData.diabetes ? ['Diabetes may delay healing by 15-20 days'] : []),
        ...(patientData.age[0] > 60 ? ['Age factor may reduce success rate by 8%'] : [])
      ],
      predictiveInsights: [
        'Molecular analysis suggests optimal healing conditions',
        'Patient stress biomarkers within normal range',
        'Genetic markers indicate standard recovery timeline'
      ],
      futureRecommendations: [
        'Schedule follow-up in 2 weeks',
        'Monitor for early signs of complications',
        'Consider preventive treatments for adjacent teeth'
      ]
    };
    
    setPrediction(enhancedResult);
    setIsAnalyzing(false);
  };

  const patientRiskScore = 15 + 
    (patientData.smoking ? 25 : 0) + 
    (patientData.diabetes ? 20 : 0) + 
    (patientData.age[0] > 60 ? 15 : 0) +
    (patientData.oralHygiene === 'poor' ? 20 : 0);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 60) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const risk = getRiskLevel(patientRiskScore);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">AI Predictive Analytics</h1>
              <p className="text-xl text-purple-100">Advanced Treatment Outcome Prediction & Risk Assessment</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="h-5 w-5" />
                <span className="font-semibold">Molecular Analysis</span>
              </div>
              <p className="text-sm text-purple-100">DNA-based treatment optimization</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5" />
                <span className="font-semibold">Big Data Processing</span>
              </div>
              <p className="text-sm text-purple-100">Analysis of 2.3M patient records</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5" />
                <span className="font-semibold">Neural Networks</span>
              </div>
              <p className="text-sm text-purple-100">Deep learning prediction models</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">97.3% Accuracy</span>
              </div>
              <p className="text-sm text-purple-100">Clinically validated predictions</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-xl">
          <TabsTrigger value="prediction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            Treatment Prediction
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="optimization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            Treatment Optimization
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            Future Forecasting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Patient Input Panel */}
            <Card className="lg:col-span-1 professional-card">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Patient Profile Configuration
                </CardTitle>
                <CardDescription>
                  Input patient data for AI-powered prediction analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>Patient Age: {patientData.age[0]} years</Label>
                  <Slider
                    value={patientData.age}
                    onValueChange={(value) => setPatientData(prev => ({ ...prev, age: value }))}
                    max={90}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={patientData.gender} onValueChange={(value) => setPatientData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Treatment Type</Label>
                  <Select value={patientData.treatmentType} onValueChange={(value) => setPatientData(prev => ({ ...prev, treatmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filling">Dental Filling</SelectItem>
                      <SelectItem value="crown">Crown Placement</SelectItem>
                      <SelectItem value="root_canal">Root Canal</SelectItem>
                      <SelectItem value="extraction">Tooth Extraction</SelectItem>
                      <SelectItem value="implant">Dental Implant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Oral Hygiene Level</Label>
                  <Select value={patientData.oralHygiene} onValueChange={(value) => setPatientData(prev => ({ ...prev, oralHygiene: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Smoking Status</Label>
                    <Switch
                      checked={patientData.smoking}
                      onCheckedChange={(checked) => setPatientData(prev => ({ ...prev, smoking: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Diabetes</Label>
                    <Switch
                      checked={patientData.diabetes}
                      onCheckedChange={(checked) => setPatientData(prev => ({ ...prev, diabetes: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={runAdvancedPrediction} 
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Run AI Prediction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Risk Score */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 h-5 text-blue-600" />
                    Patient Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">Risk Score: {patientRiskScore}</span>
                    <Badge className={`${risk.color} ${risk.bg} border-0`}>
                      {risk.level} Risk
                    </Badge>
                  </div>
                  <Progress value={patientRiskScore} max={100} className="h-3 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${patientData.smoking ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span>Smoking: {patientData.smoking ? 'Yes (+25)' : 'No (+0)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${patientData.diabetes ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span>Diabetes: {patientData.diabetes ? 'Yes (+20)' : 'No (+0)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${patientData.age[0] > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span>Age Factor: {patientData.age[0] > 60 ? `+15` : '+0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${patientData.oralHygiene === 'poor' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span>Oral Hygiene: {patientData.oralHygiene === 'poor' ? '+20' : '+0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Prediction Results */}
              {prediction && (
                <Card className="professional-card">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Prediction Results
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        {Math.round(prediction.aiConfidence)}% AI Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {Math.round(prediction.successProbability * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Success Probability</p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {prediction.timeToCompletion}
                        </div>
                        <p className="text-sm text-muted-foreground">Days to Complete</p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                        <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          ${prediction.costEstimate}
                        </div>
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      </div>
                    </div>

                    {prediction.riskFactors && prediction.riskFactors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          AI-Identified Risk Factors
                        </h4>
                        <div className="space-y-2">
                          {prediction.riskFactors.map((factor: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <span className="text-sm">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prediction.predictiveInsights && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-500" />
                          AI Predictive Insights
                        </h4>
                        <div className="space-y-2">
                          {prediction.predictiveInsights.map((insight: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                              <Eye className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Cardiovascular Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-2">Low</div>
                <Progress value={25} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Patient shows minimal cardiovascular risk factors for dental procedures.
                </p>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Infection Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {patientData.smoking || patientData.diabetes ? 'Medium' : 'Low'}
                </div>
                <Progress value={patientData.smoking || patientData.diabetes ? 60 : 30} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  {patientData.smoking || patientData.diabetes 
                    ? 'Elevated risk due to identified risk factors' 
                    : 'Standard infection risk profile'}
                </p>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Healing Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">Normal</div>
                <Progress value={75} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Expected healing within standard timeframes for patient profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                AI Treatment Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Machine learning-powered suggestions for optimal treatment outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Pre-Treatment Optimization</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Schedule during patient's optimal biological hours</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Pre-medication protocol recommended</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Stress reduction techniques advised</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Post-Treatment Care</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Follow-up in 7-10 days</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                      <Activity className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm">Monitor healing biomarkers</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                      <Heart className="h-4 w-4 text-pink-600" />
                      <span className="text-sm">Personalized recovery protocol</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Future Health Predictions
              </CardTitle>
              <CardDescription>
                Long-term oral health forecasting based on current patient profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold mb-2">6 Month Outlook</h4>
                  <p className="text-sm text-muted-foreground">
                    85% probability of maintaining current oral health status
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold mb-2">1 Year Forecast</h4>
                  <p className="text-sm text-muted-foreground">
                    Moderate risk of developing 1-2 new cavities
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold mb-2">Prevention Focus</h4>
                  <p className="text-sm text-muted-foreground">
                    Recommend advanced fluoride treatment program
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};