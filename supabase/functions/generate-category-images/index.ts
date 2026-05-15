// ============================================================
// GENERATE CATEGORY IMAGES — Run once script
// File: supabase/functions/generate-category-images/index.ts
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FAL_KEY = Deno.env.get("FAL_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const LOGO_URL = "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-assets/Lal%20raja%20logo%20%20(2).jpg.jpeg";

// ─── Category Configurations ──────────────────────────────────
const CATEGORIES = [
  {
    slug: "bridal-sets",
    name: "Bridal Sets",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/text2image.jpeg",
    outfit: "heavy Kanjivaram silk saree in deep blush pink #F2A7BB with gold #C9A84C zari border",
    jewelry: "complete bridal jewelry set — heavy gold necklace, matching earrings, maang tikka, bangles, all in 22K gold with rubies and emeralds",
    mood: "bridal, majestic, celebration",
  },
  {
    slug: "necklaces-chains",
    name: "Necklaces & Chains",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/a-photo-of-a-beautiful-indian-woman-wear-rleirwovr8wuyvebrhy87g-r2hd4sbmqlcgwhbpwm1cig-68a4d20516c4c.webp",
    outfit: "elegant Kanjivaram silk saree in pearl white #FAF8F5 with gold #C9A84C border",
    jewelry: "stunning 22K gold long haaram necklace with temple motifs, Lakshmi pendant, ruby and pearl drops",
    mood: "traditional, elegant, timeless",
  },
  {
    slug: "earrings",
    name: "Earrings",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/a-photo-of-a-beautiful-indian-woman-wear-vddqw3gnt-a2p3f1jjcr1w-qg0rkiwnsamn-midrqdqbq-68a4d21625195-819x1024.webp",
    outfit: "modern elegant kurta in soft powder blue #B8D4E8 with gold #C9A84C embroidery",
    jewelry: "large ornate gold jhumka earrings with peacock motif, emerald stones and pearl drops hanging",
    mood: "modern, vibrant, festive",
  },
  {
    slug: "rings-bangles",
    name: "Rings & Bangles",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/text2image.jpeg",
    outfit: "fusion indo-western outfit in blush pink #F2A7BB with gold #C9A84C detailing",
    jewelry: "set of gold bangles with intricate work and diamond solitaire ring on fingers, hands gracefully posed",
    mood: "graceful, delicate, modern",
  },
  {
    slug: "polki-kundan",
    name: "Polki & Kundan",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/b477e07e9484957dfd826e513e1e7c4a.webp",
    outfit: "traditional half saree in pearl white #FAF8F5 with gold #C9A84C work",
    jewelry: "elaborate polki kundan necklace set with uncut diamonds, meenakari work, emerald and ruby stones",
    mood: "royal, heritage, Mughal-inspired",
  },
  {
    slug: "temple-jewellery",
    name: "Temple Jewellery",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/b477e07e9484957dfd826e513e1e7c4a.webp",
    outfit: "traditional Kanjivaram saree in deep blush pink #F2A7BB with gold #C9A84C temple border",
    jewelry: "22K gold temple jewelry — Lakshmi coin necklace (kasu mala), temple earrings with deity motifs, traditional South Indian design",
    mood: "devotional, sacred, traditional South Indian",
  },
  {
    slug: "diamond-solitaires",
    name: "Diamond Solitaires",
    model: "https://clwjecqqmjbjcpivvgmd.supabase.co/storage/v1/object/public/brand-models/a-photo-of-a-beautiful-indian-woman-wear-rleirwovr8wuyvebrhy87g-r2hd4sbmqlcgwhbpwm1cig-68a4d20516c4c.webp",
    outfit: "minimal elegant kurta in powder blue #B8D4E8 with subtle gold #C9A84C accents",
    jewelry: "brilliant IGI certified diamond solitaire necklace and matching stud earrings in 18K white gold, sparkling diamonds",
    mood: "modern, luxurious, contemporary",
  },
];

// ─── Generate Category Image ──────────────────────────────────
const generateCategoryImage = async (category: typeof CATEGORIES[0]): Promise<string | null> => {
  const prompt = `Image 1 is a reference photo of a South Indian model.
Image 2 is the Lal Raja Jewels logo.

CRITICAL RULES:
- Show ONLY ONE model — not two, not multiple
- Model MUST have complete face and head visible
- Use ONLY her face from Image 1

CREATE A LUXURY JEWELRY CATEGORY IMAGE for: ${category.name}

MODEL:
- Exact same face from Image 1
- Outfit: ${category.outfit}
- Remove ALL existing jewelry
- Add: ${category.jewelry}

MOOD: ${category.mood}

BACKGROUND:
- Deep dark maroon #2C0A0A
- Subtle gold bokeh particles
- Cinematic dramatic lighting
- Square format suitable for category card

LOGO:
- Place Image 2 logo bottom right corner
- Small 8% width, subtle gold tint
- Text "Lal Raja" in tiny gold serif below logo

BRAND COLORS ONLY:
- Blush pink: #F2A7BB
- Pearl white: #FAF8F5
- Powder blue: #B8D4E8
- Gold: #C9A84C
- Dark maroon: #2C0A0A

QUALITY: Ultra photorealistic, 8K, square 1:1 format
STYLE: Single model South Indian luxury jewelry brand
ONE model only. Complete face. No headless figures.`;

  console.log(`🎨 Generating: ${category.name}`);

  const falResponse = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_urls: [category.model, LOGO_URL],
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }),
  });

  const falData = await falResponse.json();
  console.log(`${category.name} response:`, JSON.stringify(falData).slice(0, 200));
  return falData.images?.[0]?.url || falData.image?.url || null;
};

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🚀 Generating all 7 category images...");

    const results = [];

    for (const category of CATEGORIES) {
      try {
        // Generate image
        const imageUrl = await generateCategoryImage(category);

        if (imageUrl) {
          // Update category in database
          const { error } = await supabase
            .from("categories")
            .update({ image_url: imageUrl })
            .eq("slug", category.slug);

          if (error) {
            console.error(`DB error for ${category.slug}:`, error.message);
            results.push({ slug: category.slug, success: false, error: error.message });
          } else {
            console.log(`✅ ${category.name} done!`);
            results.push({ slug: category.slug, success: true, image_url: imageUrl });
          }
        } else {
          results.push({ slug: category.slug, success: false, error: "No image generated" });
        }

        // Small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err: any) {
        console.error(`Error for ${category.slug}:`, err.message);
        results.push({ slug: category.slug, success: false, error: err.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`✅ Done! ${successful}/7 categories updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successful}/7 category images generated`,
        results,
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});