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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Webhook, Send, Clock, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WebhookEvent {
  id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  max_attempts: number;
  response_status_code?: number;
  created_at: string;
  integration: {
    name: string;
    webhook_url: string;
  };
}

interface WebhookManagerProps {
  searchTerm: string;
}

const EVENT_TYPES = [
  { value: 'appointment.created', label: 'Appointment Created' },
  { value: 'appointment.updated', label: 'Appointment Updated' },
  { value: 'appointment.cancelled', label: 'Appointment Cancelled' },
  { value: 'patient.created', label: 'Patient Created' },
  { value: 'patient.updated', label: 'Patient Updated' },
  { value: 'invoice.created', label: 'Invoice Created' },
  { value: 'invoice.paid', label: 'Invoice Paid' },
];

export function WebhookManager({ searchTerm }: WebhookManagerProps) {
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [zapierUrl, setZapierUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const { currentTenant } = useTenant();
  const form = useForm();

  useEffect(() => {
    if (currentTenant) {
      fetchWebhookEvents();
    }
  }, [currentTenant, searchTerm]);

  const fetchWebhookEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_events')
        .select(`
          *,
          api_integrations!inner(name, webhook_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(event => ({
        ...event,
        integration: {
          name: event.api_integrations.name,
          webhook_url: event.api_integrations.webhook_url
        }
      })) || [];
      
      setWebhookEvents(transformedData);
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      toast.error('Failed to load webhook events');
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (url: string) => {
    try {
      setTestingWebhook(true);
      
      const testPayload = {
        event_type: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from your dental practice management system',
          test: true
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload),
      });

      toast.success('Test webhook sent successfully');
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to send test webhook');
    } finally {
      setTestingWebhook(false);
    }
  };

  const triggerZapierWebhook = async () => {
    if (!zapierUrl) {
      toast.error('Please enter a Zapier webhook URL');
      return;
    }

    await testWebhook(zapierUrl);
  };

  const retryWebhook = async (eventId: string) => {
    try {
      // This would typically call an edge function to retry the webhook
      const { error } = await supabase
        .from('webhook_events')
        .update({ 
          status: 'pending',
          attempts: 0,
          next_attempt_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Webhook retry scheduled');
      fetchWebhookEvents();
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast.error('Failed to retry webhook');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Webhook Manager</h2>
          <p className="text-muted-foreground">Configure and monitor webhook endpoints</p>
        </div>
      </div>

      {/* Webhook Configuration */}
      <Tabs defaultValue="zapier" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zapier">Zapier Integration</TabsTrigger>
          <TabsTrigger value="custom">Custom Webhooks</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
        </TabsList>

        {/* Zapier Integration */}
        <TabsContent value="zapier" className="space-y-6">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" />
                Zapier Integration
              </CardTitle>
              <CardDescription>
                Connect with Zapier to automate workflows when events occur in your practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zapier Webhook URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierUrl}
                    onChange={(e) => setZapierUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={triggerZapierWebhook}
                    disabled={testingWebhook || !zapierUrl}
                  >
                    {testingWebhook ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create a webhook trigger in Zapier and paste the URL here to receive events
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to set up Zapier:</h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Create a new Zap in Zapier</li>
                  <li>Choose "Webhooks by Zapier" as the trigger</li>
                  <li>Select "Catch Hook" and copy the webhook URL</li>
                  <li>Paste the URL above and click "Test"</li>
                  <li>Complete your Zap with the desired actions</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Available Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {EVENT_TYPES.map((eventType) => (
                    <div key={eventType.value} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">{eventType.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Webhooks */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Custom Webhook Endpoints</CardTitle>
              <CardDescription>
                Configure custom webhook URLs for your integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Webhook className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Custom webhooks can be configured per integration</p>
                <p className="text-xs">Go to the Integrations tab to set up webhook URLs for specific services</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event History */}
        <TabsContent value="events" className="space-y-6">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Webhook Event History</CardTitle>
              <CardDescription>
                Monitor webhook delivery status and retry failed events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : webhookEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Webhook className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No webhook events found</p>
                        <p className="text-xs text-muted-foreground">Events will appear here when webhooks are triggered</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    webhookEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.event_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.integration?.name || 'Unknown Integration'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <Badge variant={getStatusColor(event.status) as any}>
                              {event.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {event.attempts} / {event.max_attempts}
                          </span>
                        </TableCell>
                        <TableCell>
                          {event.response_status_code && (
                            <Badge variant={
                              event.response_status_code >= 200 && event.response_status_code < 300 
                                ? 'default' 
                                : 'destructive'
                            }>
                              {event.response_status_code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(event.created_at), 'MMM dd, HH:mm')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.status === 'failed' && event.attempts < event.max_attempts && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => retryWebhook(event.id)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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