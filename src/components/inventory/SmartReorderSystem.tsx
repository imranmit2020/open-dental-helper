import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Brain, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Zap,
  Target,
  DollarSign,
  Package
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface SmartReorderItem {
  id: string;
  item_name: string;
  sku: string;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  predicted_stockout_date: string;
  cost_per_unit: number;
  total_cost: number;
  supplier: string;
  delivery_time: string;
  confidence_score: number;
  usage_trend: 'increasing' | 'stable' | 'decreasing';
  seasonal_factor: number;
  auto_reorder_enabled: boolean;
  last_order_date?: string;
  avg_monthly_usage: number;
}

interface ReorderSettings {
  auto_reorder_enabled: boolean;
  min_confidence_threshold: number;
  max_order_value: number;
  preferred_suppliers: string[];
  notification_settings: {
    email: boolean;
    sms: boolean;
    dashboard: boolean;
  };
}

export function SmartReorderSystem() {
  const [reorderItems, setReorderItems] = useState<SmartReorderItem[]>([]);
  const [settings, setSettings] = useState<ReorderSettings>({
    auto_reorder_enabled: true,
    min_confidence_threshold: 85,
    max_order_value: 5000,
    preferred_suppliers: ['DentSupply Pro', 'MedDental Direct'],
    notification_settings: {
      email: true,
      sms: false,
      dashboard: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<string[]>([]);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchReorderRecommendations();
    }
  }, [currentTenant]);

  const fetchReorderRecommendations = async () => {
    try {
      setLoading(true);
      
      // Simulate AI-powered reorder recommendations
      const mockReorderItems: SmartReorderItem[] = [
        {
          id: '1',
          item_name: 'Composite Resin A2',
          sku: 'CR-A2-001',
          current_stock: 8,
          reorder_point: 15,
          suggested_quantity: 25,
          urgency: 'critical',
          predicted_stockout_date: '2024-02-15',
          cost_per_unit: 45.99,
          total_cost: 1149.75,
          supplier: 'DentSupply Pro',
          delivery_time: '2-3 days',
          confidence_score: 94,
          usage_trend: 'increasing',
          seasonal_factor: 1.2,
          auto_reorder_enabled: true,
          last_order_date: '2024-01-15',
          avg_monthly_usage: 35
        },
        {
          id: '2',
          item_name: 'Dental Gloves (Medium)',
          sku: 'GL-M-100',
          current_stock: 150,
          reorder_point: 200,
          suggested_quantity: 500,
          urgency: 'high',
          predicted_stockout_date: '2024-02-20',
          cost_per_unit: 0.32,
          total_cost: 160.00,
          supplier: 'GloveTech Solutions',
          delivery_time: '1 day',
          confidence_score: 89,
          usage_trend: 'stable',
          seasonal_factor: 1.0,
          auto_reorder_enabled: true,
          avg_monthly_usage: 800
        },
        {
          id: '3',
          item_name: 'Fluoride Varnish',
          sku: 'FV-5ML',
          current_stock: 12,
          reorder_point: 10,
          suggested_quantity: 20,
          urgency: 'medium',
          predicted_stockout_date: '2024-03-01',
          cost_per_unit: 28.50,
          total_cost: 570.00,
          supplier: 'DentSupply Pro',
          delivery_time: '2-3 days',
          confidence_score: 76,
          usage_trend: 'decreasing',
          seasonal_factor: 0.8,
          auto_reorder_enabled: false,
          last_order_date: '2023-12-20',
          avg_monthly_usage: 15
        }
      ];

      setReorderItems(mockReorderItems);
    } catch (error) {
      console.error('Error fetching reorder recommendations:', error);
      toast.error('Failed to load reorder recommendations');
    } finally {
      setLoading(false);
    }
  };

  const executeReorder = async (itemId: string) => {
    try {
      setProcessingOrders(prev => [...prev, itemId]);
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const item = reorderItems.find(i => i.id === itemId);
      if (item) {
        toast.success(`Order placed for ${item.suggested_quantity} units of ${item.item_name}`);
        // Update item status
        setReorderItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setProcessingOrders(prev => prev.filter(id => id !== itemId));
    }
  };

  const toggleAutoReorder = (itemId: string) => {
    setReorderItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, auto_reorder_enabled: !item.auto_reorder_enabled }
          : item
      )
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getDaysUntilStockout = (date: string) => {
    const stockoutDate = new Date(date);
    const today = new Date();
    const diffTime = stockoutDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalOrderValue = reorderItems.reduce((sum, item) => sum + item.total_cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Smart Reorder System</h2>
            <p className="text-muted-foreground">AI-powered automatic inventory replenishment</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={fetchReorderRecommendations} className="bg-gradient-primary text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{reorderItems.filter(i => i.urgency === 'critical').length}</div>
                <div className="text-sm text-muted-foreground">Critical Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{reorderItems.length}</div>
                <div className="text-sm text-muted-foreground">Items to Reorder</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${totalOrderValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Order Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{reorderItems.filter(i => i.auto_reorder_enabled).length}</div>
                <div className="text-sm text-muted-foreground">Auto-Reorder Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Items */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-primary/10">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : reorderItems.length === 0 ? (
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All Stocked Up!</h3>
              <p className="text-muted-foreground">No items need reordering at this time.</p>
            </CardContent>
          </Card>
        ) : (
          reorderItems.map((item) => {
            const daysUntilStockout = getDaysUntilStockout(item.predicted_stockout_date);
            const stockLevel = (item.current_stock / (item.reorder_point * 2)) * 100;
            const isProcessing = processingOrders.includes(item.id);
            
            return (
              <Card 
                key={item.id} 
                className={`border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                  item.urgency === 'critical' ? 'ring-1 ring-red-500/20 border-red-200' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Item Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{item.item_name}</h4>
                            {getTrendIcon(item.usage_trend)}
                          </div>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getUrgencyColor(item.urgency) as any}>
                            {item.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {item.confidence_score}% confidence
                          </Badge>
                        </div>
                      </div>

                      {/* Stock Level */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Stock Level</span>
                          <span className="font-medium">
                            {item.current_stock} / {item.reorder_point * 2} units
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, stockLevel))} 
                          className={`h-2 ${stockLevel < 25 ? 'bg-red-100' : stockLevel < 50 ? 'bg-amber-100' : 'bg-green-100'}`}
                        />
                      </div>

                      {/* AI Insights */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Predicted Stockout</span>
                          <div className={`font-semibold ${daysUntilStockout <= 7 ? 'text-red-600' : daysUntilStockout <= 14 ? 'text-amber-600' : 'text-green-600'}`}>
                            {daysUntilStockout} days
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Monthly Usage</span>
                          <div className="font-semibold">{item.avg_monthly_usage} units</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Supplier</span>
                          <div className="font-semibold">{item.supplier}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Delivery Time</span>
                          <div className="font-semibold">{item.delivery_time}</div>
                        </div>
                      </div>

                      {/* Auto Reorder Toggle */}
                      <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                        <Switch
                          checked={item.auto_reorder_enabled}
                          onCheckedChange={() => toggleAutoReorder(item.id)}
                        />
                        <div className="flex-1">
                          <Label className="text-sm font-medium">Auto-Reorder Enabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically place orders when stock reaches reorder point
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="w-72 space-y-4">
                      <div className="p-4 bg-gradient-subtle rounded-lg border">
                        <h5 className="font-semibold mb-3">Suggested Order</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span className="font-semibold">{item.suggested_quantity} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unit Price:</span>
                            <span>${item.cost_per_unit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Total Cost:</span>
                            <span className="font-bold text-lg">${item.total_cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => executeReorder(item.id)}
                          disabled={isProcessing}
                          className="w-full bg-gradient-primary text-primary-foreground"
                        >
                          {isProcessing ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Place Order
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Package className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}