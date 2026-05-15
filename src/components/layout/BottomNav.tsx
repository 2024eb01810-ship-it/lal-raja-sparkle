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
      className="md:hidden fixed bottom-0 inset-x-0 z-bottom-nav glass-blur border-t border-border"
      style={{
        height: "var(--bottom-nav-total)",
        paddingBottom: "var(--safe-bottom)",
      }}
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5 h-[var(--bottom-nav-h)]">
        {ITEMS.map((it) => (
          <li key={it.to} className="min-w-0">
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 h-full px-1 text-[10px] tracking-wide uppercase truncate ${
                  isActive ? "text-[#C9A84C]" : "text-foreground/70"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon className={`w-5 h-5 shrink-0 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span className="truncate w-full text-center">{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
