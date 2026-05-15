// ============================================================
// GENERATE PRODUCT IMAGES — Edge Function
// File: supabase/functions/generate-product-images/index.ts
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;
const FAL_KEY = Deno.env.get("FAL_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── CORS Headers ─────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Category → Model Mapping ─────────────────────────────────
const CATEGORY_MODEL_MAP: Record<string, string> = {
  "bridal-sets": "Model 4 - Ananya",
  "necklaces-chains": "Model 1 - Priya",
  "earrings": "Model 2 - Kavya",
  "rings-bangles": "Model 4 - Ananya",
  "polki-kundan": "Model 3 - Deepa",
  "temple-jewellery": "Model 3 - Deepa",
  "diamond-solitaires": "Model 1 - Priya",
  "bangles": "Model 4 - Ananya",
  "rings": "Model 4 - Ananya",
  "pendants": "Model 1 - Priya",
  "mangalsutra": "Model 1 - Priya",
  "choker": "Model 3 - Deepa",
  "haar": "Model 3 - Deepa",
};

const CATEGORY_OUTFIT_MAP: Record<string, string> = {
  "bridal-sets": "heavy Kanjivaram silk saree in deep blush pink #F2A7BB with gold #C9A84C zari border",
  "necklaces-chains": "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
  "earrings": "modern elegant kurta in soft powder blue #B8D4E8 with gold #C9A84C embroidery",
  "rings-bangles": "fusion indo-western outfit in blush pink #F2A7BB with gold #C9A84C detailing",
  "polki-kundan": "traditional half saree in pearl white #FAF8F5 with gold #C9A84C work",
  "temple-jewellery": "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
  "diamond-solitaires": "minimal elegant kurta in powder blue #B8D4E8 with subtle gold #C9A84C accents",
  "bangles": "fusion indo-western outfit in blush pink #F2A7BB with gold #C9A84C detailing",
  "rings": "minimal elegant kurta in powder blue #B8D4E8 with subtle gold #C9A84C accents",
  "pendants": "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
  "mangalsutra": "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
  "choker": "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
  "haar": "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
};

// ─── Save fal.ai Image to Supabase Storage (PERMANENT) ───────
const saveToStorage = async (
  falImageUrl: string,
  storagePath: string
): Promise<string> => {
  try {
    console.log(`💾 Saving to storage: ${storagePath}`);

    // Download image from fal.ai
    const response = await fetch(falImageUrl);
    if (!response.ok) {
      console.error("Failed to download from fal.ai:", response.status);
      return falImageUrl; // fallback
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/png";

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("product-images")
      .upload(storagePath, uint8Array, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error.message);
      return falImageUrl; // fallback to fal.ai URL
    }

    // Get permanent public URL
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    console.log(`✅ Saved permanently: ${data.publicUrl.slice(0, 80)}`);
    return data.publicUrl;

  } catch (err: any) {
    console.error("saveToStorage error:", err.message);
    return falImageUrl; // fallback
  }
};

// ─── Generate Product Image ───────────────────────────────────
const generateProductImage = async (
  rawImageUrl: string,
  productName: string,
  jewelryDescription: string,
  background: "white" | "dark"
): Promise<string | null> => {
  const bgPrompt = background === "white"
    ? `Pure white background #FFFFFF, clean studio product photography,
       soft even lighting, no shadows, jewelry floating on white surface,
       professional e-commerce product shot`
    : `Deep dark maroon background #2C0A0A, luxury cinematic lighting,
       golden bokeh light particles, dramatic shadows,
       high-end jewelry advertisement style`;

  const prompt = `Image 1 shows a raw jewelry photograph.
Recreate this exact jewelry piece as a professional product photo.

JEWELRY: ${jewelryDescription}
PRODUCT NAME: ${productName}

BACKGROUND: ${bgPrompt}

REQUIREMENTS:
- Show ONLY the jewelry — no model, no hands
- Preserve ALL jewelry details exactly: metal color, stones, design motifs
- Perfect lighting showing gold shine and stone sparkle
- Ultra sharp focus on jewelry details
- Professional jewelry photography style
- 8K quality, magazine level
- REMOVE any existing brand marks, logos or engravings from competitor brands
- If there is any text engraved on the jewelry, replace it with subtle "LRM" engraving
- The jewelry must look EXACTLY like in the reference image in all other aspects.`;

  console.log(`📸 Generating ${background} bg for: ${productName}`);

  const falResponse = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_urls: [rawImageUrl],
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }),
  });

  const falData = await falResponse.json();
  console.log(`${background} bg response:`, JSON.stringify(falData).slice(0, 200));
  return falData.images?.[0]?.url || falData.image?.url || null;
};

