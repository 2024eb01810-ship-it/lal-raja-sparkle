import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { WhatsAppFab } from "./WhatsAppFab";
import { AnnouncementTicker } from "./AnnouncementTicker";

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementTicker />
      <Header />
      <main className="flex-1 pb-bottom-nav">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFab />
    </div>
  );
}
