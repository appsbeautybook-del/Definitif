import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Heart, Maximize2, Armchair, CheckCircle, X, Map } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import MapWithPricePins from "@/components/map/MapWithPricePins";

function ListingCard({ listing, onPress }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-all">
      {/* Image carousel */}
      <div className="relative h-52" onClick={() => onPress(listing)}>
        <img
          src={listing.images[imgIdx]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {/* Dots */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {listing.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`rounded-full transition-all ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <span className="text-white text-[10px] font-bold">{imgIdx + 1}/{listing.images.length}</span>
        </div>
        {/* Swipe areas */}
        {imgIdx > 0 && (
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-10"
            onClick={(e) => { e.stopPropagation(); setImgIdx(i => Math.max(0, i - 1)); }}
          />
        )}
        {imgIdx < listing.images.length - 1 && (
          <button
            className="absolute right-0 top-0 w-1/3 h-full z-10"
            onClick={(e) => { e.stopPropagation(); setImgIdx(i => Math.min(listing.images.length - 1, i + 1)); }}
          />
        )}
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow z-20"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>
        {/* PRO badge */}
        <div className="absolute top-3 left-3 bg-primary rounded-full px-2.5 py-1 z-20">
          <span className="text-white text-[9px] font-black uppercase tracking-wider">{listing.badge}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 cursor-pointer" onClick={() => onPress(listing)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-[16px] font-black text-gray-900 leading-tight">{listing.title}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
              {listing.location} • {listing.area}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[24px] font-black text-primary leading-none">{listing.price}</span>
            <span className="text-primary text-[13px] font-black"> €</span>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{listing.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">{listing.surface}</span>
          </div>
          <div className="flex items-center gap-1">
            <Armchair className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">{listing.equip}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">{listing.extra}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Immobilier() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("location");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filterType, setFilterType] = useState("tous");
  const [filterSurface, setFilterSurface] = useState("tous");

  useEffect(() => {
    setLoading(true);
    /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("getImmobilier", { type: activeTab })
      .then(res => {
        setListings(res.data.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  const filtered = listings.filter(l => {
    const matchSearch = !search.trim() ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.area?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "tous" || l.equip?.toLowerCase().includes(filterType);
    return matchSearch && matchType;
  });

  return (
    <div className="font-display bg-[#f5f5f5] min-h-full pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-30">
        <h1 className="text-[15px] font-black text-gray-900 uppercase tracking-widest text-center mb-3">IMMOBILIER PRO</h1>

        {/* Search bar + Bouton Carte */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un espace..."
              className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-gray-400" /></button>
            )}
          </div>
          <button
            onClick={() => setShowMap(s => !s)}
            className={`flex items-center gap-1.5 px-3 h-10 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0 ${showMap ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-100 text-gray-600"}`}
          >
            <Map className="w-4 h-4" />
            Carte
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${showFilters ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Carte avec prix des biens */}
        {showMap && (
          <div className="mb-2">
            <MapWithPricePins
              items={filtered.slice(0, 8).map((l, i) => ({
                id: l.id, price: l.price, title: l.title,
                lat: 48.860 + (i * 0.007), lng: 2.330 + (i * 0.018),
              }))}
              onSelectItem={(item) => navigate("/immobilier/" + item.id)}
              height="h-52"
            />
          </div>
        )}

        {/* Filtres avancés */}
        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-2 space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type d'espace</p>
            <div className="flex flex-wrap gap-2">
              {["tous", "fauteuil", "cabine", "box", "studio", "plateau"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${filterType === t ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white px-5 pb-4 flex gap-2">
        {["location", "vente"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              activeTab === tab
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {tab === "location" ? "LOCATIONS" : "VENTES"}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="px-4 pt-3 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🏠</span>
            <p className="text-[14px] font-bold text-gray-400">Aucun bien disponible</p>
          </div>
        ) : filtered.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onPress={(l) => navigate("/immobilier/" + l.id, { state: l })}
          />
        ))}
      </div>
    </div>
  );
}