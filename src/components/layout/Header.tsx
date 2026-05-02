import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/bridal", label: "Bridal" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/store", label: "Store" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? "glass-blur shadow-soft" : "bg-background"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2" aria-label="Lal Raja Jewels home">
          <img src={logo} alt="Lal Raja Jewels" className="h-10 md:h-12 w-auto" width={48} height={48} />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-serif text-lg md:text-xl font-medium tracking-wide">Lal Raja</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Jewels</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-xs uppercase tracking-[0.2em] transition-colors hover:text-gold ${
                  isActive ? "text-gold" : "text-foreground/80"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={phoneLink}
            aria-label="Call store"
            className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={whatsappLink("Hello Lal Raja Jewels, I have an enquiry.")}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
