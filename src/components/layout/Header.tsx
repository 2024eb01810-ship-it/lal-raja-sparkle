import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Phone, MessageCircle, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Shop" },
  { to: "/bridal", label: "Bridal" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/store", label: "Store" },
  { to: "/certifications", label: "Trust" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-header transition-all duration-500 ${
        scrolled ? "glass-blur shadow-soft" : "bg-background"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between gap-3 lg:gap-6 h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0" aria-label="Lal Raja Gold And Diamond Jewellery — home">
          <img src={logo} alt="Lal Raja Gold And Diamond Jewellery" className="h-9 md:h-12 w-auto shrink-0" width={48} height={48} />
          <span className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wide truncate">
            Lal Raja
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 flex-1 justify-center min-w-0 px-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-[11px] xl:text-xs uppercase tracking-[0.18em] xl:tracking-[0.22em] transition-colors hover:text-gold whitespace-nowrap ${
                  isActive ? "text-gold" : "text-foreground/80"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <a
            href={phoneLink}
            aria-label="Call store"
            className="hidden sm:inline-flex lg:hidden xl:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={whatsappLink("Hello Lal Raja Gold And Diamond Jewellery, I have an enquiry.")}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu — sits above page, below overlays */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in z-mobile-menu relative shadow-soft max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <nav className="container-px mx-auto max-w-7xl py-4 flex flex-col">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-3 text-sm uppercase tracking-[0.2em] border-b border-border/60 last:border-0 ${
                    isActive ? "text-gold" : "text-foreground/85"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
