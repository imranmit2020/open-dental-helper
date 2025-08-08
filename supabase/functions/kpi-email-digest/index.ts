// Supabase Edge Function: kpi-email-digest
// Sends a daily KPI email using Resend. Expects RESEND_API_KEY secret.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const to: string = body?.to || "";
    const tz: string = body?.tz || "America/New_York";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing environment secrets" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    // Compute previous day's UTC range regardless of tz (cron handles timezone choice)
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

    const [{ data: invoices }, { data: appts }] = await Promise.all([
      supabase.from("invoices").select("total, issued_at").gte("issued_at", start.toISOString()).lt("issued_at", end.toISOString()),
      supabase.from("appointments").select("status, appointment_date").gte("appointment_date", start.toISOString()).lt("appointment_date", end.toISOString()),
    ]);

    const revenue = (invoices || []).reduce((s: number, r: any) => s + Number(r.total || 0), 0);
    const invCount = invoices?.length || 0;
    const apptCount = appts?.length || 0;
    const completed = (appts || []).filter((a: any) => (a.status || '').toLowerCase() === 'completed').length;

    const html = `
      <div style="font-family:ui-sans-serif,system-ui">
        <h2>Daily KPI Digest (${start.toISOString().slice(0,10)})</h2>
        <p><strong>Revenue:</strong> $${revenue.toLocaleString()} (${invCount} invoices)</p>
        <p><strong>Appointments:</strong> ${apptCount} total, ${completed} completed</p>
        <hr />
        <p style="color:#666">Sent automatically at 07:00 ${tz}</p>
      </div>
    `;

    const recipients = to ? [to] : ["ofinapulse@gmail.com"]; // fallback
    const { error: sendErr } = await resend.emails.send({
      from: "Practice KPIs <reports@resend.dev>",
      to: recipients,
      subject: `Daily KPI Digest - ${start.toISOString().slice(0,10)}`,
      html,
    }) as any;

    if (sendErr) throw sendErr;

    return new Response(JSON.stringify({ ok: true, revenue, invCount, apptCount, completed }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("kpi-email-digest error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