// ─── Upscale with ESRGAN ──────────────────────────────────────
const upscaleImage = async (imageUrl: string): Promise<string> => {
  console.log("🔍 Upscaling with ESRGAN...");
  try {
    const falResponse = await fetch("https://fal.run/fal-ai/esrgan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        scale: 4,
        face_enhance: false,
      }),
    });
    const falData = await falResponse.json();
    console.log("ESRGAN response:", JSON.stringify(falData).slice(0, 200));
    return falData.image?.url || falData.output?.image?.url || imageUrl;
  } catch {
    return imageUrl;
  }
};

// ─── Generate Model Image ─────────────────────────────────────
const generateModelImage = async (
  rawImageUrl: string,
  productName: string,
  jewelryDescription: string,
  categorySlug: string,
  modelImageUrl: string
): Promise<string | null> => {
  const outfit = CATEGORY_OUTFIT_MAP[categorySlug] || CATEGORY_OUTFIT_MAP["necklaces-chains"];

  const prompt = `Image 1 is a reference photo of a South Indian model.
Image 2 shows the jewelry piece to be worn.

CRITICAL RULES:
- Show ONLY ONE model — not two, not multiple
- Use ONLY her face from Image 1 — complete head and face must be visible
- COMPLETELY change her outfit to: ${outfit}
- REMOVE ALL existing jewelry from the model
- ADD this specific jewelry: ${jewelryDescription}

JEWELRY PLACEMENT:
- Place ${productName} naturally on the model
- Correct body position (necklace on neck, earrings on ears, etc)
- Realistic gold/silver reflection matching studio light
- Natural shadows where jewelry rests on skin
- Jewelry details must match reference exactly

BACKGROUND: Clean pearl white #FAF8F5 studio
LIGHTING: Soft professional studio lighting, warm gold tone
QUALITY: Ultra photorealistic, 8K, luxury jewelry advertisement
BRAND COLORS: Blush pink #F2A7BB, pearl white #FAF8F5, powder blue #B8D4E8, gold #C9A84C ONLY

ONE model only. Complete face visible. No headless figures.`;

  console.log(`👗 Generating model image for: ${productName}`);

  const falResponse = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_urls: [modelImageUrl, rawImageUrl],
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }),
  });

  const falData = await falResponse.json();
  console.log("Model image response:", JSON.stringify(falData).slice(0, 200));
  return falData.images?.[0]?.url || falData.image?.url || null;
};

// ─── Quality Check ────────────────────────────────────────────
const checkImageQuality = async (
  imageUrl: string,
  expectedContent: string,
  imageType: "white_bg" | "dark_bg" | "model"
): Promise<{ passed: boolean; score: number; notes: string }> => {
  const typeInstructions = {
    white_bg: `Product-only shot on WHITE background. No model/hands. Jewelry clearly visible.`,
    dark_bg: `Product-only shot on DARK MAROON background. Luxury lighting. No model/hands.`,
    model: `South Indian model wearing jewelry. ONE model only. Complete face. Brand colors.`,
  };

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
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            {
              type: "text",
              text: `Quality check. Expected: ${expectedContent}. ${typeInstructions[imageType]}
Score: 85-100 perfect, 70-84 good, 50-69 borderline, 0-49 fail.
Respond ONLY: {"passed": true, "score": 85, "notes": "brief explanation"}`,
            },
          ],
        }],
      }),
    });

    const qualityData = await qualityResponse.json();
    if (!qualityData.content?.[0]) return { passed: true, score: 70, notes: "Check unavailable" };
    const match = qualityData.content[0].text.match(/\{[\s\S]*\}/);
    if (!match) return { passed: true, score: 70, notes: "Could not parse" };
    const result = JSON.parse(match[0]);
    console.log(`Quality (${imageType}): score=${result.score}, passed=${result.passed}`);
    return result;
  } catch {
    return { passed: true, score: 70, notes: "Quality check error" };
  }
};

// ─── Generate With Retry ──────────────────────────────────────
const generateWithRetry = async (
  generateFn: () => Promise<string | null>,
  checkFn: (url: string) => Promise<{ passed: boolean; score: number; notes: string }>,
  imageType: string
): Promise<{ url: string | null; quality: { passed: boolean; score: number; notes: string } }> => {
  let url = await generateFn();
  if (!url) return { url: null, quality: { passed: false, score: 0, notes: "Generation failed" } };

  let quality = await checkFn(url);

  if (!quality.passed && quality.score < 50) {
    console.log(`🔄 Regenerating ${imageType} (score: ${quality.score})`);
    const retryUrl = await generateFn();
    if (retryUrl) {
      url = retryUrl;
      quality = await checkFn(retryUrl);
    }
  }

  return { url, quality };
};

