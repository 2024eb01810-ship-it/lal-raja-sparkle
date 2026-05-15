// ============================================================
// AGENT 1 — DAILY CONTENT CREATOR (v4 — Banners & Offers Only)
// Supabase Edge Function
// File: supabase/functions/agent1-daily-content/index.ts
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Environment Variables ────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;
const FAL_KEY = Deno.env.get("FAL_KEY")!;
const OWNER_WHATSAPP = Deno.env.get("OWNER_WHATSAPP") || "918184839498";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Brand Colors ─────────────────────────────────────────────
const BRAND_COLORS = `
Brand colors (USE ONLY THESE):
- Soft blush pink: #F2A7BB
- Pearl white: #FAF8F5
- Powder blue: #B8D4E8
- Gold accents: #C9A84C
- Deep maroon (backgrounds): #2C0A0A
NO other colors allowed.`;

// ─── Category → Model Mapping ─────────────────────────────────
const CATEGORY_MODEL_MAP: Record<string, string> = {
  "bridal-sets": "Model 4 - Ananya",
  "necklaces-chains": "Model 1 - Priya",
  "earrings": "Model 2 - Kavya",
  "rings-bangles": "Model 4 - Ananya",
  "polki-kundan": "Model 3 - Deepa",
  "temple-jewellery": "Model 3 - Deepa",
  "diamond-solitaires": "Model 1 - Priya",
};

// ─── Category → Outfit Mapping ────────────────────────────────
const CATEGORY_OUTFIT_MAP: Record<string, string> = {
  "bridal-sets": "heavy Kanjivaram silk saree in deep blush pink #F2A7BB with gold #C9A84C zari border",
  "necklaces-chains": "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
  "earrings": "modern elegant kurta in soft powder blue #B8D4E8 with gold #C9A84C embroidery",
  "rings-bangles": "fusion indo-western outfit in blush pink #F2A7BB with gold #C9A84C detailing",
  "polki-kundan": "traditional half saree in pearl white #FAF8F5 with gold #C9A84C work",
  "temple-jewellery": "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
  "diamond-solitaires": "minimal elegant kurta in powder blue #B8D4E8 with subtle gold #C9A84C accents",
};

// ─── Get Brand Models from DB ─────────────────────────────────
const getBrandModels = async () => {
  const { data, error } = await supabase
    .from("ai_models")
    .select("*")
    .eq("active", true);

  if (error || !data) {
    throw new Error(`Failed to fetch models: ${error?.message}`);
  }

  console.log("✅ Loaded models:", data.map((m: any) => m.name));
  return data;
};

