import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InstructionsRequest {
  treatmentCodes: string[];
  appointmentType: string;
  patientName: string;
  visitNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Generate visit instructions function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      treatmentCodes,
      appointmentType,
      patientName,
      visitNotes
    }: InstructionsRequest = await req.json();

    console.log('Generating instructions for treatments:', treatmentCodes);

    // Create context for AI
    const treatmentContext = treatmentCodes.map(code => {
      const treatments: { [key: string]: string } = {
        'D0150': 'Comprehensive oral evaluation',
        'D1110': 'Prophylaxis - adult cleaning',
        'D2140': 'Amalgam filling - one surface',
        'D2150': 'Amalgam filling - two surfaces', 
        'D2740': 'Crown - porcelain/ceramic',
        'D3220': 'Therapeutic pulpotomy',
        'D7140': 'Tooth extraction',
        'D9110': 'Emergency dental pain treatment'
      };
      return `${code}: ${treatments[code] || 'Dental procedure'}`;
    }).join(', ');

    const prompt = `
Generate professional, comprehensive post-visit care instructions for a dental patient named ${patientName}.

Treatment Details:
- Appointment Type: ${appointmentType}
- Procedures Performed: ${treatmentContext}
${visitNotes ? `- Additional Notes: ${visitNotes}` : ''}

Please provide detailed post-visit instructions that include:
1. Immediate care instructions (first 24-48 hours)
2. Pain management recommendations
3. Diet restrictions and recommendations
4. Oral hygiene instructions specific to the treatments
5. Warning signs to watch for
6. Follow-up care guidelines
7. When to contact the office

Format the response in clear, patient-friendly language with bullet points and sections. Be specific to the treatments performed.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a dental care specialist creating personalized post-visit instructions. Provide clear, professional, and comprehensive care guidance.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const instructions = data.choices[0].message.content;

    console.log('Instructions generated successfully');

    return new Response(
      JSON.stringify({ 
        instructions,
        generatedAt: new Date().toISOString(),
        treatmentsIncluded: treatmentCodes
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-visit-instructions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackInstructions: `
## Post-Visit Care Instructions for ${patientName || 'Patient'}

### Immediate Care (First 24-48 Hours)
• Apply ice pack to face for 15-20 minutes if experiencing swelling
• Take prescribed medications as directed
• Avoid hot foods and beverages for the first day

### Pain Management
• Over-the-counter pain relievers (ibuprofen, acetaminophen) as needed
• Follow dosage instructions on medication labels
• Contact office if pain worsens or persists beyond 2-3 days

### Diet Recommendations
• Soft foods for the first few days
• Avoid sticky, hard, or crunchy foods
• Stay hydrated with room temperature liquids

### Oral Hygiene
• Gentle brushing around treated areas
• Rinse with warm salt water 2-3 times daily
• Avoid vigorous rinsing for 24 hours

### Warning Signs - Contact Our Office If You Experience:
• Severe or worsening pain
• Excessive bleeding
• Signs of infection (fever, swelling, pus)
• Numbness that persists beyond expected time

### Follow-up Care
• Return for scheduled follow-up appointments
• Contact office with any questions or concerns

Office Number: (555) 123-4567
        `
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);