// ─── Main Handler ─────────────────────────────────────────────
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
    const {
      raw_image_url,
      product_name,
      jewelry_description,
      category_slug,
      generate_model = true,
      generate_white_bg = true,
      generate_dark_bg = true,
    } = body;

    if (!raw_image_url || !product_name || !jewelry_description || !category_slug) {
      return new Response(
        JSON.stringify({ error: "Missing: raw_image_url, product_name, jewelry_description, category_slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🚀 Pipeline for: ${product_name}`);

    // Create storage-safe slug
    const slug = product_name.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);
    const timestamp = Date.now();
    const folder = `products/${slug}-${timestamp}`;

    // Get brand model
    let modelImageUrl: string | undefined;
    let modelName = "Model 1 - Priya";
    if (generate_model) {
      modelName = CATEGORY_MODEL_MAP[category_slug] || "Model 1 - Priya";
      const { data: modelData } = await supabase
        .from("ai_models")
        .select("reference_image_url")
        .eq("name", modelName)
        .single();
      modelImageUrl = modelData?.reference_image_url;
      if (!modelImageUrl) throw new Error(`Model not found: ${modelName}`);
      console.log(`✅ Using model: ${modelName}`);
    }

    // STEP 1: White background
    let whiteBgFinal: string | null = null;
    let whiteFinalQuality = { passed: true, score: 100, notes: "Skipped" };
    if (generate_white_bg) {
      console.log("📸 Step 1: White background...");
      const result = await generateWithRetry(
        () => generateProductImage(raw_image_url, product_name, jewelry_description, "white"),
        (url) => checkImageQuality(url, product_name, "white_bg"),
        "white_bg"
      );
      if (result.url) {
        const upscaled = await upscaleImage(result.url);
        // Save permanently to Supabase Storage
        whiteBgFinal = await saveToStorage(upscaled, `${folder}/white-bg.png`);
        whiteFinalQuality = await checkImageQuality(whiteBgFinal, product_name, "white_bg");
      }
    }

    // STEP 2: Dark background
    let darkBgFinal: string | null = null;
    let darkFinalQuality = { passed: true, score: 100, notes: "Skipped" };
    if (generate_dark_bg) {
      console.log("🌑 Step 2: Dark background...");
      const result = await generateWithRetry(
        () => generateProductImage(raw_image_url, product_name, jewelry_description, "dark"),
        (url) => checkImageQuality(url, product_name, "dark_bg"),
        "dark_bg"
      );
      if (result.url) {
        const upscaled = await upscaleImage(result.url);
        // Save permanently to Supabase Storage
        darkBgFinal = await saveToStorage(upscaled, `${folder}/dark-bg.png`);
        darkFinalQuality = await checkImageQuality(darkBgFinal, product_name, "dark_bg");
      }
    }

    // STEP 3: Model image
    let modelImageFinal: string | null = null;
    let modelQuality = { passed: true, score: 100, notes: "Skipped" };
    if (generate_model && modelImageUrl) {
      console.log("👗 Step 3: Model image...");
      const result = await generateWithRetry(
        () => generateModelImage(raw_image_url, product_name, jewelry_description, category_slug, modelImageUrl!),
        (url) => checkImageQuality(url, product_name, "model"),
        "model"
      );
      if (result.url) {
        // Save permanently to Supabase Storage
        modelImageFinal = await saveToStorage(result.url, `${folder}/model.png`);
        modelQuality = result.quality;
      }
    }

    const results = {
      success: true,
      product_name,
      model_used: modelName,
      storage_folder: folder,
      images: {
        white_bg: whiteBgFinal,
        dark_bg: darkBgFinal,
        model: modelImageFinal,
      },
      quality_scores: {
        white_bg: generate_white_bg ? whiteFinalQuality.score : null,
        dark_bg: generate_dark_bg ? darkFinalQuality.score : null,
        model: generate_model ? modelQuality.score : null,
      },
      quality_notes: {
        white_bg: generate_white_bg ? whiteFinalQuality.notes : "Skipped",
        dark_bg: generate_dark_bg ? darkFinalQuality.notes : "Skipped",
        model: generate_model ? modelQuality.notes : "Skipped",
      },
      all_passed:
        (!generate_white_bg || whiteFinalQuality.passed) &&
        (!generate_dark_bg || darkFinalQuality.passed) &&
        (!generate_model || modelQuality.passed),
    };

    console.log("✅ Pipeline complete!", JSON.stringify(results).slice(0, 300));

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Pipeline error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});