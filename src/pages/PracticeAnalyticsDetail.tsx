import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Calendar, FileDown, MapPin, Receipt, TrendingUp } from "lucide-react";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import AppointmentsTrendChart from "@/components/analytics/AppointmentsTrendChart";
import { useToast } from "@/hooks/use-toast";
import StaffPerformanceChart from "@/components/analytics/StaffPerformanceChart";
import TreatmentMixChart from "@/components/analytics/TreatmentMixChart";

export default function PracticeAnalyticsDetail() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { tenants } = useTenant();

  const [timeRange, setTimeRange] = useState("3months");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [invoicesAll, setInvoicesAll] = useState<any[]>([]);
  const [appointmentsAll, setAppointmentsAll] = useState<any[]>([]);

  // Toast
  const { toast } = useToast();

  // Filters
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [apptStatusFilter, setApptStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [selectedDentist, setSelectedDentist] = useState<string>("all");
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");

  // Reference data
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [invoicePage, setInvoicePage] = useState<number>(0);
  const [apptPage, setApptPage] = useState<number>(0);

  const filteredInvoices = useMemo(() => {
    return (invoicesAll || []).filter((inv: any) => {
      const statusOk = invoiceStatusFilter === "all" ? true : inv.status === invoiceStatusFilter;
      const patientOk = selectedPatient === "all" ? true : inv.patient_id === selectedPatient;
      return statusOk && patientOk;
    });
  }, [invoicesAll, invoiceStatusFilter, selectedPatient]);

  const filteredAppointments = useMemo(() => {
    return (appointmentsAll || []).filter((ap: any) => {
      const statusOk = apptStatusFilter === "all" ? true : ap.status === apptStatusFilter;
      const patientOk = selectedPatient === "all" ? true : ap.patient_id === selectedPatient;
      const dentistOk = selectedDentist === "all" ? true : ap.dentist_id === selectedDentist;
      return statusOk && patientOk && dentistOk;
    });
  }, [appointmentsAll, apptStatusFilter, selectedPatient, selectedDentist]);

  const pagedInvoices = useMemo(() => {
    const start = invoicePage * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, invoicePage, pageSize]);

  const pagedAppointments = useMemo(() => {
    const start = apptPage * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, apptPage, pageSize]);

  const invoiceTotalPages = useMemo(() => Math.max(1, Math.ceil(filteredInvoices.length / pageSize)), [filteredInvoices.length, pageSize]);
  const apptTotalPages = useMemo(() => Math.max(1, Math.ceil(filteredAppointments.length / pageSize)), [filteredAppointments.length, pageSize]);

  // Staff KPIs
  const staffStats = useMemo(() => {
    const nameMap = new Map<string, string>();
    dentists.forEach(d => nameMap.set(d.id, `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'Dentist'));
    const map = new Map<string, { id: string; name: string; total: number; completed: number; cancelled: number; noShow: number }>();
    (filteredAppointments || []).forEach((ap: any) => {
      const id = ap.dentist_id || 'unassigned';
      const name = id === 'unassigned' ? 'Unassigned' : (nameMap.get(id) || 'Dentist');
      if (!map.has(id)) map.set(id, { id, name, total: 0, completed: 0, cancelled: 0, noShow: 0 });
      const rec = map.get(id)!;
      const status = (ap.status || '').toLowerCase();
      if (status === 'completed') rec.completed += 1;
      else if (status === 'cancelled') rec.cancelled += 1;
      else if (status === 'no_show') rec.noShow += 1;
      rec.total += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).map(r => ({
      ...r,
      completionRate: r.total ? Math.round((r.completed / r.total) * 100) : 0,
      cancellationRate: r.total ? Math.round((r.cancelled / r.total) * 100) : 0,
      noShowRate: r.total ? Math.round((r.noShow / r.total) * 100) : 0,
    }));
  }, [filteredAppointments, dentists]);

  // AI insights
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  const tenant = useMemo(() => tenants.find(t => t.id === tenantId), [tenants, tenantId]);

  const getStartDateISO = () => {
    const d = new Date();
    switch (timeRange) {
      case "1month": d.setMonth(d.getMonth() - 1); break;
      case "3months": d.setMonth(d.getMonth() - 3); break;
      case "6months": d.setMonth(d.getMonth() - 6); break;
      case "1year": d.setFullYear(d.getFullYear() - 1); break;
      default: d.setMonth(d.getMonth() - 3);
    }
    return d.toISOString();
  };

  useEffect(() => {
    // SEO: title, description, canonical
    const title = tenant ? `${tenant.name} | Practice Analytics Detail` : `Practice Analytics Detail`;
    document.title = title.slice(0, 60);

    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    const descText = tenant ? `Analytics for ${tenant.name}: revenue, appointments, KPIs.` : `Practice analytics: revenue, appointments, KPIs.`;
    metaDesc.setAttribute('content', descText.slice(0, 160));
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', window.location.href);
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical);
  }, [tenant, tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = getStartDateISO();
        const end = new Date().toISOString();

        // Invoices summary + list
        const { data: invoices, error: invErr } = await supabase
          .from('invoices')
          .select('id,total,issued_at,status,currency,tenant_id,patient_id')
          .eq('tenant_id', tenantId)
          .gte('issued_at', start)
          .lte('issued_at', end)
          .order('issued_at', { ascending: false });
        if (invErr) throw invErr;
        const total = (invoices || []).reduce((sum, r: any) => sum + (Number(r.total) || 0), 0);
        setRevenue(total);
        setInvoiceCount(invoices?.length || 0);
        setInvoicesAll(invoices || []);
        setRecentInvoices((invoices || []).slice(0, 10));

        // Appointments summary + list
        const { data: appts, error: apptErr } = await supabase
          .from('appointments')
          .select('id,appointment_date,status,patient_id,dentist_id')
          .eq('tenant_id', tenantId)
          .gte('appointment_date', start)
          .lte('appointment_date', end)
          .order('appointment_date', { ascending: false });
        if (apptErr) throw apptErr;
        setAppointmentsCount(appts?.length || 0);
        setAppointmentsAll(appts || []);
        setRecentAppointments((appts || []).slice(0, 10));
      } catch (e) {
        console.error('Practice detail fetch error:', e);
        toast({ title: 'Error', description: 'Failed to load analytics data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, timeRange]);

  // Fetch reference data for filters
  useEffect(() => {
    if (!tenantId) return;
    const fetchRefs = async () => {
      try {
        const [{ data: pats }, { data: docs }] = await Promise.all([
          supabase.from('patients').select('id,first_name,last_name').eq('tenant_id', tenantId).order('first_name', { ascending: true }),
          supabase.from('employees').select('id,first_name,last_name').eq('tenant_id', tenantId).eq('role', 'dentist').order('first_name', { ascending: true }),
        ]);
        setPatients(pats || []);
        setDentists(docs || []);
      } catch (e) {
        console.error('Reference data fetch error:', e);
      }
    };
    fetchRefs();
  }, [tenantId]);

  // Reset pagination on filter changes
  useEffect(() => { setInvoicePage(0); }, [invoiceStatusFilter, selectedPatient, timeRange, tenantId]);
  useEffect(() => { setApptPage(0); }, [apptStatusFilter, selectedPatient, selectedDentist, timeRange, tenantId]);
  useEffect(() => { setInvoicePage(0); setApptPage(0); }, [pageSize]);

  const exportInvoicesCsv = () => {
    const headers = ['id','total','issued_at','status','currency'];
    const rows = filteredInvoices.map(r => [r.id, r.total, r.issued_at, r.status, r.currency]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${tenant?.name || tenantId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateInsights = async () => {
    try {
      setAiLoading(true);
      const payload = {
        tenantId,
        timeRange,
        revenue,
        invoiceCount: filteredInvoices.length,
        appointmentsCount: filteredAppointments.length,
      };
      const { data, error } = await supabase.functions.invoke('ai-practice-insights', { body: payload });
      if (error) throw error;
      setAiInsights(data?.insights || []);
      if ((data?.insights || []).length === 0) {
        toast({ title: 'No insights', description: 'No AI insights could be generated for the current filters.' });
      }
    } catch (e: any) {
      console.error('AI insights error:', e);
      toast({ title: 'AI Error', description: e.message || 'Failed to generate insights', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const exportAppointmentsCsv = () => {
    const headers = ['id','appointment_date','status','patient_id'];
    const rows = filteredAppointments.map(r => [r.id, r.appointment_date, r.status, r.patient_id]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${tenant?.name || tenantId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!tenantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No tenantId provided.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading practice analytics…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Practice Analytics: {tenant?.name || tenantId}</h1>
          <div className="mt-2 flex items-center gap-2">
            {tenant?.clinic_code && <Badge variant="secondary">Code: {tenant.clinic_code}</Badge>}
            {tenant?.address && <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> {tenant.address}</div>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Granularity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Patient" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDentist} onValueChange={setSelectedDentist}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Dentist" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dentists</SelectItem>
              {dentists.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Rows/Page" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportInvoicesCsv}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card role="button" tabIndex={0} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveTab("invoices")} >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" >
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><CurrencyDisplay amount={revenue} variant="large" /></div>
              <p className="text-xs text-muted-foreground">Time range applied</p>
              <Progress value={Math.min(100, revenue ? 85 : 0)} className="mt-2" />
            </CardContent>
          </Card>
          <Card role="button" tabIndex={0} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveTab("invoices")} >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoiceCount}</div>
              <p className="text-xs text-muted-foreground">Generated in period</p>
              <Progress value={Math.min(100, (invoiceCount / 50) * 100)} className="mt-2" />
            </CardContent>
          </Card>
          <Card role="button" tabIndex={0} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveTab("appointments")} >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentsCount}</div>
              <p className="text-xs text-muted-foreground">Scheduled in period</p>
              <Progress value={Math.min(100, (appointmentsCount / 200) * 100)} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization (est.)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72%</div>
              <p className="text-xs text-muted-foreground">Heuristic estimate</p>
              <Progress value={72} className="mt-2" />
            </CardContent>
          </Card>
        </section>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="staff">Staff Performance</TabsTrigger>
              <TabsTrigger value="treatments">Treatment Mix</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Revenue Over Time</h3>
                      <RevenueTrendChart invoices={filteredInvoices} granularity={granularity} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Appointments Over Time</h3>
                      <AppointmentsTrendChart appointments={filteredAppointments} granularity={granularity} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Latest Invoices</h3>
                      <ul className="space-y-2">
                        {recentInvoices.map(inv => (
                          <li key={inv.id} className="flex items-center justify-between rounded-lg border p-2">
                            <span className="text-sm">{new Date(inv.issued_at).toLocaleDateString()} • {inv.status}</span>
                            <span className="font-medium"><CurrencyDisplay amount={Number(inv.total) || 0} variant="compact" /></span>
                          </li>
                        ))}
                        {recentInvoices.length === 0 && <p className="text-sm text-muted-foreground">No invoices found in this period.</p>}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Latest Appointments</h3>
                      <ul className="space-y-2">
                        {recentAppointments.map(ap => (
                          <li key={ap.id} className="flex items-center justify-between rounded-lg border p-2">
                            <span className="text-sm">{new Date(ap.appointment_date).toLocaleString()} • {ap.status}</span>
                            <span className="text-xs text-muted-foreground">Patient {ap.patient_id?.slice(0,6)}</span>
                          </li>
                        ))}
                        {recentAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments found in this period.</p>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <StaffPerformanceChart appointments={filteredAppointments} dentists={dentists} />

                  <div className="overflow-x-auto mt-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Dentist</th>
                          <th className="py-2 pr-4">Total</th>
                          <th className="py-2 pr-4">Completed</th>
                          <th className="py-2 pr-4">Cancelled</th>
                          <th className="py-2 pr-4">No‑show</th>
                          <th className="py-2 pr-4">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffStats.map((s: any) => (
                          <tr key={s.id} className="border-t">
                            <td className="py-2 pr-4">{s.name}</td>
                            <td className="py-2 pr-4">{s.total}</td>
                            <td className="py-2 pr-4">{s.completed}</td>
                            <td className="py-2 pr-4">{s.cancelled}</td>
                            <td className="py-2 pr-4">{s.noShow}</td>
                            <td className="py-2 pr-4">{s.completionRate}%</td>
                          </tr>
                        ))}
                        {staffStats.length === 0 && (
                          <tr><td className="py-4" colSpan={6}>No data for the selected filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <TreatmentMixChart appointments={filteredAppointments} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <CardTitle>AI Guidance & Recommendations</CardTitle>
                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <Button variant="default" onClick={handleGenerateInsights} disabled={aiLoading}>
                      {aiLoading ? 'Generating…' : 'Generate Insights'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {aiInsights.length === 0 && !aiLoading && (
                    <p className="text-sm text-muted-foreground">No insights yet. Click "Generate Insights" to analyze this period.</p>
                  )}
                  <div className="space-y-3">
                    {aiInsights.map((ins: any, idx: number) => (
                      <div key={idx} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{ins.title}</h4>
                          {ins.priority_level && <Badge variant="secondary">{ins.priority_level}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{ins.description}</p>
                        {Array.isArray(ins.actionable_items) && ins.actionable_items.length > 0 && (
                          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                            {ins.actionable_items.map((a: string, i: number) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Page {invoicePage + 1} / {invoiceTotalPages}</div>
                    <Button variant="outline" onClick={() => setInvoicePage(Math.max(0, invoicePage - 1))} disabled={invoicePage === 0}>Prev</Button>
                    <Button variant="outline" onClick={() => setInvoicePage(Math.min(invoiceTotalPages - 1, invoicePage + 1))} disabled={invoicePage + 1 >= invoiceTotalPages}>Next</Button>
                    <Button variant="outline" onClick={exportInvoicesCsv}>
                      <FileDown className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedInvoices.map(inv => (
                          <tr key={inv.id} className="border-t">
                            <td className="py-2 pr-4">{new Date(inv.issued_at).toLocaleString()}</td>
                            <td className="py-2 pr-4">{inv.status}</td>
                            <td className="py-2 pr-4"><CurrencyDisplay amount={Number(inv.total) || 0} /></td>
                          </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                          <tr><td className="py-4" colSpan={3}>No invoices match the selected filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <Select value={apptStatusFilter} onValueChange={setApptStatusFilter}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">Page {apptPage + 1} / {apptTotalPages}</div>
                    <Button variant="outline" onClick={() => setApptPage(Math.max(0, apptPage - 1))} disabled={apptPage === 0}>Prev</Button>
                    <Button variant="outline" onClick={() => setApptPage(Math.min(apptTotalPages - 1, apptPage + 1))} disabled={apptPage + 1 >= apptTotalPages}>Next</Button>
                    <Button variant="outline" onClick={exportAppointmentsCsv}>
                      <FileDown className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Patient</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedAppointments.map(ap => (
                          <tr key={ap.id} className="border-t">
                            <td className="py-2 pr-4">{new Date(ap.appointment_date).toLocaleString()}</td>
                            <td className="py-2 pr-4">{ap.status}</td>
                            <td className="py-2 pr-4">{ap.patient_id?.slice(0,8)}</td>
                          </tr>
                        ))}
                        {filteredAppointments.length === 0 && (
                          <tr><td className="py-4" colSpan={3}>No appointments match the selected filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
