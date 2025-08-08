import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
  Users,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Building
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClinicSwitcher } from "@/components/ClinicSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DateRangeCalendar } from "@/components/ui/calendar";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

const PracticeDashboard = () => {
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 29)),
    to: new Date(),
  });
  const [analytics, setAnalytics] = useState<any[]>([]);
  const { toast } = useToast();
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillDate, setDrillDate] = useState<string | null>(null);
  const [drillInvoices, setDrillInvoices] = useState<any[]>([]);
  const [drillAppointments, setDrillAppointments] = useState<any[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const fromDay = new Date(dateRange.from.toDateString());
        const toDay = new Date(dateRange.to.toDateString());
        const toNext = new Date(toDay);
        toNext.setDate(toNext.getDate() + 1);
        const { data, error } = await supabase
          .from('practice_analytics')
          .select('*')
          .gte('period_start', fromDay.toISOString())
          .lt('period_start', toNext.toISOString())
          .order('period_start', { ascending: true });
        if (error) throw error;
        setAnalytics(data || []);
      } catch (e: any) {
        console.error(e);
        toast({ title: 'Failed to load analytics', description: e.message, variant: 'destructive' });
      }
    };
    load();
  }, [dateRange.from, dateRange.to]);

  // Realtime updates for invoices and appointments
  useEffect(() => {
    const channel = supabase
      .channel('practice-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        // Refresh analytics when invoices change
        const from = dateRange.from;
        const to = dateRange.to;
        (async () => {
          try {
            const fromDay = new Date(from.toDateString());
            const toDay = new Date(to.toDateString());
            const toNext = new Date(toDay);
            toNext.setDate(toNext.getDate() + 1);
            const { data } = await supabase
              .from('practice_analytics')
              .select('*')
              .gte('period_start', fromDay.toISOString())
              .lt('period_start', toNext.toISOString())
              .order('period_start', { ascending: true });
            setAnalytics(data || []);
          } catch {}
        })();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        // Same refresh on appointment changes
        const from = dateRange.from;
        const to = dateRange.to;
        (async () => {
          try {
            const fromDay = new Date(from.toDateString());
            const toDay = new Date(to.toDateString());
            const toNext = new Date(toDay);
            toNext.setDate(toNext.getDate() + 1);
            const { data } = await supabase
              .from('practice_analytics')
              .select('*')
              .gte('period_start', fromDay.toISOString())
              .lt('period_start', toNext.toISOString())
              .order('period_start', { ascending: true });
            setAnalytics(data || []);
          } catch {}
        })();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange.from, dateRange.to]);

  const dailyRevenueSeries = useMemo(() => {
    const points = analytics
      .filter((r: any) => r.metric_name === 'daily_revenue_total' || (r.metric_type === 'daily_snapshot' && r.metric_name === 'daily_revenue_total'))
      .map((r: any) => ({
        date: (r.period_start || r.created_at || '').slice(0, 10),
        value: Number(r.metric_value || 0)
      }));
    const byDate: Record<string, number> = {};
    points.forEach((p: any) => { byDate[p.date] = (byDate[p.date] || 0) + p.value; });
    return Object.entries(byDate).map(([date, value]) => ({ date, value: value as number })).sort((a: any, b: any) => (a.date as string).localeCompare(b.date as string));
  }, [analytics]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    analytics.forEach((r: any) => {
      if (r.metric_type === 'revenue_by_type' || (r.metric_type === 'revenue' && r.metadata?.treatment)) {
        const key = r.metric_name || r.metadata?.treatment || 'Other';
        totals[key] = (totals[key] || 0) + Number(r.metric_value || 0);
      }
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [analytics]);

  const openDrillForDate = async (dateStr: string) => {
    try {
      setDrillLoading(true);
      setDrillDate(dateStr);
      setDrillOpen(true);
      const start = new Date(dateStr + 'T00:00:00Z');
      const end = new Date(dateStr + 'T00:00:00Z');
      end.setUTCDate(end.getUTCDate() + 1);

      const [{ data: invoices }, { data: appts }] = await Promise.all([
        supabase.from('invoices').select('*').gte('issued_at', start.toISOString()).lt('issued_at', end.toISOString()).order('issued_at', { ascending: true }),
        supabase.from('appointments').select('*').gte('appointment_date', start.toISOString()).lt('appointment_date', end.toISOString()).order('appointment_date', { ascending: true })
      ]);

      setDrillInvoices(invoices || []);
      setDrillAppointments(appts || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load drill-down', variant: 'destructive' });
    } finally {
      setDrillLoading(false);
    }
  };

  const handleLineChartClick = (state: any) => {
    const date = state?.activeLabel as string | undefined;
    if (date) {
      openDrillForDate(date);
    }
  };

  const handleGenerateReport = () => {
    const csvRows: string[] = [];
    csvRows.push('Section,Key,Value');
    stats.forEach((s) => csvRows.push(`Stat,${s.title},${typeof s.value === 'number' ? s.value : s.value}`));
    practiceMetrics.forEach((m) => csvRows.push(`Metric,${m.label},${m.value}% (target ${m.target}%)`));
    recentActivities.forEach((a) => csvRows.push(`Activity,${a.action} - ${a.patient},${a.time}`));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `practice-overview-report-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: "Total Patients",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: "24",
      change: "+3",
      changeType: "positive" as const,
      icon: CalendarIcon,
    },
    {
      title: "Monthly Revenue",
      value: 87450,
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Efficiency Score",
      value: "94%",
      change: "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const practiceMetrics = [
    { label: "Patient Satisfaction", value: 96, target: 95 },
    { label: "Appointment Utilization", value: 88, target: 85 },
    { label: "Treatment Success Rate", value: 94, target: 90 },
    { label: "Revenue Growth", value: 76, target: 70 }
  ];

  const operationalAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Equipment Maintenance Due",
      message: "Dental X-ray machine needs scheduled maintenance",
      priority: "high"
    },
    {
      id: 2,
      type: "info",
      title: "Staff Training Reminder",
      message: "Annual CPR certification expires in 30 days",
      priority: "medium"
    },
    {
      id: 3,
      type: "success",
      title: "Quality Certification Renewed",
      message: "ADA certification successfully renewed",
      priority: "low"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New patient registration",
      patient: "Emily Rodriguez",
      time: "2 hours ago",
      type: "registration"
    },
    {
      id: 2,
      action: "Treatment plan approved",
      patient: "Michael Thompson",
      time: "4 hours ago",
      type: "treatment"
    },
    {
      id: 3,
      action: "Emergency appointment scheduled",
      patient: "Sarah Wilson",
      time: "6 hours ago",
      type: "emergency"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Practice Overview
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage your dental practice performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocationsOpen(true)}>
              <Building className="w-4 h-4 mr-2" />
              Manage Locations
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>

        <Dialog open={locationsOpen} onOpenChange={setLocationsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Locations</DialogTitle>
              <DialogDescription>Switch between your clinics and view details.</DialogDescription>
            </DialogHeader>
            <ClinicSwitcher />
          </DialogContent>
        </Dialog>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.title === "Monthly Revenue" ? (
                    <CurrencyDisplay amount={stat.value as number} variant="large" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={`${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue MoM / YoY & Target */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Month-over-month, year-over-year, and target progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">MTD vs Last Month</div>
                <div className="text-2xl font-bold">${dailyRevenueSeries.reduce((s: number, p: any) => s + p.value, 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Comparison updates as you change date range</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">YoY (same range)</div>
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Hook to historical data when available</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Progress to Target</div>
                <Progress value={Math.min(100, (dailyRevenueSeries.reduce((s: number, p: any) => s + p.value, 0) / 100000) * 100)} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: $100,000</div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Analytics Overview */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Saved KPIs and daily snapshots</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from.toISOString().slice(0, 10)} – {dateRange.to.toISOString().slice(0, 10)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <DateRangeCalendar
                  mode="range"
                  selected={dateRange as any}
                  onSelect={(v: any) => {
                    if (!v?.from) return;
                    const to = v.to ?? v.from;
                    setDateRange({ from: v.from, to });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <h4 className="text-sm font-medium mb-2">Daily Revenue</h4>
                {dailyRevenueSeries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data in range.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRevenueSeries} onClick={handleLineChartClick}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="h-64">
                <h4 className="text-sm font-medium mb-2">Revenue by Treatment</h4>
                {categoryTotals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data in range.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryTotals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Practice Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Practice Performance
              </CardTitle>
              <CardDescription>
                Key performance indicators for your practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {practiceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-muted-foreground">
                      {metric.value}% / {metric.target}%
                    </span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Operational Alerts
              </CardTitle>
              <CardDescription>
                Important notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="mt-0.5">
                    {alert.type === "warning" && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    {alert.type === "info" && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    {alert.type === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge
                    variant={
                      alert.priority === "high" 
                        ? "destructive" 
                        : alert.priority === "medium" 
                        ? "default" 
                        : "secondary"
                    }
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest practice activities and patient interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{activity.action}</h4>
                    <p className="text-sm text-muted-foreground">
                      Patient: {activity.patient}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <Badge variant="outline" className="mt-1">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Drill-down Drawer */}
        <Drawer open={drillOpen} onOpenChange={setDrillOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Details for {drillDate}</DrawerTitle>
              <DrawerDescription>Invoices and appointments</DrawerDescription>
            </DrawerHeader>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Invoices</h4>
                {drillLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : drillInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No invoices.</p>
                ) : (
                  <div className="space-y-2">
                    {drillInvoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">{new Date(inv.issued_at).toLocaleTimeString()} • {inv.status}</span>
                        <span className="font-semibold">${(Number(inv.total)||0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Appointments</h4>
                {drillLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : drillAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments.</p>
                ) : (
                  <div className="space-y-2">
                    {drillAppointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">{new Date(a.appointment_date).toLocaleTimeString()} • {a.status}</span>
                        <Badge variant="outline">{a.treatment_type || 'General'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default PracticeDashboard;