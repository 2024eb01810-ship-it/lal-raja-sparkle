import { Link } from "react-router-dom";
import { useAdminList } from "@/hooks/useAdmin";
import { Package, Inbox, Calendar, Tag, Image, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

const STATS = [
  { table: "products", label: "Products", icon: Package, to: "/admin/products" },
  { table: "enquiries", label: "Enquiries", icon: Inbox, to: "/admin/enquiries" },
  { table: "appointments", label: "Appointments", icon: Calendar, to: "/admin/appointments" },
  { table: "offers", label: "Active Offers", icon: Tag, to: "/admin/offers" },
  { table: "banners", label: "Banners", icon: Image, to: "/admin/banners" },
  { table: "testimonials", label: "Testimonials", icon: MessageSquare, to: "/admin/testimonials" },
] as const;

function StatCard({ table, label, icon: Icon, to }: any) {
  const { data } = useAdminList(table);
  return (
    <Link to={to} className="bg-card p-5 shadow-soft hover:shadow-luxury transition-shadow flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-serif">{data?.length ?? "—"}</p>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data: enquiries } = useAdminList("enquiries");
  const newEnq = (enquiries ?? []).filter((e: any) => e.status === "new").length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store activity." />
      {newEnq > 0 && (
        <div className="bg-gold/10 border border-gold/30 px-4 py-3 mb-6 text-sm">
          You have <strong>{newEnq}</strong> new enquir{newEnq === 1 ? "y" : "ies"} awaiting response.{" "}
          <Link to="/admin/enquiries" className="underline">View</Link>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STATS.map((s) => <StatCard key={s.table} {...s} />)}
      </div>
    </div>
  );
}
