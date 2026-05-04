// ============================================================
// AGENT 2 - PERSONALIZATION ENGINE
// File: src/lib/personalization.ts
// ============================================================

import { supabase } from "@/integrations/supabase/client";

// ─── Fingerprint Generator ───────────────────────────────────
const generateFingerprint = (): string => {
    const nav = window.navigator;
    const screen = window.screen;
    const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || 0,
        nav.platform,
    ].join("|");

    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36) + Date.now().toString(36).slice(-4);
};

// ─── Get or Create Session ────────────────────────────────────
export const getOrCreateSession = async () => {
    let fingerprint = localStorage.getItem("lr_fp");
    if (!fingerprint) {
        fingerprint = generateFingerprint();
        localStorage.setItem("lr_fp", fingerprint);
    }

    try {
        const { data, error } = await supabase
            .from("user_sessions")
            .select("*")
            .eq("fingerprint", fingerprint)
            .single();

        if (error || !data) {
            // Create new session
            const { data: newSession } = await supabase
                .from("user_sessions")
                .insert({
                    fingerprint,
                    preferences: {},
                    search_history: [],
                    click_history: [],
                    category_scores: {},
                    price_range_min: 0,
                    price_range_max: 500000,
                    visit_count: 1,
                    last_seen: new Date().toISOString(),
                })
                .select()
                .single();
            return newSession;
        }

        // Update visit count and last seen
        await supabase
            .from("user_sessions")
            .update({
                visit_count: (data.visit_count || 1) + 1,
                last_seen: new Date().toISOString(),
            })
            .eq("fingerprint", fingerprint);

        return data;
    } catch (err) {
        console.error("Session error:", err);
        return null;
    }
};

// ─── Track Search ─────────────────────────────────────────────
export const trackSearch = async (query: string, resultsCount: number = 0) => {
    const fingerprint = localStorage.getItem("lr_fp");
    if (!fingerprint) return;

    try {
        // Log search event
        await supabase.from("search_events").insert({
            fingerprint,
            query: query.toLowerCase(),
            results_count: resultsCount,
        });

        // Update search history in session
        const { data: session } = await supabase
            .from("user_sessions")
            .select("search_history, category_scores")
            .eq("fingerprint", fingerprint)
            .single();

        if (session) {
            const history = (session.search_history as string[]) || [];
            const scores = (session.category_scores as Record<string, number>) || {};

            // Add to history (keep last 20)
            history.unshift(query.toLowerCase());
            const uniqueHistory = [...new Set(history)].slice(0, 20);

            // Update category scores based on keywords
            const categoryKeywords: Record<string, string[]> = {
                "bridal-sets": ["bridal", "wedding", "bride", "marriage", "pellikuthuru"],
                "necklaces-chains": ["necklace", "chain", "haaram", "haram", "mala", "haar"],
                earrings: ["earring", "jhumka", "stud", "chandbali", "tops", "jimikki"],
                "rings-bangles": ["ring", "bangle", "bracelet", "kada", "gajulu", "ungaram"],
                "polki-kundan": ["polki", "kundan", "uncut", "meenakari"],
                "temple-jewellery": ["temple", "lakshmi", "deity", "god", "gudi", "devasthanam"],
                "diamond-solitaires": ["diamond", "solitaire", "igi", "gia", "certified", "vajram"],
            };

            const queryLower = query.toLowerCase();
            Object.entries(categoryKeywords).forEach(([category, keywords]) => {
                if (keywords.some((kw) => queryLower.includes(kw))) {
                    scores[category] = (scores[category] || 0) + 2;
                }
            });

            await supabase
                .from("user_sessions")
                .update({
                    search_history: uniqueHistory,
                    category_scores: scores,
                })
                .eq("fingerprint", fingerprint);
        }
    } catch (err) {
        console.error("Track search error:", err);
    }
};

// ─── Track Product View ───────────────────────────────────────
export const trackProductView = async (
    productId: string,
    categoryId: string | null,
    timeSpentSeconds: number = 0
) => {
    const fingerprint = localStorage.getItem("lr_fp");
    if (!fingerprint) return;

    try {
        await supabase.from("product_views").insert({
            fingerprint,
            product_id: productId,
            category_id: categoryId,
            time_spent_seconds: timeSpentSeconds,
        });

        // Update category scores based on time spent
        if (categoryId && timeSpentSeconds > 5) {
            const { data: session } = await supabase
                .from("user_sessions")
                .select("category_scores, click_history, price_range_min, price_range_max")
                .eq("fingerprint", fingerprint)
                .single();

            if (session) {
                const scores = (session.category_scores as Record<string, number>) || {};
                const clicks = (session.click_history as string[]) || [];

                // Score based on time spent
                scores[categoryId] = (scores[categoryId] || 0) + Math.floor(timeSpentSeconds / 10);

                // Update click history
                clicks.unshift(productId);
                const uniqueClicks = [...new Set(clicks)].slice(0, 30);

                await supabase
                    .from("user_sessions")
                    .update({
                        category_scores: scores,
                        click_history: uniqueClicks,
                    })
                    .eq("fingerprint", fingerprint);
            }
        }
    } catch (err) {
        console.error("Track view error:", err);
    }
};

