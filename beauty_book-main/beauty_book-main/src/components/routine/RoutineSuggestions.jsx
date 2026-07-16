import { useState } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

const PRESET_ROUTINES = [
  {
    name: "Skincare du matin",
    emoji: "☀️",
    color: "bg-yellow-100",
    description: "Prends soin de ta peau chaque matin pour un teint lumineux et hydraté toute la journée.",
    time: "07:30",
    duration_min: 15,
    frequency: "quotidien",
    tasks: ["Nettoyage doux", "Tonique", "Sérum vitamine C", "Hydratant SPF"],
    objectif: "Peau lumineuse et protégée",
  },
  {
    name: "Routine cheveux hebdo",
    emoji: "💆",
    color: "bg-pink-100",
    description: "Nourris et fortifie tes cheveux chaque semaine pour une chevelure brillante et saine.",
    time: "10:00",
    duration_min: 45,
    frequency: "hebdomadaire",
    days_of_week: [6],
    tasks: ["Masque nourrissant", "Huile capillaire", "Brushing doux", "Sérum pointes"],
    objectif: "Cheveux forts et brillants",
  },
  {
    name: "Soin visage du soir",
    emoji: "🌙",
    color: "bg-blue-100",
    description: "Démaquille et régénère ta peau chaque soir pour un réveil en beauté.",
    time: "21:30",
    duration_min: 20,
    frequency: "quotidien",
    tasks: ["Démaquillage", "Nettoyant moussant", "Exfoliant (2x/sem)", "Sérum nuit", "Crème"],
    objectif: "Peau régénérée et hydratée",
  },
  {
    name: "Nail care hebdomadaire",
    emoji: "💅",
    color: "bg-purple-100",
    description: "Entretiens tes ongles et cuticules chaque semaine pour de belles mains soignées.",
    time: "17:00",
    duration_min: 30,
    frequency: "hebdomadaire",
    days_of_week: [0],
    tasks: ["Limage", "Soin cuticules", "Base protectrice", "Vernis"],
    objectif: "Ongles solides et esthétiques",
  },
  {
    name: "Routine corps quotidienne",
    emoji: "🧴",
    color: "bg-green-100",
    description: "Prends soin de ton corps chaque jour pour une peau douce et bien hydratée.",
    time: "08:00",
    duration_min: 10,
    frequency: "quotidien",
    tasks: ["Douche", "Gommage (2x/sem)", "Lait corps", "Huile sèche"],
    objectif: "Peau douce et hydratée",
  },
  {
    name: "Self-care du week-end",
    emoji: "🌿",
    color: "bg-orange-100",
    description: "Offre-toi une pause beauté complète chaque week-end pour te ressourcer.",
    time: "11:00",
    duration_min: 60,
    frequency: "hebdomadaire",
    days_of_week: [6],
    tasks: ["Masque visage", "Masque cheveux", "Bain relaxant", "Soin corps", "Vernis"],
    objectif: "Bien-être total et évasion",
  },
];

export default function RoutineSuggestions({ onSelect }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const handleAISuggest = async () => {
    setLoadingAI(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es une experte en beauté et bien-être. Génère 3 idées de routines beauté personnalisées originales et tendance pour 2026. 
        Pour chaque routine, fournis un objet JSON avec ces champs exactement :
        name, emoji (un seul emoji), description (2 phrases max), time (HH:MM), duration_min (nombre), frequency (quotidien/hebdomadaire), objectif (court)
        
        Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans commentaires.`,
        response_json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              emoji: { type: "string" },
              description: { type: "string" },
              time: { type: "string" },
              duration_min: { type: "number" },
              frequency: { type: "string" },
              objectif: { type: "string" },
            }
          }
        }
      });
      const suggestions = Array.isArray(res) ? res : [];
      const withColors = suggestions.map((s, i) => ({
        ...s,
        color: ["bg-blue-100", "bg-pink-100", "bg-purple-100"][i % 3],
        tasks: [],
        days_of_week: [1, 2, 3, 4, 5],
      }));
      setAiSuggestions(withColors);
    } catch {
      setAiSuggestions([]);
    }
    setLoadingAI(false);
  };

  const displayed = aiSuggestions.length > 0 ? aiSuggestions : PRESET_ROUTINES;

  return (
    <div className="space-y-4">
      {/* Bouton suggestions IA */}
      <button
        onClick={handleAISuggest}
        disabled={loadingAI}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-orange-400 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60 shadow-md shadow-primary/30"
      >
        {loadingAI ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Génération IA...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Suggestions personnalisées IA</>
        )}
      </button>

      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {aiSuggestions.length > 0 ? "✨ Suggestions IA" : "Modèles populaires"}
      </p>

      <div className="space-y-3">
        {displayed.map((r, i) => (
          <button
            key={i}
            onClick={() => onSelect(r)}
            className={`w-full ${r.color} rounded-2xl p-4 text-left flex items-center gap-3 active:scale-[0.99] transition-all border-2 border-transparent hover:border-primary/20`}
          >
            <span className="text-[28px] shrink-0">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-gray-900">{r.name}</p>
              <p className="text-[11px] text-gray-500 font-medium leading-snug mt-0.5 line-clamp-2">{r.description}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[9px] font-black text-gray-400 bg-white/60 rounded-full px-2 py-0.5">{r.time}</span>
                <span className="text-[9px] font-black text-gray-400 bg-white/60 rounded-full px-2 py-0.5">{r.duration_min} min</span>
                <span className="text-[9px] font-black text-gray-400 bg-white/60 rounded-full px-2 py-0.5">{r.frequency}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}