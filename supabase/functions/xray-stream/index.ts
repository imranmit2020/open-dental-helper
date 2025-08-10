import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, analysisType = "comprehensive" } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a streaming vision request to OpenAI with structured DETECTION events
    const systemPrompt = `You are a board-certified dental radiography assistant.
Stream concise, clinically useful observations.
Output newline-delimited JSON lines prefixed with DETECTION: for each region you detect.
Additionally, output DETECTION_POLY: lines when the region is better represented as a polygon.
Detection JSON schema (rect):
{"id":"string","label":"cavity|fracture|root_infection|bone_loss|oral_lesion|periodontal","confidence":0-1,"severity":"low|medium|high|critical","rect":{"x":0-1,"y":0-1,"width":0-1,"height":0-1}}
Detection JSON schema (poly):
{"id":"string","label":"...","confidence":0-1,"severity":"...","poly":[{"x":0-1,"y":0-1},...]}
Coordinates MUST be normalized (0..1) relative to the input image.
Also interleave brief natural-language insight lines (prefix TEXT:) to explain rationale.
Finish with one TEXT: SUMMARY line.`;

    const userText = `Analyze this dental image with focus: ${analysisType}.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        stream: true,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      const errTxt = await response.text();
      console.error("OpenAI error:", errTxt);
      return new Response(JSON.stringify({ error: "Upstream error", details: errTxt }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Proxy the SSE stream back to the client with proper CORS
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("xray-stream error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error", details: `${error}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
