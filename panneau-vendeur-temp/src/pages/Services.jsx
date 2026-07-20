import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, SlidersHorizontal, Star, Heart, MapPin } from "lucide-react";
import MapWithPricePins from "@/components/map/MapWithPricePins";
import AdvancedFilterSheet from "@/components/filters/AdvancedFilterSheet";
import { GLOBAL_CATEGORIES } from "@/lib/categories";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import usePullToRefresh from "@/hooks/usePullToRefresh";

const SALON_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600";
const PERSON_IMG1 = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400";
const PERSON_IMG2 = "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400";

// Données statiques salons/particuliers par défaut (seront filtrées par catégorie)
const SALONS_DATA = [
  { id: "s1", title: "Studio Lumière", location: "Paris 16e", rating: 4.9, price: 55, category: "Coiffure", image: SALON_IMG },
  { id: "s2", title: "L'Atelier de Beauté", location: "Paris 8e", rating: 4.8, price: 65, category: "Maquillage", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600" },
  { id: "s3", title: "Nail Studio Paris", location: "Paris 3e", rating: 4.7, price: 35, category: "Ongles", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600" },
  { id: "s4", title: "Zen Spa Center", location: "Paris 9e", rating: 4.9, price: 90, category: "Massage", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600" },
];

const PARTICULIERS_DATA = [
  { id: "p1", name: "Claire Dubois", role: "Coiffeuse", location: "Paris 11e", rating: 4.9, price: 45, category: "Coiffure", image: PERSON_IMG1 },
  { id: "p2", name: "Amina Koné", role: "Maquilleuse", location: "Paris 9e", rating: 4.8, price: 60, category: "Maquillage", image: PERSON_IMG2 },
  { id: "p3", name: "Julie Martin", role: "Prothésiste Ongles", location: "Paris 4e", rating: 4.7, price: 35, category: "Ongles", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400" },
];

export default function Services() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeCategory, setActiveCategory] = useState(null); // null = Tous
  const [styles, setStyles] = useState([]);
  const [services, setServices] = useState([]);
  const [pros, setPros] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    return new Promise(resolve => setTimeout(() => { setRefreshKey(k => k + 1); resolve(); }, 800));
  }, []);
  const { containerRef, pulling, pullDistance } = usePullToRefresh(handleRefresh);

  // Charger styles depuis DB
  useEffect(() => {
    setLoadingStyles(true);
    const filterObj = { status: "publie" };
    if (activeCategory) filterObj.category = activeCategory.dbValue;
    entities.Style.filter(filterObj, "-created_at", 20)
      .then(setStyles).catch(() => setStyles([])).finally(() => setLoadingStyles(false));
  }, [activeCategory, refreshKey]);

  // Charger services depuis DB
  useEffect(() => {
    setLoadingServices(true);
    const filterObj = { status: "actif" };
    if (activeCategory) filterObj.category = activeCategory.dbValue;
    entities.Service.filter(filterObj, "-created_at", 20)
      .then(setServices).catch(() => setServices([])).finally(() => setLoadingServices(false));
  }, [activeCategory, refreshKey]);

  // Charger les profils pro (pour la carte avec vraies adresses)
  useEffect(() => {
    entities.ProfilPro.filter({ status: "actif" }, "-created_at", 30)
      .then(items => setPros(items || []))
      .catch(() => setPros([]));
  }, [refreshKey]);

  // Map items = profils pro avec leur adresse réelle + prix depuis les services
  const mapItems = pros
    .slice(0, 15)
    .map(p => {
      const proServices = services.filter(s => s.pro_email === p.user_email);
      const minPrice = proServices.length > 0
        ? Math.min(...proServices.map(s => s.price || 0))
        : 0;
      return {
        id: p.id,
        price: minPrice,
        title: p.salon_name,
        lat: p.lat || (48.866 + (Math.random() - 0.5) * 0.08),
        lng: p.lng || (2.333 + (Math.random() - 0.5) * 0.12),
        address: p.address || "",
        city: p.city || "",
      };
    });

  // Filtrer salons/particuliers statiques par catégorie
  const filteredSalons = activeCategory
    ? SALONS_DATA.filter(s => s.category === activeCategory.dbValue)
    : SALONS_DATA.slice(0, 3);
  const filteredParticuliers = activeCategory
    ? PARTICULIERS_DATA.filter(p => p.category === activeCategory.dbValue)
    : PARTICULIERS_DATA;

  const goToServicesSalons = (tab = "STYLES") => {
    const cat = activeCategory ? `&cat=${activeCategory.id}` : "";
    navigate(`/services-salons?tab=${tab}${cat}`);
  };

  return (
    <div ref={containerRef} className="font-display bg-white min-h-full pb-6">
      {pullDistance > 10 && (
        <div className="flex items-center justify-center overflow-hidden transition-all" style={{ height: pullDistance * 0.5 }}>
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${pulling ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-[32px] font-black text-gray-900 leading-none tracking-tight">EXPLORER</h1>
            <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-0.5">• Vivez l'expérience BeautyBook</p>
          </div>
          <button onClick={() => navigate("/notifications")} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 mt-1 active:scale-95 transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search + Filtres */}
      <div className="px-5 mb-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Salons, Styles, Services..."
            className="flex-1 bg-transparent text-[14px] text-gray-600 outline-none placeholder:text-gray-400 font-medium" />
        </div>
        <button onClick={() => setShowFilters(true)}
          className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-all">
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Catégories — agissent comme filtre */}
      <div className="px-5 mb-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-1">
          {/* Bouton "Tous" */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border text-[20px] transition-all ${!activeCategory ? "bg-primary/10 border-primary" : "bg-gray-50 border-gray-100"}`}>
              🌟
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${!activeCategory ? "text-primary" : "text-gray-500"}`}>Tous</span>
          </button>

          {GLOBAL_CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isActive = activeCategory?.id === cat.id;
            return (
              <button key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isActive ? `${cat.bg} border-2` : "bg-gray-50 border-gray-100"}`}
                  style={isActive ? { borderColor: "hsl(var(--primary))" } : {}}>
                  <Icon className={`w-6 h-6 ${isActive ? cat.color : "text-gray-500"}`} strokeWidth={1.5} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-primary" : "text-gray-500"}`}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carte avec prix des pros de la catégorie */}
      <div className="px-5 mb-5">
        <MapWithPricePins
          items={mapItems}
          onSelectItem={() => goToServicesSalons("SALONS")}
          height="h-44"
        />
      </div>

      <AdvancedFilterSheet open={showFilters} onClose={() => setShowFilters(false)} onApply={setFilters} initialFilters={filters} />

      <div className="space-y-8 pb-4">

        {/* ── Styles ── */}
        <section>
          <div className="px-5 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-pink-400 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Styles{activeCategory ? ` · ${activeCategory.label}` : ""}
              </h2>
            </div>
            <button onClick={() => goToServicesSalons("STYLES")}
              className="text-[11px] font-black text-primary uppercase tracking-widest">Découvrir</button>
          </div>
          {loadingStyles ? (
            <div className="flex gap-3 overflow-x-auto px-5">
              {[1, 2, 3].map(i => <div key={i} className="shrink-0 w-44 h-64 bg-gray-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : styles.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest">Aucun style dans cette catégorie</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
              {styles.map((style) => (
                <div key={style.id}
                  onClick={() => navigate(`/style/${style.id}`, { state: { id: style.id, title: style.title, cover: style.image_url, category: style.category } })}
                  className="shrink-0 w-44 rounded-3xl overflow-hidden bg-gray-50 shadow-sm cursor-pointer active:scale-[0.98] transition-all">
                  <div className="relative h-48">
                    <img src={style.image_url || "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=600"} alt={style.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-black text-gray-900">{style.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{style.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Services ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Services{activeCategory ? ` · ${activeCategory.label}` : ""}
              </h2>
            </div>
            <button onClick={() => goToServicesSalons("SERVICES")}
              className="text-[11px] font-black text-primary uppercase tracking-widest">Voir tout</button>
          </div>
          {loadingServices ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest text-center py-4">Aucun service dans cette catégorie</p>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 3).map(s => (
                <button key={s.id}
                  onClick={() => navigate(`/service/${s.id}`, { state: { title: s.title, price: s.price, cover: s.image_url } })}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-3 active:scale-[0.99] transition-all text-left">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-[14px] font-black text-gray-900">{s.title}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{s.duration_min} min</p>
                  </div>
                  <span className="text-[18px] font-black text-primary shrink-0">{s.price}€</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Salons ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-amber-400 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Salons{activeCategory ? ` · ${activeCategory.label}` : ""}
              </h2>
            </div>
            <button onClick={() => goToServicesSalons("SALONS")}
              className="text-[11px] font-black text-primary uppercase tracking-widest">Voir tout</button>
          </div>
          {filteredSalons.length === 0 ? (
            <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest text-center py-4">Aucun salon dans cette catégorie</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-1">
              {filteredSalons.map(salon => (
                <div key={salon.id}
                  onClick={() => goToServicesSalons("SALONS")}
                  className="shrink-0 w-48 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
                  <div className="relative h-36">
                    <img src={salon.image} alt={salon.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[11px] font-black text-gray-900">{salon.rating}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-black text-gray-900">{salon.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{salon.location}</p>
                    <p className="text-[16px] font-black text-primary mt-1">{salon.price}€</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Particuliers ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-violet-400 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Particuliers{activeCategory ? ` · ${activeCategory.label}` : ""}
              </h2>
            </div>
            <button onClick={() => goToServicesSalons("PARTICULIERS")}
              className="text-[11px] font-black text-primary uppercase tracking-widest">Voir tout</button>
          </div>
          {filteredParticuliers.length === 0 ? (
            <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest text-center py-4">Aucun particulier dans cette catégorie</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-1">
              {filteredParticuliers.map(p => (
                <div key={p.id}
                  onClick={() => goToServicesSalons("PARTICULIERS")}
                  className="shrink-0 w-40 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
                  <div className="relative h-40">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-black text-gray-900">{p.name}</p>
                    <p className="text-[10px] font-black text-primary uppercase">{p.role}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[14px] font-black text-gray-800">{p.price}€</p>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-[10px] font-black text-gray-600">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recommandé pour vous ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-primary text-[14px]">✦</span>
              <div>
                <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest leading-none">Recommandé</p>
                <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest leading-none">Pour vous</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider text-right leading-tight">Basé sur vos<br />goûts</span>
          </div>
          <button onClick={() => navigate("/service/reco", { state: { title: "Le Lissage Signature", price: 65 } })}
            className="relative rounded-3xl overflow-hidden h-64 w-full text-left active:scale-[0.99] transition-all">
            <img src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=600" alt="Recommandé" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                  <img src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=200" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-black">Aura Pro • Elena Rossi</p>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">MASTER STYLIST</p>
                </div>
              </div>
              <h3 className="text-white text-[22px] font-black leading-tight mb-3">Le Lissage Signature 2024</h3>
              <button className="w-full bg-primary rounded-2xl py-3 text-white text-[13px] font-black uppercase tracking-widest active:scale-95 transition-all">
                Réserver • 65€
              </button>
            </div>
          </button>
        </section>

        {/* ── Salons d'Élite ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Salons d'Élite</h2>
            </div>
            <button onClick={() => goToServicesSalons("SALONS")} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Voir tout</button>
          </div>
          <div className="space-y-4">
            {[
              { id: "s1", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600", name: "L'Atelier de Beauté", location: "PARIS 08", rating: 4.9, price: 65 },
              { id: "s2", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", name: "Studio Lumière", location: "PARIS 16", rating: 4.8, price: 55 },
            ].map(salon => (
              <div key={salon.id} onClick={() => goToServicesSalons("SALONS")}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.99] transition-all">
                <div className="relative h-40">
                  <img src={salon.img} alt={salon.name} className="w-full h-full object-cover grayscale" />
                  <div className="absolute top-3 left-3 bg-primary rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-white text-[10px] font-black uppercase tracking-wider">Top Rated</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-2.5 py-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[13px] font-black text-gray-900">{salon.rating}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-black text-gray-900">{salon.name}</h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{salon.location}</p>
                    <p className="text-[20px] font-black text-primary mt-1">{salon.price}€</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); goToServicesSalons("SALONS"); }}
                    className="bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl active:scale-95 transition-all">
                    Découvrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Boutique Aura ── */}
        <section>
          <div className="px-5 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-purple-400 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Boutique Aura</h2>
            </div>
            <button onClick={() => navigate("/boutique")} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Voir plus</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
            {[
              { id: 1, img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=300", name: "Sérum Éclat Vitamin C", price: 34 },
              { id: 2, img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=300", name: "Huile Capillaire Gold", price: 28 },
              { id: 3, img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=300", name: "Masque Hydra Pro", price: 22 },
            ].map(product => (
              <div key={product.id} onClick={() => navigate("/boutique")}
                className="shrink-0 w-40 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-95 transition-all">
                <div className="relative h-36 bg-gray-50">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-[12px] font-black text-gray-900 leading-tight mb-1">{product.name}</p>
                  <p className="text-[16px] font-black text-primary">{product.price}€</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Expériences & Sorties ── */}
        <section>
          <div className="px-5 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-green-400 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Expériences & Sorties</h2>
            </div>
            <button onClick={() => navigate("/services-salons")} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Voir plus</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
            {[
              { id: "e1", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", type: "SÉJOUR", title: "Hôtel Spa de Luxe", location: "Paris 8e", price: 180, rating: 4.9 },
              { id: "e2", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600", type: "RESTAURANT", title: "Table Gastronomique", location: "Paris 2e", price: 65, rating: 4.8 },
              { id: "e3", img: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=600", type: "LOISIRS", title: "Parc Aventure Oise", location: "Oise", price: 35, rating: 4.7 },
            ].map(exp => (
              <div key={exp.id} className="shrink-0 w-52 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative h-36">
                  <img src={exp.img} alt={exp.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-gray-900/80 rounded-full px-2.5 py-1">
                    <span className="text-white text-[9px] font-black uppercase tracking-wider">{exp.type}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 rounded-xl px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px] font-black text-gray-900">{exp.rating}</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[14px] font-black text-gray-900">{exp.title}</p>
                  <div className="flex items-center gap-1 mt-0.5 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-[11px] text-gray-400 font-medium">{exp.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-black text-primary">dès {exp.price}€</span>
                    <button onClick={() => navigate("/reservation")} className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all">Réserver</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Espaces Pro ── */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Espaces Pro</h2>
            </div>
            <button onClick={() => navigate("/immobilier")} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Investir</button>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-44">
              <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=600" alt="Espace Pro" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-gray-900 rounded-full px-3 py-1.5">
                <span className="text-white text-[10px] font-black uppercase tracking-wider">DISPONIBLE</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-white text-[11px] font-black uppercase tracking-wider">PARIS 08 • 45M²</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-black text-gray-900">Studio Beauté Chic</h3>
                <p className="text-[22px] font-black text-primary">1 800€<span className="text-[13px] text-gray-400 font-medium">/mois</span></p>
              </div>
              <button onClick={() => navigate("/immobilier")} className="bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl active:scale-95 transition-all">
                Contacter
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}