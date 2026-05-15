// ============================================================
// ANALYZE JEWELRY — Edge Function
// File: supabase/functions/analyze-jewelry/index.ts
// Analyzes a raw jewelry photo and returns product details
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;

// ─── Main Handler ─────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { image_url } = body;

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: "image_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔍 Analyzing jewelry image:", image_url.slice(0, 80));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: image_url },
            },
            {
              type: "text",
              text: `You are an expert jewelry analyst for Lal Raja Gold And Diamond Jewellery, 
a luxury South Indian jewelry store in Vijayawada, Andhra Pradesh.

Analyze this jewelry image carefully and extract all details.

Respond ONLY with a JSON object, no markdown, no explanation:

{
  "product_name": "Specific descriptive name (e.g. 'Lakshmi Temple Haaram', 'Polki Kundan Choker Set')",
  "category_slug": "one of exactly: bridal-sets, necklaces-chains, earrings, rings-bangles, polki-kundan, temple-jewellery, diamond-solitaires",
  "metal": "one of: 22K Gold, 18K Gold, 18K White Gold, Diamond, Silver, Platinum",
  "weight_grams": estimated weight as number or null,
  "stones": "comma separated stones visible e.g. 'Ruby, Emerald, Pearl' or null if none",
  "occasion": "one of: Wedding, Festive, Daily, Engagement, Anniversary",
  "description": "2-3 sentence luxury product description mentioning design style, craftsmanship, occasion suitability",
  "jewelry_description": "Very detailed technical description for AI image generation: exact type, metal color, stone colors, design motifs, size, how it sits on body",
  "design_style": "one of: Temple, Kundan, Polki, Modern, Antique, Diamond, Plain Gold",
  "price_min": estimated minimum price in INR as number,
  "price_max": estimated maximum price in INR as number,
  "confidence": 0-100 confidence score of analysis
}

Price estimation guide (INR):
- Plain gold small pieces: 15000-50000
- Temple jewelry medium: 50000-200000  
- Heavy bridal sets: 200000-800000
- Diamond pieces: 50000-500000
- Polki/Kundan sets: 100000-400000`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    console.log("Claude response status:", response.status);

    if (!data.content?.[0]) {
      throw new Error(`Claude API failed: ${JSON.stringify(data)}`);
    }

    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(`No JSON in response: ${text.slice(0, 200)}`);
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log("✅ Analysis complete:", analysis.product_name);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});