import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, Play, Pause, AlertTriangle, CheckCircle, Globe, Calendar, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Integration {
  id: string;
  name: string;
  provider: string;
  integration_type: string;
  status: string;
  config: any;
  webhook_url?: string;
  sync_frequency: string;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
}

interface ThirdPartyIntegrationsProps {
  searchTerm: string;
  statusFilter: string;
}

const INTEGRATION_PROVIDERS = [
  { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, type: 'calendar' },
  { id: 'outlook', name: 'Microsoft Outlook', icon: Calendar, type: 'calendar' },
  { id: 'calendly', name: 'Calendly', icon: Calendar, type: 'calendar' },
  { id: 'zoom', name: 'Zoom', icon: Users, type: 'video' },
  { id: 'slack', name: 'Slack', icon: Users, type: 'communication' },
  { id: 'salesforce', name: 'Salesforce', icon: Users, type: 'crm' },
  { id: 'quickbooks', name: 'QuickBooks', icon: Package, type: 'accounting' },
  { id: 'zapier', name: 'Zapier', icon: Globe, type: 'automation' },
];

export function ThirdPartyIntegrations({ searchTerm, statusFilter }: ThirdPartyIntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentTenant } = useTenant();
  const form = useForm();

  useEffect(() => {
    if (currentTenant) {
      fetchIntegrations();
    }
  }, [currentTenant, searchTerm, statusFilter]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('api_integrations')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const integrationData = {
        ...data,
        tenant_id: currentTenant?.id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        config: {}
      };

      const { error } = await supabase
        .from('api_integrations')
        .insert([integrationData]);

      if (error) throw error;

      toast.success('Integration created successfully');
      setDialogOpen(false);
      form.reset();
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    }
  };

  const toggleIntegration = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('api_integrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to update integration status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Third-Party Integrations</h2>
          <p className="text-muted-foreground">Connect with external services and platforms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect a third-party service to your practice
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter integration name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="provider"
                  rules={{ required: 'Provider is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INTEGRATION_PROVIDERS.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="integration_type"
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="crm">CRM</SelectItem>
                          <SelectItem value="accounting">Accounting</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="automation">Automation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/webhook" {...field} />
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
                    Create Integration
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATION_PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const existingIntegration = integrations.find(i => i.provider === provider.id);
          
          return (
            <Card key={provider.id} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{provider.type}</p>
                    </div>
                  </div>
                  {existingIntegration && (
                    <Badge variant={getStatusColor(existingIntegration.status) as any}>
                      {existingIntegration.status}
                    </Badge>
                  )}
                </div>

                {existingIntegration ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(existingIntegration.status)}
                      <span className="capitalize">{existingIntegration.status}</span>
                    </div>
                    
                    {existingIntegration.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {format(new Date(existingIntegration.last_sync_at), 'MMM dd, HH:mm')}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleIntegration(existingIntegration.id, existingIntegration.status)}
                      >
                        {existingIntegration.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your {provider.name} account to sync data automatically.
                    </p>
                    <Button size="sm" className="w-full">
                      <Plus className="w-3 h-3 mr-2" />
                      Connect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integrations Table */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Integrations</CardTitle>
          <CardDescription>Manage your connected services</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integration</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : integrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No integrations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <span className="font-medium">{integration.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {integration.provider.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{integration.integration_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(integration.status) as any}>
                        {integration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {integration.last_sync_at 
                        ? format(new Date(integration.last_sync_at), 'MMM dd, HH:mm')
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleIntegration(integration.id, integration.status)}
                        >
                          {integration.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
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