import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { email, password, role, first_name, last_name } = await req.json();

    // Find user by email
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const existingUser = users?.find((u: any) => u.email === email);

    if (existingUser) {
      // Update password
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
      });
      if (updateErr) throw updateErr;

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({ role, first_name, last_name })
        .eq("user_id", existingUser.id);

      return new Response(JSON.stringify({ success: true, action: "updated", user_id: existingUser.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      // Create new user
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, role },
      });
      if (createErr) throw createErr;

      if (newUser?.user?.id) {
        await supabaseAdmin
          .from("profiles")
          .update({ role, first_name, last_name })
          .eq("user_id", newUser.user.id);
      }

      return new Response(JSON.stringify({ success: true, action: "created", user_id: newUser?.user?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("create-demo-user error:", error);
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
