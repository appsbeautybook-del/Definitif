import { useState, useRef, useEffect } from "react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';
import PageHeader from "@/components/layout/PageHeader";
import { Video, Sparkles, Send, Copy, Check, Download, RotateCcw, Play } from "lucide-react";

const ASPECT_RATIOS = [
  { id: "9:16", label: "Portrait", icon: "📱" },
  { id: "16:9", label: "Paysage", icon: "🖥" },
  { id: "1:1", label: "Carré", icon: "⬜" },
];

const QUICK_PROMPTS = [
  { emoji: "✂️", label: "Coupe cheveux", text: "Professional hairdresser giving a stylish haircut in a modern salon, close-up, warm lighting, slow motion scissors, cinematic" },
  { emoji: "💅", label: "Nail art", text: "Nail artist creating intricate floral nail art design, macro close-up, bright studio lighting, satisfying process, 4K" },
  { emoji: "💄", label: "Maquillage", text: "Beauty transformation, applying glamorous makeup in luxury vanity mirror, soft lighting, elegant and professional" },
  { emoji: "💆", label: "Soin visage", text: "Luxury spa facial treatment with jade roller, calming ambient light, smooth skin close-up, relaxing atmosphere" },
  { emoji: "🪒", label: "Barbier", text: "Classic barbershop hot towel shave, skilled barber, moody cinematic lighting, sharp blade close-up, vintage aesthetic" },
  { emoji: "🌟", label: "Avant/Après", text: "Hair color transformation from brunette to blonde balayage, split screen before and after, salon professional" },
];

export default function VeoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const generate = async (customPrompt) => {
    const finalPrompt = customPrompt || prompt.trim();
    if (!finalPrompt || loading) return;
    setLoading(true);
    setVideoUrl(null);
    setError(null);

    try {
      const res = await apiClient.callFunction("generateVeoVideo", {
        prompt: finalPrompt,
        aspectRatio,
        durationSeconds: 8,
      });
      if (res.data?.videoUrl) {
        setVideoUrl(res.data.videoUrl);
      } else {
        setError("Aucune vidéo générée. Réessaie avec un prompt différent.");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la génération.");
    }
    setLoading(false);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 font-display">
      <PageHeader title="VEO Video Generator" subtitle="Powered by Google Veo" dark={false} />

      <div className="px-4 pt-4 pb-24 space-y-4">

        {/* Hero */}
        <div className="bg-[#1a2035] rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                <Video className="w-4 h-4 text-primary" />
              </div>
              <span className="text-primary text-[11px] font-black uppercase tracking-widest">Google Veo 2 ✦</span>
            </div>
            <h2 className="text-white text-[20px] font-black leading-tight">Génère des vidéos<br />professionnelles en IA</h2>
            <p className="text-white/40 text-[12px] mt-1">8 secondes · Cinématique · Portrait ou Paysage</p>
          </div>
        </div>

        {/* Quick prompts */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Thèmes rapides</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setPrompt(p.text); textareaRef.current?.focus(); }}
                className="shrink-0 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 text-[12px] font-black text-gray-700 active:scale-95 transition-all shadow-sm"
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect ratio */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Format</p>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map(r => (
              <button
                key={r.id}
                onClick={() => setAspectRatio(r.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all active:scale-95 ${aspectRatio === r.id ? "border-primary bg-orange-50" : "border-gray-200 bg-white"}`}
              >
                <span className="text-xl">{r.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${aspectRatio === r.id ? "text-primary" : "text-gray-500"}`}>{r.label}</span>
                <span className="text-[9px] text-gray-400">{r.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ton prompt</p>
            {prompt && (
              <button onClick={copyPrompt} className="flex items-center gap-1 text-[10px] text-gray-400 active:scale-95">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copié" : "Copier"}
              </button>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Professional hairdresser cutting hair in a modern salon, warm cinematic lighting, slow motion..."
            rows={4}
            className="w-full px-4 pb-3 text-[14px] text-gray-800 outline-none resize-none placeholder:text-gray-400"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={() => generate()}
          disabled={!prompt.trim() || loading}
          className="w-full bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération en cours... (~1-2 min)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Générer avec Veo
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-[13px] text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Result */}
        {videoUrl && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[13px] font-black text-gray-900">Vidéo générée !</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={videoUrl}
                  download="veo-video.mp4"
                  className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-black px-3 py-1.5 rounded-xl active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </a>
                <button
                  onClick={() => generate()}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-[11px] font-black px-3 py-1.5 rounded-xl active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Relancer
                </button>
              </div>
            </div>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full max-h-[500px] object-contain bg-black"
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-[#1a2035] rounded-3xl p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center relative">
              <Video className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-black text-[15px]">Google Veo génère ta vidéo</p>
              <p className="text-white/40 text-[12px] mt-1">Environ 60-120 secondes...</p>
            </div>
            <div className="flex gap-1">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}