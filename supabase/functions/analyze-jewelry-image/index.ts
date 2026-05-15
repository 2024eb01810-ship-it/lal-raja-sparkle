import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { raw_image_url } = body;

    if (!raw_image_url) {
      return new Response(
        JSON.stringify({ error: "Missing required field: raw_image_url" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🔍 Analyzing image: ${raw_image_url}`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: raw_image_url } },
            {
              type: "text",
              text: `Analyze this raw jewelry photo and extract the following details. 

1. jewelry_type: Identify the type (e.g., necklace, earring, ring, bangle, bridal-set, pendant, etc.).
2. metal_type: Identify the metal (e.g., 22K Gold, 18K Gold, 14K Gold, Silver 925, Platinum, Diamond, etc.).
3. design_style: Identify the style (e.g., temple, kundan, polki, modern, antique, minimalist, etc.).
4. product_name: Suggest a premium, catchy name for this product (e.g., "Lakshmi Antique Gold Temple Necklace").
5. description: Write a short, luxurious description for an e-commerce website detailing its craftsmanship and appeal.
6. category_slug: Based on the type, provide exactly ONE of the following valid category slugs: 
   - 'bridal-sets'
   - 'necklaces-chains'
   - 'earrings'
   - 'rings-bangles'
   - 'polki-kundan'
   - 'temple-jewellery'
   - 'diamond-solitaires'

IMPORTANT: Respond ONLY with a valid JSON object matching exactly these keys:
{
  "jewelry_type": "string",
  "metal_type": "string",
  "design_style": "string",
  "product_name": "string",
  "description": "string",
  "category_slug": "string"
}`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error("Anthropic API Error:", data);
      throw new Error("Failed to get a valid response from Claude");
    }

    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Failed to parse JSON from Claude response");
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(`✅ Analysis complete:`, result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Pipeline error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
