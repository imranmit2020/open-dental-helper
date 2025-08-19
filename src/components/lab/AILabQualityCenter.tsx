import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Bot, Zap, Target, AlertTriangle, CheckCircle, Camera, 
  Microscope, Cpu, Activity, Globe, Shield, TrendingUp, Clock,
  Star, Award, Lightbulb, Eye, Settings, Waves, ChartBar
} from 'lucide-react';
import { toast } from 'sonner';

interface AIQualityAnalysis {
  orderId: string;
  qualityScore: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  expectedDelivery: string;
  materialAnalysis: {
    composition: string;
    strength: number;
    durability: number;
    biocompatibility: number;
  };
  visualInspection: {
    defectDetection: string[];
    surfaceQuality: number;
    dimensionalAccuracy: number;
  };
}

interface PredictiveInsight {
  type: 'quality_risk' | 'delivery_delay' | 'cost_optimization' | 'equipment_maintenance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: string;
  action: string;
  estimatedSavings?: number;
}

export function AILabQualityCenter() {
  const [qualityAnalyses, setQualityAnalyses] = useState<AIQualityAnalysis[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIQualityAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    // Mock AI quality analyses
    const mockAnalyses: AIQualityAnalysis[] = [
      {
        orderId: 'ORD-001',
        qualityScore: 96.5,
        confidence: 94.2,
        riskFactors: ['Slight color variation detected', 'Edge smoothness could be improved'],
        recommendations: ['Additional polishing required', 'Color matching verification needed'],
        expectedDelivery: '2024-02-15T10:00:00Z',
        materialAnalysis: {
          composition: 'Lithium Disilicate',
          strength: 94.8,
          durability: 96.2,
          biocompatibility: 99.1
        },
        visualInspection: {
          defectDetection: ['Minor surface irregularity at position 3.2mm'],
          surfaceQuality: 92.5,
          dimensionalAccuracy: 98.7
        }
      },
      {
        orderId: 'ORD-002',
        qualityScore: 89.3,
        confidence: 87.8,
        riskFactors: ['Material density inconsistency', 'Slight warping detected'],
        recommendations: ['Reinforcement suggested', 'Quality control review required'],
        expectedDelivery: '2024-02-18T14:30:00Z',
        materialAnalysis: {
          composition: 'Zirconia',
          strength: 91.2,
          durability: 88.5,
          biocompatibility: 97.8
        },
        visualInspection: {
          defectDetection: ['Micro-crack detected at stress point'],
          surfaceQuality: 85.3,
          dimensionalAccuracy: 94.1
        }
      }
    ];

    const mockInsights: PredictiveInsight[] = [
      {
        type: 'quality_risk',
        title: 'Potential Quality Issue Detected',
        description: 'Order ORD-003 shows elevated risk factors based on material composition and environmental conditions.',
        severity: 'medium',
        confidence: 78.5,
        impact: 'May require rework, delaying delivery by 2-3 days',
        action: 'Increase inspection frequency and adjust processing parameters'
      },
      {
        type: 'delivery_delay',
        title: 'Supply Chain Disruption Alert',
        description: 'Ceramic material shortage predicted to affect 15% of orders next week.',
        severity: 'high',
        confidence: 91.2,
        impact: 'Average delay of 4-5 days for ceramic restorations',
        action: 'Source alternative materials or adjust scheduling'
      },
      {
        type: 'cost_optimization',
        title: 'Batch Processing Opportunity',
        description: 'Grouping 8 similar crowns can reduce processing time by 23% and costs by $340.',
        severity: 'low',
        confidence: 95.7,
        impact: 'Potential savings and efficiency improvement',
        action: 'Reorganize production schedule for batch processing',
        estimatedSavings: 340
      },
      {
        type: 'equipment_maintenance',
        title: 'CAD/CAM Mill Maintenance Due',
        description: 'Predictive analysis indicates mill performance degradation. Maintenance recommended within 48 hours.',
        severity: 'critical',
        confidence: 88.9,
        impact: 'Risk of production halt and quality degradation',
        action: 'Schedule immediate preventive maintenance'
      }
    ];

    setQualityAnalyses(mockAnalyses);
    setPredictiveInsights(mockInsights);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newAnalysis: AIQualityAnalysis = {
        orderId: `ORD-${String(qualityAnalyses.length + 1).padStart(3, '0')}`,
        qualityScore: Math.random() * 20 + 80, // 80-100 range
        confidence: Math.random() * 20 + 80,
        riskFactors: [
          'AI detected minor surface variation',
          'Edge definition could be enhanced'
        ],
        recommendations: [
          'Additional quality control inspection',
          'Surface refinement recommended'
        ],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        materialAnalysis: {
          composition: 'Ceramic Composite',
          strength: Math.random() * 20 + 80,
          durability: Math.random() * 20 + 80,
          biocompatibility: Math.random() * 10 + 90
        },
        visualInspection: {
          defectDetection: ['No critical defects detected'],
          surfaceQuality: Math.random() * 20 + 80,
          dimensionalAccuracy: Math.random() * 10 + 90
        }
      };

      setQualityAnalyses(prev => [newAnalysis, ...prev]);
      toast.success('AI quality analysis completed successfully!');
      
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">AI Quality Center</h2>
            <p className="text-muted-foreground">Advanced AI-powered quality analysis and predictions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="quality-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quality-analysis">Quality Analysis</TabsTrigger>
          <TabsTrigger value="predictive-insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="performance-metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="quality-analysis" className="space-y-6">
          {/* Quality Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Quality Score', value: '94.2%', icon: Star, color: 'text-green-600' },
              { label: 'Analyses Today', value: qualityAnalyses.length, icon: Microscope, color: 'text-blue-600' },
              { label: 'Risk Alerts', value: qualityAnalyses.filter(a => a.qualityScore < 90).length, icon: AlertTriangle, color: 'text-amber-600' },
              { label: 'AI Confidence', value: '91.8%', icon: Brain, color: 'text-purple-600' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quality Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {qualityAnalyses.map((analysis, index) => (
              <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-accent" />
                      Order {analysis.orderId}
                    </CardTitle>
                    <Badge variant={analysis.qualityScore >= 95 ? 'default' : analysis.qualityScore >= 85 ? 'secondary' : 'destructive'}>
                      {analysis.qualityScore.toFixed(1)}% Quality
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Material Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Material Analysis
                    </h4>
                    <div className="bg-accent/10 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Composition</span>
                        <span className="text-sm font-medium">{analysis.materialAnalysis.composition}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Strength</div>
                          <div className="font-medium">{analysis.materialAnalysis.strength.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Durability</div>
                          <div className="font-medium">{analysis.materialAnalysis.durability.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Bio-compat</div>
                          <div className="font-medium">{analysis.materialAnalysis.biocompatibility.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Inspection */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visual Inspection
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Surface Quality</span>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.visualInspection.surfaceQuality} className="w-20 h-2" />
                          <span className="text-sm font-medium">{analysis.visualInspection.surfaceQuality.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dimensional Accuracy</span>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.visualInspection.dimensionalAccuracy} className="w-20 h-2" />
                          <span className="text-sm font-medium">{analysis.visualInspection.dimensionalAccuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {analysis.riskFactors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-1">
                        {analysis.riskFactors.map((risk, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Confidence: {analysis.confidence.toFixed(1)}%
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedAnalysis(analysis)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictive-insights" className="space-y-6">
          {/* Predictive Insights */}
          <div className="grid grid-cols-1 gap-4">
            {predictiveInsights.map((insight, index) => (
              <Card key={index} className={`border-2 ${getSeverityColor(insight.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {insight.type === 'quality_risk' && <AlertTriangle className="w-5 h-5" />}
                      {insight.type === 'delivery_delay' && <Clock className="w-5 h-5" />}
                      {insight.type === 'cost_optimization' && <TrendingUp className="w-5 h-5" />}
                      {insight.type === 'equipment_maintenance' && <Settings className="w-5 h-5" />}
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {insight.confidence.toFixed(1)}% confidence
                      </Badge>
                      <Badge variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'high' ? 'secondary' : 'outline'}>
                        {insight.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground">{insight.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-600">Impact</h4>
                      <p className="text-sm text-muted-foreground">{insight.impact}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">Recommended Action</h4>
                      <p className="text-sm text-muted-foreground">{insight.action}</p>
                    </div>
                  </div>

                  {insight.estimatedSavings && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          Potential Savings: ${insight.estimatedSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                      Take Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance-metrics" className="space-y-6">
          {/* Performance Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="w-5 h-5" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold text-green-600">+2.3%</span>
                  </div>
                  <Progress value={94.2} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    Average quality score improved by 2.3% compared to last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Prediction Accuracy</span>
                    <span className="font-bold">91.8%</span>
                  </div>
                  <Progress value={91.8} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    AI models correctly predicted 91.8% of quality outcomes
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Quality Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">7 days without quality issues</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">98% client satisfaction rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">15% efficiency improvement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Global Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Industry Average</span>
                    <span className="text-sm font-medium">87.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Your Performance</span>
                    <span className="text-sm font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Top 10%</span>
                    <span className="text-sm font-medium">95.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Analysis Processing Indicator */}
      {isAnalyzing && (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4 flex-col">
              <div className="relative">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Waves className="w-4 h-4 text-accent animate-bounce" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                <p className="text-muted-foreground">Advanced neural networks are analyzing your sample...</p>
              </div>
              <Progress value={75} className="w-full max-w-xs h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}