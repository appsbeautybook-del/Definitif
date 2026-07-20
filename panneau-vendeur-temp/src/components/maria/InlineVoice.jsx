import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Globe } from "lucide-react";

/**
 * InlineVoice — mode conversationnel dans Maria.
 * - Vocal : écoute continue, silence 700ms → envoie
 * - Dictée : session unique, remplit l'input
 * - Global : délègue au VoiceAgentContext
 */

function EqBars({ active }) {
  return (
    <div className="flex items-end gap-[2px] w-4 h-4">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-full bg-white"
          style={{
            height: `${h * 2}px`,
            transition: "height 0.2s ease",
            height: active ? `${h * 2}px` : "3px",
          }}
        />
      ))}
    </div>
  );
}

export default function InlineVoice({
  onTranscript,
  onDictate,
  speaking,
  onInterrupt,
  onActivateGlobalVoice,
  globalVoiceActive,
  onDeactivateGlobalVoice,
}) {
  const [vocalActive, setVocalActive] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [interimText, setInterimText] = useState("");

  const recRef = useRef(null);
  const silenceRef = useRef(null);
  const pendingRef = useRef("");
  const vocalActiveRef = useRef(false);
  const speakingRef = useRef(speaking);

  useEffect(() => { speakingRef.current = speaking; }, [speaking]);
  useEffect(() => { vocalActiveRef.current = vocalActive; }, [vocalActive]);

  // Nettoyer à l'unmount
  useEffect(() => {
    return () => {
      clearTimeout(silenceRef.current);
      try { recRef.current?.abort(); } catch {}
    };
  }, []);

  // Arrêter l'écoute quand l'IA parle (évite feedback)
  useEffect(() => {
    if (speaking && vocalActive) {
      clearTimeout(silenceRef.current);
      try { recRef.current?.abort(); } catch {}
      recRef.current = null;
    } else if (!speaking && vocalActive) {
      startVocalRec();
    }
  }, [speaking]);

  const startVocalRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Reconnaissance vocale non supportée."); return; }

    try { recRef.current?.abort(); } catch {}
    recRef.current = null;

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => {};

    rec.onresult = (e) => {
      if (speakingRef.current) return;
      let finalText = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setInterimText(interim);
      if (finalText) {
        pendingRef.current += " " + finalText;
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          const text = pendingRef.current.trim();
          pendingRef.current = "";
          setInterimText("");
          if (text && text.length > 1) {
            if (speakingRef.current) onInterrupt?.();
            onTranscript(text, true); // isVocal = true
          }
        }, 350);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      setInterimText("");
      if (vocalActiveRef.current && !speakingRef.current) {
        setTimeout(() => startVocalRec(), 200);
      }
    };

    rec.onend = () => {
      setInterimText("");
      if (vocalActiveRef.current && !speakingRef.current) {
        setTimeout(() => startVocalRec(), 150);
      }
    };

    try { rec.start(); } catch {}
  }, [onTranscript, onInterrupt]);

  const toggleVocal = () => {
    if (vocalActive) {
      vocalActiveRef.current = false;
      setVocalActive(false);
      clearTimeout(silenceRef.current);
      setInterimText("");
      try { recRef.current?.abort(); } catch {}
      recRef.current = null;
    } else {
      setVocalActive(true);
      vocalActiveRef.current = true;
      startVocalRec();
    }
  };

  // ── Dictée (session unique, remplit l'input) ──────────────────────────────
  const dictRecRef = useRef(null);

  const toggleDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Reconnaissance vocale non supportée."); return; }

    if (dictating) {
      try { dictRecRef.current?.abort(); } catch {}
      setDictating(false);
      return;
    }

    const r = new SR();
    r.lang = "fr-FR";
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setDictating(true);
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (onDictate) onDictate(text);
      else onTranscript(text, false);
      setDictating(false);
    };
    r.onerror = () => setDictating(false);
    r.onend = () => setDictating(false);
    dictRecRef.current = r;
    try { r.start(); } catch {}
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0 relative">
      {/* Bulle texte interimaire */}
      {interimText && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-[11px] text-blue-700 font-medium italic pointer-events-none">
          {interimText}…
        </div>
      )}

      {/* Bouton Dictée */}
      <button
        onClick={toggleDictation}
        title="Dictée rapide"
        className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all ${
          dictating ? "bg-green-500 shadow-md shadow-green-400/50" : "bg-gray-200"
        }`}
      >
        {dictating
          ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          : <Mic className="w-4 h-4 text-gray-600" />
        }
      </button>

      {/* Bouton Vocal OU Global (mutuellement exclusifs) */}
      {globalVoiceActive ? (
        <button
          onClick={onDeactivateGlobalVoice}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-2 active:scale-95 transition-all shadow bg-red-500 text-white text-[10px] font-black uppercase tracking-wider"
        >
          <Globe className="w-3.5 h-3.5" />
          Stop Global
        </button>
      ) : vocalActive ? (
        <button
          onClick={toggleVocal}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-2 active:scale-95 transition-all shadow bg-red-500 text-white"
        >
          <EqBars active={true} />
          <span className="text-[10px] font-black uppercase tracking-wider">Stop</span>
        </button>
      ) : (
        <>
          <button
            onClick={toggleVocal}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 active:scale-95 transition-all shadow bg-blue-500 text-white"
          >
            <EqBars active={false} />
            <span className="text-[10px] font-black uppercase tracking-wider">Vocal</span>
          </button>
          {onActivateGlobalVoice && (
            <button
              onClick={onActivateGlobalVoice}
              title="Contrôle vocal global de l'app"
              className="flex items-center gap-1 rounded-full px-2.5 py-2 active:scale-95 transition-all shadow text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-primary to-orange-400 text-white"
            >
              <Globe className="w-3.5 h-3.5" />
              Global
            </button>
          )}
        </>
      )}
    </div>
  );
}