// ─── Get Personalized Category Order ─────────────────────────
export const getPersonalizedCategories = async () => {
    const fingerprint = localStorage.getItem("lr_fp");

    try {
        // Get all active categories
        const { data: categories } = await supabase
            .from("categories")
            .select("*")
            .eq("active", true)
            .order("sort_order");

        if (!fingerprint || !categories) return categories;

        // Get user scores
        const { data: session } = await supabase
            .from("user_sessions")
            .select("category_scores")
            .eq("fingerprint", fingerprint)
            .single();

        if (!session?.category_scores) return categories;

        const scores = session.category_scores as Record<string, number>;

        // Sort categories by user preference score
        return [...categories].sort((a, b) => {
            const scoreA = scores[a.slug] || scores[a.id] || 0;
            const scoreB = scores[b.slug] || scores[b.id] || 0;
            return scoreB - scoreA;
        });
    } catch (err) {
        console.error("Get categories error:", err);
        return [];
    }
};

// ─── Get Personalized Products ────────────────────────────────
export const getPersonalizedProducts = async (limit: number = 12) => {
    const fingerprint = localStorage.getItem("lr_fp");

    try {
        const { data: products } = await supabase
            .from("products")
            .select("*, categories(*), collections(*)")
            .eq("active", true)
            .order("featured", { ascending: false });

        if (!fingerprint || !products) return products;

        const { data: session } = await supabase
            .from("user_sessions")
            .select("category_scores, search_history, price_range_min, price_range_max")
            .eq("fingerprint", fingerprint)
            .single();

        if (!session) return products?.slice(0, limit);

        const scores = (session.category_scores as Record<string, number>) || {};

        // Score each product
        const scoredProducts = products.map((product) => {
            let score = product.featured ? 10 : 0;

            // Category preference score
            const categorySlug = (product.categories as any)?.slug || "";
            score += scores[categorySlug] || 0;
            score += scores[product.category_id] || 0;

            // Search history match
            const searchHistory = (session.search_history as string[]) || [];
            searchHistory.forEach((query) => {
                if (
                    product.name.toLowerCase().includes(query) ||
                    (product.description || "").toLowerCase().includes(query)
                ) {
                    score += 5;
                }
            });

            return { ...product, _score: score };
        });

        // Sort by score
        return scoredProducts
            .sort((a, b) => b._score - a._score)
            .slice(0, limit);
    } catch (err) {
        console.error("Get products error:", err);
        return [];
    }
};

// ─── Detect High Intent (for Agent 3) ────────────────────────
export const detectHighIntent = async (): Promise<{
    hasHighIntent: boolean;
    keyword: string;
    categorySlug: string;
    searchCount: number;
} | null> => {
    const fingerprint = localStorage.getItem("lr_fp");
    if (!fingerprint) return null;

    try {
        // Get recent searches in last 30 mins
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { data: recentSearches } = await supabase
            .from("search_events")
            .select("query")
            .eq("fingerprint", fingerprint)
            .gte("created_at", thirtyMinsAgo);

        if (!recentSearches || recentSearches.length < 2) return null;

        // Count keyword frequency
        const keywordCount: Record<string, number> = {};
        recentSearches.forEach(({ query }) => {
            keywordCount[query] = (keywordCount[query] || 0) + 1;
        });

        // Find highest frequency keyword
        const topKeyword = Object.entries(keywordCount).sort(
            ([, a], [, b]) => b - a
        )[0];

        if (!topKeyword || topKeyword[1] < 2) return null;

        // Map keyword to category
        const keywordCategoryMap: Record<string, string> = {
            bridal: "bridal-sets",
            wedding: "bridal-sets",
            haram: "necklaces-chains",
            haaram: "necklaces-chains",
            necklace: "necklaces-chains",
            jhumka: "earrings",
            earring: "earrings",
            ring: "rings-bangles",
            bangle: "rings-bangles",
            polki: "polki-kundan",
            kundan: "polki-kundan",
            temple: "temple-jewellery",
            diamond: "diamond-solitaires",
            solitaire: "diamond-solitaires",
        };

        const [keyword, count] = topKeyword;
        const categorySlug =
            Object.entries(keywordCategoryMap).find(([kw]) =>
                keyword.includes(kw)
            )?.[1] || "bridal-sets";

        return {
            hasHighIntent: count >= 2,
            keyword,
            categorySlug,
            searchCount: count,
        };
    } catch (err) {
        console.error("Detect intent error:", err);
        return null;
    }
};

// ─── Check if coupon already shown ───────────────────────────
export const hasCouponBeenShown = (): boolean => {
    const shown = localStorage.getItem("lr_coupon_shown");
    if (!shown) return false;
    const shownTime = parseInt(shown);
    // Don't show again for 24 hours
    return Date.now() - shownTime < 24 * 60 * 60 * 1000;
};

export const markCouponShown = () => {
    localStorage.setItem("lr_coupon_shown", Date.now().toString());
};