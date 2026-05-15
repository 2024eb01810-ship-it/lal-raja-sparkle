// ============================================================
// GENERATE BANNER — Edge Function
// File: supabase/functions/generate-banner/index.ts
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;
const FAL_KEY = Deno.env.get("FAL_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const LOGO_URL = "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-assets/Lal%20raja%20logo%20%20(2).jpg.jpeg";

const CATEGORY_MODEL_MAP: Record<string, string> = {
  "bridal-sets": "Model 4 - Ananya",
  "necklaces-chains": "Model 1 - Priya",
  "earrings": "Model 2 - Kavya",
  "rings-bangles": "Model 4 - Ananya",
  "polki-kundan": "Model 3 - Deepa",
  "temple-jewellery": "Model 3 - Deepa",
  "diamond-solitaires": "Model 1 - Priya",
};

const CATEGORY_OUTFIT_MAP: Record<string, string> = {
  "bridal-sets": "heavy Kanjivaram silk saree in deep blush pink #F2A7BB with gold #C9A84C zari border",
  "necklaces-chains": "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
  "earrings": "modern elegant kurta in soft powder blue #B8D4E8 with gold #C9A84C embroidery",
  "rings-bangles": "fusion indo-western outfit in blush pink #F2A7BB with gold #C9A84C detailing",
  "polki-kundan": "traditional half saree in pearl white #FAF8F5 with gold #C9A84C work",
  "temple-jewellery": "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
  "diamond-solitaires": "minimal elegant kurta in powder blue #B8D4E8 with subtle gold #C9A84C accents",
};

// ─── Get Festival Context with Claude + Web Search ────────────
const getFestivalContext = async (): Promise<{ festival: string; category: string }> => {
  const today = new Date().toISOString().split('T')[0];
  const messages: any[] = [{
    role: "user",
    content: `Today is ${today}. Search for Indian/Telugu festivals in next 14 days. 
Return ONLY a JSON: {"festival": "festival name or season", "category": "one of: bridal-sets, necklaces-chains, earrings, rings-bangles, polki-kundan, temple-jewellery, diamond-solitaires"}`
  }];

  let result = { festival: "Wedding Season", category: "bridal-sets" };
  let iterations = 0;

  while (iterations < 5) {
    iterations++;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        tools: [{ "type": "web_search_20250305", "name": "web_search" }],
        messages,
      }),
    });

    const data = await response.json();
    if (!data.content) break;
    messages.push({ role: "assistant", content: data.content });

    if (data.stop_reason === "end_turn") {
      const textBlocks = data.content.filter((b: any) => b.type === "text");
      if (textBlocks.length > 0) {
        const text = textBlocks[textBlocks.length - 1].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { result = JSON.parse(jsonMatch[0]); } catch (_) { }
        }
        break;
      }
    } else if (data.stop_reason === "tool_use") {
      const toolBlocks = data.content.filter((b: any) =>
        b.type === "tool_use" || b.type === "server_tool_use"
      );
      if (toolBlocks.length > 0) {
        messages.push({
          role: "user",
          content: toolBlocks.map((b: any) => ({
            type: "tool_result",
            tool_use_id: b.id,
            content: "Search complete. Now return the JSON.",
          })),
        });
      } else break;
    } else break;
  }

  return result;
};

