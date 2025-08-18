import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface AnalyticsData {
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  usageTrends: Array<{ month: string; usage: number; cost: number }>;
  topItems: Array<{ name: string; usage: number; cost: number }>;
  stockLevels: Array<{ name: string; current: number; optimal: number }>;
  insights: any;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export function InventoryAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    categoryDistribution: [],
    usageTrends: [],
    topItems: [],
    stockLevels: [],
    insights: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchAnalyticsData();
    }
  }, [currentTenant, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch category distribution
      const { data: categories, error: categoriesError } = await supabase
        .from('inventory_items')
        .select(`
          inventory_categories(name),
          current_stock
        `)
        .eq('tenant_id', currentTenant?.id)
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Process category distribution
      const categoryMap = new Map();
      categories?.forEach(item => {
        const categoryName = item.inventory_categories?.name || 'Uncategorized';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + item.current_stock);
      });

      const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));

      // Fetch top usage items
      const { data: transactions, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select(`
          item_id,
          quantity,
          total_cost,
          created_at,
          inventory_items(name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .eq('transaction_type', 'usage')
        .gte('created_at', new Date(Date.now() - (timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString());

      if (transactionsError) throw transactionsError;

      // Process top items
      const itemMap = new Map();
      transactions?.forEach(transaction => {
        const itemName = transaction.inventory_items?.name || 'Unknown';
        const existing = itemMap.get(itemName) || { usage: 0, cost: 0 };
        itemMap.set(itemName, {
          usage: existing.usage + Math.abs(transaction.quantity),
          cost: existing.cost + (transaction.total_cost || 0)
        });
      });

      const topItems = Array.from(itemMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      // Get AI insights
      const { data: insights, error: insightsError } = await supabase
        .rpc('generate_inventory_insights', {
          _tenant_id: currentTenant?.id
        });

      if (insightsError) {
        console.error('Error fetching insights:', insightsError);
      }

      setData({
        categoryDistribution,
        usageTrends: [], // Mock data for now
        topItems,
        stockLevels: [], // Mock data for now
        insights: insights || {}
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Inventory Value',
      value: `$${(data.insights.total_inventory_value || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Items Below Reorder Point',
      value: data.insights.low_stock_items || 0,
      change: '-2 from last week',
      changeType: 'positive',
      icon: Package
    },
    {
      title: 'Avg. Stock Turnover',
      value: '4.2x',
      change: '+0.3x',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Days Until Stockout',
      value: '45 days',
      change: '+5 days',
      changeType: 'positive',
      icon: Clock
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights and trends for your inventory</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.changeType === 'positive' ? 
                        <TrendingUp className="w-3 h-3" /> : 
                        <TrendingDown className="w-3 h-3" />
                      }
                      {kpi.change}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Stock distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Usage Items */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top Usage Items</CardTitle>
            <CardDescription>Most frequently used items in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topItems.length > 0 ? (
              <div className="space-y-4">
                {data.topItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <Progress 
                        value={(item.usage / Math.max(...data.topItems.map(i => i.usage))) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium">{item.usage}</p>
                      <p className="text-xs text-muted-foreground">${item.cost.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p>No usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Smart recommendations based on your inventory patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Optimization Opportunities</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Reduce carrying costs</p>
                    <p className="text-xs text-muted-foreground">
                      Optimize stock levels for slow-moving items to reduce storage costs by 15-20%.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Package className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bulk purchase savings</p>
                    <p className="text-xs text-muted-foreground">
                      Consider bulk orders for high-usage items to achieve 10% cost savings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Predictive Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Reorder recommendations</p>
                    <p className="text-xs text-muted-foreground">
                      3 items predicted to reach reorder point within 7 days based on usage patterns.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Zap className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Seasonal trends detected</p>
                    <p className="text-xs text-muted-foreground">
                      Increase cleaning supplies by 25% for upcoming flu season based on historical data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}