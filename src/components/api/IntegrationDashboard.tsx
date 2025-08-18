import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Globe, Key, Webhook, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface DashboardStats {
  activeIntegrations: number;
  inactiveIntegrations: number;
  errorIntegrations: number;
  totalApiCalls30d: number;
  apiKeys: number;
  webhooks: number;
}

interface IntegrationDashboardProps {
  searchTerm: string;
  statusFilter: string;
}

export function IntegrationDashboard({ searchTerm, statusFilter }: IntegrationDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    activeIntegrations: 0,
    inactiveIntegrations: 0,
    errorIntegrations: 0,
    totalApiCalls30d: 0,
    apiKeys: 0,
    webhooks: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchDashboardData();
    }
  }, [currentTenant]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch integration status summary
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_integration_status_summary', {
          _tenant_id: currentTenant?.id
        });

      if (summaryError) throw summaryError;

      // Fetch API keys count
      const { data: apiKeys, error: apiKeysError } = await supabase
        .from('api_keys')
        .select('id')
        .eq('tenant_id', currentTenant?.id)
        .eq('is_active', true);

      if (apiKeysError) throw apiKeysError;

      // Fetch webhooks count
      const { data: integrations, error: integrationsError } = await supabase
        .from('api_integrations')
        .select('id')
        .eq('tenant_id', currentTenant?.id)
        .not('webhook_url', 'is', null);

      if (integrationsError) throw integrationsError;

      // Fetch recent activities (API usage logs)
      const { data: activities, error: activitiesError } = await supabase
        .from('api_usage_logs')
        .select(`
          *,
          api_keys(name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      setStats({
        activeIntegrations: (summary as any)?.active_integrations || 0,
        inactiveIntegrations: (summary as any)?.inactive_integrations || 0,
        errorIntegrations: (summary as any)?.error_integrations || 0,
        totalApiCalls30d: (summary as any)?.total_api_calls_30d || 0,
        apiKeys: apiKeys?.length || 0,
        webhooks: integrations?.length || 0
      });

      setRecentActivities(activities || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Integrations',
      value: stats.activeIntegrations,
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      description: 'Connected services'
    },
    {
      title: 'API Keys',
      value: stats.apiKeys,
      icon: Key,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      description: 'Active access keys'
    },
    {
      title: 'API Calls (30d)',
      value: stats.totalApiCalls30d.toLocaleString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      description: 'Total requests'
    },
    {
      title: 'Webhooks',
      value: stats.webhooks,
      icon: Webhook,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      description: 'Active endpoints'
    }
  ];

  const healthStatus = [
    {
      name: 'Active Integrations',
      count: stats.activeIntegrations,
      total: stats.activeIntegrations + stats.inactiveIntegrations + stats.errorIntegrations,
      color: 'bg-green-500'
    },
    {
      name: 'Inactive',
      count: stats.inactiveIntegrations,
      total: stats.activeIntegrations + stats.inactiveIntegrations + stats.errorIntegrations,
      color: 'bg-gray-400'
    },
    {
      name: 'Errors',
      count: stats.errorIntegrations,
      total: stats.activeIntegrations + stats.inactiveIntegrations + stats.errorIntegrations,
      color: 'bg-red-500'
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

      {/* Health Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Health */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Integration Health
            </CardTitle>
            <CardDescription>
              Status overview of all integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthStatus.map((status, index) => {
              const percentage = status.total > 0 ? (status.count / status.total) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{status.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {status.count} of {status.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common integration tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Webhook className="w-4 h-4 mr-2" />
              Setup Webhook
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              View API Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent API Activity */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent API Activity
          </CardTitle>
          <CardDescription>
            Latest API calls and integration events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status_code >= 200 && activity.status_code < 300 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {activity.method} {activity.endpoint}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        API Key: {activity.api_keys?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.status_code >= 200 && activity.status_code < 300 
                        ? 'default' 
                        : 'destructive'
                    }>
                      {activity.status_code}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No recent API activity</p>
              <p className="text-xs">API calls will appear here once you start using integrations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}