// Supabase Edge Function: kpi-daily-snapshot
// Computes daily KPIs and stores them in practice_analytics

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date: dateStr } = (await req.json().catch(() => ({}))) as { date?: string };

    // Use UTC day boundaries
    const target = dateStr ? new Date(dateStr + "T00:00:00Z") : new Date();
    const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate() + 1, 0, 0, 0));

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Compute totals from invoices
    const { data: invoices, error: invErr } = await supabase
      .from("invoices")
      .select("total, issued_at")
      .gte("issued_at", start.toISOString())
      .lt("issued_at", end.toISOString());

    if (invErr) throw invErr;

    const dailyRevenue = (invoices || []).reduce((sum: number, row: any) => sum + Number(row.total || 0), 0);
    const invoicesCount = invoices?.length || 0;

    // Appointments today (any status) and completed count if available
    const { data: appts, error: apptErr } = await supabase
      .from("appointments")
      .select("status, appointment_date")
      .gte("appointment_date", start.toISOString())
      .lt("appointment_date", end.toISOString());
    if (apptErr) throw apptErr;

    const appointmentsToday = appts?.length || 0;
    const completedToday = (appts || []).filter((a: any) => (a.status || "").toLowerCase() === "completed").length;

    // Insert analytics rows
    const rows = [
      {
        metric_type: "daily_snapshot",
        metric_name: "daily_revenue_total",
        metric_value: dailyRevenue,
        period_start: start.toISOString().slice(0, 10),
        period_end: start.toISOString().slice(0, 10),
        metadata: { currency: "USD" },
      },
      {
        metric_type: "daily_snapshot",
        metric_name: "daily_invoices_count",
        metric_value: invoicesCount,
        period_start: start.toISOString().slice(0, 10),
        period_end: start.toISOString().slice(0, 10),
      },
      {
        metric_type: "daily_snapshot",
        metric_name: "appointments_today",
        metric_value: appointmentsToday,
        period_start: start.toISOString().slice(0, 10),
        period_end: start.toISOString().slice(0, 10),
      },
      {
        metric_type: "daily_snapshot",
        metric_name: "appointments_completed_today",
        metric_value: completedToday,
        period_start: start.toISOString().slice(0, 10),
        period_end: start.toISOString().slice(0, 10),
      },
    ];

    const { error: insertErr } = await supabase.from("practice_analytics").insert(rows as any);
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({
        ok: true,
        range: { start: start.toISOString(), end: end.toISOString() },
        metrics: { dailyRevenue, invoicesCount, appointmentsToday, completedToday },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("kpi-daily-snapshot error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
