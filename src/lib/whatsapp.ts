export const WHATSAPP_NUMBER = "918184839498";
export const PHONE_NUMBER = "+918184839498";

/** Strip everything except digits so wa.me accepts the number. */
function normalizeWa(num?: string | null) {
  const cleaned = (num ?? "").replace(/\D/g, "");
  return cleaned || WHATSAPP_NUMBER;
}

/** Keep a leading + and digits only; fall back to default. */
function normalizeTel(num?: string | null) {
  const raw = (num ?? "").trim();
  if (!raw) return PHONE_NUMBER;
  const hasPlus = raw.startsWith("+");
  const cleaned = raw.replace(/\D/g, "");
  return cleaned ? (hasPlus ? `+${cleaned}` : cleaned) : PHONE_NUMBER;
}

export function whatsappLink(message: string, number?: string | null) {
  return `https://wa.me/${normalizeWa(number)}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryLink(
  productName: string,
  slug?: string,
  opts?: { number?: string | null; message?: string | null },
) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/product/${slug ?? ""}` : "";
  const base =
    opts?.message?.trim() ||
    `Hello Lal Raja Gold And Diamond Jewellery, I'd like to enquire about "${productName}".`;
  const text = url ? `${base}\n${url}` : base;
  return whatsappLink(text, opts?.number);
}

export const phoneLink = `tel:${PHONE_NUMBER}`;

export function productPhoneLink(number?: string | null) {
  return `tel:${normalizeTel(number)}`;
}
