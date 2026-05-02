import { NavLink } from "react-router-dom";
import { Home, Sparkles, Heart, MapPin, Phone } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/collections", label: "Shop", icon: Sparkles },
  { to: "/bridal", label: "Bridal", icon: Heart },
  { to: "/store", label: "Store", icon: MapPin },
  { to: "/contact", label: "Contact", icon: Phone },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-blur border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] tracking-wide uppercase ${
                  isActive ? "text-gold" : "text-foreground/70"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
