import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  TrendingUp, 
  FileX,
  Users,
  DollarSign,
  Clock
} from "lucide-react";
import { FraudDetectionService } from "@/services/FraudDetectionService";
import { useToast } from "@/components/ui/use-toast";

export default function FraudDetectionSystem() {
  const [fraudAnalysis, setFraudAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFraudAnalysis();
  }, []);

  const loadFraudAnalysis = async () => {
    try {
      setIsLoading(true);
      const analysis = await FraudDetectionService.analyzeOverallFraudRisk();
      setFraudAnalysis(analysis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load fraud analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Fraud Detection System</h1>
        <p className="text-muted-foreground">AI-powered fraud detection and prevention</p>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudAnalysis?.overallRiskScore}</div>
            <Progress value={fraudAnalysis?.overallRiskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudAnalysis?.activeAlerts?.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Fraud Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${fraudAnalysis?.recentTrends?.potentialFraudValue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">At risk amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudAnalysis?.recentTrends?.falsePositiveRate?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">System accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>
                AI-detected suspicious activities requiring investigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAnalysis?.activeAlerts?.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Risk Score: {alert.riskScore}%
                            </span>
                          </div>
                          <h3 className="font-semibold">{alert.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            Detected: {alert.detectedAt.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">{alert.riskScore}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Flags</h4>
                          <ul className="space-y-1">
                            {alert.details.flags.map((flag, index) => (
                              <li key={index} className="text-xs text-muted-foreground">• {flag}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Patterns</h4>
                          <ul className="space-y-1">
                            {alert.details.patterns.map((pattern, index) => (
                              <li key={index} className="text-xs text-muted-foreground">• {pattern}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
                          <ul className="space-y-1">
                            {alert.details.riskFactors.map((factor, index) => (
                              <li key={index} className="text-xs text-muted-foreground">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium text-sm mb-1">Recommended Action:</h4>
                        <p className="text-sm">{alert.recommendedAction}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">Investigate</Button>
                        <Button size="sm" variant="outline">Mark as False Positive</Button>
                        <Button size="sm" variant="outline">Resolve</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories</CardTitle>
              <CardDescription>
                Breakdown of fraud risk by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(fraudAnalysis?.riskCategories || {}).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline">{data.alertCount} alerts</Badge>
                    </div>
                    <Progress value={data.riskLevel} className="h-2" />
                    <p className="text-sm text-muted-foreground">{data.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Suggested actions to reduce fraud risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fraudAnalysis?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm flex-1">{recommendation}</span>
                    <Button size="sm" variant="outline">Implement</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}