import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { procedure, toothNumber, priority, patientContext, chartingHistory } = await req.json();

    const prompt = `Generate comprehensive treatment notes for a dental procedure:

Patient Context: ${patientContext || 'Standard patient'}
Tooth Number: ${toothNumber}
Procedure: ${procedure}
Priority: ${priority}
Previous Charting: ${chartingHistory || 'No previous charting available'}

Generate detailed, professional treatment notes that include:
1. Clinical assessment and findings
2. Treatment rationale
3. Procedure considerations
4. Post-treatment care instructions
5. Follow-up recommendations

Keep the notes professional, concise, and clinically relevant. Format as a structured note suitable for dental records.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an experienced dental professional generating clinical treatment notes. Provide accurate, professional, and clinically relevant notes for dental procedures.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedNotes = data.choices[0].message.content;

    return new Response(JSON.stringify({ notes: generatedNotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-treatment-notes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});