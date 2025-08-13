import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Rotate3D, Scan, Eye } from "lucide-react";

export default function DentalModeling3D() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Cpu className="h-8 w-8 text-emerald-500" />
            3D Dental Modeling
          </h1>
          <p className="text-muted-foreground">
            Interactive 3D tooth visualization and treatment simulation
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700">
          Next-Gen 3D
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Rotate3D className="h-5 w-5" />
              3D Viewer
            </CardTitle>
            <CardDescription>Interactive 3D dental model visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">3D Model Viewer</p>
                <p className="text-xs text-gray-400">Interactive tooth visualization</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Rotate3D className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Zoom
              </Button>
              <Button size="sm" variant="outline">
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Model Features</CardTitle>
              <CardDescription>Advanced 3D capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  High-resolution 3D scanning
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time model manipulation
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Treatment simulation overlay
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Before/after comparisons
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Precise measurements
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">Orthodontics</div>
                  <div className="text-xs text-purple-600">Alignment planning</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">Implants</div>
                  <div className="text-xs text-green-600">Placement guidance</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Restorations</div>
                  <div className="text-xs text-blue-600">Crown design</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800">Surgery</div>
                  <div className="text-xs text-orange-600">Surgical planning</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <p className="text-emerald-800 text-sm">
              🚀 Advanced 3D modeling technology is being integrated to provide unparalleled visualization and treatment planning capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}