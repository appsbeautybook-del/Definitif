import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, X, Search, ChevronRight } from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

const CATEGORIES = ["Tous", "Coiffure", "Maquillage", "Ongles", "Soin", "Barbe", "Massage"];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function PriceMarker({ pro, price, isSelected, onClick }) {
  const bg = isSelected ? "#E8732A" : "white";
  const color = isSelected ? "white" : "#1a1a1a";
  const border = isSelected ? "#E8732A" : "#e5e7eb";

  return (
    <AdvancedMarker
      position={{ lat: pro.mapLat, lng: pro.mapLng }}
      onClick={onClick}
    >
      <div
        style={{
          background: bg,
          color: color,
          border: `2px solid ${border}`,
          borderRadius: "24px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: 800,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
          transform: isSelected ? "scale(1.2) translateY(-2px)" : "scale(1)",
          transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {price > 0 ? `${price}€` : "Pro"}
      </div>
    </AdvancedMarker>
  );
}

export default function Explorer() {
  const navigate = useNavigate();
  const [profils, setProfils] = useState([]);
  const [minPricesMap, setMinPricesMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    entities.ProfilPro.filter({ status: "actif" }, "-created_at", 100)
      .then(async (all) => {
        setProfils(all);
        const emails = all.map(p => p.user_email).filter(Boolean);
        const servicesArr = await Promise.all(
          emails.map(e => entities.Service.filter({ pro_email: e, status: "actif" }, "price", 5).catch(() => []))
        );
        const map = {};
        emails.forEach((e, i) => {
          const prices = servicesArr[i].map(s => s.price).filter(p => p > 0);
          if (prices.length > 0) map[e] = Math.min(...prices);
        });
        setMinPricesMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = profils.filter(p => {
    const matchCat = activeCategory === "Tous" || p.specialites?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchSearch = !search || p.salon_name?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const allMapItems = filtered.map((p) => ({
    ...p,
    mapLat: p.latitude || p.lat || 48.866 + (Math.random() - 0.5) * 0.08,
    mapLng: p.longitude || p.lng || 2.333 + (Math.random() - 0.5) * 0.12,
  }));

  const selectedPro = allMapItems.find(p => p.id === selected);
  const mapCenter = useMemo(() => {
    if (selectedPro) return { lat: selectedPro.mapLat, lng: selectedPro.mapLng };
    return { lat: 48.866, lng: 2.333 };
  }, [selectedPro]);

  const mapId = useMemo(() => "explorer-map-" + Date.now(), []);

  const handleSelectMarker = (proId) => {
    if (selected === proId) {
      const pro = allMapItems.find(p => p.id === proId);
      if (pro) navigate("/pro/vue-client", { state: { proEmail: pro.user_email } });
      return;
    }
    setSelected(proId);
    setExpanded(true);
  };

  const handleSelectCard = (pro) => {
    setSelected(pro.id);
    setExpanded(true);
  };

  return (
    <div className="font-display flex flex-col" style={{ height: "100dvh" }}>

      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 z-40 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un salon, une ville..."
              className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none"
            />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 text-[14px]">✕</button>}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setSelected(null); setExpanded(false); }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-black border transition-all active:scale-95 ${activeCategory === cat ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !GOOGLE_MAPS_API_KEY ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center px-4">
              <p className="text-gray-400 text-[12px] font-medium">Google Maps non configuré</p>
              <p className="text-gray-300 text-[10px] mt-1">Ajoutez VITE_GOOGLE_MAPS_API_KEY</p>
            </div>
          </div>
        ) : (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={12}
              mapId={mapId}
              gestureHandling="greedy"
              disableDefaultUI={true}
              style={{ width: "100%", height: "100%" }}
            >
              {allMapItems.map((p) => (
                <PriceMarker
                  key={p.id}
                  pro={p}
                  price={minPricesMap[p.user_email] || 0}
                  isSelected={selected === p.id}
                  onClick={() => handleSelectMarker(p.id)}
                />
              ))}
            </Map>
          </APIProvider>
        )}

        {/* Compteur */}
        <div className="absolute top-3 left-3 z-[500] bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-[11px] font-black text-gray-800">{filtered.length} prestataire{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Indication tap */}
        {selectedPro && !expanded && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-[11px] font-medium">Tapotez le marqueur pour ouvrir le profil</span>
          </div>
        )}
      </div>

      {/* Panneau inférieur coulissant */}
      <div
        className="bg-white border-t border-gray-100 shadow-2xl flex-shrink-0 z-[600] overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: expanded ? "58vh" : "0px" }}
      >
        <div
          className="flex justify-center pt-2 pb-1 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {expanded && selectedPro && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-sm cursor-pointer active:scale-95 transition-all"
                onClick={() => navigate("/pro/vue-client", { state: { proEmail: selectedPro.user_email } })}
              >
                <img src={selectedPro.avatar_url || selectedPro.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300"} alt={selectedPro.salon_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-black text-gray-900 truncate">{selectedPro.salon_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {selectedPro.city && (
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400 font-medium">
                          <MapPin className="w-3 h-3" />{selectedPro.city}
                        </span>
                      )}
                      {selectedPro.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[12px] font-black text-gray-700">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{selectedPro.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setExpanded(false); }} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {minPricesMap[selectedPro.user_email] > 0
                    ? <span className="text-[16px] font-black text-primary">dès {minPricesMap[selectedPro.user_email]}€</span>
                    : <span className="text-[12px] text-gray-400 font-medium">Prix sur demande</span>
                  }
                  <button
                    onClick={() => navigate("/pro/vue-client", { state: { proEmail: selectedPro.user_email } })}
                    className="bg-gray-900 text-white text-[12px] font-black uppercase tracking-wider px-5 py-2.5 rounded-2xl active:scale-95 transition-all shadow-lg shadow-gray-900/20"
                  >
                    Voir le profil →
                  </button>
                </div>
              </div>
            </div>

            <div ref={listRef} className="overflow-y-auto hide-scrollbar" style={{ maxHeight: "calc(58vh - 150px)" }}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                {filtered.length - 1} autre{filtered.length - 1 !== 1 ? "s" : ""} à proximité
              </p>
              <div className="space-y-1 pb-2">
                {allMapItems.filter(p => p.id !== selectedPro.id).slice(0, 20).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectCard(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-[48px] h-[48px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <img src={p.avatar_url || p.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300"} alt={p.salon_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-gray-900 truncate">{p.salon_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.city && <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{p.city}</span>}
                        {p.rating > 0 && <span className="text-[11px] font-black text-gray-600 flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />{p.rating}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-1">
                      {minPricesMap[p.user_email] > 0 && <span className="text-[13px] font-black text-primary">{minPricesMap[p.user_email]}€</span>}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
