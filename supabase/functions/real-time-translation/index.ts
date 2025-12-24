import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const medicalTerms = {
  en: ['anesthesia', 'cavity', 'crown', 'filling', 'fluoride', 'gingivitis', 'implant', 'molar', 'periodontitis', 'root canal', 'tartar', 'veneer', 'x-ray'],
  es: ['anestesia', 'caries', 'corona', 'empaste', 'flúor', 'gingivitis', 'implante', 'molar', 'periodontitis', 'endodoncia', 'sarro', 'carilla', 'radiografía'],
  fr: ['anesthésie', 'carie', 'couronne', 'plombage', 'fluor', 'gingivite', 'implant', 'molaire', 'parodontite', 'canal radiculaire', 'tartre', 'facette', 'radiographie'],
  de: ['Anästhesie', 'Karies', 'Krone', 'Füllung', 'Fluorid', 'Gingivitis', 'Implantat', 'Backenzahn', 'Parodontitis', 'Wurzelkanal', 'Zahnstein', 'Veneer', 'Röntgen'],
  it: ['anestesia', 'carie', 'corona', 'otturazione', 'fluoro', 'gengivite', 'impianto', 'molare', 'parodontite', 'canale radicolare', 'tartaro', 'faccetta', 'radiografia'],
  pt: ['anestesia', 'cárie', 'coroa', 'obturação', 'flúor', 'gengivite', 'implante', 'molar', 'periodontite', 'canal radicular', 'tártaro', 'faceta', 'raio-x']
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { text, targetLanguage, sourceLanguage, isMedical = false } = await req.json();

    if (!text?.trim()) {
      throw new Error('Text is required');
    }

    const systemPrompt = isMedical 
      ? `You are a professional medical translator specializing in dental and healthcare terminology. 
         Translate the following text accurately while preserving medical terms and adding cultural context when appropriate.
         Maintain the original meaning and tone while ensuring cultural sensitivity.
         If translating to Spanish, consider regional variations and formal medical language.
         Medical terms to preserve: ${(medicalTerms as any)[targetLanguage] ? (medicalTerms as any)[targetLanguage].join(', ') : 'general medical terminology'}`
      : `You are a professional translator. Translate the following text accurately while maintaining the original meaning and tone.
         Be culturally sensitive and use appropriate language for the target region.`;

    const userPrompt = sourceLanguage && sourceLanguage !== 'auto' 
      ? `Translate from ${sourceLanguage} to ${targetLanguage}: "${text}"`
      : `Translate to ${targetLanguage}: "${text}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    // Language detection (simple heuristic)
    const detectedLanguage = sourceLanguage && sourceLanguage !== 'auto' 
      ? sourceLanguage 
      : detectLanguage(text);

    // Check if medical terms are preserved
    const medicalTermsPreserved = isMedical ? checkMedicalTerms(text, translatedText, targetLanguage) : true;

    // Confidence score based on text length and complexity
    const confidence = calculateConfidence(text, translatedText);

    return new Response(JSON.stringify({
      translatedText,
      confidence,
      detectedLanguage,
      medicalTermsPreserved,
      processingTime: Date.now()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      translatedText: '',
      confidence: 0,
      detectedLanguage: 'unknown',
      medicalTermsPreserved: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function detectLanguage(text: string): string {
  const patterns = {
    'es': /\b(el|la|los|las|y|de|en|un|una|que|es|por|para|con|no|se|su|como|pero|todo|bien|más|muy|también|ya|solo|hasta|sobre|año|años|día|días|vez|hace|hacer|tiempo|vida|casa|país|mundo|parte|lugar|forma|caso|mano|momento|trabajo|ejemplo|hombre|mujer|niño|agua|otros|entre|menos|estado|cada|tanto|dar|ser|estar|tener|poder|parecer|venir|decir|deber|ir|saber|querer|llegar|pasar)\b/gi,
    'fr': /\b(le|la|les|et|de|en|un|une|que|est|pour|avec|ne|se|son|comme|mais|tout|bien|plus|très|aussi|déjà|seulement|jusqu|sur|année|années|jour|jours|fois|fait|faire|temps|vie|maison|pays|monde|partie|lieu|forme|cas|main|moment|travail|exemple|homme|femme|enfant|eau|autres|entre|moins|état|chaque|tant|donner|être|avoir|pouvoir|sembler|venir|dire|devoir|aller|savoir|vouloir|arriver|passer)\b/gi,
    'de': /\b(der|die|das|und|von|in|ein|eine|dass|ist|für|mit|nicht|sich|sein|wie|aber|alles|gut|mehr|sehr|auch|schon|nur|bis|über|jahr|jahre|tag|tage|mal|macht|machen|zeit|leben|haus|land|welt|teil|ort|form|fall|hand|moment|arbeit|beispiel|mann|frau|kind|wasser|andere|zwischen|weniger|staat|jeder|so|geben|sein|haben|können|scheinen|kommen|sagen|sollen|gehen|wissen|wollen|ankommen|passieren)\b/gi,
    'it': /\b(il|la|le|e|di|in|un|una|che|è|per|con|non|si|suo|come|ma|tutto|bene|più|molto|anche|già|solo|fino|su|anno|anni|giorno|giorni|volta|fa|fare|tempo|vita|casa|paese|mondo|parte|luogo|forma|caso|mano|momento|lavoro|esempio|uomo|donna|bambino|acqua|altri|tra|meno|stato|ogni|tanto|dare|essere|avere|potere|sembrare|venire|dire|dovere|andare|sapere|volere|arrivare|passare)\b/gi,
    'pt': /\b(o|a|os|as|e|de|em|um|uma|que|é|para|com|não|se|seu|como|mas|tudo|bem|mais|muito|também|já|só|até|sobre|ano|anos|dia|dias|vez|faz|fazer|tempo|vida|casa|país|mundo|parte|lugar|forma|caso|mão|momento|trabalho|exemplo|homem|mulher|criança|água|outros|entre|menos|estado|cada|tanto|dar|ser|ter|poder|parecer|vir|dizer|dever|ir|saber|querer|chegar|passar)\b/gi
  };

  let maxMatches = 0;
  let detectedLang = 'en';

  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern)?.length || 0;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedLang = lang;
    }
  }

  return detectedLang;
}

function checkMedicalTerms(original: string, translated: string, targetLanguage: string): boolean {
  const targetMedicalTerms = (medicalTerms as any)[targetLanguage] || [];
  if (targetMedicalTerms.length === 0) return true;

  // Simple check if medical terms are present in translation
  const foundTerms = targetMedicalTerms.filter((term: any) => 
    translated.toLowerCase().includes(term.toLowerCase())
  );

  return foundTerms.length > 0 || original.length < 50; // Short texts get benefit of doubt
}

function calculateConfidence(original: string, translated: string): number {
  // Base confidence on text length ratio and basic quality indicators
  const lengthRatio = Math.min(translated.length / original.length, original.length / translated.length);
  const baseConfidence = 0.7 + (lengthRatio * 0.2);
  
  // Adjust for obvious quality indicators
  if (translated.includes('...') || translated.includes('[') || translated.includes('ERROR')) {
    return Math.max(baseConfidence - 0.3, 0.3);
  }
  
  return Math.min(baseConfidence + 0.1, 0.95);
}