import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Menu, X, Search, MapPin, Store, Heart, ShoppingBag, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

const NAV = [
  { to: "/collections", label: "All Jewellery" },
  { to: "/bridal", label: "Bridal" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/store", label: "Store" },
  { to: "/certifications", label: "Trust" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/collections?q=${encodeURIComponent(q)}` : "/collections");
  };

  return (
    <header className="sticky top-0 z-header shadow-soft">
      {/* Row 1 — Magenta brand bar */}
      <div className="bg-gradient-brand text-brand-foreground">
        <div className="container-px mx-auto max-w-7xl flex items-center gap-2 lg:gap-6 h-14 md:h-20">
          {/* Mobile hamburger — LEFT (Malabar-style) */}
          <button
            type="button" onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-brand-foreground/10"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0" aria-label="Lal Raja — home">
            <img src={logo} alt="Lal Raja Gold And Diamond Jewellery" className="h-8 md:h-11 w-auto shrink-0" width={44} height={44} />
            <span className="hidden md:inline font-serif text-lg md:text-2xl font-medium tracking-wide truncate">
              Lal Raja
            </span>
          </Link>

          {/* Centered search — desktop */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto items-center">
            <div className="relative w-full">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for today?"
                aria-label="Search jewellery"
                className="w-full bg-transparent border-b border-brand-foreground/40 focus:border-brand-foreground outline-none text-sm placeholder:text-brand-foreground/70 py-2 pr-9"
              />
              <button type="submit" aria-label="Search" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right icon group */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
            {/* Stores pill — visible on mobile too (Malabar-style) */}
            <Link to="/store" aria-label="Stores" className="inline-flex items-center gap-1 px-2.5 h-8 rounded-full border border-brand-foreground/40 hover:bg-brand-foreground/10 text-[11px] font-medium lg:hidden">
              <Store className="w-3.5 h-3.5" />
              <span>Stores</span>
            </Link>
            <Link to="/store" aria-label="Stores" className="hidden lg:inline-flex flex-col items-center justify-center px-2 hover:opacity-80">
              <Store className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 hidden lg:block">Stores</span>
            </Link>
            <a href={phoneLink} aria-label="Call store" className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
              <Phone className="w-4 h-4" />
            </a>
            {/* Wishlist (mobile + up) */}
            <Link to="/collections?wishlist=1" aria-label="Wishlist" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
              <Heart className="w-5 h-5" />
            </Link>
            {/* Bag (mobile + up) */}
            <Link to="/collections" aria-label="Bag" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
              <ShoppingBag className="w-5 h-5" />
            </Link>
            {/* WhatsApp — desktop only (mobile has floating button) */}
            <a
              href={whatsappLink("Hello Lal Raja, I have an enquiry.")}
              target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <Link to="/contact" aria-label="Account" className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mobile search row — white background like Malabar, with Set Location pill */}
        <div className="md:hidden bg-background">
          <div className="container-px mx-auto max-w-7xl py-2.5 flex items-center gap-2">
            <form onSubmit={onSearch} className="flex-1">
              <div className="relative">
                <input
                  type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for today?" aria-label="Search jewellery"
                  className="w-full bg-transparent border-b border-border focus:border-brand outline-none text-sm placeholder:text-muted-foreground text-foreground py-2 pr-8"
                />
                <button type="submit" aria-label="Search" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-foreground/70">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
            <Link
              to="/store"
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium border border-border rounded-md px-2.5 py-1.5 text-foreground/80 hover:border-brand hover:text-brand leading-tight"
            >
              <span>Set<br/>Location</span>
              <MapPin className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2 — White nav bar (desktop) */}
      <div className="hidden lg:block bg-background border-b border-border">
        <div className="container-px mx-auto max-w-7xl flex items-center justify-between gap-4 h-12">
          <nav className="flex items-center gap-6 xl:gap-8 min-w-0">
            {NAV.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.to === "/"}
                className={({ isActive }) =>
                  `text-[12px] xl:text-[13px] font-medium tracking-wide transition-colors hover:text-brand whitespace-nowrap ${
                    isActive ? "text-brand" : "text-foreground/85"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[12px] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden />
              <span className="text-muted-foreground">Live Gold Rate:</span>
              <span className="font-semibold text-brand">₹—/g (22kt)</span>
            </span>
            <Link to="/store" className="inline-flex items-center gap-1.5 text-[12px] font-medium border border-border rounded-full px-3 py-1 hover:border-brand hover:text-brand transition-colors">
              <MapPin className="w-3.5 h-3.5" /> Set Location
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in z-mobile-menu relative shadow-soft max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <nav className="container-px mx-auto max-w-7xl py-4 flex flex-col">
            <NavLink to="/" end onClick={() => setOpen(false)} className={({ isActive }) => `py-3 text-sm uppercase tracking-[0.2em] border-b border-border/60 ${isActive ? "text-brand" : "text-foreground/85"}`}>Home</NavLink>
            {NAV.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-3 text-sm uppercase tracking-[0.2em] border-b border-border/60 last:border-0 ${
                    isActive ? "text-brand" : "text-foreground/85"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Live Gold Rate</span>
              <span className="font-semibold text-brand">₹—/g (22kt)</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
