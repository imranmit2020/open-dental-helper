import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import type { ToothData } from "@/types/dental";

interface PredictiveAnalyticsProps {
  toothData: Record<number, ToothData>;
  selectedTooth: number | null;
}

export function PredictiveAnalytics({ toothData, selectedTooth }: PredictiveAnalyticsProps) {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedTooth) {
      performPredictiveAnalysis();
    }
  }, [selectedTooth]);

  const performPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate AI analysis with progress
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(timer);
          setIsAnalyzing(false);
          generateAnalysisData();
          return 100;
        }
        return next;
      });
    }, 300);
  };

  const generateAnalysisData = () => {
    const riskFactors = [
      { factor: "Plaque accumulation", severity: "High", impact: 85 },
      { factor: "Bite pressure", severity: "Medium", impact: 60 },
      { factor: "Acid exposure", severity: "Low", impact: 30 }
    ];

    const predictions = [
      { 
        condition: "Secondary caries", 
        probability: 75, 
        timeframe: "6-12 months",
        prevention: "Regular fluoride treatments"
      },
      { 
        condition: "Tooth sensitivity", 
        probability: 45, 
        timeframe: "3-6 months",
        prevention: "Desensitizing toothpaste"
      },
      { 
        condition: "Restoration failure", 
        probability: 25, 
        timeframe: "12-18 months",
        prevention: "Crown placement"
      }
    ];

    const recommendations = [
      { priority: "High", action: "Schedule deep cleaning", timeline: "Within 2 weeks" },
      { priority: "Medium", action: "Apply protective sealant", timeline: "Within 1 month" },
      { priority: "Low", action: "Dietary consultation", timeline: "Within 3 months" }
    ];

    setAnalysisData({ riskFactors, predictions, recommendations });
  };

  if (!selectedTooth) {
    return (
      <Card className="professional-card">
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a tooth to view predictive analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          AI Predictive Analytics
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Tooth {selectedTooth}
          </Badge>
        </CardTitle>
        <CardDescription>
          Advanced AI analysis for predictive dental care
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary animate-bounce" />
              <span className="text-sm">Analyzing dental patterns...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Processing historical data, risk factors, and treatment patterns
            </div>
          </div>
        ) : analysisData ? (
          <div className="space-y-6 animate-scale-in">
            {/* Risk Factors */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                Risk Factors Analysis
              </h4>
              <div className="space-y-2">
                {analysisData.riskFactors.map((risk: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{risk.factor}</div>
                      <Badge variant={risk.severity === "High" ? "destructive" : risk.severity === "Medium" ? "secondary" : "default"} className="text-xs">
                        {risk.severity} Risk
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{risk.impact}%</div>
                      <div className="text-xs text-muted-foreground">Impact</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-info" />
                Predictive Outcomes
              </h4>
              <div className="space-y-3">
                {analysisData.predictions.map((prediction: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">{prediction.condition}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{prediction.timeframe}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Lightbulb className="h-3 w-3 text-warning" />
                            <span>{prediction.prevention}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            prediction.probability > 70 ? "text-destructive" : 
                            prediction.probability > 40 ? "text-warning" : "text-success"
                          }`}>
                            {prediction.probability}%
                          </div>
                          <div className="text-xs text-muted-foreground">Probability</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {analysisData.recommendations.map((rec: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-success/5 to-primary/5 rounded-lg border border-success/20 hover:border-success/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "secondary" : "default"}>
                        {rec.priority}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{rec.action}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {rec.timeline}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="btn-gradient">
                      Schedule
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full btn-gradient"
              onClick={() => toast.success("Treatment plan updated with AI recommendations")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply AI Recommendations to Treatment Plan
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}