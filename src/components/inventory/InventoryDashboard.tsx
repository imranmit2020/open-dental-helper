import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalValue: number;
  topUsageItems: Array<{ item_name: string; usage_quantity: number }>;
}

interface InventoryDashboardProps {
  searchTerm: string;
  categoryFilter: string;
}

export function InventoryDashboard({ searchTerm, categoryFilter }: InventoryDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    expiringItems: 0,
    totalValue: 0,
    topUsageItems: []
  });
  const [loading, setLoading] = useState(true);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchDashboardData();
    }
  }, [currentTenant]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch basic inventory stats
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .eq('is_active', true);

      if (itemsError) throw itemsError;

      // Calculate stats
      const totalItems = items?.length || 0;
      const lowStockItems = items?.filter(item => item.current_stock <= item.reorder_point).length || 0;
      const totalValue = items?.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0) || 0;

      // Get AI insights
      const { data: insights, error: insightsError } = await supabase
        .rpc('generate_inventory_insights', {
          _tenant_id: currentTenant?.id
        });

      if (insightsError) {
        console.error('Error fetching insights:', insightsError);
      }

      setStats({
        totalItems,
        lowStockItems,
        expiringItems: (insights as any)?.expiring_items || 0,
        totalValue,
        topUsageItems: (insights as any)?.top_usage_items || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active inventory items'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Items below reorder point'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringItems,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Items expiring in 30 days'
    },
    {
      title: 'Total Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Current inventory value'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights & Top Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Smart recommendations for your inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium">Low Stock Alert</span>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {stats.lowStockItems} items
                  </Badge>
                </div>
              )}
              
              {stats.expiringItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Expiring Soon</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {stats.expiringItems} items
                  </Badge>
                </div>
              )}

              {stats.lowStockItems === 0 && stats.expiringItems === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">All systems optimal!</p>
                  <p className="text-xs">No immediate action required</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Usage Items */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Usage (30 days)
            </CardTitle>
            <CardDescription>
              Most frequently used items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topUsageItems.length > 0 ? (
              <div className="space-y-3">
                {stats.topUsageItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.item_name}</p>
                      <Progress 
                        value={(item.usage_quantity / Math.max(...stats.topUsageItems.map(i => i.usage_quantity))) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    <Badge variant="outline" className="ml-3">
                      {item.usage_quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No usage data yet</p>
                <p className="text-xs">Start recording transactions to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}