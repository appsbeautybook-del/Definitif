import { useState } from "react";
import { Star, X, Send, Loader2 } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from "@/lib/AuthContext";

function StarSelector({ value, onChange, size = "w-8 h-8" }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="active:scale-90 transition-all"
        >
          <Star
            className={`${size} transition-colors ${
              i <= (hovered || value)
                ? "text-primary fill-primary"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function LaisserAvisModal({ reservation, onClose, onSuccess }) {
  const { user } = useAuth();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [criteres, setCriteres] = useState({ ponctualite: 0, communication: 0, proprete: 0 });
  const [loading, setLoading] = useState(false);

  const criteresLabels = [
    { key: "ponctualite", label: "Ponctualité" },
    { key: "communication", label: "Communication" },
    { key: "proprete", label: "Propreté / Hygiène" },
  ];

  const handleSubmit = async () => {
    if (note === 0) return;
    setLoading(true);
    try {
      await entities.Avis.create({
        reservation_id: reservation.id,
        type: "client_to_pro",
        auteur_email: user.email,
        auteur_nom: user.full_name || "Client",
        cible_email: reservation.pro_email,
        cible_nom: reservation.pro_name,
        note,
        commentaire,
        service_nom: reservation.service_name,
        criteres,
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-black text-gray-900">Votre avis</h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              {reservation.service_name} · {reservation.pro_name}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Note globale */}
        <div className="bg-gray-50 rounded-3xl p-5 mb-4 flex flex-col items-center gap-3">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Note globale</p>
          <StarSelector value={note} onChange={setNote} size="w-10 h-10" />
          <p className="text-[13px] font-black text-gray-500">
            {note === 0 ? "Touchez une étoile" : ["", "Décevant", "Passable", "Bien", "Très bien", "Excellent !"][note]}
          </p>
        </div>

        {/* Critères */}
        <div className="space-y-3 mb-4">
          {criteresLabels.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
              <span className="text-[13px] font-black text-gray-700">{label}</span>
              <StarSelector
                value={criteres[key]}
                onChange={(v) => setCriteres((prev) => ({ ...prev, [key]: v }))}
                size="w-5 h-5"
              />
            </div>
          ))}
        </div>

        {/* Commenter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-0.5 bg-primary rounded-full" />
            <p className="text-[13px] font-black text-gray-900">Commenter</p>
          </div>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience en détail... (optionnel)"
            rows={4}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[13px] text-gray-700 placeholder:text-gray-300 outline-none resize-none focus:border-primary transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={note === 0 || loading}
          className="w-full bg-primary text-white py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-md shadow-primary/30 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? "Envoi..." : "Publier mon avis"}
        </button>
      </div>
    </div>
  );
}