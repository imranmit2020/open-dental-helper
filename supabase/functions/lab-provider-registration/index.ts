import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...data } = await req.json();

    switch (action) {
      case 'verify_account': {
        const { lab_provider_account_id, verification_token } = data;
        
        // Verify the token and activate the account
        const { data: verification, error: verifyError } = await supabase
          .from('lab_provider_email_verifications')
          .select('*')
          .eq('verification_token', verification_token)
          .eq('lab_provider_account_id', lab_provider_account_id)
          .is('verified_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (verifyError || !verification) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired verification token' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark as verified
        await supabase
          .from('lab_provider_email_verifications')
          .update({ verified_at: new Date().toISOString() })
          .eq('id', verification.id);

        // Update lab provider account status
        await supabase
          .from('lab_provider_accounts')
          .update({ 
            verification_status: 'verified',
            status: 'active'
          })
          .eq('id', lab_provider_account_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Account verified successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'resend_verification': {
        const { email } = data;
        
        // Find the lab provider account
        const { data: account, error: accountError } = await supabase
          .from('lab_provider_accounts')
          .select('*')
          .eq('email', email)
          .eq('verification_status', 'unverified')
          .single();

        if (accountError || !account) {
          return new Response(
            JSON.stringify({ error: 'Account not found or already verified' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate new verification token
        const verificationToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

        // Store verification record
        await supabase
          .from('lab_provider_email_verifications')
          .insert({
            lab_provider_account_id: account.id,
            user_id: account.user_id,
            verification_token: verificationToken,
            email: email,
            expires_at: expiresAt.toISOString()
          });

        // Here you would send the email with the verification link
        // For now, we'll just return the token (in production, send via email service)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification email sent',
            verification_link: `${Deno.env.get('SUPABASE_URL')}/functions/v1/lab-provider-registration?action=verify_account&token=${verificationToken}&account_id=${account.id}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_status': {
        const { email } = data;
        
        const { data: account, error } = await supabase
          .from('lab_provider_accounts')
          .select('status, verification_status, company_name')
          .eq('email', email)
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Account not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ account }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});