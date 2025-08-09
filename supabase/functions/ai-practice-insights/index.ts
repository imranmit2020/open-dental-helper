import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { tenantId, timeRange, revenue, invoiceCount, appointmentsCount } = await req.json();

    const prompt = `You are a dental practice analytics assistant. Given recent metrics, produce concise, actionable insights.
Return JSON with an "insights" array of 3-5 items. Each item should include: title, description, priority_level (low|medium|high), actionable_items (array of strings).

Context:
- Tenant ID: ${tenantId}
- Time Range: ${timeRange}
- Revenue: ${revenue}
- Invoices: ${invoiceCount}
- Appointments: ${appointmentsCount}
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
          { role: 'system', content: 'You generate actionable, concise practice management recommendations in JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    let content = '';
    try {
      content = data.choices?.[0]?.message?.content || '';
    } catch (_) { /* ignore */ }

    let insights = [] as any[];
    try {
      const parsed = JSON.parse(content);
      insights = parsed.insights || [];
    } catch (_) {
      // fallback: try to extract JSON blob
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          insights = parsed.insights || [];
        } catch (_) {}
      }
    }

    return new Response(JSON.stringify({ insights }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('AI insights error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
