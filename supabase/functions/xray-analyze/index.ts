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

    const systemPrompt = `You are a board-certified dental radiography assistant. Return STRICT JSON only matching this schema in camelCase. Do not include any extra text.`;

    const schema = {
      type: "object",
      properties: {
        id: { type: "string" },
        imageUrl: { type: "string" },
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { enum: ["cavity","fracture","root_infection","bone_density","oral_cancer","periodontal_disease"] },
              confidence: { type: "number" }, // 0-100 preferred (accept 0-1)
              severity: { enum: ["low","medium","high","critical"] },
              location: { type: "string" },
              description: { type: "string" },
              coordinates: {
                type: "object",
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" },
                },
                required: ["x","y","width","height"],
              },
              treatmentSuggestion: { type: "string" },
              urgency: { enum: ["routine","soon","urgent","emergency"] },
              patientExplanation: { type: "string" },
              followUpNeeded: { type: "boolean" },
            },
            required: ["id","type","confidence","severity","location","description","coordinates","treatmentSuggestion","urgency","patientExplanation","followUpNeeded"],
          },
        },
        overallRiskScore: { type: "number" },
        boneDensityScore: { type: "number" },
        oralHealthGrade: { type: "string" },
        recommendations: { type: "array", items: { type: "string" } },
        treatmentPlan: { type: "array", items: { type: "string" } },
        patientSummary: { type: "string" },
        secondOpinionRequired: { type: "boolean" },
        aiModel: { type: "string" },
      },
      required: ["id","imageUrl","findings","overallRiskScore","boneDensityScore","oralHealthGrade","recommendations","treatmentPlan","patientSummary","secondOpinionRequired","aiModel"],
    } as const;

    const userText = `Analyze this dental image with focus: ${analysisType}. IMPORTANT: coordinates MUST be normalized to 0..1 (not pixels). Confidence should be 0..100 if possible (0..1 acceptable).`;

    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "xray_analysis",
            schema,
            strict: true,
          },
        },
      }),
    });

    if (!oaiRes.ok) {
      const errTxt = await oaiRes.text();
      console.error("OpenAI error:", errTxt);
      return new Response(JSON.stringify({ error: "Upstream error", details: errTxt }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await oaiRes.json();
    const msg = json.choices?.[0]?.message;
    const content = msg?.content;

    let parsed: any = null;
    try {
      if (typeof content === "string") {
        parsed = JSON.parse(content);
      } else if (Array.isArray(content)) {
        const schemaPart = content.find((p: any) => p?.type === "output_json_schema" && p?.json);
        if (schemaPart?.json) {
          parsed = schemaPart.json;
        } else {
          const textPart = content.find((p: any) => typeof p === "string" || p?.type === "text");
          const text = typeof textPart === "string" ? textPart : textPart?.text;
          if (text) parsed = JSON.parse(text);
        }
      } else if (content && typeof content === "object") {
        parsed = content;
      }
    } catch (e) {
      console.error("Failed to parse model JSON:", e, content);
      return new Response(JSON.stringify({ error: "Invalid model output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!parsed || typeof parsed !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid model output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Attach imageUrl and model, normalize ranges just in case
    parsed.imageUrl = imageUrl;
    parsed.aiModel = parsed.aiModel || "gpt-4o-mini";
    if (Array.isArray(parsed.findings)) {
      parsed.findings = parsed.findings.map((f: any) => ({
        ...f,
        confidence: f.confidence <= 1 ? Math.round(f.confidence * 100) : Math.round(f.confidence),
      }));
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("xray-analyze error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error", details: `${error}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
