// ============================================================
// AGENT 3 - SMART COUPON ENGINE
// File: src/components/SmartCouponEngine.tsx
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectHighIntent, hasCouponBeenShown, markCouponShown } from "@/lib/personalization";
import { X, Gift, Clock, Copy, Check } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    discount_type: string;
    discount_value: number;
    category_slug: string;
    trigger_keyword: string;
    valid_until: string;
}

const SmartCouponEngine = () => {
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>("");

    // Check for high intent every 60 seconds
    useEffect(() => {
        const checkIntent = async () => {
            if (hasCouponBeenShown()) return;

            const intent = await detectHighIntent();
            if (!intent?.hasHighIntent) return;

            // Find matching coupon
            const { data: matchingCoupon } = await supabase
                .from("coupons")
                .select("*")
                .eq("active", true)
                .eq("category_slug", intent.categorySlug)
                .limit(1)
                .maybeSingle();

            if (matchingCoupon) {
                setCoupon(matchingCoupon as Coupon);
                setShowPopup(true);
                markCouponShown();

                // Log claim
                const fingerprint = localStorage.getItem("lr_fp");
                if (fingerprint) {
                    await supabase.from("coupon_claims").insert({
                        coupon_id: matchingCoupon.id,
                        fingerprint,
                        trigger_keyword: intent.keyword,
                        search_context: {
                            keyword: intent.keyword,
                            categorySlug: intent.categorySlug,
                            searchCount: intent.searchCount,
                        },
                    });

                    // Notify owner via WhatsApp
                    notifyOwner(intent.keyword, intent.categorySlug, matchingCoupon.code);
                }
            }
        };

        // Check after 45 seconds of browsing
        const timer = setTimeout(checkIntent, 45000);
        const interval = setInterval(checkIntent, 60000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!coupon?.valid_until) return;
        const updateTimer = () => {
            const expiry = new Date(coupon.valid_until).getTime();
            const now = Date.now();
            const diff = expiry - now;
            if (diff <= 0) {
                setTimeLeft("Expired");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days > 0) setTimeLeft(`${days} days left`);
            else setTimeLeft(`${hours} hours left`);
        };
        updateTimer();
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
    }, [coupon]);

    const notifyOwner = (keyword: string, category: string, code: string) => {
        const message = encodeURIComponent(
            `🔥 New Lead Alert - Lalraja Jewels!\n\n` +
            `Interest: ${keyword.toUpperCase()}\n` +
            `Category: ${category}\n` +
            `Coupon Sent: ${code}\n` +
            `Time: ${new Date().toLocaleString("en-IN")}\n\n` +
            `Follow up now! 🚀`
        );
        // Opens WhatsApp silently in background
        const link = document.createElement("a");
        link.href = `https://wa.me/918184839498?text=${message}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyCode = () => {
        if (!coupon) return;
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    if (!showPopup || !coupon) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-slide-up">

                {/* Gold header */}
                <div className="relative p-6 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)" }}>
                    <button
                        onClick={() => setShowPopup(false)}
                        className="absolute top-3 right-3 text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                    <div className="flex justify-center mb-2">
                        <Gift size={32} className="text-white" />
                    </div>
                    <p className="text-sm font-light tracking-widest uppercase opacity-90">
                        Exclusive Offer For You
                    </p>
                    <h2 className="text-xl font-bold mt-1">{coupon.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-gray-600 text-sm mb-4">{coupon.description}</p>

                    {/* Coupon code */}
                    <div className="border-2 border-dashed border-amber-400 rounded-xl p-4 mb-4 bg-amber-50">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Your Coupon Code</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-bold tracking-widest text-amber-700">
                                {coupon.code}
                            </span>
                            <button onClick={copyCode}
                                className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        {copied && (
                            <p className="text-xs text-green-600 mt-1 font-medium">✓ Copied!</p>
                        )}
                    </div>

                    {/* Timer */}
                    {timeLeft && (
                        <div className="flex items-center justify-center gap-1 text-red-500 text-xs mb-4">
                            <Clock size={12} />
                            <span>{timeLeft}</span>
                        </div>
                    )}

                    {/* Screenshot hint */}
                    <p className="text-xs text-gray-400 mb-4">
                        📸 Screenshot this offer and show at our store
                    </p>

                    {/* CTA */}
                    <a href={`https://wa.me/918184839498?text=${encodeURIComponent(
                        `Hi! I have coupon code ${coupon.code} for ${coupon.title}. I'd like to enquire about your jewellery.`
                    )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                        💬 Enquire on WhatsApp
                    </a>

                    <button
                        onClick={() => setShowPopup(false)}
                        className="mt-3 text-xs text-gray-400 hover:text-gray-600">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartCouponEngine;