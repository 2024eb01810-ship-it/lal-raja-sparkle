// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import {
//   Phone, MessageCircle, Menu, X, Search, MapPin, Store, Heart, ShoppingBag, User,
//   ChevronRight, Gem, Gift, Crown, Sparkles, Coins, ShieldCheck, Award, BadgeCheck,
//   Flame, Star, ArrowRight,
// } from "lucide-react";
// import logo from "@/assets/logo.png";
// import { phoneLink, whatsappLink } from "@/lib/whatsapp";
// import { useAuth } from "@/hooks/useAuth";

// const NAV = [
//   { to: "/collections", label: "All Jewellery", Icon: Gem },
//   { to: "/bridal", label: "Bridal", Icon: Crown },
//   { to: "/offers", label: "Offers & Gifting", Icon: Gift },
//   { to: "/collections?category=coins", label: "Gold Coins & Bars", Icon: Coins },
//   { to: "/about", label: "About Lal Raja", Icon: Sparkles },
//   { to: "/certifications", label: "Lal Raja Promises", Icon: ShieldCheck },
//   { to: "/store", label: "Stores", Icon: MapPin },
//   { to: "/contact", label: "Contact", Icon: Phone },
// ];

// const QUICK_CHIPS = [
//   { to: "/collections?sort=bestsellers", label: "Bestsellers", Icon: Star, cls: "bg-[#E9DDF7] text-[#5B2A86]" },
//   { to: "/collections?sort=new", label: "New Arrivals", Icon: Flame, cls: "bg-[#E2E5C7] text-[#5A6B1E]" },
//   { to: "/store", label: "Locate a Store", Icon: MapPin, cls: "bg-[#E8D9B0] text-[#7A5A1F]" },
// ];

// const FEATURED_TILES = [
//   { to: "/collections?category=rings", title: "Rings under 25k", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=70" },
//   { to: "/bridal", title: "Bridal Festival", img: "https://images.unsplash.com/photo-1535632066274-36f6becd5d11?w=400&q=70" },
//   { to: "/collections?category=necklaces", title: "Heritage", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=70" },
//   { to: "/collections?category=bangles", title: "Bespoke", img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=70" },
// ];

// export function Header() {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const navigate = useNavigate();
//   const { user, signOut } = useAuth();
//   const accountLabel = user?.user_metadata?.full_name || user?.phone || user?.email || "";

//   useEffect(() => {
//     document.body.style.overflow = open ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; };
//   }, [open]);

//   const onSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     const q = query.trim();
//     navigate(q ? `/collections?q=${encodeURIComponent(q)}` : "/collections");
//   };

//   return (
//     <header className="sticky top-0 z-header shadow-soft">
//       {/* Row 1 — Magenta brand bar */}
//       <div className="bg-gradient-brand text-brand-foreground">
//         <div className="container-px mx-auto max-w-7xl flex items-center gap-2 lg:gap-6 h-14 md:h-20">
//           {/* Mobile hamburger — LEFT (Malabar-style) */}
//           <button
//             type="button" onClick={() => setOpen((v) => !v)}
//             aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}
//             className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-brand-foreground/10"
//           >
//             {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>

//           <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0" aria-label="Lal Raja — home">
//             <img src={logo} alt="Lal Raja Gold And Diamond Jewellery" className="h-8 md:h-11 w-auto shrink-0" width={44} height={44} />
//             <span className="font-serif text-base md:text-2xl font-medium tracking-wide truncate leading-none">
//               Lal Raja
//             </span>
//           </Link>

//           {/* Centered search — desktop */}
//           <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto items-center">
//             <div className="relative w-full">
//               <input
//                 type="search"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="What are you looking for today?"
//                 aria-label="Search jewellery"
//                 className="w-full bg-transparent border-b border-brand-foreground/40 focus:border-brand-foreground outline-none text-sm placeholder:text-brand-foreground/70 py-2 pr-9"
//               />
//               <button type="submit" aria-label="Search" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80">
//                 <Search className="w-5 h-5" />
//               </button>
//             </div>
//           </form>

