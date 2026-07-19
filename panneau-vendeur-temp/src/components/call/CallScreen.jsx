import { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// Sonnerie via Web Audio API
function useRingTone(active) {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);

  const playRing = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    if (active) {
      playRing();
      intervalRef.current = setInterval(playRing, 1500);
    }
    return () => {
      clearInterval(intervalRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, [active]);
}

/**
 * CallScreen — UI d'un appel en cours (sonnerie, appel actif, raccroché)
 * Props:
 *  - mode: "calling" | "ringing" | "active" | "ended"
 *  - targetName, targetAvatar
 *  - onHangup
 *  - onAccept (mode ringing uniquement)
 *  - onReject (mode ringing uniquement)
 *  - remoteAudioRef: ref à attacher à <audio>
 */
export default function CallScreen({ mode, targetName, targetAvatar, onHangup, onAccept, onReject, remoteAudioRef }) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Sonnerie active pendant "calling" et "ringing"
  useRingTone(mode === "calling" || mode === "ringing");

  useEffect(() => {
    if (mode === "active") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel = {
    calling: "Appel en cours...",
    ringing: "Appel entrant",
    active: formatTime(seconds),
    ended: "Appel terminé",
  }[mode] || "";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-[#1a1a2e] to-[#16213e] px-6 pt-16 pb-14">
      {/* Audio element pour le son distant */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Avatar + nom */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-gray-700">
            {targetAvatar
              ? <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[40px] font-black text-white/50">{(targetName || "?")[0]}</div>
            }
          </div>
          {/* Anneaux d'animation si sonnerie */}
          {(mode === "calling" || mode === "ringing") && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-green-400/20 animate-ping" style={{ animationDelay: "0.4s" }} />
            </>
          )}
        </div>
        <p className="text-white text-[24px] font-black">{targetName || "Inconnu"}</p>
        <p className={`text-[14px] font-medium ${mode === "active" ? "text-green-400 font-black" : "text-white/50"}`}>
          {statusLabel}
        </p>
      </div>

      {/* Equalizer si appel actif */}
      {mode === "active" && (
        <div className="flex items-center gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 bg-green-400/60 rounded-full animate-pulse"
              style={{ height: `${8 + (i % 5) * 6}px`, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      )}

      {/* Contrôles */}
      <div className="w-full">
        {mode === "ringing" ? (
          /* Appel entrant : refuser + accepter */
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onReject} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/40 active:scale-95">
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <p className="text-white/40 text-[11px] font-medium">Refuser</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={onAccept} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 active:scale-95 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.02z"/>
                </svg>
              </button>
              <p className="text-white/40 text-[11px] font-medium">Accepter</p>
            </div>
          </div>
        ) : (
          /* Appel sortant ou actif */
          <div className="flex items-center justify-around">
            {mode === "active" && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setMuted(m => !m)} className={`w-14 h-14 rounded-full flex items-center justify-center ${muted ? "bg-white/20" : "bg-white/10"} active:scale-95`}>
                    {muted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  </button>
                  <p className="text-white/40 text-[10px] font-medium">{muted ? "Muet" : "Micro"}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setSpeaker(s => !s)} className={`w-14 h-14 rounded-full flex items-center justify-center ${speaker ? "bg-white/20" : "bg-white/10"} active:scale-95`}>
                    {speaker ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
                  </button>
                  <p className="text-white/40 text-[10px] font-medium">HP</p>
                </div>
              </>
            )}
            <div className="flex flex-col items-center gap-2">
              <button onClick={onHangup} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/40 active:scale-95">
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <p className="text-white/40 text-[11px] font-medium">Raccrocher</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}