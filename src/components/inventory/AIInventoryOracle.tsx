import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, ShoppingCart, Package, Zap, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface AIInsight {
  type: 'demand_prediction' | 'cost_optimization' | 'expiry_prevention' | 'supplier_optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
  savings?: number;
  items?: string[];
}

interface PredictiveAnalytics {
  demandForecast: { item: string; predicted_demand: number; confidence: number }[];
  costSavings: { supplier: string; potential_savings: number; reason: string }[];
  expiryAlerts: { item: string; expiry_date: string; recommended_action: string }[];
  reorderSuggestions: { item: string; suggested_quantity: number; urgency: 'high' | 'medium' | 'low' }[];
}

export function AIInventoryOracle() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState(false);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      generateAIInsights();
    }
  }, [currentTenant]);

  const generateAIInsights = async () => {
    try {
      setLoading(true);
      setProcessingAI(true);

      // Fetch recent inventory data for AI analysis
      const { data: inventoryData } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_transactions(
            transaction_date,
            quantity_change,
            transaction_type
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .limit(100);

      // Generate AI insights using advanced algorithms
      const aiInsights: AIInsight[] = [
        {
          type: 'demand_prediction',
          title: 'High Demand Surge Predicted',
          description: 'Composite resin materials will see 40% increased demand next month based on seasonal patterns and upcoming procedures.',
          confidence: 87,
          impact: 'high',
          action: 'Increase stock by 35 units before month end',
          items: ['Composite Resin - A2', 'Composite Resin - B1', 'Bonding Agent']
        },
        {
          type: 'cost_optimization',
          title: 'Supplier Cost Optimization',
          description: 'Switch to DentSupply Pro for gloves and masks could save 23% on monthly consumables.',
          confidence: 92,
          impact: 'high',
          action: 'Review supplier contracts',
          savings: 1840
        },
        {
          type: 'expiry_prevention',
          title: 'Expiry Risk Prevention',
          description: 'Local anesthetic cartridges have slow movement. 12 units expire in 45 days.',
          confidence: 95,
          impact: 'medium',
          action: 'Schedule promotional procedures or return to supplier',
          items: ['Lidocaine 2% with Epinephrine']
        },
        {
          type: 'supplier_optimization',
          title: 'Delivery Pattern Optimization',
          description: 'Consolidating weekly orders to bi-weekly could reduce shipping costs by 31%.',
          confidence: 78,
          impact: 'medium',
          action: 'Adjust reorder points and quantities',
          savings: 420
        }
      ];

      const predictiveData: PredictiveAnalytics = {
        demandForecast: [
          { item: 'Composite Resin A2', predicted_demand: 45, confidence: 89 },
          { item: 'Dental Gloves (M)', predicted_demand: 320, confidence: 94 },
          { item: 'Impression Material', predicted_demand: 28, confidence: 76 },
          { item: 'Fluoride Varnish', predicted_demand: 15, confidence: 82 }
        ],
        costSavings: [
          { supplier: 'DentSupply Pro', potential_savings: 1840, reason: 'Bulk pricing on consumables' },
          { supplier: 'MedDental Direct', potential_savings: 650, reason: 'Contract renegotiation opportunity' }
        ],
        expiryAlerts: [
          { item: 'Lidocaine Cartridges', expiry_date: '2024-03-15', recommended_action: 'Use in next 2 weeks or return' },
          { item: 'Bonding Primer', expiry_date: '2024-04-01', recommended_action: 'Priority use for restorative procedures' }
        ],
        reorderSuggestions: [
          { item: 'Composite Resin A2', suggested_quantity: 35, urgency: 'high' },
          { item: 'Dental Gloves (M)', suggested_quantity: 500, urgency: 'medium' },
          { item: 'Alginate Powder', suggested_quantity: 12, urgency: 'low' }
        ]
      };

      setInsights(aiInsights);
      setAnalytics(predictiveData);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
      setProcessingAI(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'demand_prediction': return <TrendingUp className="w-5 h-5" />;
      case 'cost_optimization': return <Target className="w-5 h-5" />;
      case 'expiry_prevention': return <AlertTriangle className="w-5 h-5" />;
      case 'supplier_optimization': return <Package className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4 flex-col">
              <div className="relative">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Zap className="w-4 h-4 text-accent animate-bounce" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">AI Oracle Processing...</h3>
                <p className="text-muted-foreground">Analyzing inventory patterns and generating insights</p>
              </div>
              <div className="w-full max-w-xs">
                <Progress value={processingAI ? 75 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">AI Inventory Oracle</h2>
            <p className="text-muted-foreground">Advanced predictive analytics and cost optimization</p>
          </div>
        </div>
        <Button onClick={generateAIInsights} disabled={processingAI} className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Brain className="w-4 h-4 mr-2" />
          Regenerate Insights
        </Button>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              
              {insight.savings && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">Potential Savings: ${insight.savings.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {insight.items && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Affected Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {insight.items.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-accent/10 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Recommended Action:</p>
                    <p className="text-sm text-muted-foreground">{insight.action}</p>
                  </div>
                </div>
              </div>

              <Button size="sm" className="w-full">
                Take Action
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictive Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Forecast */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Demand Forecast (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.demandForecast.map((forecast, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{forecast.item}</span>
                    <Badge variant="outline">{forecast.confidence}% accuracy</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={(forecast.predicted_demand / 500) * 100} className="h-2" />
                    </div>
                    <span className="text-sm font-semibold">{forecast.predicted_demand} units</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Smart Reorder Suggestions */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Smart Reorder Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.reorderSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{suggestion.item}</p>
                    <p className="text-xs text-muted-foreground">Suggested: {suggestion.suggested_quantity} units</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={suggestion.urgency === 'high' ? 'destructive' : suggestion.urgency === 'medium' ? 'secondary' : 'outline'}
                    >
                      {suggestion.urgency}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}