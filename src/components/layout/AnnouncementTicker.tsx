import { useStoreInfo } from "@/hooks/useContent";

export function AnnouncementTicker() {
  const { data } = useStoreInfo();
  const text = data?.announcement || "Festive Season Special — Up to 25% off on making charges. Book your bridal appointment today!";
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] whitespace-nowrap">
      <span className="w-1 h-1 rounded-full bg-[#C9A84C] inline-block" />
      {text}
    </span>
  ));
  return (
    <div className="bg-[#000000] text-[#C9A84C] overflow-hidden py-2.5">
      <div className="marquee">{items}{items}</div>
    </div>
  );
}
