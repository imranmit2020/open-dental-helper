import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

interface APIKeysProps {
  searchTerm: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'appointments:read', label: 'Read Appointments', description: 'View appointment data' },
  { id: 'appointments:write', label: 'Write Appointments', description: 'Create and update appointments' },
  { id: 'patients:read', label: 'Read Patients', description: 'View patient data' },
  { id: 'patients:write', label: 'Write Patients', description: 'Create and update patients' },
  { id: 'schedules:read', label: 'Read Schedules', description: 'View schedule data' },
  { id: 'schedules:write', label: 'Write Schedules', description: 'Create and update schedules' },
  { id: 'billing:read', label: 'Read Billing', description: 'View billing data' },
  { id: 'billing:write', label: 'Write Billing', description: 'Create and update billing' },
  { id: 'reports:read', label: 'Read Reports', description: 'View analytics and reports' },
];

export function APIKeys({ searchTerm }: APIKeysProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const { currentTenant } = useTenant();
  const form = useForm();

  useEffect(() => {
    if (currentTenant) {
      fetchAPIKeys();
    }
  }, [currentTenant, searchTerm]);

  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('api_keys')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,key_prefix.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const transformedData = data?.map(key => ({
        ...key,
        permissions: Array.isArray(key.permissions) ? key.permissions as string[] : [],
        usage_count: key.usage_count || 0
      })) || [];
      
      setApiKeys(transformedData);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Generate a new API key
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_api_key');

      if (keyError) throw keyError;

      // Hash the key for storage
      const encoder = new TextEncoder();
      const keyData_encoded = encoder.encode(keyData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData_encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const apiKeyData = {
        ...data,
        tenant_id: currentTenant?.id,
        key_prefix: keyData.substring(0, 8),
        key_hash: keyHash,
        permissions: data.permissions || [],
        rate_limit: parseInt(data.rate_limit || 1000),
        expires_at: data.expires_at || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { error } = await supabase
        .from('api_keys')
        .insert([apiKeyData]);

      if (error) throw error;

      setGeneratedKey(keyData);
      setShowKeyDialog(true);
      setDialogOpen(false);
      form.reset();
      fetchAPIKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const deactivateKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('API key deactivated');
      fetchAPIKeys();
    } catch (error) {
      console.error('Error deactivating API key:', error);
      toast.error('Failed to deactivate API key');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <p className="text-muted-foreground">Manage access keys for your calendar API</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Plus className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key with specific permissions and rate limits
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
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter key name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (requests/hour)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {AVAILABLE_PERMISSIONS.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={permission.id}
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, permission.id]);
                                } else {
                                  field.onChange(current.filter((p: string) => p !== permission.id));
                                }
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.label}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Generate Key
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Save this key now - you won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono break-all">{generatedKey}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedKey)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Store this key securely. It won't be shown again and provides access to your data.
              </p>
            </div>
            <Button onClick={() => setShowKeyDialog(false)} className="w-full">
              I've Saved the Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Keys Table */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage your API access keys and monitor usage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No API keys found</p>
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{apiKey.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rate limit: {apiKey.rate_limit}/hour
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">
                          {revealedKeys.has(apiKey.id) 
                            ? `${apiKey.key_prefix}••••••••••••••••••••••••••••••••`
                            : `${apiKey.key_prefix}••••••••••••••••••••••••••••••••`
                          }
                        </code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {revealedKeys.has(apiKey.id) ? 
                            <EyeOff className="w-3 h-3" /> : 
                            <Eye className="w-3 h-3" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {apiKey.permissions.slice(0, 2).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.split(':')[0]}
                          </Badge>
                        ))}
                        {apiKey.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{apiKey.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{apiKey.usage_count.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {apiKey.last_used_at 
                        ? format(new Date(apiKey.last_used_at), 'MMM dd, HH:mm')
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                          {apiKey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {apiKey.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {format(new Date(apiKey.expires_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(`${apiKey.key_prefix}••••••••••••••••••••••••••••••••`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deactivateKey(apiKey.id)}
                          disabled={!apiKey.is_active}
                        >
                          <Trash2 className="w-3 h-3" />
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