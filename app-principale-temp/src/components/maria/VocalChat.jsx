import { useState, useRef, useEffect } from "react";
import { X, Mic, MicOff, Volume2, Bot } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

export default function VocalChat({ onClose, onMessage }) {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speak = async (text) => {
    setStatus("speaking");
    setResponse(text);
    try {
      const res = await base44.integrations.Core.GenerateSpeech({
        text: text.slice(0, 500),
        voice: "honey", // voix féminine douce
        language_code: "fr",
      });
      if (audioRef.current) {
        audioRef.current.src = res.url;
        audioRef.current.play();
        audioRef.current.onended = () => setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  const askMaria = async (userText) => {
    setStatus("thinking");
    const newHistory = [...history, { role: "user", content: userText }];
    setHistory(newHistory);
    const historyStr = newHistory.map(m => `${m.role === "user" ? "Utilisateur" : "Assistante"}: ${m.content}`).join("\n");
    try {
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es une assistante beauté IA experte, spécialisée en soins, coiffure, maquillage et beauté. Réponds oralement en français, de façon naturelle et concise (2-3 phrases max). Ne te présente jamais par un nom. Réponds directement, comme dans une vraie conversation.\n\nHistorique:\n${historyStr}`,
      });
      const replyText = typeof reply === "string" ? reply : reply?.text || "";
      setHistory(prev => [...prev, { role: "assistant", content: replyText }]);
      // Envoyer dans le chat texte principal
      onMessage?.(userText, replyText);
      await speak(replyText);
    } catch {
      setStatus("idle");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      recognition.stop();
      askMaria(text);
    };
    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => { if (status === "listening") setStatus("idle"); };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus("idle");
  };

  const stopSpeaking = () => {
    audioRef.current?.pause();
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  const statusConfig = {
    idle: { label: "Appuyez pour parler", color: "bg-gray-800", pulse: false, buttonLabel: "" },
    listening: { label: "Je vous écoute...", color: "bg-red-500", pulse: true, buttonLabel: "Arrêter" },
    thinking: { label: "Réfléchit...", color: "bg-orange-400", pulse: true, buttonLabel: "Arrêter" },
    speaking: { label: "Vous répond...", color: "bg-primary", pulse: true, buttonLabel: "Arrêter" },
  };
  const cfg = statusConfig[status];

  return (
    <div className="fixed inset-0 z-[200] bg-[#0d1117] flex flex-col items-center justify-between font-display"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
      <audio ref={audioRef} />

      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 pt-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white text-[17px] font-black">Maria</p>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Assistante vocale</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Visual orb */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${cfg.color} transition-colors duration-300 ${cfg.pulse ? "shadow-2xl" : "shadow-lg"}`}
          style={cfg.pulse ? { boxShadow: `0 0 60px 20px hsl(var(--primary) / 0.4)` } : {}}>
          {cfg.pulse && (
            <div className={`absolute inset-0 rounded-full ${cfg.color} opacity-30 animate-ping`} />
          )}
          {status === "speaking" ? (
            <Volume2 className="w-12 h-12 text-white" />
          ) : status === "listening" ? (
            <Mic className="w-12 h-12 text-white" />
          ) : (
            <Bot className="w-12 h-12 text-white" />
          )}
        </div>

        <p className="text-white text-[15px] font-black uppercase tracking-widest text-center">{cfg.label}</p>

        {/* Transcript */}
        {transcript && (
          <div className="bg-white/10 rounded-2xl px-4 py-3 max-w-sm w-full text-center">
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">Vous avez dit</p>
            <p className="text-white text-[13px] font-medium italic">"{transcript}"</p>
          </div>
        )}

        {/* Response */}
        {response && status !== "thinking" && (
          <div className="bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3 max-w-sm w-full text-center">
            <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">Maria répond</p>
            <p className="text-white text-[13px] font-medium leading-relaxed">{response}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 pb-8">
        {status === "speaking" && (
          <button onClick={stopSpeaking} className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
            <MicOff className="w-6 h-6 text-white" />
          </button>
        )}
        <button
          onPointerDown={status === "idle" ? startListening : status === "listening" ? stopListening : undefined}
          disabled={status === "thinking" || status === "speaking"}
          className={`flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-40
            ${status === "idle" ? "w-20 h-20 rounded-full bg-primary shadow-xl shadow-primary/50" : "px-4 py-3 rounded-full bg-red-500 shadow-xl shadow-red-500/50"}`}
        >
          {status === "idle" ? (
            <Mic className="w-8 h-8 text-white" />
          ) : (
            <>
              <MicOff className="w-6 h-6 text-white" />
              <span className="text-white text-[9px] font-black uppercase tracking-widest">{cfg.buttonLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}