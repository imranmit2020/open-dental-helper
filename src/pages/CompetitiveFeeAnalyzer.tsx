import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Building, 
  Star,
  RefreshCw,
  ArrowUpDown,
  Target,
  BarChart3
} from "lucide-react";
import { CompetitiveFeeAnalyzerService } from "@/services/CompetitiveFeeAnalyzerService";
import { useToast } from "@/components/ui/use-toast";

export default function CompetitiveFeeAnalyzer() {
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [competitorChanges, setCompetitorChanges] = useState(null);
  const [location, setLocation] = useState("Current Location");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketAnalysis();
    loadCompetitorChanges();
  }, []);

  const loadMarketAnalysis = async () => {
    try {
      setIsLoading(true);
      const analysis = await CompetitiveFeeAnalyzerService.analyzeMarketFees(location);
      setMarketAnalysis(analysis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load market analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetitorChanges = async () => {
    try {
      const changes = await CompetitiveFeeAnalyzerService.trackCompetitorChanges();
      setCompetitorChanges(changes);
    } catch (error) {
      console.error("Failed to load competitor changes:", error);
    }
  };

  const refreshAnalysis = async () => {
    setIsRefreshing(true);
    await loadMarketAnalysis();
    await loadCompetitorChanges();
    setIsRefreshing(false);
    toast({
      title: "Analysis Updated",
      description: "Market data has been refreshed with latest information",
    });
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'below_average': return 'bg-red-100 text-red-800';
      case 'average': return 'bg-gray-100 text-gray-800';
      case 'above_average': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRevenueImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Competitive Fee Analyzer</h1>
          <p className="text-muted-foreground">Compare your fees with local competitors and optimize pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="w-48"
              placeholder="Enter location"
            />
          </div>
          <Button 
            onClick={refreshAnalysis} 
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitors Analyzed</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalysis?.totalCompetitorsAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              Avg rating: {marketAnalysis?.averageMarketRating}⭐
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Position</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{marketAnalysis?.pricePositioning?.replace('_', ' ')}</div>
            <p className="text-xs text-muted-foreground">Market positioning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(marketAnalysis?.opportunityScore * 100)?.toFixed(0)}%</div>
            <Progress value={marketAnalysis?.opportunityScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${marketAnalysis?.feeAnalyses?.reduce((sum, analysis) => sum + analysis.revenueImpact, 0)?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Annual impact</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Fee Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Market Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Fee Analysis</CardTitle>
              <CardDescription>
                Detailed comparison of your fees vs. market averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketAnalysis?.feeAnalyses?.map((analysis) => (
                  <Card key={analysis.treatmentCode} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{analysis.treatmentName}</h3>
                          <p className="text-sm text-muted-foreground">Code: {analysis.treatmentCode}</p>
                        </div>
                        <Badge className={getPositionColor(analysis.positionInMarket)}>
                          {analysis.positionInMarket.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Your Fee:</span>
                          <div className="text-lg font-semibold">${analysis.currentFee}</div>
                        </div>
                        <div>
                          <span className="font-medium">Market Avg:</span>
                          <div className="text-lg">${analysis.marketAverage}</div>
                        </div>
                        <div>
                          <span className="font-medium">Market High:</span>
                          <div className="text-lg">${analysis.marketHigh}</div>
                        </div>
                        <div>
                          <span className="font-medium">Market Low:</span>
                          <div className="text-lg">${analysis.marketLow}</div>
                        </div>
                        <div>
                          <span className="font-medium">Recommended:</span>
                          <div className="text-lg font-semibold text-blue-600">${analysis.recommendedFee}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Revenue Impact:</span>
                          <span className={`text-sm font-semibold ${getRevenueImpactColor(analysis.revenueImpact)}`}>
                            {analysis.revenueImpact > 0 ? '+' : ''}${analysis.revenueImpact?.toLocaleString()}/year
                          </span>
                        </div>
                        <Progress 
                          value={((analysis.currentFee - analysis.marketLow) / (analysis.marketHigh - analysis.marketLow)) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Market Low</span>
                          <span>Market High</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Competitive Advantage:</h4>
                        <p className="text-sm text-muted-foreground">{analysis.competitiveAdvantage}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recommendations:</h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ArrowUpDown className="h-3 w-3" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Market Changes</CardTitle>
              <CardDescription>
                Track competitor pricing changes and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold">Recent Fee Changes</h3>
                {competitorChanges?.recentChanges?.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{change.competitor}</div>
                      <div className="text-sm text-muted-foreground">{change.treatment}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">${change.oldFee}</span>
                        <ArrowUpDown className="h-3 w-3" />
                        <span className="font-semibold">${change.newFee}</span>
                        <Badge className={change.changePercent > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {change.changePercent > 0 ? '+' : ''}{change.changePercent.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {change.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Market Trends</h3>
                <div className="grid grid-cols-1 gap-3">
                  {competitorChanges?.marketTrends?.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Pricing Recommendations</CardTitle>
              <CardDescription>
                Strategic pricing advice based on market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketAnalysis?.topRecommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Implement
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Pricing Strategy Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>• Your practice is positioned in the <strong>{marketAnalysis?.pricePositioning?.replace('_', ' ')}</strong> segment</p>
                  <p>• Potential annual revenue increase: <strong>${marketAnalysis?.feeAnalyses?.reduce((sum, analysis) => sum + Math.max(0, analysis.revenueImpact), 0)?.toLocaleString()}</strong></p>
                  <p>• Market opportunity score: <strong>{(marketAnalysis?.opportunityScore * 100)?.toFixed(0)}%</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}