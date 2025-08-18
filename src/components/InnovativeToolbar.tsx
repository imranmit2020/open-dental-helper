import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Wand2, 
  Scan, 
  Mic, 
  Camera, 
  Zap,
  Eye,
  Volume2,
  Palette,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import type { ToothData } from "@/types/dental";

interface InnovativeToolbarProps {
  selectedTooth: number | null;
  onAIAnalysis: () => void;
  onVoiceCommand: () => void;
  onImageCapture: () => void;
  on3DToggle: () => void;
  onARMode: () => void;
}

export function InnovativeToolbar({ 
  selectedTooth, 
  onAIAnalysis, 
  onVoiceCommand, 
  onImageCapture, 
  on3DToggle, 
  onARMode 
}: InnovativeToolbarProps) {
  const [isAIActive, setIsAIActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState(0);

  // Simulate AI analysis
  useEffect(() => {
    if (isAIActive && selectedTooth) {
      setAnalysisProgress(0);
      const timer = setInterval(() => {
        setAnalysisProgress(prev => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(timer);
            generateSmartSuggestions();
            calculateRiskScore();
            return 100;
          }
          return next;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [isAIActive, selectedTooth]);

  const generateSmartSuggestions = () => {
    const suggestions = [
      "Consider preventive sealant application",
      "Schedule follow-up in 3 months",
      "Recommend fluoride treatment",
      "Check adjacent teeth for similar patterns",
      "Patient shows high caries risk factors"
    ];
    setSmartSuggestions(suggestions.slice(0, 3));
  };

  const calculateRiskScore = () => {
    // Simulate risk calculation
    const risk = Math.floor(Math.random() * 100);
    setRiskScore(risk);
  };

  const handleVoiceCommand = () => {
    setVoiceListening(!voiceListening);
    onVoiceCommand();
    
    if (!voiceListening) {
      toast.success("Voice recognition activated. Say your charting notes...");
      // Simulate voice recognition
      setTimeout(() => {
        setVoiceListening(false);
        toast.success("Voice command processed: 'MOD caries detected on tooth 14'");
      }, 3000);
    }
  };

  const handleImageCapture = () => {
    onImageCapture();
    toast.success("Intraoral camera activated. Position for optimal capture...");
    
    // Simulate image processing
    setTimeout(() => {
      toast.success("Image captured and analyzed. Findings added to chart.");
    }, 2000);
  };

  return (
    <Card className="professional-card border-primary/20 bg-gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          AI-Powered Charting Tools
        </CardTitle>
        <CardDescription>
          Next-generation dental charting with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Analysis Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-mode" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis Mode
            </Label>
            <Switch
              id="ai-mode"
              checked={isAIActive}
              onCheckedChange={setIsAIActive}
            />
          </div>
          
          {isAIActive && selectedTooth && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm">Analyzing Tooth {selectedTooth}...</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              
              {analysisProgress === 100 && (
                <div className="space-y-2 animate-scale-in">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Risk Score: {riskScore}%</span>
                    <Badge variant={riskScore > 70 ? "destructive" : riskScore > 40 ? "secondary" : "default"}>
                      {riskScore > 70 ? "High Risk" : riskScore > 40 ? "Moderate" : "Low Risk"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">AI Suggestions:</span>
                    {smartSuggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="text-xs p-2 bg-primary/5 rounded border-l-2 border-primary animate-slide-in-right"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Target className="h-3 w-3 inline mr-1" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Tools */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleVoiceCommand}
            className={cn(
              "h-auto p-3 flex flex-col gap-2 transition-all duration-300",
              voiceListening && "bg-primary/10 border-primary animate-pulse"
            )}
          >
            <Mic className={cn("h-5 w-5", voiceListening && "animate-bounce")} />
            <span className="text-xs">
              {voiceListening ? "Listening..." : "Voice Chart"}
            </span>
            {voiceListening && (
              <div className="flex gap-1">
                <div className="w-1 h-2 bg-primary animate-ping" />
                <div className="w-1 h-3 bg-primary animate-ping" style={{ animationDelay: "150ms" }} />
                <div className="w-1 h-2 bg-primary animate-ping" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleImageCapture}
            className="h-auto p-3 flex flex-col gap-2 hover:scale-105 transition-all duration-300"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Smart Capture</span>
          </Button>

          <Button
            variant="outline"
            onClick={on3DToggle}
            className="h-auto p-3 flex flex-col gap-2 hover:scale-105 transition-all duration-300"
          >
            <Scan className="h-5 w-5" />
            <span className="text-xs">3D View</span>
          </Button>

          <Button
            variant="outline"
            onClick={onARMode}
            className="h-auto p-3 flex flex-col gap-2 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
          >
            <Eye className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-600">AR Mode</span>
          </Button>
        </div>

        {/* Smart Alerts */}
        {selectedTooth && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 p-2 bg-warning/10 rounded border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs">Tooth {selectedTooth} requires attention</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-info/10 rounded border border-info/20">
              <Zap className="h-4 w-4 text-info" />
              <span className="text-xs">Treatment plan generated automatically</span>
            </div>
          </div>
        )}

        {/* Advanced Controls */}
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization" className="text-xs">Visual</TabsTrigger>
            <TabsTrigger value="detection" className="text-xs">Detection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label className="text-xs">Tooth Transparency</Label>
              <Slider defaultValue={[80]} max={100} step={1} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Condition Visibility</Label>
              <Slider defaultValue={[90]} max={100} step={1} className="w-full" />
            </div>
          </TabsContent>
          
          <TabsContent value="detection" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto-detect Caries</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Plaque Detection</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Wear Analysis</Label>
              <Switch />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}