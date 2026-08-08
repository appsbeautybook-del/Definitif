import { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Phone } from "lucide-react";

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
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  useEffect(() => {
    if (active) {
      playRing();
      intervalRef.current = setInterval(playRing, 2000);
    }
    return () => {
      clearInterval(intervalRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, [active]);
}

export default function CallScreen({ mode, targetName, targetAvatar, onHangup, onAccept, onReject, remoteAudioRef }) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useRingTone(mode === "calling" || mode === "ringing");

  useEffect(() => {
    if (mode === "active") {
      setSeconds(0);
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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between px-6 pt-12 pb-10"
      style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }}>
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-48 h-48 bg-orange-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-5 relative z-10">
        <div className="relative">
          {(mode === "calling" || mode === "ringing") && (
            <>
              <div className="absolute -inset-3 rounded-full border-2 border-orange-400/30 animate-ping" />
              <div className="absolute -inset-6 rounded-full border border-orange-400/15 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="absolute -inset-9 rounded-full border border-orange-400/10 animate-ping" style={{ animationDelay: "0.6s" }} />
            </>
          )}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/20" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl shadow-orange-500/20 bg-gradient-to-br from-orange-400 to-orange-600">
            {targetAvatar ? (
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                {(targetName || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-white text-[24px] font-black tracking-tight">{targetName || "Inconnu"}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {mode === "active" && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <p className={`text-[14px] font-semibold ${mode === "active" ? "text-green-400" : "text-orange-300/70"}`}>
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      {mode === "active" && (
        <div className="flex items-end gap-[3px] h-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-[3px] rounded-full bg-gradient-to-t from-orange-500/80 to-orange-300/40 animate-pulse"
              style={{ height: `${6 + Math.sin(i * 0.6) * 4 + (i % 3) * 3}px`, animationDelay: `${i * 0.07}s`, animationDuration: `${0.4 + (i % 4) * 0.15}s` }} />
          ))}
        </div>
      )}

      <div className="w-full relative z-10">
        {mode === "ringing" ? (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-3">
              <button onClick={onReject}
                className="w-[72px] h-[72px] bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 active:scale-95 transition-all">
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <p className="text-white/40 text-[11px] font-semibold">Refuser</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button onClick={onAccept}
                className="w-[72px] h-[72px] bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-400/30 active:scale-95 animate-pulse">
                <Phone className="w-7 h-7 text-white" />
              </button>
              <p className="text-white/40 text-[11px] font-semibold">Accepter</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-around">
            {mode === "active" && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setMuted(m => !m)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${muted ? "bg-white/20 shadow-lg shadow-white/10" : "bg-white/10 hover:bg-white/15"}`}>
                    {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                  <p className="text-white/40 text-[10px] font-semibold">{muted ? "Muet" : "Micro"}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setSpeaker(s => !s)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${speaker ? "bg-white/20 shadow-lg shadow-white/10" : "bg-white/10 hover:bg-white/15"}`}>
                    {speaker ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
                  </button>
                  <p className="text-white/40 text-[10px] font-semibold">HP</p>
                </div>
              </>
            )}
            <div className="flex flex-col items-center gap-2">
              <button onClick={onHangup}
                className="w-[72px] h-[72px] bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 active:scale-95 transition-all">
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <p className="text-white/40 text-[11px] font-semibold">Raccrocher</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
