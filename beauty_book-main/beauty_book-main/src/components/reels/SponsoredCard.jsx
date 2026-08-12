import { useState, useEffect, useRef } from "react";
import { ExternalLink, X, Play } from "lucide-react";

export default function SponsoredCard({ annonce, onClose, variant = "reels" }) {
  if (!annonce || (!annonce.image_url && !annonce.video_url)) return null;

  return (
    <>
      {variant === "styles" ? (
        <StylesAd annonce={annonce} onClose={onClose} />
      ) : (
        <ReelsAd annonce={annonce} onClose={onClose} />
      )}
    </>
  );
}

/* ── REELS: plein écran, sponsor en haut, CTA en bas, countdown 5s pour vidéo ── */
function ReelsAd({ annonce, onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef(null);
  const isVideo = !!annonce.video_url;

  useEffect(() => {
    if (!isVideo) return;
    if (countdown <= 0) { setShowSkip(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isVideo]);

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      <div className="flex-1 relative">
        {/* Media */}
        {isVideo ? (
          <video ref={videoRef} src={annonce.video_url} className="w-full h-full object-cover" autoPlay muted playsInline />
        ) : (
          <img src={annonce.image_url} alt={annonce.title} className="w-full h-full object-cover" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Header sponsorisé */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-black/50 to-transparent" style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}>
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

          {/* Skip button / countdown */}
          {isVideo && (
            <div className="flex items-center gap-2 shrink-0">
              {!showSkip ? (
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span className="text-white text-[12px] font-black">{countdown}s</span>
                </div>
              ) : (
                <button onClick={onClose} className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-[12px] font-black text-gray-900 active:scale-95 transition-all shadow-lg">
                  Ignorer
                </button>
              )}
            </div>
          )}

          {!isVideo && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom content */}
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

/* ── STYLES: sponsor en bas avec catégories, CTA au-dessus nav, vidéo 5s countdown ── */
function StylesAd({ annonce, onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef(null);
  const isVideo = !!annonce.video_url;

  useEffect(() => {
    if (!isVideo) return;
    if (countdown <= 0) { setShowSkip(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isVideo]);

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden rounded-none">
      {/* Skip button for video */}
      {isVideo && (
        <div className="absolute top-3 right-3 z-20" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {!showSkip ? (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <span className="text-white text-[11px] font-black">{countdown}s</span>
            </div>
          ) : (
            <button onClick={onClose} className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[11px] font-black text-gray-900 active:scale-95 transition-all shadow-lg">
              Ignorer
            </button>
          )}
        </div>
      )}

      {/* Close button for image */}
      {!isVideo && (
        <button onClick={onClose} className="absolute top-3 right-3 z-20 w-7 h-7 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Media — takes all available space above bottom sections */}
      <div className="flex-1 relative overflow-hidden">
        {isVideo ? (
          <video ref={videoRef} src={annonce.video_url} className="w-full h-full object-cover" autoPlay muted playsInline />
        ) : (
          <img src={annonce.image_url} alt={annonce.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* CTA button — au-dessus du menu navigation */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => { if (annonce.cta_url) window.open(annonce.cta_url, "_blank"); }}
          className="w-full flex items-center justify-between bg-primary rounded-2xl px-4 py-3 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
        >
          <span className="text-[14px] font-black text-white">{annonce.cta_label || "En savoir plus"}</span>
          <ExternalLink className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Sponsor + title en bas */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          {annonce.sponsor_logo ? (
            <img src={annonce.sponsor_logo} alt={annonce.sponsor_name} className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-[14px] font-black">{(annonce.sponsor_name || "S")[0]}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-black text-gray-900 truncate">{annonce.sponsor_name}</p>
            <p className="text-[11px] text-gray-400 font-medium">Sponsorisé</p>
          </div>
        </div>
        {annonce.title && (
          <p className="text-[13px] text-gray-700 font-semibold mt-2 line-clamp-1">{annonce.title}</p>
        )}
      </div>
    </div>
  );
}