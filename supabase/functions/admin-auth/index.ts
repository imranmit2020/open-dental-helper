import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminAuthRequest {
  action: "invite" | "set_password" | "send_reset" | "create_user";
  email?: string;
  user_id?: string;
  new_password?: string;
  redirectTo?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env config" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Check if caller is using the service role key (internal/tooling calls)
    const apikeyHeader = req.headers.get("apikey") ?? "";
    const isServiceRole = authHeader === `Bearer ${SERVICE_ROLE_KEY}` || apikeyHeader === SERVICE_ROLE_KEY;

    if (!isServiceRole) {
      const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });

      // Verify caller is authenticated and has admin privileges
      const { data: userData, error: getUserErr } = await supabaseAuth.auth.getUser();
      if (getUserErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { data: profile } = await supabaseAuth
        .from("profiles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single();

      const callerRole = profile?.role ?? "user";
      if (!["admin", "super_admin"].includes(callerRole)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const body = (await req.json()) as AdminAuthRequest;
    const redirectTo = body.redirectTo || `${new URL(req.url).origin}/`;

    if (body.action === "invite") {
      if (!body.email) {
        return new Response(JSON.stringify({ error: "Email required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
        redirectTo,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (body.action === "set_password") {
      if (!body.user_id || !body.new_password) {
        return new Response(JSON.stringify({ error: "user_id and new_password required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(body.user_id, {
        password: body.new_password,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (body.action === "send_reset") {
      if (!body.email) {
        return new Response(JSON.stringify({ error: "Email required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(body.email, {
        redirectTo,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (body.action === "create_user") {
      if (!body.email || !body.new_password) {
        return new Response(JSON.stringify({ error: "email and new_password required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.new_password,
        email_confirm: true,
        user_metadata: {
          first_name: body.first_name || "",
          last_name: body.last_name || "",
          role: body.role || "staff",
        },
      });
      if (createErr) throw createErr;

      // Update profile role if specified
      if (body.role && newUser?.user?.id) {
        await supabaseAdmin
          .from("profiles")
          .update({ role: body.role, first_name: body.first_name || "", last_name: body.last_name || "" })
          .eq("user_id", newUser.user.id);
      }

      return new Response(JSON.stringify({ success: true, data: newUser }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("admin-auth error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