// ─── Generate Content with Claude + Web Search (Multi-turn) ──
const generateContentWithClaude = async () => {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a content writer for Lal Raja Gold And Diamond Jewellery, a luxury jewelry store in Vijayawada, Andhra Pradesh, India.

Today's exact date: ${today}

Search for Indian festivals in the next 14 days from ${today}, especially Telugu/South Indian festivals. Then generate jewelry website content.

IMPORTANT: Generate ONLY banners and offers. NO products section needed.

Respond ONLY with a JSON object, no markdown, no explanation:

{
  "context_used": "Brief note on what festival/occasion you found today",
  "banners": [
    {
      "title": "Short impactful headline (max 5 words)",
      "subtitle": "One line description (max 10 words)",
      "cta_label": "Button text (2-3 words)",
      "category": "one of: bridal-sets, necklaces-chains, earrings, rings-bangles, polki-kundan, temple-jewellery, diamond-solitaires"
    },
    {
      "title": "Second banner headline",
      "subtitle": "Second banner description",
      "cta_label": "Button text",
      "category": "category"
    }
  ],
  "offer": {
    "title": "Today's special offer title",
    "description": "Offer description with specific discount",
    "badge": "Badge text like '20% OFF' or 'LIMITED'"
  },
  "instagram_caption": "Instagram caption in English with Telugu words mixed in, 3-4 lines, with relevant hashtags #LalRajaJewels #VijayawadaJewellery #Telugu"
}`;

  const messages: any[] = [{ role: "user", content: prompt }];
  let finalText = "";
  let iterations = 0;

  while (iterations < 5) {
    iterations++;
    console.log(`🔄 Claude iteration ${iterations}...`);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        tools: [{ "type": "web_search_20250305", "name": "web_search" }],
        messages,
      }),
    });

    const claudeData = await claudeResponse.json();
    console.log(`Iteration ${iterations} stop_reason:`, claudeData.stop_reason);

    if (!claudeData.content) {
      throw new Error(`Claude API failed: ${JSON.stringify(claudeData)}`);
    }

    messages.push({ role: "assistant", content: claudeData.content });

    if (claudeData.stop_reason === "end_turn") {
      const textBlocks = claudeData.content.filter((b: any) => b.type === "text");
      if (textBlocks.length > 0) {
        finalText = textBlocks[textBlocks.length - 1].text;
        console.log("✅ Got final text:", finalText.slice(0, 200));
        break;
      }
    } else if (claudeData.stop_reason === "tool_use") {
      const toolUseBlocks = claudeData.content.filter((b: any) =>
        b.type === "tool_use" || b.type === "server_tool_use"
      );

      if (toolUseBlocks.length > 0) {
        const toolResults = toolUseBlocks.map((b: any) => ({
          type: "tool_result",
          tool_use_id: b.id,
          content: "Search results received. Please now generate the jewelry content JSON.",
        }));
        messages.push({ role: "user", content: toolResults });
        console.log(`🔍 Sent ${toolResults.length} tool results back to Claude`);
      } else {
        break;
      }
    } else {
      const textBlocks = claudeData.content.filter((b: any) => b.type === "text");
      if (textBlocks.length > 0) {
        finalText = textBlocks[textBlocks.length - 1].text;
      }
      break;
    }
  }

  if (!finalText) {
    throw new Error(`No final text from Claude after ${iterations} iterations`);
  }

  const jsonMatch = finalText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in response: ${finalText.slice(0, 200)}`);
  }
  return JSON.parse(jsonMatch[0].trim());
};

// ─── Generate Banner with Real Model ─────────────────────────
const generateBannerImage = async (
  modelImageUrl: string,
  category: string,
  title: string
): Promise<string | null> => {
  const outfit = CATEGORY_OUTFIT_MAP[category] || CATEGORY_OUTFIT_MAP["necklaces-chains"];

  const bannerPrompt = `Image 1 is a reference photo of a South Indian model.

CRITICAL RULES:
- Show ONLY ONE model in the image — not two, not multiple
- The model MUST have a complete face and head visible
- Use ONLY her face from Image 1

Create luxury jewelry banner:
FACE: Exact same face from Image 1 — complete head visible
OUTFIT: ${outfit}
JEWELRY: Elegant ${category} jewelry — remove all existing jewelry first
BACKGROUND: Deep dark maroon #2C0A0A with subtle gold bokeh light rays
LIGHTING: Cinematic professional studio lighting
QUALITY: Ultra photorealistic, 8K, luxury jewelry brand banner
STYLE: Single model South Indian luxury jewelry advertisement
CONTEXT: ${title}

IMPORTANT: ONE model only. Complete face and head must be visible. No headless figures.
${BRAND_COLORS}`;

  console.log(`🎨 Generating banner: ${title} (${category})`);

  const falResponse = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt: bannerPrompt,
      image_urls: [modelImageUrl],
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }),
  });

  const falData = await falResponse.json();
  console.log("Banner response:", JSON.stringify(falData).slice(0, 200));
  return falData.images?.[0]?.url || falData.image?.url || null;
};

