import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, FileImage } from "lucide-react";
import { toast } from "sonner";

interface XRayAnalysis {
  id: string;
  imageUrl: string;
  findings: Array<{
    type: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    location: string;
    description: string;
  }>;
  overallScore: number;
  recommendations: string[];
  secondOpinionRequired: boolean;
}

export default function XRayDiagnostics() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<XRayAnalysis | null>(null);

  // Mock analysis data for demonstration
  const mockAnalysis: XRayAnalysis = {
    id: "analysis_1",
    imageUrl: "/placeholder-xray.jpg",
    findings: [
      {
        type: "Cavity",
        confidence: 92,
        severity: "high",
        location: "Upper right molar (#3)",
        description: "Large cavity detected with possible pulp involvement"
      },
      {
        type: "Bone Loss",
        confidence: 78,
        severity: "medium", 
        location: "Lower jaw area",
        description: "Mild periodontal bone loss visible"
      },
      {
        type: "Root Issue",
        confidence: 85,
        severity: "medium",
        location: "Lower left premolar (#20)",
        description: "Root canal treatment may be required"
      }
    ],
    overallScore: 7.2,
    recommendations: [
      "Immediate dental consultation recommended",
      "Root canal therapy for tooth #3",
      "Periodontal evaluation needed",
      "Follow-up X-ray in 3 months"
    ],
    secondOpinionRequired: true
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error("Please upload an X-ray image first");
      return;
    }

    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast.success("X-ray analysis completed");
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI X-Ray Diagnostics</h1>
        <p className="text-lg text-muted-foreground">
          Advanced AI-powered dental X-ray analysis with confidence scoring and second-opinion flagging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              X-Ray Image Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="X-ray" 
                    className="max-w-full h-64 object-contain mx-auto rounded"
                  />
                  <p className="text-sm text-muted-foreground">X-ray image uploaded successfully</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="text-lg font-medium">Upload X-ray Image</p>
                  <p className="text-sm text-muted-foreground">
                    Supports DICOM, JPEG, PNG formats
                  </p>
                </div>
              )}
            </div>
            
            <input
              type="file"
              accept="image/*,.dcm"
              onChange={handleImageUpload}
              className="hidden"
              id="xray-upload"
            />
            <label htmlFor="xray-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Choose X-ray File
                </span>
              </Button>
            </label>

            <Button 
              onClick={analyzeImage} 
              disabled={!selectedImage || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analysis Results
              {analysis?.secondOpinionRequired && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Second Opinion Required
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an X-ray image and click "Start AI Analysis" to begin</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Overall Health Score</p>
                  <p className="text-3xl font-bold text-primary">{analysis.overallScore}/10</p>
                </div>

                {/* Findings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Detected Issues</h3>
                  {analysis.findings.map((finding, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{finding.type}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)}`} />
                          <Badge variant="outline">{finding.confidence}% confidence</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.location}</p>
                      <p className="text-sm">{finding.description}</p>
                      <Progress value={finding.confidence} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Recommendations</h3>
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Color-coded Overlay Demo */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Patient-Friendly Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">Original X-ray</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Original dental X-ray image</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">AI Analysis Overlay</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center relative">
                  <p className="text-sm text-muted-foreground">X-ray with color-coded problem areas</p>
                  <div className="mt-4 flex justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-xs">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs">Low Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}