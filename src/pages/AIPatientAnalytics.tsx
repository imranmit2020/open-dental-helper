import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Heart, Activity } from "lucide-react";

export default function AIPatientAnalytics() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            AI Patient Analytics
          </h1>
          <p className="text-muted-foreground">
            Real-time risk assessment and predictive insights for patient care
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
          Next-Gen AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              Risk Prediction
            </CardTitle>
            <CardDescription>AI-powered risk assessment models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced machine learning algorithms analyze patient data to predict treatment risks and outcomes with 95% accuracy.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Early Warning System
            </CardTitle>
            <CardDescription>Proactive health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time alerts for potential complications, helping prevent issues before they become serious problems.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Heart className="h-5 w-5" />
              Patient Insights
            </CardTitle>
            <CardDescription>Comprehensive health analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deep insights into patient health patterns, enabling personalized treatment plans and improved outcomes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Feature Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              🚀 This is a next-generation AI feature currently in development. Advanced patient analytics capabilities will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}