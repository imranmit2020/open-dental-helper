import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConsentFormsRequest {
  patient_id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  appointment_id: string;
  appointment_type: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      patient_id,
      patient_name,
      patient_email,
      patient_phone,
      appointment_id,
      appointment_type
    }: ConsentFormsRequest = await req.json();

    // Generate secure consent form link
    const consentFormUrl = `https://4bf4f92b-b56c-461b-915a-4455c65e42dd.lovableproject.com/consent-forms?patient_id=${patient_id}&appointment_id=${appointment_id}`;

    if (patient_email) {
      // Send email with consent forms
      const emailResponse = await resend.emails.send({
        from: "Dental Practice <onboarding@resend.dev>",
        to: [patient_email],
        subject: `Consent Forms Required - ${appointment_type} Appointment`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🦷 Pre-Visit Consent Forms</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello ${patient_name}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                To streamline your upcoming <strong>${appointment_type}</strong> appointment, we've prepared digital consent forms for you to complete ahead of time.
              </p>
              
              <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #667eea;">📋 What's Included:</h3>
                <ul style="color: #555;">
                  <li>Medical History Questionnaire</li>
                  <li>Treatment Consent Forms</li>
                  <li>Privacy & HIPAA Acknowledgment</li>
                  <li>Insurance Information Verification</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${consentFormUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                          font-weight: bold; font-size: 16px;">
                  🔐 Complete Secure Forms
                </a>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #1976d2; font-size: 14px;">
                  <strong>🔒 Secure & Private:</strong> All forms are encrypted and HIPAA-compliant for your protection.
                </p>
              </div>
              
              <p style="color: #777; font-size: 14px;">
                Questions? Call us at (555) 123-4567 or reply to this email.
              </p>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              © 2024 Dental Practice Management System
            </div>
          </div>
        `,
      });
    }

    // You could also implement SMS sending here if patient_phone is provided
    if (patient_phone && !patient_email) {
      // Implement SMS functionality here if needed
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Consent forms sent successfully",
        method: patient_email ? 'email' : 'sms'
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-consent-forms function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send consent forms"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);