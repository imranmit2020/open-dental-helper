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
    const { medicalHistory, analysisType = 'comprehensive', patientAge } = await req.json();

    if (!medicalHistory?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Medical history is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ageContext = patientAge ? `Patient age: ${patientAge} years old.` : '';
    
    const prompt = `As a dental medical assistant AI, analyze the following patient medical history and provide comprehensive insights:

${ageContext}
Medical History: ${medicalHistory}

Please provide:
1. Risk Assessment: Identify any dental/medical risk factors
2. Allergies & Contraindications: Note any allergies or medication contraindications for dental treatment
3. Treatment Considerations: Special considerations for dental procedures
4. Recommendations: Preventive care suggestions and follow-up recommendations
5. Red Flags: Any concerning conditions requiring immediate attention

Format your response in a clear, professional manner suitable for dental staff. Focus on dental implications of the medical conditions mentioned.`;

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
            content: 'You are an experienced dental medical assistant AI specialized in analyzing patient medical histories for dental treatment planning. Provide accurate, professional, and clinically relevant analysis.' 
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
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-medical-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});