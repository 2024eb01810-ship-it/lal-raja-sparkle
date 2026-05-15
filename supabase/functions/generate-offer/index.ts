// ============================================================
// GENERATE OFFER — Edge Function
// File: supabase/functions/generate-offer/index.ts
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Generate Offer with Claude + Web Search ──────────────────
const generateOfferContent = async () => {
  const today = new Date().toISOString().split('T')[0];
  const messages: any[] = [{
    role: "user",
    content: `You are a marketing writer for Lal Raja Gold And Diamond Jewellery, Vijayawada.
Today: ${today}

Search for Indian/Telugu festivals in next 14 days. Then create ONE compelling jewelry offer.

Return ONLY JSON:
{
  "title": "Offer title (max 6 words)",
  "description": "Specific offer description with discount % or benefit (max 20 words)",
  "badge": "Short badge text like '20% OFF' or 'FREE GIFT' or 'LIMITED'",
  "valid_days": 7,
  "festival_context": "festival name used",
  "instagram_caption": "3-4 lines Telugu+English caption with hashtags #LalRajaJewels #VijayawadaJewellery"
}`
  }];

  let result = {
    title: "Special Season Offer",
    description: "Get 15% off on making charges for all gold jewellery above ₹1 Lakh",
    badge: "15% OFF",
    valid_days: 7,
    festival_context: "General",
    instagram_caption: "#LalRajaJewels #VijayawadaJewellery",
  };

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
        max_tokens: 1000,
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
            content: "Search complete. Now generate the offer JSON.",
          })),
        });
      } else break;
    } else break;
  }

  return result;
};

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🚀 Generate Offer starting...");

    // Generate offer content
    const offer = await generateOfferContent();
    console.log("✅ Offer generated:", offer.title);

    // Calculate valid_until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (offer.valid_days || 7));

    // Save to ai_content_queue as pending
    const { data: queueItem } = await supabase
      .from("ai_content_queue")
      .insert({
        content_type: "offer",
        title: offer.title,
        description: offer.description,
        metadata: {
          badge: offer.badge,
          valid_until: validUntil.toISOString(),
          festival_context: offer.festival_context,
          instagram_caption: offer.instagram_caption,
        },
        status: "pending",
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        offer: {
          id: queueItem?.id,
          title: offer.title,
          description: offer.description,
          badge: offer.badge,
          valid_until: validUntil.toISOString(),
          festival_context: offer.festival_context,
          instagram_caption: offer.instagram_caption,
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