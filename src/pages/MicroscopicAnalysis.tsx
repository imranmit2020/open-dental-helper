import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Microscope, Search, Zap, Camera } from "lucide-react";

export default function MicroscopicAnalysis() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Microscope className="h-8 w-8 text-slate-600" />
            Microscopic Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-enhanced microscopic imaging and analysis
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700">
          AI Microscopy
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Microscope className="h-5 w-5" />
              Digital Microscope
            </CardTitle>
            <CardDescription>High-resolution microscopic imaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center">
                <Microscope className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-lg font-medium">Microscope View</p>
                <p className="text-sm text-slate-500">AI-enhanced imaging</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button size="sm" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </Button>
              <Button size="sm" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                AI Detect
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Analysis Results</CardTitle>
              <CardDescription>AI-powered detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Tissue Health</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Normal</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Inflammation</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Mild</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Bacterial Count</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Low</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Tissue Density</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Automated pathogen detection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Tissue analysis and classification
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Abnormality identification
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Quantitative measurements
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Comparative analysis
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 text-sm">Magnification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1000x</div>
            <p className="text-xs text-muted-foreground">Maximum zoom</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-700 text-sm">Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0.1μm</div>
            <p className="text-xs text-muted-foreground">Minimum detail</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-700 text-sm">AI Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">96%</div>
            <p className="text-xs text-muted-foreground">Detection rate</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-700 text-sm">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2.3s</div>
            <p className="text-xs text-muted-foreground">Analysis time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <p className="text-slate-800 text-sm">
              🚀 Advanced AI-enhanced microscopic analysis systems are being developed to provide unprecedented diagnostic capabilities at the cellular level.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}