//           {/* Right icon group */}
//           <div className="flex items-center gap-0.5 sm:gap-2 shrink-0 ml-auto -mr-1">
//             {/* Stores — icon-only on mobile (Malabar-style) */}
//             <Link to="/store" aria-label="Stores" className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-brand-foreground/10 lg:hidden">
//               <Store className="w-[18px] h-[18px]" />
//             </Link>
//             <Link to="/store" aria-label="Stores" className="hidden lg:inline-flex flex-col items-center justify-center px-2 hover:opacity-80">
//               <Store className="w-5 h-5" />
//               <span className="text-[10px] mt-0.5 hidden lg:block">Stores</span>
//             </Link>
//             <a href={phoneLink} aria-label="Call store" className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
//               <Phone className="w-4 h-4" />
//             </a>
//             {/* Wishlist */}
//             <Link to="/collections?wishlist=1" aria-label="Wishlist" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
//               <Heart className="w-[18px] h-[18px] md:w-5 md:h-5" />
//             </Link>
//             {/* Bag */}
//             <Link to="/collections" aria-label="Bag" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
//               <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
//             </Link>
//             {/* WhatsApp — desktop only */}
//             <a
//               href={whatsappLink("Hello Lal Raja, I have an enquiry.")}
//               target="_blank" rel="noreferrer" aria-label="WhatsApp"
//               className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90"
//             >
//               <MessageCircle className="w-4 h-4" />
//             </a>
//             <Link to={user ? "/" : "/auth"} aria-label={user ? "My account" : "Sign in"} className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
//               <User className="w-5 h-5" />
//             </Link>
//           </div>
//         </div>

