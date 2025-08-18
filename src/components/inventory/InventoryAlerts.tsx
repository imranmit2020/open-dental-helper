import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Package, TrendingUp, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface InventoryAlert {
  id: string;
  alert_type: string;
  priority: string;
  message: string;
  current_stock?: number;
  suggested_action?: string;
  ai_generated: boolean;
  is_read: boolean;
  created_at: string;
  inventory_items: {
    name: string;
    sku: string;
    current_stock: number;
    reorder_point: number;
  };
}

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('unread');
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchAlerts();
    }
  }, [currentTenant, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('inventory_alerts')
        .select(`
          *,
          inventory_items(name, sku, current_stock, reorder_point)
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'high_priority') {
        query = query.in('priority', ['high', 'critical']);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Failed to update alert');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ 
          is_read: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      toast.success('Alert dismissed');
      fetchAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'low_stock': return <Package className="w-4 h-4" />;
      case 'expiring_soon': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'overstock': return <TrendingUp className="w-4 h-4" />;
      case 'reorder_suggestion': return <Package className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'low_stock': return 'border-amber-200 bg-amber-50 dark:bg-amber-950/20';
      case 'expiring_soon': return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20';
      case 'expired': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'overstock': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      case 'reorder_suggestion': return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Alerts</h2>
          <p className="text-muted-foreground">Stay on top of your inventory with AI-powered alerts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'unread', label: 'Unread', count: alerts.filter(a => !a.is_read).length },
          { id: 'high_priority', label: 'High Priority', count: alerts.filter(a => ['high', 'critical'].includes(a.priority)).length },
          { id: 'all', label: 'All Alerts', count: alerts.length }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'outline'}
            onClick={() => setFilter(tab.id as any)}
            className="relative"
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : alerts.length === 0 ? (
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "All caught up! No unread alerts."
                  : "Everything looks good. No alerts at this time."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-primary/10 backdrop-blur-sm transition-all duration-300 ${
                !alert.is_read ? 'ring-1 ring-primary/20' : ''
              } ${getAlertTypeColor(alert.alert_type)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityColor(alert.priority) as any}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </Badge>
                        {alert.ai_generated && (
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">
                        {alert.inventory_items.name} (SKU: {alert.inventory_items.sku})
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      {alert.suggested_action && (
                        <div className="text-sm bg-white/50 dark:bg-gray-800/50 p-2 rounded border border-dashed">
                          <strong>Suggested Action:</strong> {alert.suggested_action}
                        </div>
                      )}
                      {alert.current_stock !== undefined && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Current Stock: {alert.current_stock} | Reorder Point: {alert.inventory_items.reorder_point}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}