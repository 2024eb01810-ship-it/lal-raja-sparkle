import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PriceBreakupProps {
  goldWeightGrams?: number | null;
  stoneValue?: number | null;
  makingChargesPercent?: number | null;
  makingChargesDiscountPercent?: number | null;
  goldRate?: number | null; // ₹/gram for 22KT, from store_info
}

const DEFAULT_GOLD_RATE = 7500;

function fmt(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PriceBreakup({
  goldWeightGrams,
  stoneValue,
  makingChargesPercent,
  makingChargesDiscountPercent,
  goldRate,
}: PriceBreakupProps) {
  const [open, setOpen] = useState(true);

  // Resolve values with sensible defaults
  const rate = goldRate ?? DEFAULT_GOLD_RATE;
  const goldWt = goldWeightGrams ?? 0;
  const stoneVal = stoneValue ?? 0;
  const mcPercent = makingChargesPercent ?? 12;
  const mcDiscPercent = makingChargesDiscountPercent ?? 0;

  // Only render if gold weight is specified
  if (!goldWeightGrams) return null;

  // Calculations
  const goldValue = goldWt * rate;
  const makingValue = goldValue * (mcPercent / 100);
  const makingDiscount = makingValue * (mcDiscPercent / 100);
  const makingFinal = makingValue - makingDiscount;
  const subtotal = goldValue + stoneVal + makingFinal;
  const gst = subtotal * 0.03;
  const grandTotal = subtotal + gst;

  return (
    <div className="price-breakup mt-6 mb-2 border border-border rounded-sm overflow-hidden text-sm">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 font-semibold tracking-wide text-left"
        style={{ background: "#1a0a00", color: "#C9A84C" }}
        aria-expanded={open}
      >
        <span className="text-sm uppercase tracking-[0.2em]">Price Breakup</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Collapsible body */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "800px" : "0px" }}
      >
        {/* Rate info sub-header */}
        <div className="px-4 py-2 text-xs" style={{ background: "#fdf8f0", color: "#7a5c1e", borderBottom: "1px solid #e8d5a3" }}>
          Live 22KT Gold Rate: <strong>{fmt(rate)}/gram</strong>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "480px" }}>
            <thead>
              <tr style={{ background: "#f9f4ec", color: "#5a3e00", borderBottom: "1px solid #e8d5a3" }}>
                <th className="px-3 py-2 text-left font-semibold" style={{ width: "28%" }}>Component</th>
                <th className="px-3 py-2 text-center font-semibold" style={{ width: "22%" }}>Rate</th>
                <th className="px-3 py-2 text-center font-semibold" style={{ width: "12%" }}>Weight</th>
                <th className="px-3 py-2 text-right font-semibold" style={{ width: "14%" }}>Value</th>
                <th className="px-3 py-2 text-right font-semibold" style={{ width: "12%" }}>Disc.</th>
                <th className="px-3 py-2 text-right font-semibold" style={{ width: "12%" }}>Final</th>
              </tr>
            </thead>
            <tbody>
              {/* ── Metal Category Header ── */}
              <tr style={{ background: "#7a1515", color: "#fff" }}>
                <td colSpan={6} className="px-3 py-1.5 font-semibold tracking-wide text-xs uppercase">
                  Metal
                </td>
              </tr>
              {/* Gold row */}
              <tr className="border-b" style={{ borderColor: "#f0e6d0" }}>
                <td className="px-3 py-2 pl-5">Gold (22KT)</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{fmt(rate)}/g</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{goldWt}g</td>
                <td className="px-3 py-2 text-right">{fmt(goldValue)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                <td className="px-3 py-2 text-right font-medium">{fmt(goldValue)}</td>
              </tr>

              {/* ── Stone Category Header ── */}
              {stoneVal > 0 && (
                <>
                  <tr style={{ background: "#7a1515", color: "#fff" }}>
                    <td colSpan={6} className="px-3 py-1.5 font-semibold tracking-wide text-xs uppercase">
                      Stone
                    </td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "#f0e6d0" }}>
                    <td className="px-3 py-2 pl-5">Stone Value</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">—</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">—</td>
                    <td className="px-3 py-2 text-right">{fmt(stoneVal)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(stoneVal)}</td>
                  </tr>
                </>
              )}

              {/* ── Making Charges Category Header ── */}
              <tr style={{ background: "#7a1515", color: "#fff" }}>
                <td colSpan={6} className="px-3 py-1.5 font-semibold tracking-wide text-xs uppercase">
                  Making Charges
                </td>
              </tr>
              <tr className="border-b" style={{ borderColor: "#f0e6d0" }}>
                <td className="px-3 py-2 pl-5">
                  Making ({mcPercent}%)
                  {mcDiscPercent > 0 && (
                    <span className="ml-1 text-[10px] text-green-700 font-medium">−{mcDiscPercent}% off</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-muted-foreground">{mcPercent}%</td>
                <td className="px-3 py-2 text-center text-muted-foreground">—</td>
                <td className="px-3 py-2 text-right">{fmt(makingValue)}</td>
                <td className="px-3 py-2 text-right text-red-600">
                  {mcDiscPercent > 0 ? `−${fmt(makingDiscount)}` : "—"}
                </td>
                <td className="px-3 py-2 text-right font-medium">{fmt(makingFinal)}</td>
              </tr>

              {/* ── Subtotal ── */}
              <tr style={{ background: "#fdf3e3", fontWeight: 600 }}>
                <td className="px-3 py-2">Sub Total</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right">{fmt(subtotal)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right">{fmt(subtotal)}</td>
              </tr>

              {/* ── GST ── */}
              <tr className="border-t" style={{ borderColor: "#e8d5a3" }}>
                <td className="px-3 py-2 text-muted-foreground">GST (3%)</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right text-muted-foreground">{fmt(gst)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right text-muted-foreground">{fmt(gst)}</td>
              </tr>

              {/* ── Grand Total ── */}
              <tr style={{ background: "#1a0a00", color: "#C9A84C", fontWeight: 700 }}>
                <td className="px-3 py-3 text-sm uppercase tracking-wide">Grand Total</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3 text-right text-base">{fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <p
          className="px-4 py-2.5 text-[10px] italic text-center border-t"
          style={{ borderColor: "#e8d5a3", color: "#9a7c3a", background: "#fdf8f0" }}
        >
          * Prices subject to change based on live gold rate. GST @3% applicable.
          BIS Hallmarked · IGI Certified.
        </p>
      </div>
    </div>
  );
}

/** Calculates grand total from product fields + gold rate */
export function calcGrandTotal(
  goldWeightGrams: number | null | undefined,
  stoneValue: number | null | undefined,
  makingChargesPercent: number | null | undefined,
  makingChargesDiscountPercent: number | null | undefined,
  goldRate: number
): number | null {
  if (!goldWeightGrams) return null;
  const goldValue = goldWeightGrams * goldRate;
  const mcPct = makingChargesPercent ?? 12;
  const makingValue = goldValue * (mcPct / 100);
  const mcDiscPct = makingChargesDiscountPercent ?? 0;
  const makingFinal = makingValue - makingValue * (mcDiscPct / 100);
  const subtotal = goldValue + (stoneValue ?? 0) + makingFinal;
  return Math.round(subtotal * 1.03);
}