//         {/* Mobile search row — white background like Malabar, with Set Location pill */}
//         <div className="md:hidden bg-background">
//           <div className="container-px mx-auto max-w-7xl py-2.5 flex items-center gap-2">
//             <form onSubmit={onSearch} className="flex-1">
//               <div className="relative">
//                 <input
//                   type="search" value={query} onChange={(e) => setQuery(e.target.value)}
//                   placeholder="What are you looking for today?" aria-label="Search jewellery"
//                   className="w-full bg-transparent border-b border-border focus:border-brand outline-none text-sm placeholder:text-muted-foreground text-foreground py-2 pr-8"
//                 />
//                 <button type="submit" aria-label="Search" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-foreground/70">
//                   <Search className="w-4 h-4" />
//                 </button>
//               </div>
//             </form>
//             <Link
//               to="/store"
//               aria-label="Set location"
//               className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-foreground/70 hover:text-brand hover:bg-muted"
//             >
//               <MapPin className="w-[18px] h-[18px]" />
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Row 2 — White nav bar (desktop) */}
//       <div className="hidden lg:block bg-background border-b border-border">
//         <div className="container-px mx-auto max-w-7xl flex items-center gap-4 h-12">
//           <nav className="flex items-center gap-4 xl:gap-7 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
//             {NAV.map((n) => (
//               <NavLink
//                 key={n.to} to={n.to} end={n.to === "/"}
//                 className={({ isActive }) =>
//                   `text-[12px] xl:text-[13px] font-medium tracking-wide transition-colors hover:text-brand whitespace-nowrap shrink-0 ${
//                     isActive ? "text-brand" : "text-foreground/85"
//                   }`
//                 }
//               >
//                 {n.label}
//               </NavLink>
//             ))}
//           </nav>
//           <div className="flex items-center gap-3 shrink-0">
//             <span className="text-[12px] hidden 2xl:flex items-center gap-2">
//               <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden />
//               <span className="text-muted-foreground">Live Gold Rate:</span>
//               <span className="font-semibold text-brand">₹—/g (22kt)</span>
//             </span>
//             {/* Compact gold rate for lg & xl */}
//             <span className="text-[12px] 2xl:hidden flex items-center gap-1.5">
//               <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden />
//               <span className="font-semibold text-brand whitespace-nowrap">₹—/g</span>
//             </span>
//             <Link to="/store" className="inline-flex items-center gap-1.5 text-[12px] font-medium border border-border rounded-full px-3 py-1 hover:border-brand hover:text-brand transition-colors whitespace-nowrap">
//               <MapPin className="w-3.5 h-3.5" /> <span className="hidden 2xl:inline">Set Location</span><span className="2xl:hidden">Location</span>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Mobile / tablet menu — Malabar-style full-width drawer */}
//       {open && createPortal(
//         <>
//           {/* Backdrop covers the entire viewport, including header & bottom nav */}
//           <div
//             className="lg:hidden fixed inset-0 bg-black/40 animate-fade-in"
//             style={{ zIndex: 80 }}
//             onClick={() => setOpen(false)}
//             aria-hidden
//           />
//           {/* Drawer — full viewport, sits above header (40) and bottom nav (45) */}
//           <div
//             className="lg:hidden fixed inset-0 bg-background animate-fade-in flex flex-col shadow-strong overflow-hidden"
//             style={{ zIndex: 90 }}
//           >
//             {/* Welcome header */}
//             <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
//               <h2 className="font-serif text-2xl text-foreground">Welcome!</h2>
//               <button
//                 type="button"
//                 aria-label="Close menu"
//                 onClick={() => setOpen(false)}
//                 className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-foreground"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Sign in pill */}
//             <div className="px-5 pb-4 shrink-0">
//               {user ? (
//                 <div className="flex items-center justify-between gap-3 border border-border rounded-full pl-4 pr-2 py-1.5">
//                   <div className="flex items-center gap-2 min-w-0">
//                     <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand">
//                       <User className="w-4 h-4" />
//                     </span>
//                     <span className="text-sm font-medium truncate">{accountLabel}</span>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={async () => { await signOut(); setOpen(false); }}
//                     className="text-xs font-medium text-brand px-3 py-1.5 rounded-full hover:bg-brand/5"
//                   >
//                     Sign out
//                   </button>
//                 </div>
//               ) : (
//                 <Link
//                   to="/auth"
//                   onClick={() => setOpen(false)}
//                   className="inline-flex items-center gap-2 border border-brand text-brand rounded-full px-4 py-2 text-sm font-medium hover:bg-brand/5"
//                 >
//                   Sign In / Register <ArrowRight className="w-4 h-4" />
//                 </Link>
//               )}
//             </div>

//             {/* Scrollable content */}
//             <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-8">
//               {/* Quick chips row */}
//               <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-4 snap-x">
//                 {QUICK_CHIPS.map(({ to, label, Icon, cls }) => (
//                   <Link
//                     key={label}
//                     to={to}
//                     onClick={() => setOpen(false)}
//                     className={`shrink-0 snap-start inline-flex items-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-medium ${cls}`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     {label}
//                   </Link>
//                 ))}
//               </div>

//               {/* Main nav list */}
//               <nav className="px-5">
//                 {NAV.map(({ to, label, Icon }) => (
//                   <NavLink
//                     key={to}
//                     to={to}
//                     onClick={() => setOpen(false)}
//                     className={({ isActive }) =>
//                       `flex items-center justify-between gap-3 py-4 border-b border-border/60 ${
//                         isActive ? "text-brand" : "text-foreground/90"
//                       }`
//                     }
//                   >
//                     <span className="flex items-center gap-3">
//                       <Icon className="w-5 h-5 text-foreground/70" />
//                       <span className="text-[15px]">{label}</span>
//                     </span>
//                     <ChevronRight className="w-4 h-4 text-foreground/50" />
//                   </NavLink>
//                 ))}
//               </nav>

//               {/* Featured tiles 2x2 */}
//               <div className="px-5 mt-5 grid grid-cols-2 gap-3">
//                 {FEATURED_TILES.map(({ to, title, img }) => (
//                   <Link
//                     key={title}
//                     to={to}
//                     onClick={() => setOpen(false)}
//                     className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary group"
//                   >
//                     <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
//                     <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
//                       <span className="text-background text-sm font-medium">{title}</span>
//                     </div>
//                   </Link>
//                 ))}
//               </div>

