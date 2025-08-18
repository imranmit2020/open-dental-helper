import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Zap, Key, Activity, Webhook, Code, Settings } from 'lucide-react';
import { IntegrationDashboard } from '@/components/api/IntegrationDashboard';
import { ThirdPartyIntegrations } from '@/components/api/ThirdPartyIntegrations';
import { APIKeys } from '@/components/api/APIKeys';
import { WebhookManager } from '@/components/api/WebhookManager';
import { APIDocumentation } from '@/components/api/APIDocumentation';
import { APIUsageAnalytics } from '@/components/api/APIUsageAnalytics';
import { useTenant } from '@/contexts/TenantContext';

export default function APIIntegrations() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentTenant } = useTenant();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: Activity,
      component: <IntegrationDashboard searchTerm={searchTerm} statusFilter={statusFilter} />
    },
    {
      id: 'integrations',
      label: '3rd Party',
      icon: Globe,
      component: <ThirdPartyIntegrations searchTerm={searchTerm} statusFilter={statusFilter} />
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: Key,
      component: <APIKeys searchTerm={searchTerm} />
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: Webhook,
      component: <WebhookManager searchTerm={searchTerm} />
    },
    {
      id: 'documentation',
      label: 'API Docs',
      icon: Code,
      component: <APIDocumentation />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Zap,
      component: <APIUsageAnalytics />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
              API Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect with external services and expose your calendar API
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              New Integration
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Calendar Sync', icon: Globe, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
            { label: 'Webhook Setup', icon: Webhook, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
            { label: 'Generate API Key', icon: Key, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
            { label: 'View Docs', icon: Code, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search integrations, APIs, or webhooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto p-1 bg-card/50 backdrop-blur-sm border-primary/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}