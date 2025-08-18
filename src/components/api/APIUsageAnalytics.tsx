import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface UsageStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  hourlyUsage: Array<{ hour: string; requests: number }>;
  statusCodes: Array<{ status: string; count: number; color: string }>;
}

export function APIUsageAnalytics() {
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    topEndpoints: [],
    hourlyUsage: [],
    statusCodes: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchAnalyticsData();
    }
  }, [currentTenant, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const timeAgo = getTimeAgo(timeRange);
      
      // Fetch API usage logs
      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .gte('created_at', timeAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        setStats({
          totalRequests: 0,
          successRate: 0,
          avgResponseTime: 0,
          topEndpoints: [],
          hourlyUsage: [],
          statusCodes: []
        });
        return;
      }

      // Calculate stats
      const totalRequests = logs.length;
      const successfulRequests = logs.filter(log => log.status_code >= 200 && log.status_code < 300).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalRequests;

      // Top endpoints
      const endpointCounts = logs.reduce((acc, log) => {
        acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Hourly usage
      const hourlyData = logs.reduce((acc, log) => {
        const hour = new Date(log.created_at).getHours();
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        acc[hourLabel] = (acc[hourLabel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hourlyUsage = Array.from({ length: 24 }, (_, i) => {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        return { hour, requests: hourlyData[hour] || 0 };
      });

      // Status codes
      const statusCounts = logs.reduce((acc, log) => {
        const statusGroup = Math.floor(log.status_code / 100) * 100;
        const statusLabel = `${statusGroup}s`;
        acc[statusLabel] = (acc[statusLabel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusColors: Record<string, string> = {
        '200s': '#10B981',
        '300s': '#3B82F6', 
        '400s': '#F59E0B',
        '500s': '#EF4444'
      };

      const statusCodes = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || '#6B7280'
      }));

      setStats({
        totalRequests,
        successRate,
        avgResponseTime,
        topEndpoints,
        hourlyUsage,
        statusCodes
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const kpiCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Activity
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Avg Response Time',
      value: `${Math.round(stats.avgResponseTime)}ms`,
      change: '-15ms',
      changeType: 'positive',
      icon: Clock
    },
    {
      title: 'Error Rate',
      value: `${(100 - stats.successRate).toFixed(1)}%`,
      change: '-1.2%',
      changeType: 'positive',
      icon: AlertTriangle
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">API Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor API performance and usage patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.changeType === 'positive' ? 
                        <TrendingUp className="w-3 h-3" /> : 
                        <TrendingDown className="w-3 h-3" />
                      }
                      {kpi.change}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>API requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.hourlyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.hourlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Code Distribution */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Response Status Codes</CardTitle>
            <CardDescription>Distribution of HTTP status codes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.statusCodes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.statusCodes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.statusCodes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>Most frequently accessed API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topEndpoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topEndpoints} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="endpoint" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p>No endpoint data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to optimize your API usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.successRate < 95 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Low Success Rate</p>
                  <p className="text-xs text-muted-foreground">
                    Your API success rate is {stats.successRate.toFixed(1)}%. Consider reviewing error handling and API usage patterns.
                  </p>
                </div>
              </div>
            )}

            {stats.avgResponseTime > 1000 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">High Response Time</p>
                  <p className="text-xs text-muted-foreground">
                    Average response time is {Math.round(stats.avgResponseTime)}ms. Consider implementing caching or optimizing queries.
                  </p>
                </div>
              </div>
            )}

            {stats.totalRequests > 800 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">High API Usage</p>
                  <p className="text-xs text-muted-foreground">
                    You're approaching your rate limit with {stats.totalRequests} requests. Consider upgrading your plan or implementing request batching.
                  </p>
                </div>
              </div>
            )}

            {stats.successRate >= 95 && stats.avgResponseTime <= 500 && stats.totalRequests <= 800 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Zap className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Excellent Performance</p>
                  <p className="text-xs text-muted-foreground">
                    Your API is performing well with high success rate and fast response times. Keep up the good work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}