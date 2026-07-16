import { useState } from "react";
import { X, SlidersHorizontal, Star, Check } from "lucide-react";

const CATEGORIES = ["Tout", "Coiffure", "Maquillage", "Ongles", "Soin", "Barbe", "Massage", "Épilation", "Spa"];
const SORT_OPTIONS = ["Pertinence", "Prix croissant", "Prix décroissant", "Note", "Distance"];

export default function AdvancedFilterSheet({ open, onClose, onApply, initialFilters = {} }) {
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin ?? 0);
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax ?? 300);
  const [minRating, setMinRating] = useState(initialFilters.minRating ?? 0);
  const [category, setCategory] = useState(initialFilters.category ?? "Tout");
  const [availableOnly, setAvailableOnly] = useState(initialFilters.availableOnly ?? false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy ?? "Pertinence");

  if (!open) return null;

  const handleApply = () => {
    onApply({ priceMin, priceMax, minRating, category, availableOnly, sortBy });
    onClose();
  };

  const handleReset = () => {
    setPriceMin(0); setPriceMax(300); setMinRating(0);
    setCategory("Tout"); setAvailableOnly(false); setSortBy("Pertinence");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end font-display">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl z-10 max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-[18px] font-black text-gray-900">Filtres avancés</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-95">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 hide-scrollbar">

          {/* Catégorie */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Catégorie</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[12px] font-black border transition-all active:scale-95 ${
                    category === cat
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fourchette de prix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Fourchette de prix</p>
              <span className="text-[13px] font-black text-primary">{priceMin}€ – {priceMax}€</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1">
                  <span>MIN</span><span>{priceMin}€</span>
                </div>
                <input
                  type="range" min={0} max={300} step={5}
                  value={priceMin}
                  onChange={e => { const v = +e.target.value; if (v <= priceMax - 10) setPriceMin(v); }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1">
                  <span>MAX</span><span>{priceMax}€</span>
                </div>
                <input
                  type="range" min={0} max={300} step={5}
                  value={priceMax}
                  onChange={e => { const v = +e.target.value; if (v >= priceMin + 10) setPriceMax(v); }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
            {/* Visual price bar */}
            <div className="relative h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{ left: `${(priceMin / 300) * 100}%`, right: `${100 - (priceMax / 300) * 100}%` }}
              />
            </div>
          </div>

          {/* Note minimale */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Note minimale</p>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex-1 py-2.5 rounded-2xl text-[12px] font-black border transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    minRating === r
                      ? "bg-amber-400 text-white border-amber-400 shadow-md"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {r === 0 ? "Tout" : <><Star className="w-3 h-3" strokeWidth={2} />{r}</>}
                </button>
              ))}
            </div>
          </div>

          {/* Disponibilité */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Disponibilité</p>
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all active:scale-95 ${
                availableOnly ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${availableOnly ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-[14px] font-black text-gray-800">Disponibles uniquement</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${availableOnly ? "bg-primary border-primary" : "border-gray-300"}`}>
                {availableOnly && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </button>
          </div>

          {/* Trier par */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Trier par</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-4 py-2 rounded-full text-[12px] font-black border transition-all active:scale-95 ${
                    sortBy === opt
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <button
            onClick={handleReset}
            className="flex-1 py-4 rounded-2xl border border-gray-200 text-[13px] font-black text-gray-600 active:scale-95 transition-all"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-2 flex-grow-[2] py-4 rounded-2xl bg-primary text-white text-[13px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/30"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}