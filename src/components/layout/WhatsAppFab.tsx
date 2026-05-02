import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hello Lal Raja Gold And Diamond Jewellery, I'd like to know more.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 z-fab w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-luxury hover:scale-110 transition-transform"
      style={{ bottom: "calc(var(--bottom-nav-total) + 16px)" }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
