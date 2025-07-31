import React, { useState } from 'react';
import { Brain, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PredictiveAnalyticsService } from '@/services/PredictiveAnalyticsService';

export const PredictiveAnalytics: React.FC = () => {
  const [treatmentType, setTreatmentType] = useState('filling');
  const [patientAge, setPatientAge] = useState(35);
  const [smoking, setSmoking] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [service] = useState(() => new PredictiveAnalyticsService());

  const runPrediction = () => {
    const patientData = {
      age: patientAge,
      gender: 'M',
      medicalHistory: [],
      dentalHistory: [],
      lifestyle: {
        smoking,
        drinking: false,
        sugarIntake: 'medium' as const,
        oralHygiene: 'good' as const
      },
      currentConditions: []
    };

    const result = service.predictTreatmentOutcome(patientData, treatmentType);
    setPrediction(result);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Predictive Analytics</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered treatment outcome prediction and success analysis
        </p>
      </div>

      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Treatment Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Treatment Type</label>
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filling">Filling</SelectItem>
                  <SelectItem value="crown">Crown</SelectItem>
                  <SelectItem value="root_canal">Root Canal</SelectItem>
                  <SelectItem value="extraction">Extraction</SelectItem>
                  <SelectItem value="implant">Implant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Patient Age</label>
              <Input 
                type="number" 
                value={patientAge} 
                onChange={(e) => setPatientAge(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={runPrediction} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predict Outcome
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="professional-card">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Success Probability</h4>
                <Progress value={prediction.successProbability * 100} className="mb-2" />
                <p className="text-2xl font-bold text-primary">
                  {Math.round(prediction.successProbability * 100)}%
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Completion Time</h4>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  {prediction.timeToCompletion} days
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cost Estimate</h4>
                <p className="text-2xl font-bold text-success">
                  ${prediction.costEstimate}
                </p>
              </div>
            </div>
            
            {prediction.complications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Potential Complications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prediction.complications.map((comp: string, i: number) => (
                    <Badge key={i} variant="destructive">{comp}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};