import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, queryType, tenantId, userRole, isSuperAdmin } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          response: "AI Assistant is not properly configured. Please contact your administrator to set up the OpenAI API key.",
          data_sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine data access scope
    const isClinicLevel = !isSuperAdmin && tenantId;
    const isCorporateLevel = isSuperAdmin;

    // Build context about available data
    let contextData = '';
    let dataSources: string[] = [];

    if (queryType === 'data' || queryType === 'analytics') {
      // Fetch relevant data based on query type and access level
      if (isClinicLevel) {
        // Clinic-level data access
        const { data: patients, error: patientsError } = await supabase
          .from('patients')
          .select('id, first_name, last_name, created_at')
          .eq('tenant_id', tenantId)
          .limit(10);

        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, title, appointment_date, status')
          .eq('tenant_id', tenantId)
          .limit(10);

        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, total, status, issued_at')
          .eq('tenant_id', tenantId)
          .limit(10);

        if (patients) {
          contextData += `Recent Patients (${patients.length}): ${JSON.stringify(patients)}\n`;
          dataSources.push('Patients');
        }
        if (appointments) {
          contextData += `Recent Appointments (${appointments.length}): ${JSON.stringify(appointments)}\n`;
          dataSources.push('Appointments');
        }
        if (invoices) {
          contextData += `Recent Invoices (${invoices.length}): ${JSON.stringify(invoices)}\n`;
          dataSources.push('Invoices');
        }
      } else if (isCorporateLevel) {
        // Corporate-level data access
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, name, clinic_code')
          .limit(20);

        const { data: corporateInvoices, error: corpInvoicesError } = await supabase
          .from('invoices')
          .select('id, total, status, issued_at, tenant_id')
          .limit(50);

        if (tenants) {
          contextData += `Clinics in Corporation (${tenants.length}): ${JSON.stringify(tenants)}\n`;
          dataSources.push('Clinics');
        }
        if (corporateInvoices) {
          contextData += `Corporate Invoices (${corporateInvoices.length}): ${JSON.stringify(corporateInvoices)}\n`;
          dataSources.push('Corporate Invoices');
        }
      }
    }

    // Create system prompt based on access level and data
    const systemPrompt = `You are an AI assistant for a dental practice management system. 

User Role: ${userRole}
Access Level: ${isSuperAdmin ? 'Corporate (all clinics)' : 'Clinic (single clinic)'}
Query Type: ${queryType}

Available data context:
${contextData}

FORMATTING GUIDELINES:
- Use clear, professional language
- Present data in structured formats (bullet points, numbered lists)
- Include only relevant information
- Use emojis sparingly for key metrics only
- Format numbers clearly (e.g., "10 patients" not just "10")
- Group related information together
- Provide actionable insights, not just data dumps
- Keep responses concise but comprehensive

RESPONSE STRUCTURE:
1. Start with a clear summary
2. Present key metrics in bullet points
3. Include brief insights or trends
4. End with actionable recommendations (if relevant)

Please provide helpful, well-formatted responses about dental practice data:
- For data queries: Present clear metrics and key findings
- For analytics queries: Show trends, patterns, and insights
- For general queries: Provide structured guidance
- Always focus on actionable information
- Remove redundant or obvious details

Keep responses professional, well-organized, and focused on dental practice management.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        data_sources: dataSources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm experiencing technical difficulties. Please try again later.",
        data_sources: [],
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});