//               {/* Footer links */}
//               <div className="mt-5 px-5 pb-2 text-[15px]">
//                 <Link to="/contact" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">FAQs</Link>
//                 <Link to="/collections" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">Size Guide</Link>
//                 <Link to="/contact" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">Contact Us</Link>
//               </div>

//               {/* Live Gold Rate footer */}
//               <div className="mt-2 px-5 py-4 bg-muted flex items-center justify-between text-sm">
//                 <span className="text-muted-foreground">Live Gold Rate</span>
//                 <span className="font-semibold text-brand">₹—/g (22kt)</span>
//               </div>
//             </div>
//           </div>
//         </>,
//         document.body
//       )}
//     </header>
//   );
// }
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Phone, MessageCircle, Menu, X, Search, MapPin, Store, Heart, ShoppingBag, User,
  ChevronRight, Gem, Gift, Crown, Sparkles, Coins, ShieldCheck, Award, BadgeCheck,
  Flame, Star, ArrowRight,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/useAuth";
import { useSearchTracking } from "@/hooks/usePersonalization"; // ← Agent 2

const NAV = [
  { to: "/collections", label: "All Jewellery", Icon: Gem },
  { to: "/bridal", label: "Bridal", Icon: Crown },
  { to: "/offers", label: "Offers & Gifting", Icon: Gift },
  { to: "/collections?category=coins", label: "Gold Coins & Bars", Icon: Coins },
  { to: "/about", label: "About Lal Raja", Icon: Sparkles },
  { to: "/certifications", label: "Lal Raja Promises", Icon: ShieldCheck },
  { to: "/store", label: "Stores", Icon: MapPin },
  { to: "/contact", label: "Contact", Icon: Phone },
];

const QUICK_CHIPS = [
  { to: "/collections?sort=bestsellers", label: "Bestsellers", Icon: Star, cls: "bg-[#E9DDF7] text-[#5B2A86]" },
  { to: "/collections?sort=new", label: "New Arrivals", Icon: Flame, cls: "bg-[#E2E5C7] text-[#5A6B1E]" },
  { to: "/store", label: "Locate a Store", Icon: MapPin, cls: "bg-[#E8D9B0] text-[#7A5A1F]" },
];

