import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { 
  Package, 
  Clock, 
  Eye, 
  MessageCircle, 
  Truck,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  Camera,
  Send,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface LabOrder {
  id: string;
  order_number: string;
  patient_id: string;
  dentist_id: string;
  lab_provider_id: string;
  order_type: string;
  case_details: any;
  instructions: string;
  due_date: string;
  priority: string;
  status: string;
  estimated_cost: number;
  actual_cost: number;
  tracking_number: string;
  created_at: string;
  patients?: { first_name: string; last_name: string } | null;
  lab_providers?: { name: string } | null;
  profiles?: { first_name: string; last_name: string } | null;
}

interface LabOrderTracking {
  id: string;
  lab_order_id: string;
  status: string;
  message: string;
  progress_percentage: number;
  updated_by: string;
  created_at: string;
}

export default function LabManagement() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labProviders, setLabProviders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [trackingData, setTrackingData] = useState<Record<string, LabOrderTracking[]>>({});
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);

  // Real-time subscription for tracking updates
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('lab-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_order_tracking'
        },
        (payload) => {
          console.log('Lab tracking update:', payload);
          fetchTrackingData();
          toast.success('Order status updated in real-time!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) {
      fetchData();
    }
  }, [currentTenant?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLabOrders(),
        fetchLabProviders(),
        fetchPatients(),
        fetchTrackingData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch lab data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabOrders = async () => {
    const { data, error } = await supabase
      .from('lab_orders')
      .select(`
        *,
        patients (first_name, last_name),
        lab_providers (name),
        profiles (first_name, last_name)
      `)
      .eq('tenant_id', currentTenant?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setLabOrders((data || []) as unknown as LabOrder[]);
  };

  const fetchLabProviders = async () => {
    const { data, error } = await supabase
      .from('lab_providers.lab_provider_accounts')
      .select('*')
      .eq('status', 'active')
      .eq('verification_status', 'verified');

    if (error) throw error;
    setLabProviders(data || []);
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('tenant_id', currentTenant?.id);

    if (error) throw error;
    setPatients(data || []);
  };

  const fetchTrackingData = async () => {
    const { data, error } = await supabase
      .from('lab_providers.lab_order_tracking')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Group tracking data by lab_order_id
    const grouped = (data || []).reduce((acc, tracking) => {
      if (!acc[tracking.lab_order_id]) {
        acc[tracking.lab_order_id] = [];
      }
      acc[tracking.lab_order_id].push(tracking);
      return acc;
    }, {} as Record<string, LabOrderTracking[]>);

    setTrackingData(grouped);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'submitted': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'normal': return 'text-foreground';
      case 'low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getLatestTracking = (orderId: string) => {
    const tracking = trackingData[orderId];
    return tracking ? tracking[tracking.length - 1] : null;
  };

  const filteredOrders = labOrders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patients?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patients?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lab Management
            </h1>
            <p className="text-muted-foreground">Manage lab orders with real-time tracking</p>
          </div>
          
          <Dialog open={newOrderDialogOpen} onOpenChange={setNewOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="h-4 w-4 mr-2" />
                New Lab Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lab Order</DialogTitle>
              </DialogHeader>
              <NewLabOrderForm 
                patients={patients}
                labProviders={labProviders}
                onSuccess={() => {
                  setNewOrderDialogOpen(false);
                  fetchData();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{labOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">
                    {labOrders.filter(o => o.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {labOrders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold">
                    {labOrders.filter(o => o.priority === 'urgent').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gradient-to-r from-card to-card/90 border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const latestTracking = getLatestTracking(order.id);
            
            return (
              <Card key={order.id} className="bg-gradient-to-br from-card to-card/80 border-border/50 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.patients?.first_name} {order.patients?.last_name}
                      </p>
                    </div>
                    <Badge 
                      variant={getStatusBadgeVariant(order.status)}
                      className="capitalize"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Type and Priority */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-muted px-2 py-1 rounded capitalize">
                      {order.order_type}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority} priority
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {latestTracking && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{latestTracking.progress_percentage}%</span>
                      </div>
                      <Progress value={latestTracking.progress_percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{latestTracking.message}</p>
                    </div>
                  )}

                  {/* Lab Provider */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {order.lab_providers?.name}
                  </div>

                  {/* Due Date */}
                  {order.due_date && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: {format(new Date(order.due_date), 'MMM dd, yyyy')}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    {order.tracking_number && (
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lab orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'No orders match your current filters.' 
                  : 'Start by creating your first lab order.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <Button onClick={() => setNewOrderDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lab Order
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        {selectedOrder && (
          <OrderDetailDialog
            order={selectedOrder}
            tracking={trackingData[selectedOrder.id] || []}
            onClose={() => setSelectedOrder(null)}
            onRefresh={fetchData}
          />
        )}
      </div>
    </div>
  );
}

// New Lab Order Form Component
function NewLabOrderForm({ patients, labProviders, onSuccess }: any) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patient_id: '',
    lab_provider_id: '',
    order_type: '',
    instructions: '',
    due_date: '',
    priority: 'normal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate order number
      const orderNumber = `LAB-${Date.now()}`;
      
      const { error } = await supabase
        .from('lab_orders')
        .insert({
          ...formData,
          tenant_id: currentTenant?.id,
          dentist_id: user?.id,
          lab_provider_account_id: formData.lab_provider_id,
          order_number: orderNumber,
          case_details: {}
        });

      if (error) throw error;
      
      toast.success('Lab order created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating lab order:', error);
      toast.error('Failed to create lab order');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Select 
            value={formData.patient_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient: any) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lab_provider">Lab Provider</Label>
          <Select 
            value={formData.lab_provider_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, lab_provider_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lab" />
            </SelectTrigger>
            <SelectContent>
              {labProviders.map((provider: any) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order_type">Order Type</Label>
          <Select 
            value={formData.order_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, order_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crown">Crown</SelectItem>
              <SelectItem value="bridge">Bridge</SelectItem>
              <SelectItem value="denture">Denture</SelectItem>
              <SelectItem value="implant">Implant</SelectItem>
              <SelectItem value="orthodontics">Orthodontics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          placeholder="Special instructions for the lab..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Create Lab Order
      </Button>
    </form>
  );
}

// Order Detail Dialog Component
function OrderDetailDialog({ order, tracking, onClose, onRefresh }: any) {
  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order {order.order_number}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient:</span>
                    <span>{order.patients?.first_name} {order.patients?.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{order.order_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge variant="outline" className="capitalize">{order.priority}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge>{order.status.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lab Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lab:</span>
                    <span>{order.lab_providers?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Cost:</span>
                    <span>${order.estimated_cost || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {order.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.instructions}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tracking.length > 0 ? (
                  <div className="space-y-4">
                    {tracking.map((track: LabOrderTracking, index: number) => (
                      <div key={track.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            index === tracking.length - 1 ? 'bg-primary' : 'bg-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium capitalize">{track.status.replace('_', ' ')}</p>
                              <p className="text-sm text-muted-foreground">{track.message}</p>
                              {track.progress_percentage > 0 && (
                                <div className="mt-2">
                                  <Progress value={track.progress_percentage} className="h-2" />
                                  <span className="text-xs text-muted-foreground">{track.progress_percentage}% complete</span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(track.created_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tracking updates yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Communication feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}