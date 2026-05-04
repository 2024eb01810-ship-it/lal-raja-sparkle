import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Tags, Layers, Image as ImageIcon, Tag, MessageSquare,
  Store, Calendar, Inbox, Users, LogOut, KeyRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useState } from "react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/store-info", label: "Store Info", icon: Store },
  { to: "/admin/appointments", label: "Appointments", icon: Calendar },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/users", label: "Users & Roles", icon: Users, adminOnly: true },
  { to: "/admin/access-requests", label: "Access Requests", icon: KeyRound, adminOnly: true },
];

export default function AdminLayout() {
  const { signOut, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <Link to="/admin" className="flex items-center gap-2 px-4 h-16 border-b border-border">
          <img src={logo} alt="" className="h-9" />
          <div className="leading-tight">
            <p className="font-serif text-base">Lal Raja</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Admin</p>
          </div>
        </Link>
        <nav className="flex-1 py-3 overflow-y-auto">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                  isActive ? "bg-muted text-gold font-medium" : "text-foreground/80"
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground truncate px-1">{user?.email}</p>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full gap-2">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <button onClick={() => setOpen((v) => !v)} className="text-sm font-medium">
            ☰ Menu
          </button>
          <Link to="/admin" className="font-serif">Lal Raja Admin</Link>
          <Button onClick={handleSignOut} variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>
        {open && (
          <div className="md:hidden border-b border-border bg-card">
            {items.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm border-b border-border/50 last:border-0 ${
                    isActive ? "text-gold font-medium" : ""
                  }`
                }
              >
                <n.icon className="w-4 h-4" />
                {n.label}
              </NavLink>
            ))}
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
