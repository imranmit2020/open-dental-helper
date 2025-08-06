import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  DollarSign,
  MapPin,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Download,
  Zap,
  Calendar,
  Star,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { MarketIntelligenceService } from '@/services/MarketIntelligenceService';
import { useToast } from '@/hooks/use-toast';

const MarketIntelligence = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [investmentSuggestions, setInvestmentSuggestions] = useState<any[]>([]);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<any[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [marketReport, setMarketReport] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketData();
  }, [selectedRegion]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [trends, suggestions, outcomes, insights] = await Promise.all([
        MarketIntelligenceService.getMarketTrends(selectedRegion),
        MarketIntelligenceService.getInvestmentSuggestions(),
        MarketIntelligenceService.getTreatmentOutcomes(),
        MarketIntelligenceService.getMarketInsights()
      ]);
      
      setMarketTrends(trends);
      setInvestmentSuggestions(suggestions);
      setTreatmentOutcomes(outcomes);
      setMarketInsights(insights);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load market intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const report = await MarketIntelligenceService.generateMarketReport('quarterly');
      setMarketReport(report);
      toast({
        title: "Report Generated",
        description: "Market intelligence report has been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate market report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Data & Market Intelligence</h1>
          <p className="text-muted-foreground">AI-powered insights for strategic decision making and revenue optimization</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north_america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Market Growth</p>
                <p className="text-2xl font-bold text-blue-800">+12.4%</p>
                <p className="text-xs text-blue-600">vs last quarter</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Investment ROI</p>
                <p className="text-2xl font-bold text-green-800">186%</p>
                <p className="text-xs text-green-600">avg return</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Success Rate</p>
                <p className="text-2xl font-bold text-purple-800">94.1%</p>
                <p className="text-xs text-purple-600">treatment avg</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Market Position</p>
                <p className="text-2xl font-bold text-orange-800">Top 20%</p>
                <p className="text-xs text-orange-600">regional rank</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="investments">Investment AI</TabsTrigger>
          <TabsTrigger value="outcomes">Treatment Analytics</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        {/* Dental Market Trends Dashboard */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dental Market Trends Dashboard
              </CardTitle>
              <CardDescription>
                Aggregated anonymized data showing demand for procedures, costs, and patient behavior by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Analyzing market trends...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {marketTrends.map((trend, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold">{trend.procedureType}</h4>
                              <Badge variant="outline">
                                <MapPin className="w-3 h-3 mr-1" />
                                {trend.region}
                              </Badge>
                              <Badge className={trend.growthRate > 10 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{trend.growthRate}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Market demand: {trend.demand}% • Average cost: <CurrencyDisplay amount={trend.averageCost} />
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{trend.demand}%</p>
                            <p className="text-xs text-muted-foreground">Demand Score</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Seasonality Chart */}
                          <div>
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Seasonal Trends
                            </h5>
                            <div className="space-y-2">
                              {trend.seasonality.slice(0, 6).map((season: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span>{season.month}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={season.demandMultiplier * 70} className="w-16 h-2" />
                                    <span className="text-xs">{season.demandMultiplier}x</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Patient Demographics */}
                          <div>
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Patient Demographics
                            </h5>
                            <div className="space-y-2">
                              {trend.patientDemographics.map((demo: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span>{demo.ageGroup}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={demo.percentage} className="w-16 h-2" />
                                    <span className="text-xs">{demo.percentage}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Competitor Analysis */}
                          <div>
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Market Position
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Average Pricing</p>
                                <p className="font-medium"><CurrencyDisplay amount={trend.competitorAnalysis.averagePricing} /></p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Market Share</p>
                                <p className="font-medium">{trend.competitorAnalysis.marketShare}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Key Differentiators</p>
                                <div className="flex flex-wrap gap-1">
                                  {trend.competitorAnalysis.differentiators.map((diff: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {diff}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered Investment Suggestions */}
        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Powered Investment Suggestions
              </CardTitle>
              <CardDescription>
                Helps clinics identify which services or equipment to add for revenue growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Analyzing investment opportunities...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {investmentSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-green-400">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold">{suggestion.title}</h4>
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority} priority
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {suggestion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {suggestion.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{suggestion.expectedROI}%</p>
                            <p className="text-xs text-muted-foreground">Expected ROI</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Investment Cost</p>
                            <p className="font-bold text-lg">
                              <CurrencyDisplay amount={suggestion.estimatedCost} />
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payback Period</p>
                            <p className="font-bold text-lg">{suggestion.paybackPeriod} months</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market Opportunity</p>
                            <div className="flex items-center gap-2">
                              <Progress value={suggestion.marketOpportunity} className="flex-1" />
                              <span className="text-sm font-medium">{suggestion.marketOpportunity}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <p className={`font-bold text-lg ${getRiskColor(suggestion.riskLevel)}`}>
                              {suggestion.riskLevel}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium mb-3">Revenue Projections</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Year 1:</span>
                                <span className="font-medium">
                                  <CurrencyDisplay amount={suggestion.projectedRevenue.year1} />
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Year 2:</span>
                                <span className="font-medium">
                                  <CurrencyDisplay amount={suggestion.projectedRevenue.year2} />
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Year 3:</span>
                                <span className="font-medium">
                                  <CurrencyDisplay amount={suggestion.projectedRevenue.year3} />
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-3">Market Data</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Local Demand:</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={suggestion.marketData.localDemand} className="w-16 h-2" />
                                  <span className="text-xs">{suggestion.marketData.localDemand}%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Competitor Adoption:</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={suggestion.marketData.competitorAdoption} className="w-16 h-2" />
                                  <span className="text-xs">{suggestion.marketData.competitorAdoption}%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Patient Willingness:</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={suggestion.marketData.patientWillingness} className="w-16 h-2" />
                                  <span className="text-xs">{suggestion.marketData.patientWillingness}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Implementation Steps</h5>
                          <div className="space-y-1">
                            {suggestion.implementationSteps.slice(0, 3).map((step: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                  {i + 1}
                                </span>
                                {step}
                              </div>
                            ))}
                            {suggestion.implementationSteps.length > 3 && (
                              <p className="text-xs text-muted-foreground ml-7">
                                +{suggestion.implementationSteps.length - 3} more steps
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Target className="w-3 h-3 mr-1" />
                            Start Implementation
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Download Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Outcome Analytics */}
        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Treatment Outcome Analytics
              </CardTitle>
              <CardDescription>
                Tracks success rates, complications, and satisfaction for every procedure type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Analyzing treatment outcomes...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {treatmentOutcomes.map((outcome) => (
                    <Card key={outcome.id} className="border-l-4 border-l-purple-400">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold mb-2">{outcome.procedureType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {outcome.totalCases} total cases analyzed
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">{outcome.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{outcome.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{outcome.complicationRate}%</p>
                            <p className="text-xs text-muted-foreground">Complications</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{outcome.averageSatisfactionScore}</p>
                            <p className="text-xs text-muted-foreground">Satisfaction</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{outcome.averageHealingTime}</p>
                            <p className="text-xs text-muted-foreground">Days Healing</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{outcome.patientReturnRate}%</p>
                            <p className="text-xs text-muted-foreground">Return Rate</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium mb-3">Benchmark Comparison</h5>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Industry Average</span>
                                  <span className="text-sm font-medium">{outcome.benchmarkComparison.industry}%</span>
                                </div>
                                <Progress value={outcome.benchmarkComparison.industry} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Regional Average</span>
                                  <span className="text-sm font-medium">{outcome.benchmarkComparison.regional}%</span>
                                </div>
                                <Progress value={outcome.benchmarkComparison.regional} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Top 10%</span>
                                  <span className="text-sm font-medium">{outcome.benchmarkComparison.top10Percent}%</span>
                                </div>
                                <Progress value={outcome.benchmarkComparison.top10Percent} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-bold">Your Practice</span>
                                  <span className="text-sm font-bold text-purple-600">{outcome.successRate}%</span>
                                </div>
                                <Progress value={outcome.successRate} className="h-2 bg-purple-100" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-3">Risk Factors</h5>
                            <div className="space-y-2">
                              {outcome.riskFactors.map((risk: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span className="text-sm">{risk.factor}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{risk.frequency}%</span>
                                    <Progress value={risk.impact} className="w-16 h-2" />
                                    <span className="text-xs font-medium">{risk.impact}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h5 className="font-medium mb-2">Improvement Opportunities</h5>
                          <div className="space-y-1">
                            {outcome.improvementOpportunities.map((opportunity: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                {opportunity}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketInsights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getImpactIcon(insight.impact)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">{insight.title}</h5>
                            <Badge variant="outline" className="capitalize">
                              {insight.type}
                            </Badge>
                            <Badge className={`text-xs ${insight.urgency === 'immediate' ? 'bg-red-100 text-red-800' : insight.urgency === 'short_term' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                              {insight.urgency.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          <div className="space-y-1">
                            {insight.actionableSteps.slice(0, 2).map((step: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {step}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              Confidence: {Math.round(insight.confidence * 100)}%
                            </span>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {marketReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Market Report Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-medium mb-2">Executive Summary</h5>
                      <p className="text-sm text-muted-foreground">{marketReport.summary}</p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-3">Key Metrics</h5>
                      <div className="space-y-2">
                        {marketReport.keyMetrics.map((metric: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm">{metric.metric}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{metric.value}</span>
                              {metric.trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : metric.trend === 'down' ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : (
                                <Activity className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Top Recommendations</h5>
                      <div className="space-y-1">
                        {marketReport.recommendations.slice(0, 3).map((rec: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Target className="w-3 h-3 text-blue-500" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Competitive Position</h5>
                      <p className="text-sm text-muted-foreground">{marketReport.competitivePosition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;