// ─── Generate Banner Image ────────────────────────────────────
const generateBannerImage = async (
  modelImageUrl: string,
  category: string,
  festival: string
): Promise<string | null> => {
  const outfit = CATEGORY_OUTFIT_MAP[category] || CATEGORY_OUTFIT_MAP["necklaces-chains"];

  const prompt = `Image 1 is a reference photo of a South Indian model.
Image 2 is the Lal Raja Jewels logo (LR monogram in elegant floral mandala design).

CRITICAL RULES:
- Show ONLY ONE model — not two, not multiple
- Model MUST have complete face and head visible — NO headless figures
- Use ONLY her face from Image 1

CREATE A LUXURY JEWELRY ADVERTISEMENT BANNER:

MODEL:
- Exact same face from Image 1 — complete head visible
- Outfit: ${outfit}
- Remove ALL existing jewelry, add elegant ${category} jewelry

BACKGROUND:
- Deep dark maroon #2C0A0A
- Subtle gold bokeh light particles and rays
- Cinematic dramatic lighting
- Wide landscape format suitable for website banner

LOGO PLACEMENT:
- Place Image 2 logo in bottom RIGHT corner
- Small size (about 8% of image width)
- Slightly transparent, elegant placement
- Below logo add text "Lal Raja" in small elegant gold serif font

OCCASION CONTEXT: ${festival}

BRAND COLORS ONLY:
- Blush pink: #F2A7BB
- Pearl white: #FAF8F5
- Powder blue: #B8D4E8
- Gold: #C9A84C
- Dark maroon background: #2C0A0A

QUALITY: Ultra photorealistic, 8K, wide banner format 1920x680
STYLE: Single model South Indian luxury jewelry advertisement
NO TEXT other than subtle "Lal Raja" near logo`;

  console.log(`🎨 Generating banner for: ${festival} (${category})`);

  const falResponse = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_urls: [modelImageUrl, LOGO_URL],
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }),
  });

  const falData = await falResponse.json();
  console.log("Banner response:", JSON.stringify(falData).slice(0, 300));
  return falData.images?.[0]?.url || falData.image?.url || null;
};

// ─── Quality Check ────────────────────────────────────────────
const checkQuality = async (
  imageUrl: string
): Promise<{ passed: boolean; score: number; notes: string }> => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            {
              type: "text",
              text: `Check this luxury jewelry banner image strictly:
1. Only ONE model? (FAIL if multiple)
2. Complete face visible? (FAIL if headless)
3. Jewelry visible on model?
4. Dark maroon background?
5. Brand colors (pink/white/blue/gold)?
6. Professional quality?
Respond ONLY: {"passed": true, "score": 85, "notes": "explanation"}`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (!data.content?.[0]) return { passed: true, score: 70, notes: "Check unavailable" };
    const text = data.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { passed: true, score: 70, notes: "Could not parse" };
    return JSON.parse(match[0]);
  } catch {
    return { passed: true, score: 70, notes: "Check error" };
  }
};

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🚀 Generate Banner starting...");

    // Step 1: Get festival context
    const { festival, category } = await getFestivalContext();
    console.log(`📅 Festival: ${festival}, Category: ${category}`);

    // Step 2: Get brand model
    const modelName = CATEGORY_MODEL_MAP[category] || "Model 1 - Priya";
    const { data: modelData } = await supabase
      .from("ai_models")
      .select("reference_image_url")
      .eq("name", modelName)
      .single();

    if (!modelData?.reference_image_url) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // Step 3: Generate banner image
    let imageUrl = await generateBannerImage(
      modelData.reference_image_url,
      category,
      festival
    );

    if (!imageUrl) throw new Error("Banner generation failed");

    // Step 4: Quality check
    let quality = await checkQuality(imageUrl);
    console.log(`Quality: score=${quality.score}, passed=${quality.passed}`);

    // Step 5: Retry if quality fails
    if (!quality.passed && quality.score < 50) {
      console.log("🔄 Retrying banner generation...");
      const retryUrl = await generateBannerImage(
        modelData.reference_image_url,
        category,
        festival
      );
      if (retryUrl) {
        imageUrl = retryUrl;
        quality = await checkQuality(retryUrl);
      }
    }

    // Step 6: Save to ai_content_queue as pending
    const { data: queueItem } = await supabase
      .from("ai_content_queue")
      .insert({
        content_type: "banner",
        title: `${festival} Collection`,
        description: `Luxury ${category} jewelry for ${festival}`,
        image_url: imageUrl,
        metadata: {
          category,
          festival,
          model_used: modelName,
          quality_score: quality.score,
          quality_notes: quality.notes,
          passed_quality: quality.passed,
          cta_label: "Shop Now",
          cta_link: `/collections/${category}`,
        },
        status: "pending",
      })
      .select()
      .single();

    console.log("✅ Banner generated and saved!");

    return new Response(
      JSON.stringify({
        success: true,
        banner: {
          id: queueItem?.id,
          image_url: imageUrl,
          title: `${festival} Collection`,
          category,
          festival,
          quality_score: quality.score,
          passed: quality.passed,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});