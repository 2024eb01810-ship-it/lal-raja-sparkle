import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useStoreInfo } from "@/hooks/useContent";

export function Footer() {
  const { data: info } = useStoreInfo();
  return (
    <footer className="bg-foreground text-background mt-16 md:mt-24 pb-bottom-nav">
      <div className="container-px max-w-7xl mx-auto py-12 md:py-16 grid gap-10 md:grid-cols-4">
        <div>
          <h3 className="font-serif text-2xl mb-2">Lal Raja Gold And Diamond Jewellery</h3>
          <p className="telugu text-gold mb-4">లాల్ రాజా ఆభరణాలు</p>
          <p className="text-sm text-background/70 leading-relaxed">
            Crafting timeless jewellery in Vijayawada with heritage, honesty and artistry.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-background/80">
            <li><Link to="/collections" className="hover:text-gold transition-colors">Shop</Link></li>
            <li><Link to="/bridal" className="hover:text-gold transition-colors">Bridal</Link></li>
            <li><Link to="/offers" className="hover:text-gold transition-colors">Offers</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
            <li><Link to="/certifications" className="hover:text-gold transition-colors">Trust</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Visit Us</h4>
          <ul className="space-y-3 text-sm text-background/80">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{info?.address ?? "Vijayawada, Andhra Pradesh"}</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" />{info?.phone ?? "+91 8184839498"}</li>
            <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" />{info?.email ?? "info@lalrajajewels.com"}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Follow</h4>
          <div className="flex gap-3">
            <a href={info?.instagram_url ?? "#"} aria-label="Instagram" className="w-9 h-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-gold hover:border-gold transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href={info?.facebook_url ?? "#"} aria-label="Facebook" className="w-9 h-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-gold hover:border-gold transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href={info?.youtube_url ?? "#"} aria-label="YouTube" className="w-9 h-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-gold hover:border-gold transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
          <p className="mt-6 text-xs text-background/50">BIS Hallmarked · IGI Certified</p>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-px max-w-7xl mx-auto py-5 text-xs text-background/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Lal Raja Gold And Diamond Jewellery. All rights reserved.</span>
          <span>Vijayawada, Andhra Pradesh, India</span>
        </div>
      </div>
    </footer>
  );
}
