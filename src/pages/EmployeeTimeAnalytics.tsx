import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, TrendingUp, Users, BarChart3, PieChart, Activity, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";

// SEO Configuration
const setSEO = () => {
  document.title = "Employee Time Analytics - Advanced Workforce Analytics Dashboard";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", "Comprehensive employee time tracking analytics with insights on productivity, attendance patterns, and workforce management for dental practices.");
  }
};

interface TimeAnalytics {
  totalEmployees: number;
  activeToday: number;
  averageHoursPerDay: number;
  totalHoursThisWeek: number;
  punctualityScore: number;
  overtimeHours: number;
}

interface EmployeeMetrics {
  employee_id: string;
  first_name: string;
  last_name: string;
  role: string;
  total_hours: number;
  days_worked: number;
  avg_daily_hours: number;
  punctuality_score: number;
  overtime_hours: number;
  status: string;
}

interface DailyTrends {
  date: string;
  total_hours: number;
  employees_count: number;
  avg_hours_per_employee: number;
}

interface RoleBreakdown {
  role: string;
  employee_count: number;
  total_hours: number;
  avg_hours: number;
  color: string;
}

export default function EmployeeTimeAnalytics() {
  const { t } = useTranslation();
  const { currentTenant } = useTenant();
  const [analytics, setAnalytics] = useState<TimeAnalytics>({
    totalEmployees: 0,
    activeToday: 0,
    averageHoursPerDay: 0,
    totalHoursThisWeek: 0,
    punctualityScore: 0,
    overtimeHours: 0
  });
  const [employeeMetrics, setEmployeeMetrics] = useState<EmployeeMetrics[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrends[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<RoleBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week"); // week, month, quarter

  useEffect(() => {
    setSEO();
    if (currentTenant) {
      fetchAnalytics();
    }
  }, [currentTenant, dateRange]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter":
        return { start: startOfMonth(subDays(now, 90)), end: endOfMonth(now) };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const fetchAnalytics = async () => {
    if (!currentTenant) return;

    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Fetch time tracking data
      const { data: timeRecords, error: timeError } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString());

      if (timeError) throw timeError;

      // Fetch work sessions
      const { data: workSessions, error: sessionsError } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (sessionsError) throw sessionsError;

      // Calculate analytics
      const totalEmployees = employees?.length || 0;
      const today = format(new Date(), 'yyyy-MM-dd');
      const activeToday = timeRecords?.filter(record => 
        format(new Date(record.timestamp), 'yyyy-MM-dd') === today && 
        record.action_type === 'clock_in'
      ).length || 0;

      const totalHours = workSessions?.reduce((sum, session) => sum + (session.total_hours || 0), 0) || 0;
      const averageHoursPerDay = totalEmployees > 0 ? totalHours / totalEmployees / 7 : 0;

      const punctualityScore = calculatePunctualityScore(timeRecords || []);
      const overtimeHours = workSessions?.reduce((sum, session) => sum + (session.overtime_hours || 0), 0) || 0;

      setAnalytics({
        totalEmployees,
        activeToday,
        averageHoursPerDay,
        totalHoursThisWeek: totalHours,
        punctualityScore,
        overtimeHours
      });

      // Calculate employee metrics
      const employeeMetricsData = calculateEmployeeMetrics(employees || [], workSessions || [], timeRecords || []);
      setEmployeeMetrics(employeeMetricsData);

      // Calculate daily trends
      const dailyTrendsData = calculateDailyTrends(workSessions || [], start, end);
      setDailyTrends(dailyTrendsData);

      // Calculate role breakdown
      const roleBreakdownData = calculateRoleBreakdown(employees || [], workSessions || []);
      setRoleBreakdown(roleBreakdownData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePunctualityScore = (timeRecords: any[]) => {
    const clockInRecords = timeRecords.filter(record => record.action_type === 'clock_in');
    if (clockInRecords.length === 0) return 100;

    const onTimeRecords = clockInRecords.filter(record => {
      const clockInTime = new Date(record.timestamp);
      const expectedTime = new Date(clockInTime);
      expectedTime.setHours(9, 0, 0, 0); // Assume 9 AM start time
      return clockInTime <= expectedTime;
    });

    return Math.round((onTimeRecords.length / clockInRecords.length) * 100);
  };

  const calculateEmployeeMetrics = (employees: any[], workSessions: any[], timeRecords: any[]): EmployeeMetrics[] => {
    return employees.map(employee => {
      const employeeSessions = workSessions.filter(session => session.employee_id === employee.id);
      const employeeRecords = timeRecords.filter(record => record.employee_id === employee.id);
      
      const totalHours = employeeSessions.reduce((sum, session) => sum + (session.total_hours || 0), 0);
      const daysWorked = new Set(employeeSessions.map(session => session.date)).size;
      const avgDailyHours = daysWorked > 0 ? totalHours / daysWorked : 0;
      const overtimeHours = employeeSessions.reduce((sum, session) => sum + (session.overtime_hours || 0), 0);
      
      const clockInRecords = employeeRecords.filter(record => record.action_type === 'clock_in');
      const punctualityScore = clockInRecords.length > 0 ? calculatePunctualityScore(employeeRecords) : 100;

      return {
        employee_id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        total_hours: totalHours,
        days_worked: daysWorked,
        avg_daily_hours: avgDailyHours,
        punctuality_score: punctualityScore,
        overtime_hours: overtimeHours,
        status: employee.status
      };
    });
  };

  const calculateDailyTrends = (workSessions: any[], start: Date, end: Date): DailyTrends[] => {
    const trends: DailyTrends[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const daySessions = workSessions.filter(session => session.date === dateStr);
      
      const totalHours = daySessions.reduce((sum, session) => sum + (session.total_hours || 0), 0);
      const employeesCount = daySessions.length;
      const avgHoursPerEmployee = employeesCount > 0 ? totalHours / employeesCount : 0;

      trends.push({
        date: format(currentDate, 'MMM dd'),
        total_hours: totalHours,
        employees_count: employeesCount,
        avg_hours_per_employee: avgHoursPerEmployee
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  };

  const calculateRoleBreakdown = (employees: any[], workSessions: any[]): RoleBreakdown[] => {
    const roleColors = {
      dentist: '#8b5cf6',
      hygienist: '#06b6d4',
      staff: '#10b981',
      admin: '#f59e0b'
    };

    const roleGroups = employees.reduce((acc, employee) => {
      const role = employee.role;
      if (!acc[role]) {
        acc[role] = { employees: [], totalHours: 0 };
      }
      acc[role].employees.push(employee);
      
      const employeeSessions = workSessions.filter(session => session.employee_id === employee.id);
      const hours = employeeSessions.reduce((sum, session) => sum + (session.total_hours || 0), 0);
      acc[role].totalHours += hours;
      
      return acc;
    }, {} as any);

    return Object.entries(roleGroups).map(([role, data]: [string, any]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      employee_count: data.employees.length,
      total_hours: data.totalHours,
      avg_hours: data.employees.length > 0 ? data.totalHours / data.employees.length : 0,
      color: roleColors[role as keyof typeof roleColors] || '#6b7280'
    }));
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Time Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive workforce analytics and productivity insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeToday}</div>
            <p className="text-xs text-muted-foreground">Clocked in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageHoursPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalHoursThisWeek.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.punctualityScore}%</div>
            <p className="text-xs text-muted-foreground">On-time rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overtimeHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Extra hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="employees">Employee Performance</TabsTrigger>
          <TabsTrigger value="roles">Role Breakdown</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Work Hours Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_hours" fill="#8b5cf6" name="Total Hours" />
                  <Bar dataKey="employees_count" fill="#06b6d4" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeMetrics.map((employee) => (
                  <div key={employee.employee_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {employee.first_name} {employee.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">
                            {employee.role}
                          </Badge>
                          {employee.days_worked} days worked
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {employee.total_hours.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.avg_daily_hours.toFixed(1)}h/day avg
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {employee.punctuality_score}% punctual
                      </span>
                      {employee.overtime_hours > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="w-3 h-3" />
                          {employee.overtime_hours.toFixed(1)}h overtime
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hours by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={roleBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total_hours"
                      label={({ role, total_hours }) => `${role}: ${total_hours.toFixed(1)}h`}
                    >
                      {roleBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleBreakdown.map((role) => (
                    <div key={role.role} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: role.color }}
                        />
                        <div>
                          <div className="font-semibold">{role.role}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.employee_count} employees
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{role.total_hours.toFixed(1)}h</div>
                        <div className="text-sm text-muted-foreground">
                          {role.avg_hours.toFixed(1)}h avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  📊 Productivity Analysis
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mt-2">
                  Average productivity is {analytics.averageHoursPerDay > 7 ? 'above' : 'below'} expected levels. 
                  Consider {analytics.averageHoursPerDay > 8 ? 'workload redistribution' : 'process optimization'} 
                  to improve efficiency.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  ⏰ Punctuality Insights
                </h3>
                <p className="text-green-800 dark:text-green-200 mt-2">
                  {analytics.punctualityScore >= 90 
                    ? 'Excellent punctuality! Team consistently arrives on time.'
                    : analytics.punctualityScore >= 75
                    ? 'Good punctuality overall. Consider flexible start times for improvement.'
                    : 'Punctuality needs attention. Review scheduling policies and communication.'}
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  📈 Recommendations
                </h3>
                <ul className="text-orange-800 dark:text-orange-200 mt-2 space-y-1 list-disc list-inside">
                  <li>Monitor overtime patterns to prevent burnout</li>
                  <li>Implement flexible scheduling for improved work-life balance</li>
                  <li>Use peak hours data for optimal staff allocation</li>
                  <li>Regular one-on-ones to address performance concerns</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}