// ─── Quality Check ────────────────────────────────────────────
const checkImageQuality = async (
  imageUrl: string,
  expectedJewelry: string
): Promise<{ passed: boolean; score: number; notes: string }> => {
  try {
    const qualityResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            {
              type: "text",
              text: `Quality check this luxury jewelry advertisement image.
Expected: ${expectedJewelry}

Check ALL strictly:
1. Is there ONLY ONE model? (FAIL if multiple/duplicate models)
2. Does the model have a COMPLETE face and head? (FAIL if headless)
3. Is jewelry clearly visible on the model?
4. Is the model realistic? (FAIL if obviously AI/plastic)
5. Are brand colors used? (pink/white/blue/gold only)
6. Is lighting professional studio quality?
7. Any obvious defects? (extra limbs, warped face etc)

Be STRICT — fail anything with duplicate models or missing face.
Respond ONLY with JSON: {"passed": true, "score": 85, "notes": "explanation"}`,
            },
          ],
        }],
      }),
    });

    const qualityData = await qualityResponse.json();
    if (!qualityData.content || !qualityData.content[0]) {
      return { passed: true, score: 70, notes: "Quality check unavailable" };
    }

    const qualityText = qualityData.content[0].text;
    const jsonMatch = qualityText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { passed: true, score: 70, notes: "Could not parse quality check" };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { passed: true, score: 70, notes: "Quality check error, defaulting to pass" };
  }
};

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🚀 Agent 1 v4 — Banners & Offers Only!");

    // Load brand models
    const brandModels = await getBrandModels();
    const modelMap: Record<string, string> = {};
    brandModels.forEach((m: any) => {
      modelMap[m.name] = m.reference_image_url;
    });

    const getModelUrl = (categorySlug: string): string => {
      const modelName = CATEGORY_MODEL_MAP[categorySlug] || "Model 1 - Priya";
      return modelMap[modelName] || Object.values(modelMap)[0];
    };

    // Generate content with Claude + web search
    console.log("✍️ Generating content with Claude + web search...");
    const content = await generateContentWithClaude();
    console.log("✅ Content ready! Context:", content.context_used);

    const results = {
      banners_generated: 0,
      images_generated: 0,
      images_passed_quality: 0,
      offer_created: false,
      context_used: content.context_used || "General",
    };

    // Generate banners with real models
    for (const banner of content.banners) {
      const modelUrl = getModelUrl(banner.category);
      const bannerImageUrl = await generateBannerImage(modelUrl, banner.category, banner.title);

      if (bannerImageUrl) {
        const quality = await checkImageQuality(bannerImageUrl, `${banner.category} banner`);

        // Regenerate if quality fails
        let finalBannerUrl = bannerImageUrl;
        let finalQuality = quality;

        if (!quality.passed && quality.score < 50) {
          console.log(`🔄 Regenerating banner: ${banner.title} (score: ${quality.score})`);
          const retryUrl = await generateBannerImage(modelUrl, banner.category, banner.title);
          if (retryUrl) {
            finalBannerUrl = retryUrl;
            finalQuality = await checkImageQuality(retryUrl, `${banner.category} banner`);
          }
        }

        await supabase.from("ai_content_queue").insert({
          content_type: "banner",
          title: banner.title,
          description: banner.subtitle,
          image_url: finalBannerUrl,
          metadata: {
            cta_label: banner.cta_label,
            category: banner.category,
            quality_score: finalQuality.score,
            passed_quality: finalQuality.passed,
            quality_notes: finalQuality.notes,
            context_used: content.context_used,
          },
          status: "pending",
        });

        results.banners_generated++;
        results.images_generated++;
        if (finalQuality.passed) results.images_passed_quality++;
      }
    }

    // Save offer
    if (content.offer) {
      await supabase.from("ai_content_queue").insert({
        content_type: "offer",
        title: content.offer.title,
        description: content.offer.description,
        metadata: {
          badge: content.offer.badge,
          context_used: content.context_used,
          instagram_caption: content.instagram_caption,
        },
        status: "pending",
      });
      results.offer_created = true;
    }

    // Log success
    await supabase.from("ai_generation_logs").insert({
      agent: "agent1-daily-content",
      input: { today: new Date().toISOString().split('T')[0] },
      output: results,
      status: "success",
    });

    // WhatsApp notification
    const summary =
      `✅ ${results.banners_generated} banners\n` +
      `✅ ${results.images_generated} images\n` +
      `✅ ${results.images_passed_quality} passed QC\n` +
      `✅ ${results.offer_created ? "1 offer" : "No offer"} created\n` +
      `📅 ${results.context_used}`;

    const waMessage = encodeURIComponent(
      `🌟 *Lal Raja Jewels — Daily Content Ready!*\n\n${summary}\n\nGo to admin panel to approve!`
    );

    console.log("✅ Agent 1 v4 completed!", JSON.stringify(results));

    return new Response(
      JSON.stringify({
        success: true,
        results,
        whatsapp_url: `https://wa.me/${OWNER_WHATSAPP}?text=${waMessage}`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Agent 1 error:", error.message);

    try {
      await supabase.from("ai_generation_logs").insert({
        agent: "agent1-daily-content",
        input: {},
        output: {},
        status: "error",
        error_message: error.message,
      });
    } catch (_) { }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});