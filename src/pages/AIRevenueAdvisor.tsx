import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { AIRevenueAdvisorService } from "@/services/AIRevenueAdvisorService";
import { useToast } from "@/components/ui/use-toast";

export default function AIRevenueAdvisor() {
  const [revenueAnalysis, setRevenueAnalysis] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueAnalysis();
  }, []);

  const loadRevenueAnalysis = async () => {
    try {
      setIsLoading(true);
      const analysis = await AIRevenueAdvisorService.analyzeRevenueOpportunities();
      setRevenueAnalysis(analysis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load revenue analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCaseScript = async (opportunity) => {
    try {
      setIsGeneratingScript(true);
      const factors = await AIRevenueAdvisorService.getPatientCaseAcceptanceFactors(opportunity.patientId);
      const script = await AIRevenueAdvisorService.generateCaseAcceptanceScript(opportunity.treatmentType, factors);
      setGeneratedScript(script);
      setSelectedOpportunity(opportunity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate case acceptance script",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'proposed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Revenue Advisor</h1>
        <p className="text-muted-foreground">Optimize case acceptance and maximize practice revenue</p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueAnalysis?.totalPotentialRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{(revenueAnalysis?.projectedImprovement * 100)?.toFixed(1)}% potential increase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Acceptance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(revenueAnalysis?.currentAcceptanceRate * 100)?.toFixed(1)}%</div>
            <Progress value={revenueAnalysis?.currentAcceptanceRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueAnalysis?.topOpportunities?.length}</div>
            <p className="text-xs text-muted-foreground">High-value cases pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue by Type</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Treatment categories</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Revenue Opportunities</TabsTrigger>
          <TabsTrigger value="strategies">Case Acceptance Strategies</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Opportunities</CardTitle>
              <CardDescription>
                AI-identified cases with highest revenue potential and acceptance probability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueAnalysis?.topOpportunities?.map((opportunity) => (
                  <Card key={opportunity.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{opportunity.patientName}</h3>
                          <Badge className={getStatusColor(opportunity.currentStatus)}>
                            {opportunity.currentStatus}
                          </Badge>
                          <Badge className={`text-white ${getPriorityColor(opportunity.priority)}`}>
                            {opportunity.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Treatment:</span> {opportunity.treatmentType}
                          </div>
                          <div>
                            <span className="font-medium">Estimated Revenue:</span> ${opportunity.estimatedRevenue.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Acceptance Probability:</span> {(opportunity.caseAcceptanceProbability * 100).toFixed(0)}%
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">AI Recommendations:</h4>
                          <ul className="space-y-1">
                            {opportunity.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last contact: {opportunity.lastContact.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Follow-up: {opportunity.followUpSuggested.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => generateCaseScript(opportunity)}
                          disabled={isGeneratingScript}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Generate Script
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule Follow-up
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress 
                        value={opportunity.caseAcceptanceProbability * 100} 
                        className="h-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Script Modal */}
          {selectedOpportunity && generatedScript && (
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Case Acceptance Script</CardTitle>
                <CardDescription>
                  Personalized communication for {selectedOpportunity.patientName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{generatedScript}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm">Copy Script</Button>
                  <Button size="sm" variant="outline">Email Patient</Button>
                  <Button size="sm" variant="outline">Schedule Call</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Case Acceptance Strategies</CardTitle>
              <CardDescription>
                AI-powered strategies to improve treatment acceptance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueAnalysis?.recommendedStrategies?.map((strategy, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{strategy.strategyType}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          +{(strategy.expectedImprovement * 100).toFixed(1)}% improvement
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Implementation Effort:</span>
                          <Badge className={`ml-2 ${
                            strategy.implementationEffort === 'low' ? 'bg-green-100 text-green-800' :
                            strategy.implementationEffort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {strategy.implementationEffort}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Target Audience:</span> {strategy.targetAudience.join(', ')}
                        </div>
                      </div>

                      <Button size="sm" className="w-fit">
                        Implement Strategy
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics by Treatment Type</CardTitle>
              <CardDescription>
                Breakdown of potential revenue by treatment category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueAnalysis?.revenueByTreatmentType || {}).map(([treatment, revenue]) => (
                  <div key={treatment} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{treatment}</span>
                    <div className="text-right">
                      <div className="font-semibold">${(revenue as number).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {(((revenue as number) / (revenueAnalysis?.totalPotentialRevenue || 1)) * 100).toFixed(1)}% of total
                      </div>
                    </div>
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