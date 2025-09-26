import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action, specialty = 'general dentistry' } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'complete':
        systemPrompt = `You are an AI assistant specialized in dental documentation. You help complete clinical notes with accurate, professional medical terminology. Focus on ${specialty}. Provide concise, medically accurate completions that follow standard dental charting practices.`;
        userPrompt = `Complete this dental documentation: "${text}"

Provide a natural continuation that includes relevant clinical details, treatments, or observations. Keep it professional and use appropriate dental terminology.`;
        break;

      case 'suggest':
        systemPrompt = `You are an AI assistant that provides dental documentation templates and suggestions. You specialize in ${specialty} and provide structured, professional templates.`;
        userPrompt = `Generate 3 professional documentation templates or suggestions based on: "${text}"

Format each suggestion clearly with proper medical terminology. Include sections like Chief Complaint, Clinical Findings, Treatment Plan, etc. where appropriate.`;
        break;

      case 'improve':
        systemPrompt = `You are an AI assistant that improves dental documentation quality. You enhance clarity, medical accuracy, and professional terminology while maintaining the original meaning.`;
        userPrompt = `Improve this dental documentation for clarity and professionalism: "${text}"

Enhance the language, add relevant medical terminology, and ensure it follows standard dental documentation practices.`;
        break;

      case 'template':
        systemPrompt = `You are an AI assistant that creates comprehensive dental documentation templates. You provide structured, professional templates for ${specialty}.`;
        userPrompt = `Create a comprehensive documentation template for: "${text}"

Include all relevant sections such as:
- Chief Complaint
- Medical/Dental History
- Clinical Examination
- Radiographic Findings
- Diagnosis
- Treatment Plan
- Prognosis
- Follow-up

Use professional dental terminology and maintain clinical standards.`;
        break;

      default:
        systemPrompt = `You are an AI assistant specialized in dental documentation. You help with various documentation tasks including completion, suggestions, and improvements.`;
        userPrompt = `Help with this dental documentation task: "${text}"`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        result,
        action,
        original_text: text
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart Documentation error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process documentation request",
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});