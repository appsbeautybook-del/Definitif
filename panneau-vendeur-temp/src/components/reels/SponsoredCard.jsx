import { ExternalLink, X } from "lucide-react";

export default function SponsoredCard({ annonce, onClose }) {
  if (!annonce) return null;

  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 mb-1">
      {/* Header sponsorisé */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {annonce.sponsor_logo ? (
            <img src={annonce.sponsor_logo} alt={annonce.sponsor_name} className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-[12px] font-black">{(annonce.sponsor_name || "S")[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-black text-gray-900 truncate">{annonce.sponsor_name}</p>
              <button className="text-[11px] font-black text-primary border border-primary rounded-full px-2.5 py-0.5 shrink-0">
                Suivre
              </button>
            </div>
            <p className="text-[10px] font-medium text-gray-400">Sponsorisé</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 shrink-0 ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative">
        <img src={annonce.image_url} alt={annonce.title} className="w-full object-cover" style={{ maxHeight: "180px", objectFit: "cover" }} />
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <h3 className="text-[13px] font-black text-gray-900 mb-0.5">{annonce.title}</h3>
        {annonce.description && (
          <p className="text-[11px] text-gray-500 leading-snug mb-2 line-clamp-2">{annonce.description}</p>
        )}
        <button
          onClick={() => { if (annonce.cta_url) window.open(annonce.cta_url, "_blank"); }}
          className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 active:scale-[0.99] transition-all"
        >
          <span className="text-[12px] font-black text-gray-800">{annonce.cta_label || "En savoir plus"}</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}