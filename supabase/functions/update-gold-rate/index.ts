// ============================================================
// UPDATE GOLD RATE — Edge Function
// File: supabase/functions/update-gold-rate/index.ts
// Fetches live 22K gold rate and caches in store_info table
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ─── Fetch Gold Rate ──────────────────────────────────────────
const fetchGoldRate = async (): Promise<{ rate22k: number; rate24k: number; source: string }> => {
  
  // Method 1 — goldpricez.com API (free)
  try {
    const response = await fetch(
      "https://data-asg.goldprice.org/dbXRates/INR",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    
    if (data?.items?.[0]?.xauPrice) {
      // XAU = price per troy oz in INR
      const pricePerOz = data.items[0].xauPrice;
      const pricePerGram24k = Math.round(pricePerOz / 31.1035);
      const pricePerGram22k = Math.round(pricePerGram24k * 22 / 24);
      
      console.log(`✅ Gold rate fetched: 22K = ₹${pricePerGram22k}/g, 24K = ₹${pricePerGram24k}/g`);
      return {
        rate22k: pricePerGram22k,
        rate24k: pricePerGram24k,
        source: "goldprice.org"
      };
    }
  } catch (err: any) {
    console.error("Method 1 failed:", err.message);
  }

  // Method 2 — metals-api alternative
  try {
    const response = await fetch(
      "https://api.metals.live/v1/spot/gold",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    
    if (data?.[0]?.gold) {
      // Price in USD per troy oz
      const priceUSD = data[0].gold;
      
      // Fetch USD to INR rate
      const inrResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const inrData = await inrResponse.json();
      const usdToInr = inrData?.rates?.INR || 83.5;
      
      const pricePerOzINR = priceUSD * usdToInr;
      const pricePerGram24k = Math.round(pricePerOzINR / 31.1035);
      const pricePerGram22k = Math.round(pricePerGram24k * 22 / 24);
      
      console.log(`✅ Gold rate fetched (method 2): 22K = ₹${pricePerGram22k}/g`);
      return {
        rate22k: pricePerGram22k,
        rate24k: pricePerGram24k,
        source: "metals.live"
      };
    }
  } catch (err: any) {
    console.error("Method 2 failed:", err.message);
  }

  // Method 3 — GoodReturns scraping fallback
  try {
    const response = await fetch(
      "https://www.goodreturns.in/gold-rates/",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await response.text();
    
    // Extract 22K rate from HTML
    const match22k = html.match(/22\s*[Kk].*?₹\s*([\d,]+)/);
    if (match22k) {
      const rate22k = parseInt(match22k[1].replace(/,/g, ""));
      const rate24k = Math.round(rate22k * 24 / 22);
      
      console.log(`✅ Gold rate fetched (method 3): 22K = ₹${rate22k}/g`);
      return { rate22k, rate24k, source: "goodreturns.in" };
    }
  } catch (err: any) {
    console.error("Method 3 failed:", err.message);
  }

  // Fallback — use yesterday's rate from DB
  console.log("⚠️ All methods failed, using cached rate");
  const { data } = await supabase
    .from("store_info")
    .select("gold_rate_22k, gold_rate_24k")
    .limit(1)
    .single();

  return {
    rate22k: data?.gold_rate_22k || 7500,
    rate24k: data?.gold_rate_24k || 8200,
    source: "cached"
  };
};

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🪙 Fetching live gold rate...");

    const { rate22k, rate24k, source } = await fetchGoldRate();

    // Update store_info table
    const { error } = await supabase
      .from("store_info")
      .update({
        gold_rate_22k: rate22k,
        gold_rate_24k: rate24k,
        gold_rate_updated_at: new Date().toISOString(),
      })
      .not("id", "is", null); // update all rows

    if (error) {
      console.error("DB update error:", error.message);
      throw new Error(error.message);
    }

    console.log(`✅ Gold rate updated: 22K = ₹${rate22k}/g, source: ${source}`);

    return new Response(
      JSON.stringify({
        success: true,
        rate22k,
        rate24k,
        source,
        updated_at: new Date().toISOString(),
      }),
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