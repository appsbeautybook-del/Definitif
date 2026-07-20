import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Save, Plus, X, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DEFAULT_DAY = { open: true, start: "09:00", end: "19:00" };

// ── Horaires Form ──────────────────────────────────────────────────────────────
function HorairesForm({ horaires, onChange }) {
  return (
    <div className="space-y-2">
      {DAYS.map((day, i) => {
        const h = horaires[day] || DEFAULT_DAY;
        const nightColors = h.start >= "21" || h.start < "05";
        return (
          <div key={day} className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${h.open ? nightColors ? "bg-indigo-50 border border-indigo-100" : "bg-white border border-gray-100 shadow-sm" : "bg-gray-50 border border-gray-100"}`}>
            {/* Toggle jour */}
            <button
              onClick={() => onChange(day, { ...h, open: !h.open })}
              className={`w-9 h-6 rounded-full transition-colors shrink-0 relative ${h.open ? "bg-primary" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${h.open ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>

            <span className={`text-[13px] font-black w-16 shrink-0 ${h.open ? "text-gray-900" : "text-gray-300"}`}>
              {DAY_LABELS[i]}
            </span>

            {h.open ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={h.start}
                  onChange={e => onChange(day, { ...h, start: e.target.value })}
                  className="bg-gray-100 rounded-xl px-3 py-2 text-[13px] font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary/30 w-full"
                />
                <span className="text-[12px] font-medium text-gray-300 shrink-0">à</span>
                <input
                  type="time"
                  value={h.end}
                  onChange={e => onChange(day, { ...h, end: e.target.value })}
                  className="bg-gray-100 rounded-xl px-3 py-2 text-[13px] font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary/30 w-full"
                />
              </div>
            ) : (
              <span className="text-[12px] font-medium text-gray-300 flex-1">Fermé</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Congés Section ─────────────────────────────────────────────────────────────
function CongesSection({ conges, onChange }) {
  const [adding, setAdding] = useState(false);
  const [newConge, setNewConge] = useState({ debut: "", fin: "", label: "" });

  const handleAdd = () => {
    if (!newConge.debut || !newConge.fin) return;
    onChange([...conges, { ...newConge, id: Date.now().toString() }]);
    setNewConge({ debut: "", fin: "", label: "" });
    setAdding(false);
  };

  const handleRemove = (id) => {
    onChange(conges.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-black text-gray-900">Périodes de congés</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-200 rounded-xl px-3 py-2 text-[12px] font-black text-gray-600 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Début</p>
              <input
                type="date"
                value={newConge.debut}
                onChange={e => setNewConge(c => ({ ...c, debut: e.target.value }))}
                className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-900 outline-none"
              />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fin</p>
              <input
                type="date"
                value={newConge.fin}
                onChange={e => setNewConge(c => ({ ...c, fin: e.target.value }))}
                className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-900 outline-none"
              />
            </div>
          </div>
          <input
            type="text"
            value={newConge.label}
            onChange={e => setNewConge(c => ({ ...c, label: e.target.value }))}
            placeholder="Motif (ex: Vacances d'été)"
            className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-900 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setAdding(false); setNewConge({ debut: "", fin: "", label: "" }); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] font-black text-gray-500 active:scale-95 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={!newConge.debut || !newConge.fin}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[12px] font-black active:scale-95 transition-all disabled:opacity-40"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {conges.length > 0 ? (
        <div className="space-y-2">
          {conges.sort((a, b) => a.debut.localeCompare(b.debut)).map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-gray-900">{c.label || "Congés"}</p>
                <p className="text-[11px] font-medium text-gray-500">
                  {c.debut} → {c.fin}
                </p>
              </div>
              <button onClick={() => handleRemove(c.id)} className="w-8 h-8 flex items-center justify-center active:scale-90">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-[12px] font-medium text-gray-300">Aucune période de congés ajoutée</p>
        </div>
      )}
    </div>
  );
}

// ── Mode Nuit Card ─────────────────────────────────────────────────────────────
function ModeNuitCard({ travailNuit, onToggle }) {
  return (
    <div className={`rounded-3xl p-4 flex items-center gap-4 border active:scale-[0.98] transition-all cursor-pointer ${travailNuit ? "bg-indigo-950 border-indigo-800" : "bg-indigo-50 border-indigo-100"}`}
      onClick={() => onToggle(!travailNuit)}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${travailNuit ? "bg-indigo-800" : "bg-indigo-100"}`}>
        <Clock className={`w-6 h-6 ${travailNuit ? "text-indigo-300" : "text-indigo-500"}`} />
      </div>
      <div className="flex-1">
        <p className={`text-[15px] font-black ${travailNuit ? "text-indigo-200" : "text-indigo-700"}`}>
          Mode Nuit
        </p>
        <p className={`text-[12px] font-medium mt-0.5 ${travailNuit ? "text-indigo-400" : "text-indigo-400"}`}>
          Horaires : {travailNuit ? "21h – 07h" : "09h – 19h"} — {travailNuit ? "Actif" : "Désactivé"}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onToggle(!travailNuit); }}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${travailNuit ? "bg-indigo-500" : "bg-gray-200"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${travailNuit ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HorairesConges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profil, setProfil] = useState(null);
  const [horaires, setHoraires] = useState({});
  const [conges, setConges] = useState([]);
  const [travailNuit, setTravailNuit] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    entities.ProfilPro.filter({ user_email: user.email }, "-created_at", 1)
      .then(rows => {
        if (rows[0]) {
          setProfil(rows[0]);
          const ouv = rows[0].ouverture || {};
          // Initialize horaires with defaults for each day
          const init = {};
          DAYS.forEach(d => {
            init[d] = ouv[d] || { ...DEFAULT_DAY };
          });
          setHoraires(init);
          setConges(ouv.conges || []);
          setTravailNuit(rows[0].travail_nuit || false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const handleDayChange = (day, value) => {
    setHoraires(prev => ({ ...prev, [day]: value }));
  };

  const handleSave = async () => {
    if (!profil) return;
    setSaving(true);
    const ouverture = { ...horaires, conges };
    await entities.ProfilPro.update(profil.id, {
      ouverture,
      travail_nuit: travailNuit,
    });
    setSaving(false);
  };

  const handleToggleNuit = (val) => {
    setTravailNuit(val);
    // Auto-set night hours when enabling
    const newHoraires = {};
    DAYS.forEach(d => {
      const prev = horaires[d] || DEFAULT_DAY;
      if (val && prev.open) {
        newHoraires[d] = { ...prev, start: "21:00", end: "07:00" };
      } else if (!val && prev.open) {
        newHoraires[d] = { ...prev, start: "09:00", end: "19:00" };
      } else {
        newHoraires[d] = prev;
      }
    });
    setHoraires(newHoraires);
  };

  if (loading) {
    return (
      <div className="font-display min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="font-display min-h-full bg-[#f5f5f5] pb-10">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/pro/gestion-agenda?tab=gestion")}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-gray-900">Horaires & Congés</h1>
            <p className="text-[11px] font-medium text-gray-400">Configurez vos horaires d'ouverture</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Mode Nuit */}
        <ModeNuitCard travailNuit={travailNuit} onToggle={handleToggleNuit} />

        {/* Horaires par jour */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">Horaires</h2>
          </div>
          <HorairesForm horaires={horaires} onChange={handleDayChange} />
        </div>

        {/* Congés */}
        <CongesSection conges={conges} onChange={setConges} />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-black text-[14px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
          ) : (
            <><Save className="w-4 h-4" /> Enregistrer</>
          )}
        </button>
      </div>
    </div>
  );
}