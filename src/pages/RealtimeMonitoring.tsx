import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Thermometer, Zap } from "lucide-react";

export default function RealtimeMonitoring() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Activity className="h-8 w-8 text-sky-500" />
            Real-time Monitoring
          </h1>
          <p className="text-muted-foreground">
            Live vital signs and procedure monitoring
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700">
          Live Monitoring
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
              <Heart className="h-5 w-5" />
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">72</div>
            <p className="text-sm text-muted-foreground">BPM - Normal</p>
            <div className="mt-2 h-2 bg-red-100 rounded-full">
              <div className="h-2 bg-red-500 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
              <Activity className="h-5 w-5" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">120/80</div>
            <p className="text-sm text-muted-foreground">mmHg - Normal</p>
            <div className="mt-2 h-2 bg-blue-100 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full w-4/5"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
              <Thermometer className="h-5 w-5" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">98.6°F</div>
            <p className="text-sm text-muted-foreground">Normal</p>
            <div className="mt-2 h-2 bg-green-100 rounded-full">
              <div className="h-2 bg-green-500 rounded-full w-1/2"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
              <Zap className="h-5 w-5" />
              Pain Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">2/10</div>
            <p className="text-sm text-muted-foreground">Mild discomfort</p>
            <div className="mt-2 h-2 bg-purple-100 rounded-full">
              <div className="h-2 bg-purple-500 rounded-full w-1/5"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Vital Signs Chart
            </CardTitle>
            <CardDescription>Real-time monitoring during procedure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Live Chart Display</p>
                <p className="text-xs text-gray-400">Real-time vital signs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring Status</CardTitle>
            <CardDescription>System health and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">All Systems</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Data Connection</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Stable</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Alerts</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">None</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Recording</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg">
            <p className="text-sky-800 text-sm">
              🚀 Advanced real-time monitoring systems are being integrated to provide comprehensive patient safety during procedures.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}