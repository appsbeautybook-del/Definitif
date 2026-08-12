import { ExternalLink, X } from "lucide-react";

export default function SponsoredCard({ annonce, onClose }) {
  if (!annonce) return null;

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Image full screen */}
      <div className="flex-1 relative">
        <img src={annonce.image_url} alt={annonce.title} className="w-full h-full object-cover" />

        {/* Overlay gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Header sponsorisé overlay */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-black/40 to-transparent" style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {annonce.sponsor_logo ? (
              <img src={annonce.sponsor_logo} alt={annonce.sponsor_name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
                <span className="text-white text-[14px] font-black">{(annonce.sponsor_name || "S")[0]}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-[14px] font-black truncate drop-shadow-lg">{annonce.sponsor_name}</p>
              <p className="text-white/60 text-[11px] font-medium">Sponsorisé</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Texte + CTA overlay bottom */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-6">
          <h3 className="text-white text-[18px] font-black mb-1 drop-shadow-lg">{annonce.title}</h3>
          {annonce.description && (
            <p className="text-white/70 text-[13px] leading-snug mb-3 line-clamp-2 drop-shadow">{annonce.description}</p>
          )}
          <button
            onClick={() => { if (annonce.cta_url) window.open(annonce.cta_url, "_blank"); }}
            className="w-full flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 active:scale-[0.98] transition-all shadow-lg"
          >
            <span className="text-[14px] font-black text-gray-900">{annonce.cta_label || "En savoir plus"}</span>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}