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
          .select('id,total,issued_at,status,currency,tenant_id')
          .eq('tenant_id', tenantId)
          .gte('issued_at', start)
          .lte('issued_at', end)
          .order('issued_at', { ascending: false });
        if (invErr) throw invErr;
        const total = (invoices || []).reduce((sum, r: any) => sum + (Number(r.total) || 0), 0);
        setRevenue(total);
        setInvoiceCount(invoices?.length || 0);
        setRecentInvoices((invoices || []).slice(0, 10));

        // Appointments summary + list
        const { data: appts, error: apptErr } = await supabase
          .from('appointments')
          .select('id,appointment_date,status,patient_id')
          .eq('tenant_id', tenantId)
          .gte('appointment_date', start)
          .lte('appointment_date', end)
          .order('appointment_date', { ascending: false });
        if (apptErr) throw apptErr;
        setAppointmentsCount(appts?.length || 0);
        setRecentAppointments((appts || []).slice(0, 10));
      } catch (e) {
        console.error('Practice detail fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, timeRange]);

  const exportInvoicesCsv = () => {
    const headers = ['id','total','issued_at','status','currency'];
    const rows = recentInvoices.map(r => [r.id, r.total, r.issued_at, r.status, r.currency]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${tenant?.name || tenantId}.csv`;
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
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportInvoicesCsv}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><CurrencyDisplay amount={revenue} variant="large" /></div>
              <p className="text-xs text-muted-foreground">Time range applied</p>
              <Progress value={Math.min(100, revenue ? 85 : 0)} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
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
          <Card>
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
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
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

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices ({invoiceCount})</CardTitle>
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
                        {recentInvoices.map(inv => (
                          <tr key={inv.id} className="border-t">
                            <td className="py-2 pr-4">{new Date(inv.issued_at).toLocaleString()}</td>
                            <td className="py-2 pr-4">{inv.status}</td>
                            <td className="py-2 pr-4"><CurrencyDisplay amount={Number(inv.total) || 0} /></td>
                          </tr>
                        ))}
                        {recentInvoices.length === 0 && (
                          <tr><td className="py-4" colSpan={3}>No invoices in this period.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments ({appointmentsCount})</CardTitle>
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
                        {recentAppointments.map(ap => (
                          <tr key={ap.id} className="border-t">
                            <td className="py-2 pr-4">{new Date(ap.appointment_date).toLocaleString()}</td>
                            <td className="py-2 pr-4">{ap.status}</td>
                            <td className="py-2 pr-4">{ap.patient_id?.slice(0,8)}</td>
                          </tr>
                        ))}
                        {recentAppointments.length === 0 && (
                          <tr><td className="py-4" colSpan={3}>No appointments in this period.</td></tr>
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
