import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  Filter,
  Calendar,
  PlayCircle,
  PauseCircle,
  Eye,
  Settings,
  Bell,
  Activity,
  BarChart3,
  Microscope,
  Award,
  FlaskConical
} from 'lucide-react';
import { format } from 'date-fns';

interface LabOrder {
  id: string;
  order_number: string;
  patient_id: string;
  dentist_id: string;
  order_type: string;
  case_details: any;
  instructions: string;
  due_date: string;
  priority: string;
  status: string;
  estimated_cost: number;
  created_at: string;
  lab_partnerships?: {
    dental_office_tenant_id: string;
    tenants?: { name: string } | null;
  } | null;
}

interface WorkflowStage {
  id: string;
  lab_order_id: string;
  stage: string;
  status: string;
  assigned_technician_id: string;
  progress_percentage: number;
  estimated_duration_hours: number;
  actual_start_time: string;
  notes: string;
  created_at: string;
  profiles?: { first_name: string; last_name: string } | null;
}

interface LabProviderAccount {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  specialties: string[];
  status: string;
}

export default function LabProviderDashboard() {
  const { user } = useAuth();
  const [labAccount, setLabAccount] = useState<LabProviderAccount | null>(null);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Real-time subscriptions
  useEffect(() => {
    if (!labAccount?.id) return;

    const channel = supabase
      .channel('lab-provider-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_orders'
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchOrders();
          if (payload.eventType === 'INSERT') {
            toast.success('New order received!', {
              description: `Order #${payload.new.order_number} has been submitted`
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_order_workflow'
        },
        () => {
          fetchWorkflows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [labAccount?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLabAccount();
    }
  }, [user?.id]);

  useEffect(() => {
    if (labAccount?.id) {
      fetchOrders();
      fetchWorkflows();
    }
  }, [labAccount?.id]);

  const fetchLabAccount = async () => {
    try {
      const { data, error } = await (supabase as any)
        .schema('lab_providers')
        .from('lab_provider_users')
        .select(`
          lab_provider_account_id,
          role,
          lab_provider_accounts (*)
        `)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data?.lab_provider_accounts) {
        setLabAccount(data.lab_provider_accounts as LabProviderAccount);
      }
    } catch (error) {
      console.error('Error fetching lab account:', error);
      toast.error('Failed to load lab account');
    }
  };

  const fetchOrders = async () => {
    if (!labAccount?.id) return;

    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select(`
          *,
          lab_partnerships (
            dental_office_tenant_id,
            tenants (name)
          )
        `)
        .eq('lab_provider_account_id', labAccount.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as unknown as LabOrder[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchWorkflows = async () => {
    if (!labAccount?.id) return;

    try {
      const { data, error } = await (supabase as any)
        .schema('lab_providers')
        .from('lab_order_workflow')
        .select(`
          *,
          profiles (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows((data || []) as unknown as WorkflowStage[]);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('lab_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Add workflow tracking
      await (supabase as any)
        .schema('lab_providers')
        .from('lab_order_tracking')
        .insert({
          lab_order_id: orderId,
          status: newStatus,
          message: `Order status updated to ${newStatus}`,
          progress_percentage: getProgressPercentage(newStatus),
          updated_by: user?.email || 'Lab Provider'
        });

      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'submitted': return 10;
      case 'in_progress': return 50;
      case 'completed': return 90;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'normal': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const statsData = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    urgentOrders: orders.filter(o => o.priority === 'urgent').length,
    revenue: orders.reduce((sum, order) => sum + (order.estimated_cost || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!labAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lab Provider Access Required</h3>
            <p className="text-muted-foreground">
              You don't have access to any lab provider accounts. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-full">
              <FlaskConical className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {labAccount.company_name}
              </h1>
              <p className="text-muted-foreground">Lab Provider Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900">{statsData.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{statsData.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-purple-900">{statsData.inProgressOrders}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{statsData.completedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Urgent</p>
                  <p className="text-2xl font-bold text-red-900">{statsData.urgentOrders}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Revenue</p>
                  <p className="text-xl font-bold text-emerald-900">${statsData.revenue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="quality">Quality Control</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'submitted', 'in_progress', 'completed', 'delivered'].map((status) => (
                <Button
                  key={status}
                  variant={activeFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(status)}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-gradient-to-br from-card to-card/80 border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {order.lab_partnerships?.tenants?.name || 'Dental Office'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(order.priority)}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize font-medium">{order.order_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">
                          {order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">${order.estimated_cost || 0}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getProgressPercentage(order.status)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(order.status)} className="h-2" />
                    </div>

                    {/* Instructions */}
                    {order.instructions && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Instructions:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {order.instructions}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {order.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    {activeFilter !== 'all' 
                      ? `No orders with status "${activeFilter.replace('_', ' ')}"` 
                      : 'No orders received yet. Orders will appear here when dental offices submit them.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Production Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Workflow management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Microscope className="h-5 w-5 mr-2" />
                  Quality Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Microscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Quality control features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}