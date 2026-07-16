import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from "@/lib/AuthContext";

export default function AIDescriptionButton({ serviceName, category, onDescription }) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(null); // null = loading, true/false

  useEffect(() => {
    if (!user?.email) return;
    entities.ProfilPro.filter({ user_email: user.email }, "-created_at", 1)
      .then(rows => {
        const abo = rows[0]?.abonnement || "free";
        setIsPaid(abo !== "free");
      })
      .catch(() => setIsPaid(false));
  }, [user?.email]);

  const handleGenerate = async () => {
    if (!serviceName?.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en coiffure et beauté. Rédige une description professionnelle et attrayante pour une prestation de beauté nommée "${serviceName}" dans la catégorie "${category || 'beauté'}". La description doit faire 2 à 3 phrases, être en français, mettre en valeur l'expertise, la technique et le résultat final. Format : uniquement le texte de la description.`,
        add_context_from_internet: true,
      });
      if (res && typeof res === "string") {
        onDescription(res.trim());
      }
    } catch {}
    setGenerating(false);
  };

  // Afficher le bouton seulement pour les abonnés payants
  if (isPaid === null) return null; // encore en chargement
  if (!isPaid) return null; // gratuit, ne pas afficher

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={generating || !serviceName?.trim()}
      className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-600 text-[12px] font-black active:scale-95 transition-all disabled:opacity-50 hover:bg-purple-100"
    >
      {generating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          Générer avec l'IA
        </>
      )}
    </button>
  );
}