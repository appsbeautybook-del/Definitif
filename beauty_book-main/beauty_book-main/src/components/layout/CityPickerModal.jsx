import { useState } from "react";
import { MapPin, X, Search, Navigation } from "lucide-react";

const POPULAR_CITIES = [
  "Paris, France",
  "Lyon, France",
  "Marseille, France",
  "Bordeaux, France",
  "Lille, France",
  "Nice, France",
  "Toulouse, France",
  "Nantes, France",
  "Strasbourg, France",
  "Montpellier, France",
];

export default function CityPickerModal({ currentCity, onSelect, onClose }) {
  const [input, setInput] = useState(currentCity || "");
  const [geoLoading, setGeoLoading] = useState(false);

  const handleConfirm = () => {
    if (!input.trim()) return;
    localStorage.setItem("bb_user_city", input.trim());
    onSelect(input.trim());
    onClose();
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Ma ville";
          const country = data.address?.country_code?.toUpperCase() || "";
          const label = country ? `${city}, ${country}` : city;
          setInput(label);
          localStorage.setItem("bb_user_city", label);
          onSelect(label);
          onClose();
        } catch {}
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 5000 }
    );
  };

  const filtered = POPULAR_CITIES.filter(c =>
    input.length < 2 || c.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white font-display" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0">
          <X className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-[18px] font-black text-gray-900 flex-1">Ma localisation</h1>
      </div>

      <div className="px-4 pt-5 pb-4 space-y-4 flex-1 overflow-y-auto">
        {/* Géolocalisation auto */}
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          className="w-full flex items-center gap-3 px-4 py-4 bg-primary/10 border border-primary/30 rounded-2xl active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
            <Navigation className={`w-5 h-5 text-white ${geoLoading ? "animate-pulse" : ""}`} />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-black text-gray-900">{geoLoading ? "Localisation en cours..." : "Utiliser ma position"}</p>
            <p className="text-[11px] text-gray-500 font-medium">Détection automatique via GPS</p>
          </div>
        </button>

        {/* Saisie manuelle */}
        <div className="bg-gray-50 rounded-2xl flex items-center gap-3 px-4 py-3 border border-gray-200">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Entrez votre ville..."
            className="flex-1 bg-transparent text-[15px] text-gray-800 outline-none placeholder:text-gray-400 font-medium"
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleConfirm(); }}
          />
          {input && (
            <button onClick={() => setInput("")} className="active:scale-90">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Valider */}
        {input.trim().length > 1 && (
          <button
            onClick={handleConfirm}
            className="w-full bg-primary text-white font-black text-[14px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" /> Confirmer cette ville
          </button>
        )}

        {/* Villes populaires */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Villes populaires</p>
          <div className="space-y-2">
            {filtered.map(city => (
              <button
                key={city}
                onClick={() => {
                  setInput(city);
                  localStorage.setItem("bb_user_city", city);
                  onSelect(city);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl active:scale-[0.98] transition-all text-left shadow-sm"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[14px] font-semibold text-gray-800">{city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}