import { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Phone } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

function useRingTone(active) {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
      return;
    }
    const playRing = () => {
      try {
        if (!ctxRef.current || ctxRef.current.state === "closed") {
          ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = ctxRef.current;
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
    playRing();
    intervalRef.current = setInterval(playRing, 1500);
    return () => {
      clearInterval(intervalRef.current);
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [active]);
}

const THEME_COLORS = {
  light: {
    bg: "linear-gradient(180deg, #FFF5ED 0%, #FFFFFF 50%, #FFF5ED 100%)",
    cardBg: "rgba(0,0,0,0.04)",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    accent: "#E8732A",
    accentGlow: "rgba(232,115,42,0.25)",
    ringBg: "rgba(232,115,42,0.08)",
    controlBg: "rgba(0,0,0,0.05)",
    controlActive: "rgba(232,115,42,0.15)",
    hangupBg: "#EF4444",
    hangupShadow: "rgba(239,68,68,0.4)",
    acceptBg: "#22C55E",
    acceptShadow: "rgba(34,197,94,0.4)",
    equalizerBar: "#E8732A",
    avatarBorder: "rgba(232,115,42,0.3)",
    avatarBg: "#F3E8FF",
    quickMsgBg: "rgba(0,0,0,0.04)",
    quickMsgBorder: "rgba(0,0,0,0.08)",
    overlay: "rgba(255,255,255,0.1)",
  },
  dark: {
    bg: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
    cardBg: "rgba(255,255,255,0.05)",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    accent: "#F97316",
    accentGlow: "rgba(249,115,22,0.3)",
    ringBg: "rgba(249,115,22,0.1)",
    controlBg: "rgba(255,255,255,0.08)",
    controlActive: "rgba(249,115,22,0.2)",
    hangupBg: "#EF4444",
    hangupShadow: "rgba(239,68,68,0.5)",
    acceptBg: "#22C55E",
    acceptShadow: "rgba(34,197,94,0.5)",
    equalizerBar: "#F97316",
    avatarBorder: "rgba(249,115,22,0.3)",
    avatarBg: "#312E81",
    quickMsgBg: "rgba(255,255,255,0.06)",
    quickMsgBorder: "rgba(255,255,255,0.1)",
    overlay: "rgba(0,0,0,0.15)",
  },
  night: {
    bg: "linear-gradient(180deg, #000000 0%, #0a0a1a 50%, #000000 100%)",
    cardBg: "rgba(255,255,255,0.03)",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textMuted: "#4B5563",
    accent: "#F97316",
    accentGlow: "rgba(249,115,22,0.25)",
    ringBg: "rgba(249,115,22,0.08)",
    controlBg: "rgba(255,255,255,0.05)",
    controlActive: "rgba(249,115,22,0.15)",
    hangupBg: "#DC2626",
    hangupShadow: "rgba(220,38,38,0.5)",
    acceptBg: "#16A34A",
    acceptShadow: "rgba(22,163,74,0.5)",
    equalizerBar: "#F97316",
    avatarBorder: "rgba(249,115,22,0.25)",
    avatarBg: "#1E1B4B",
    quickMsgBg: "rgba(255,255,255,0.04)",
    quickMsgBorder: "rgba(255,255,255,0.08)",
    overlay: "rgba(0,0,0,0.2)",
  },
};

export default function CallScreen({ mode, targetName, targetAvatar, onHangup, onAccept, onReject, remoteAudioRef, targetEmail, currentUserEmail, isCallee, sendQuickMessage }) {
  const { theme } = useTheme();
  const t = THEME_COLORS[theme] || THEME_COLORS.light;

  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [showQuickMsgs, setShowQuickMsgs] = useState(false);
  const timerRef = useRef(null);

  const QUICK_MESSAGES = [
    "Je te rappelle plus tard",
    "Disponible dans 5 min",
    "En réunion, rappelle-moi",
    "Merci, pas maintenant",
  ];

  const handleQuickMsg = (msg) => {
    if (sendQuickMessage) sendQuickMessage(msg);
    setShowQuickMsgs(false);
  };

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

  const initials = (targetName || "?")[0]?.toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between px-6 pt-16 pb-14" style={{ background: t.bg }}>
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Avatar + nom */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl" style={{ border: `4px solid ${t.avatarBorder}`, background: t.avatarBg }}>
            {targetAvatar
              ? <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[44px] font-black" style={{ color: t.accent }}>{initials}</div>
            }
          </div>
          {(mode === "calling" || mode === "ringing") && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ border: `2px solid ${t.accent}`, opacity: 0.4 }} />
              <div className="absolute -inset-5 rounded-full animate-ping" style={{ border: `1.5px solid ${t.accent}`, opacity: 0.2, animationDelay: "0.5s" }} />
            </>
          )}
          {mode === "active" && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 flex items-center justify-center" style={{ borderColor: t.bg.includes("000") ? "#0a0a1a" : "#FFF5ED" }}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>

        <p className="text-[26px] font-black" style={{ color: t.textPrimary }}>{targetName || "Inconnu"}</p>
        <p className={`text-[14px] font-bold ${mode === "active" ? "" : ""}`} style={{ color: mode === "active" ? t.accent : t.textMuted }}>
          {statusLabel}
        </p>
      </div>

      {/* Equalizer */}
      {mode === "active" && (
        <div className="flex items-end gap-[3px] h-14">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-[3px] rounded-full animate-pulse"
              style={{ height: `${6 + Math.sin(Date.now() / 300 + i) * 10 + (i % 4) * 4}px`, background: t.equalizerBar, opacity: 0.5 + (i % 3) * 0.15, animationDelay: `${i * 0.06}s`, transition: "height 0.3s ease" }} />
          ))}
        </div>
      )}

      {/* Contrôles */}
      <div className="w-full max-w-sm">
        {mode === "ringing" ? (
          <div className="flex flex-col items-center gap-6">
            {isCallee && (
              <div className="w-full max-w-xs">
                {showQuickMsgs ? (
                  <div className="space-y-2">
                    {QUICK_MESSAGES.map(msg => (
                      <button key={msg} onClick={() => handleQuickMsg(msg)}
                        className="w-full rounded-xl px-4 py-3 text-[13px] font-semibold text-left active:scale-95 transition-all"
                        style={{ background: t.quickMsgBg, color: t.textPrimary, border: `1px solid ${t.quickMsgBorder}` }}>
                        {msg}
                      </button>
                    ))}
                    <button onClick={() => setShowQuickMsgs(false)} className="w-full text-[12px] font-bold py-2" style={{ color: t.textMuted }}>Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => setShowQuickMsgs(true)}
                    className="w-full rounded-xl px-4 py-3 text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
                    style={{ background: t.quickMsgBg, color: t.textSecondary, border: `1px solid ${t.quickMsgBorder}` }}>
                    <MessageSquare className="w-4 h-4" /> Message rapide
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center justify-around w-full">
              <div className="flex flex-col items-center gap-2">
                <button onClick={onReject} className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: t.hangupBg, boxShadow: `0 8px 24px ${t.hangupShadow}` }}>
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <p className="text-[11px] font-semibold" style={{ color: t.textMuted }}>Refuser</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={onAccept} className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 animate-pulse transition-all" style={{ background: t.acceptBg, boxShadow: `0 8px 24px ${t.acceptShadow}` }}>
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <p className="text-[11px] font-semibold" style={{ color: t.textMuted }}>Accepter</p>
              </div>
            </div>
          </div>
        ) : mode === "calling" ? (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onHangup} className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: t.hangupBg, boxShadow: `0 8px 24px ${t.hangupShadow}` }}>
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <p className="text-[11px] font-semibold" style={{ color: t.textMuted }}>Raccrocher</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setMuted(m => !m)} className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all"
                style={{ background: muted ? t.controlActive : t.controlBg }}>
                {muted ? <MicOff className="w-6 h-6" style={{ color: muted ? t.accent : t.textSecondary }} /> : <Mic className="w-6 h-6" style={{ color: t.textSecondary }} />}
              </button>
              <p className="text-[10px] font-semibold" style={{ color: t.textMuted }}>{muted ? "Muet" : "Micro"}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setSpeaker(s => !s)} className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all"
                style={{ background: speaker ? t.controlActive : t.controlBg }}>
                {speaker ? <Volume2 className="w-6 h-6" style={{ color: t.accent }} /> : <VolumeX className="w-6 h-6" style={{ color: t.textSecondary }} />}
              </button>
              <p className="text-[10px] font-semibold" style={{ color: t.textMuted }}>HP</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={onHangup} className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: t.hangupBg, boxShadow: `0 8px 24px ${t.hangupShadow}` }}>
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <p className="text-[11px] font-semibold" style={{ color: t.textMuted }}>Raccrocher</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
