import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Authed client to identify user and tenant
    const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: userErr } = await authed.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get current tenant id via SECURITY DEFINER function
    const { data: tenantId, error: tenantErr } = await authed.rpc("get_current_tenant_id");
    if (tenantErr) throw tenantErr;

    // Service client to bypass RLS for inserts
    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // If tenantId is null, still seed but with null tenant; however users may not see data due to RLS
    // Prefer: if null, create standalone patients with null tenant so page can still demo insert logic

    // Check if there are already patients for this tenant
    const { data: existing, error: existingErr } = await service
      .from("patients")
      .select("id")
      .eq("tenant_id", tenantId)
      .limit(1);
    if (existingErr) throw existingErr;

    let createdCount = 0;

    if (!existing || existing.length === 0) {
      // Seed patients
      const patients = [
        { first_name: "John", last_name: "Smith", email: "john.smith@example.com", date_of_birth: "1980-05-12", gender: "male", tenant_id: tenantId },
        { first_name: "Sarah", last_name: "Johnson", email: "sarah.johnson@example.com", date_of_birth: "1992-03-21", gender: "female", tenant_id: tenantId },
        { first_name: "Mike", last_name: "Davis", email: "mike.davis@example.com", date_of_birth: "1966-11-02", gender: "male", tenant_id: tenantId },
      ];

      const { data: insertedPatients, error: insertPatientsErr } = await service
        .from("patients")
        .insert(patients)
        .select("id");
      if (insertPatientsErr) throw insertPatientsErr;

      createdCount += insertedPatients?.length || 0;

      // Seed clinical data
      for (const p of insertedPatients || []) {
        const allergyRows = [
          { patient_id: p.id, allergen: "Penicillin", severity: "high" },
        ];
        const medicationRows = [
          { patient_id: p.id, medication_name: "Warfarin", status: "active", notes: "Daily" },
        ];
        const conditionRows = [
          { patient_id: p.id, condition_name: "Hypertension", status: "active" },
        ];

        await service.from("allergies").insert(allergyRows);
        await service.from("medications").insert(medicationRows);
        await service.from("medical_conditions").insert(conditionRows);
      }
    }

    return new Response(
      JSON.stringify({ status: "ok", tenantId, createdCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
