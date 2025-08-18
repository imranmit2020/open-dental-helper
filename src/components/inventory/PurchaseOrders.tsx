import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Eye, FileText, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PurchaseOrder {
  id: string;
  order_number: string;
  status: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  currency: string;
  suppliers: { name: string };
  purchase_order_items: Array<{
    quantity_ordered: number;
    quantity_received: number;
    inventory_items: { name: string };
  }>;
}

interface PurchaseOrdersProps {
  searchTerm: string;
}

export function PurchaseOrders({ searchTerm }: PurchaseOrdersProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchOrders();
    }
  }, [currentTenant, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(name),
          purchase_order_items(
            quantity_ordered,
            quantity_received,
            inventory_items(name)
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'ordered': return 'secondary';
      case 'received': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <Truck className="w-3 h-3" />;
      case 'ordered': return <ShoppingCart className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage purchase orders and deliveries</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Draft Orders', value: orders.filter(o => o.status === 'draft').length, color: 'text-gray-600' },
          { label: 'Pending Approval', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-600' },
          { label: 'In Transit', value: orders.filter(o => o.status === 'ordered').length, color: 'text-blue-600' },
          { label: 'Received', value: orders.filter(o => o.status === 'received').length, color: 'text-green-600' },
        ].map((stat, index) => (
          <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm ${stat.color}`}>{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No purchase orders found</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-medium">{order.order_number}</span>
                    </TableCell>
                    <TableCell>{order.suppliers?.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.order_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.expected_delivery_date 
                        ? format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')
                        : 'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{order.purchase_order_items?.length || 0} items</p>
                        <p className="text-muted-foreground">
                          {order.purchase_order_items?.reduce((sum, item) => sum + item.quantity_received, 0)} received
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {order.currency} {order.total_amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}