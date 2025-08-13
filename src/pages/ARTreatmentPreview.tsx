import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Camera, Scan, Layers } from "lucide-react";

export default function ARTreatmentPreview() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Eye className="h-8 w-8 text-fuchsia-500" />
            AR Treatment Preview
          </h1>
          <p className="text-muted-foreground">
            Augmented reality treatment visualization
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-700">
          AR Technology
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-fuchsia-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fuchsia-700">
              <Eye className="h-5 w-5" />
              AR Visualization
            </CardTitle>
            <CardDescription>Augmented reality treatment overlay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-fuchsia-300">
              <div className="text-center">
                <Eye className="h-16 w-16 text-fuchsia-400 mx-auto mb-2" />
                <p className="text-fuchsia-600 text-lg font-medium">AR Viewer</p>
                <p className="text-sm text-fuchsia-500">Treatment visualization</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button size="sm" variant="outline">
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </Button>
              <Button size="sm" variant="outline">
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">AR Features</CardTitle>
              <CardDescription>Advanced visualization capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Real-time treatment overlay
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Before/after visualization
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  3D tooth model overlay
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Procedure guidance
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Patient education mode
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Patient Education</div>
                  <div className="text-xs text-blue-600">Show treatment results before procedure</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">Procedure Planning</div>
                  <div className="text-xs text-green-600">Visualize treatment steps</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800">Training</div>
                  <div className="text-xs text-orange-600">Educational simulations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">98%</div>
            <p className="text-sm text-muted-foreground">Visualization precision</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">16ms</div>
            <p className="text-sm text-muted-foreground">Real-time rendering</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">4K+</div>
            <p className="text-sm text-muted-foreground">Ultra-high definition</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-fuchsia-50 border border-fuchsia-200 p-4 rounded-lg">
            <p className="text-fuchsia-800 text-sm">
              🚀 Cutting-edge augmented reality technology is being developed to revolutionize treatment visualization and patient education.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}