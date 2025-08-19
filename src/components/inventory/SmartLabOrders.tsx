import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Microscope, Plus, Clock, CheckCircle, AlertTriangle, Truck, 
  QrCode, Camera, Bot, Zap, Calendar, MapPin, Phone, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LabOrder {
  id: string;
  order_number: string;
  patient_name: string;
  case_type: string;
  lab_name: string;
  status: 'pending' | 'in_progress' | 'quality_check' | 'shipped' | 'delivered' | 'completed';
  priority: 'routine' | 'urgent' | 'rush';
  due_date: string;
  estimated_completion: string;
  progress_percentage: number;
  instructions: string;
  cost: number;
  tracking_number?: string;
  ai_quality_score?: number;
  materials_used?: string[];
  lab_contact?: string;
  created_at: string;
}

interface AIQualityPredictor {
  order_id: string;
  predicted_quality: number;
  risk_factors: string[];
  recommendations: string[];
  confidence: number;
}

export function SmartLabOrders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [qualityPredictions, setQualityPredictions] = useState<AIQualityPredictor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentTenant } = useTenant();
  const form = useForm();

  useEffect(() => {
    if (currentTenant) {
      fetchLabOrders();
      generateQualityPredictions();
    }
  }, [currentTenant, activeTab]);

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would fetch from Supabase
      const mockOrders: LabOrder[] = [
        {
          id: '1',
          order_number: 'LAB-2024-001',
          patient_name: 'John Smith',
          case_type: 'Crown - Anterior',
          lab_name: 'Precision Dental Lab',
          status: 'in_progress',
          priority: 'routine',
          due_date: '2024-02-15',
          estimated_completion: '2024-02-14',
          progress_percentage: 65,
          instructions: 'Match to adjacent teeth, high translucency required',
          cost: 450,
          tracking_number: 'PDL-TRK-789',
          ai_quality_score: 87,
          materials_used: ['Zirconia', 'Ceramic Stain'],
          lab_contact: '+1-555-0123',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '2',
          order_number: 'LAB-2024-002',
          patient_name: 'Sarah Johnson',
          case_type: 'Partial Denture',
          lab_name: 'Elite Prosthetics',
          status: 'quality_check',
          priority: 'urgent',
          due_date: '2024-02-10',
          estimated_completion: '2024-02-09',
          progress_percentage: 90,
          instructions: 'Patient has limited mouth opening, adjust accordingly',
          cost: 1200,
          tracking_number: 'ELT-QC-456',
          ai_quality_score: 92,
          materials_used: ['Acrylic Resin', 'Metal Framework'],
          lab_contact: '+1-555-0456',
          created_at: '2024-01-18T14:30:00Z'
        },
        {
          id: '3',
          order_number: 'LAB-2024-003',
          patient_name: 'Mike Wilson',
          case_type: 'Implant Crown',
          lab_name: 'Digital Dental Solutions',
          status: 'shipped',
          priority: 'rush',
          due_date: '2024-02-08',
          estimated_completion: '2024-02-07',
          progress_percentage: 100,
          instructions: 'Straumann implant platform, cement retained',
          cost: 680,
          tracking_number: 'DDS-SHP-123',
          ai_quality_score: 95,
          materials_used: ['Titanium Abutment', 'Lithium Disilicate'],
          lab_contact: '+1-555-0789',
          created_at: '2024-01-15T09:15:00Z'
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      toast.error('Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const generateQualityPredictions = async () => {
    try {
      // Mock AI quality predictions
      const predictions: AIQualityPredictor[] = [
        {
          order_id: '1',
          predicted_quality: 87,
          risk_factors: ['Complex color matching', 'Tight deadline'],
          recommendations: ['Extended lab consultation', 'Digital shade verification'],
          confidence: 89
        },
        {
          order_id: '2',
          predicted_quality: 92,
          risk_factors: ['Limited mouth opening constraint'],
          recommendations: ['Physical fit verification before delivery'],
          confidence: 94
        },
        {
          order_id: '3',
          predicted_quality: 95,
          risk_factors: [],
          recommendations: ['Standard delivery protocol'],
          confidence: 97
        }
      ];

      setQualityPredictions(predictions);
    } catch (error) {
      console.error('Error generating quality predictions:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const orderData = {
        ...data,
        tenant_id: currentTenant?.id,
        order_number: `LAB-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
        status: 'pending',
        progress_percentage: 0,
        cost: parseFloat(data.cost || 0),
        created_at: new Date().toISOString()
      };

      // In real implementation, save to Supabase
      console.log('New lab order:', orderData);

      toast.success('Lab order created successfully');
      setDialogOpen(false);
      form.reset();
      fetchLabOrders();
    } catch (error) {
      console.error('Error creating lab order:', error);
      toast.error('Failed to create lab order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'quality_check': return 'outline';
      case 'shipped': return 'secondary';
      case 'delivered': return 'default';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'routine': return 'outline';
      case 'urgent': return 'secondary';
      case 'rush': return 'destructive';
      default: return 'outline';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.case_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'active' 
      ? !['completed', 'delivered'].includes(order.status)
      : ['completed', 'delivered'].includes(order.status);
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Microscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Smart Lab Order Management</h2>
            <p className="text-muted-foreground">AI-powered lab workflow with quality predictions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Scan Lab Case
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
                <Plus className="w-4 h-4 mr-2" />
                New Lab Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lab Order</DialogTitle>
                <DialogDescription>
                  Submit a new case to your preferred dental laboratory
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_name"
                      rules={{ required: 'Patient name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter patient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="case_type"
                      rules={{ required: 'Case type is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select case type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="crown">Crown</SelectItem>
                              <SelectItem value="bridge">Bridge</SelectItem>
                              <SelectItem value="implant-crown">Implant Crown</SelectItem>
                              <SelectItem value="partial-denture">Partial Denture</SelectItem>
                              <SelectItem value="full-denture">Full Denture</SelectItem>
                              <SelectItem value="veneer">Veneer</SelectItem>
                              <SelectItem value="inlay-onlay">Inlay/Onlay</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lab_name"
                      rules={{ required: 'Lab selection is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Laboratory</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select laboratory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="precision-dental-lab">Precision Dental Lab</SelectItem>
                              <SelectItem value="elite-prosthetics">Elite Prosthetics</SelectItem>
                              <SelectItem value="digital-dental-solutions">Digital Dental Solutions</SelectItem>
                              <SelectItem value="premier-ceramics">Premier Ceramics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || 'routine'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="routine">Routine (7-10 days)</SelectItem>
                              <SelectItem value="urgent">Urgent (3-5 days)</SelectItem>
                              <SelectItem value="rush">Rush (24-48 hours)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="due_date"
                      rules={{ required: 'Due date is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter detailed instructions for the laboratory..." 
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Order
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search orders, patients, or case types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Photo Upload
              </Button>
              <Button variant="outline" size="sm">
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Orders', value: orders.filter(o => !['completed', 'delivered'].includes(o.status)).length, icon: Clock, color: 'text-blue-600' },
              { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, icon: Zap, color: 'text-amber-600' },
              { label: 'Quality Check', value: orders.filter(o => o.status === 'quality_check').length, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Shipped Today', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-purple-600' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Orders Table */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Lab & Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>AI Quality Score</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Microscope className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No lab orders found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const prediction = qualityPredictions.find(p => p.order_id === order.id);
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">{order.patient_name}</p>
                              <p className="text-xs text-muted-foreground">{order.case_type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">{order.lab_name}</p>
                              <Badge variant={getPriorityColor(order.priority) as any}>
                                {order.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant={getStatusColor(order.status) as any}>
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-sm">{order.progress_percentage}%</span>
                              </div>
                              <Progress value={order.progress_percentage} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.ai_quality_score ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Bot className="w-4 h-4 text-accent" />
                                  <span className={`font-semibold ${getQualityColor(order.ai_quality_score)}`}>
                                    {order.ai_quality_score}%
                                  </span>
                                </div>
                                {prediction && (
                                  <div className="text-xs text-muted-foreground">
                                    {prediction.confidence}% confidence
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {format(new Date(order.due_date), 'MMM dd')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Est: {format(new Date(order.estimated_completion), 'MMM dd')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${order.cost}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <FileText className="w-3 h-3" />
                              </Button>
                              {order.lab_contact && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:${order.lab_contact}`}>
                                    <Phone className="w-3 h-3" />
                                  </a>
                                </Button>
                              )}
                              {order.tracking_number && (
                                <Button size="sm" variant="outline">
                                  <MapPin className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}