export const WHATSAPP_NUMBER = "918184839498";
export const PHONE_NUMBER = "+918184839498";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryLink(productName: string, slug?: string) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/product/${slug ?? ""}` : "";
  return whatsappLink(
    `Hello Lal Raja Gold And Diamond Jewellery, I'd like to enquire about "${productName}".${url ? `\n${url}` : ""}`
  );
}

export const phoneLink = `tel:${PHONE_NUMBER}`;
