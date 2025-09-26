import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  email: string;
  name: string;
  role: string;
  clinicName: string;
  loginUrl: string;
}

const getOnboardingContent = (role: string) => {
  const content = {
    dentist: {
      title: "Welcome to Your Clinical Practice Platform",
      description: "Access advanced diagnostic tools, patient charting, and treatment planning features designed specifically for dental professionals.",
      keyFeatures: [
        "Digital Patient Charting & Records",
        "X-Ray Diagnostics & Analysis", 
        "Treatment Plan Generator",
        "Appointment Scheduling"
      ]
    },
    hygienist: {
      title: "Your Preventive Care Management Hub", 
      description: "Streamline patient communication, track preventive care protocols, and manage your schedule efficiently.",
      keyFeatures: [
        "Patient Communication Tools",
        "Preventive Care Tracking",
        "Schedule Management",
        "Patient Education Resources"
      ]
    },
    staff: {
      title: "Front Desk & Practice Operations Center",
      description: "Manage appointments, patient records, billing, and communication all from one integrated platform.",
      keyFeatures: [
        "Patient Check-in & Registration",
        "Appointment Scheduling",
        "Insurance & Billing Management", 
        "Patient Communication"
      ]
    },
    admin: {
      title: "Practice Management & Analytics Dashboard",
      description: "Comprehensive tools for practice analytics, user management, compliance, and system configuration.",
      keyFeatures: [
        "Practice Analytics & Reporting",
        "User & Role Management", 
        "Compliance & Security Tools",
        "System Configuration"
      ]
    }
  };
  
  return content[role as keyof typeof content] || content.staff;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, role, clinicName, loginUrl }: OnboardingEmailRequest = await req.json();
    
    const onboardingData = getOnboardingContent(role);
    const onboardingUrl = `${new URL(loginUrl).origin}/employee-onboarding?role=${role}`;
    
    const featuresHtml = onboardingData.keyFeatures
      .map(feature => `<li style="margin: 8px 0; color: #374151;">${feature}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${clinicName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Welcome to ${clinicName}!</h1>
            <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">You're joining as a ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We're excited to have you join our team! Your account has been set up and you now have access to our comprehensive practice management platform.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px;">${onboardingData.title}</h3>
              <p style="color: #4b5563; margin: 0 0 15px; font-size: 14px;">${onboardingData.description}</p>
              
              <h4 style="color: #1f2937; margin: 15px 0 10px; font-size: 16px;">Key Features for Your Role:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${featuresHtml}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                Access Your Account
              </a>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #065f46; margin: 0 0 15px; font-size: 16px;">🚀 Get Started with Onboarding</h4>
              <p style="color: #047857; margin: 0 0 15px; font-size: 14px;">
                Complete your personalized onboarding process to get familiar with the platform:
              </p>
              <a href="${onboardingUrl}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                Start Onboarding Process
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #92400e; margin: 0 0 15px; font-size: 16px;">📚 Learning Resources</h4>
              <p style="color: #b45309; margin: 0 0 15px; font-size: 14px;">Explore these resources to master the platform:</p>
              
              <div style="margin: 15px 0;">
                <a href="https://www.youtube.com/playlist?list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO" style="display: inline-block; color: #dc2626; text-decoration: none; font-weight: 500; margin-right: 20px;">
                  🎥 Video Tutorials
                </a>
                <a href="#" style="display: inline-block; color: #dc2626; text-decoration: none; font-weight: 500; opacity: 0.5; cursor: not-allowed;">
                  📖 Documentation
                </a>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                <strong>Need Help?</strong><br>
                Contact your clinic administrator or supervisor if you have any questions about getting started.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0;">
                Welcome to the team!<br>
                <strong>${clinicName} Management</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: `Welcome to ${clinicName} - Your ${role.charAt(0).toUpperCase() + role.slice(1)} Account is Ready!`,
      html: html,
    });

    if (error) {
      console.error("Error sending onboarding email:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-employee-onboarding function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});