const FEATURED_TILES = [
  { to: "/collections?category=rings", title: "Rings under 25k", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=70" },
  { to: "/bridal", title: "Bridal Festival", img: "https://images.unsplash.com/photo-1535632066274-36f6becd5d11?w=400&q=70" },
  { to: "/collections?category=necklaces", title: "Heritage", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=70" },
  { to: "/collections?category=bangles", title: "Bespoke", img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=70" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const trackSearch = useSearchTracking(); // ← Agent 2
  const accountLabel = user?.user_metadata?.full_name || user?.phone || user?.email || "";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) trackSearch(q); // ← Agent 2: track every search
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
            <span className="font-serif text-base md:text-2xl font-medium tracking-wide truncate leading-none">
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
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0 ml-auto -mr-1">
            {/* Stores — icon-only on mobile (Malabar-style) */}
            <Link to="/store" aria-label="Stores" className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-brand-foreground/10 lg:hidden">
              <Store className="w-[18px] h-[18px]" />
            </Link>
            <Link to="/store" aria-label="Stores" className="hidden lg:inline-flex flex-col items-center justify-center px-2 hover:opacity-80">
              <Store className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 hidden lg:block">Stores</span>
            </Link>
            <a href={phoneLink} aria-label="Call store" className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
              <Phone className="w-4 h-4" />
            </a>
            {/* Wishlist */}
            <Link to="/collections?wishlist=1" aria-label="Wishlist" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
              <Heart className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </Link>
            {/* Bag */}
            <Link to="/collections" aria-label="Bag" className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-brand-foreground/10">
              <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </Link>
            {/* WhatsApp — desktop only */}
            <a
              href={whatsappLink("Hello Lal Raja, I have an enquiry.")}
              target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <Link to={user ? "/" : "/auth"} aria-label={user ? "My account" : "Sign in"} className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-foreground/10">
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
              aria-label="Set location"
              className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-foreground/70 hover:text-brand hover:bg-muted"
            >
              <MapPin className="w-[18px] h-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2 — White nav bar (desktop) */}
      <div className="hidden lg:block bg-background border-b border-border">
        <div className="container-px mx-auto max-w-7xl flex items-center gap-4 h-12">
          <nav className="flex items-center gap-4 xl:gap-7 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
            {NAV.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.to === "/"}
                className={({ isActive }) =>
                  `text-[12px] xl:text-[13px] font-medium tracking-wide transition-colors hover:text-brand whitespace-nowrap shrink-0 ${isActive ? "text-brand" : "text-foreground/85"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[12px] hidden 2xl:flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden />
              <span className="text-muted-foreground">Live Gold Rate:</span>
              <span className="font-semibold text-brand">₹—/g (22kt)</span>
            </span>
            {/* Compact gold rate for lg & xl */}
            <span className="text-[12px] 2xl:hidden flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden />
              <span className="font-semibold text-brand whitespace-nowrap">₹—/g</span>
            </span>
            <Link to="/store" className="inline-flex items-center gap-1.5 text-[12px] font-medium border border-border rounded-full px-3 py-1 hover:border-brand hover:text-brand transition-colors whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5" /> <span className="hidden 2xl:inline">Set Location</span><span className="2xl:hidden">Location</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / tablet menu — Malabar-style full-width drawer */}
      {open && createPortal(
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 animate-fade-in"
            style={{ zIndex: 80 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="lg:hidden fixed inset-0 bg-background animate-fade-in flex flex-col shadow-strong overflow-hidden"
            style={{ zIndex: 90 }}
          >
            {/* Welcome header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <h2 className="font-serif text-2xl text-foreground">Welcome!</h2>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sign in pill */}
            <div className="px-5 pb-4 shrink-0">
              {user ? (
                <div className="flex items-center justify-between gap-3 border border-border rounded-full pl-4 pr-2 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand">
                      <User className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium truncate">{accountLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => { await signOut(); setOpen(false); }}
                    className="text-xs font-medium text-brand px-3 py-1.5 rounded-full hover:bg-brand/5"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 border border-brand text-brand rounded-full px-4 py-2 text-sm font-medium hover:bg-brand/5"
                >
                  Sign In / Register <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-8">
              {/* Quick chips row */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-4 snap-x">
                {QUICK_CHIPS.map(({ to, label, Icon, cls }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`shrink-0 snap-start inline-flex items-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-medium ${cls}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Main nav list */}
              <nav className="px-5">
                {NAV.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-3 py-4 border-b border-border/60 ${isActive ? "text-brand" : "text-foreground/90"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-foreground/70" />
                      <span className="text-[15px]">{label}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-foreground/50" />
                  </NavLink>
                ))}
              </nav>

              {/* Featured tiles 2x2 */}
              <div className="px-5 mt-5 grid grid-cols-2 gap-3">
                {FEATURED_TILES.map(({ to, title, img }) => (
                  <Link
                    key={title}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary group"
                  >
                    <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                      <span className="text-background text-sm font-medium">{title}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Footer links */}
              <div className="mt-5 px-5 pb-2 text-[15px]">
                <Link to="/contact" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">FAQs</Link>
                <Link to="/collections" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">Size Guide</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="block py-3 border-t border-border/60 text-foreground/80">Contact Us</Link>
              </div>

              {/* Live Gold Rate footer */}
              <div className="mt-2 px-5 py-4 bg-muted flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Live Gold Rate</span>
                <span className="font-semibold text-brand">₹—/g (22kt)</span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}