import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, TrendingUp, Target } from "lucide-react";

export default function PredictiveTreatment() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Predictive Treatment AI
          </h1>
          <p className="text-muted-foreground">
            Machine learning treatment outcome predictions
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
          Next-Gen AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="h-5 w-5" />
              AI Accuracy
            </CardTitle>
            <CardDescription>Treatment prediction accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <Progress value={95} className="h-2" />
              <p className="text-xs text-muted-foreground">Based on 50,000+ case studies</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Success Rate
            </CardTitle>
            <CardDescription>Treatment success improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">87%</div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">Compared to traditional methods</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Precision
            </CardTitle>
            <CardDescription>Diagnostic precision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">Early issue detection</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Predictive Capabilities</CardTitle>
            <CardDescription>AI-powered treatment outcome analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Treatment Success Rate</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">High</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Complication Risk</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Low</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Recovery Time</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">7-10 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Learning Models</CardTitle>
            <CardDescription>Advanced AI algorithms for prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Neural Networks</span>
                <span className="text-purple-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Random Forest</span>
                <span className="text-purple-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deep Learning</span>
                <span className="text-purple-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ensemble Methods</span>
                <span className="text-purple-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <p className="text-purple-800 text-sm">
              🚀 Advanced machine learning models are being trained on vast datasets to provide precise treatment outcome predictions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}