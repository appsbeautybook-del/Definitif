import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, Trash2, ChevronDown, ChevronUp, Scissors, Clock, Star, Zap, Package, Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { uploadFile } from "@/api/entities";
import { useTheme, useThemeBg } from "@/hooks/useTheme";

const SPECIALITES_LIST = [
  "Coiffure afro", "Coiffure lisse", "Balayage", "Colorations", "Tresses",
  "Locks", "Maquillage mariée", "Maquillage éditorial", "Soins visage",
  "Épilation", "Ongles gel", "Nail art", "Massage relaxant", "Massage sportif",
  "Barbe", "Rasage traditionnel"
];

const COMMODITES_LIST = [
  "Wifi", "Parking", "Climatisation", "Espace bébé", "Café offert",
  "Paiement CB", "Accessible PMR", "Vestiaire", "Salle d'attente",
  "Douches", "Champagne", "Musique live"
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Vendredi", "Samedi", "Dimanche"];

export default function ModifierProfilPro() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeBg = useThemeBg();
  const isDark = theme === "dark" || theme === "night";

  const [data, setData] = useState({
    salon_name: "", phone: "", address: "", city: "", zip_code: "",
    seats: 1, bio: "", avatar_url: "", cover_url: "",
    specialites: [], commodites: [], hours: {},
    menu_items: [], additional_services: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const avatarRef = useRef(null);
  const bannerRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    supabase.from('ProfilPro').select('*').eq('user_email', user.email).maybeSingle()
      .then(({ data: p }) => {
        if (p) {
          const h = {};
          DAYS.forEach(d => { h[d] = { open: true, start: "09:00", end: "19:00" }; });
          if (p.days) {
            if (Array.isArray(p.days)) p.days.forEach(d => { if (h[d]) h[d].open = true; });
          }
          if (p.time_slots && typeof p.time_slots === 'object') Object.assign(h, p.time_slots);

          setData({
            salon_name: p.salon_name || "", phone: p.phone || "", address: p.address || "",
            city: p.city || "", zip_code: p.zip_code || "", seats: p.seats_count || 1,
            bio: p.bio || "", avatar_url: p.avatar_url || "", cover_url: p.cover_url || "",
            specialites: p.specialites || [], commodites: p.commodites || [],
            hours: h, menu_items: p.menu_restaurant || [], additional_services: p.additional_services || [],
          });
        }
        setLoading(false);
      });
  }, [user?.email]);

  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSpecialite = (s) => {
    setData(d => ({
      ...d,
      specialites: d.specialites.includes(s) ? d.specialites.filter(x => x !== s) : [...d.specialites, s],
    }));
  };

  const toggleCommodite = (c) => {
    setData(d => ({
      ...d,
      commodites: d.commodites.includes(c) ? d.commodites.filter(x => x !== c) : [...d.commodites, c],
    }));
  };

  const updateHours = (day, field, value) => {
    setData(d => ({ ...d, hours: { ...d.hours, [day]: { ...d.hours[day], [field]: value } } }));
  };

  const toggleDay = (day) => {
    setData(d => ({ ...d, hours: { ...d.hours, [day]: { ...d.hours[day], open: !d.hours[day]?.open } } }));
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (type === 'avatar') setUploadingAvatar(true);
      else setUploadingBanner(true);
      const { file_url } = await uploadFile({ file });
      setData(d => ({ ...d, [type === 'avatar' ? 'avatar_url' : 'cover_url']: file_url }));
    } catch (e) {
      console.error('Upload error:', e);
    }
    if (type === 'avatar') setUploadingAvatar(false);
    else setUploadingBanner(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase.from('ProfilPro').update({
        salon_name: data.salon_name, phone: data.phone, address: data.address,
        city: data.city, zip_code: data.zip_code, seats_count: data.seats,
        bio: data.bio, avatar_url: data.avatar_url, cover_url: data.cover_url,
        specialites: data.specialites, commodites: data.commodites,
        time_slots: data.hours, updated_at: new Date().toISOString(),
      }).eq('user_email', user.email);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError("Erreur: " + e.message);
    }
    setSaving(false);
  };

  const inputCls = `w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#E8732A]`;
  const sectionCls = "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden";

  if (loading) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-2 border-[#E8732A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="font-display min-h-screen" style={{ background: themeBg }}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900 text-white px-5 pt-12 pb-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-[20px] font-black">Modifier le Profil Pro</h1>
            <p className="text-[11px] font-bold text-[#E8732A]">PRO</p>
          </div>
        </div>
        <span className="bg-[#E8732A] text-white text-[11px] font-black px-3 py-1 rounded-full">PRO</span>
      </div>

      <div className="px-4 pb-32 space-y-3 pt-4">
        {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"><p className="text-[12px] text-red-500 font-bold">{error}</p></div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3"><p className="text-[12px] text-green-600 font-bold">✓ Modifications enregistrées !</p></div>}

        {/* Photos */}
        <div className={sectionCls + " p-4"}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div onClick={() => avatarRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-[#E8732A] overflow-hidden cursor-pointer">
                {data.avatar_url ? <img src={data.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-24 bg-gray-100 flex items-center justify-center"><Camera className="w-8 h-8 text-gray-300" /></div>}
              </div>
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full border-2 border-white flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <button onClick={() => avatarRef.current?.click()} className="text-[12px] font-black text-[#E8732A]">{uploadingAvatar ? "Upload..." : "CHANGER LA PHOTO"}</button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, 'avatar')} />
          </div>
          <div onClick={() => bannerRef.current?.click()} className="relative mt-3 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer">
            {data.cover_url ? <img src={data.cover_url} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex flex-col items-center justify-center"><Camera className="w-6 h-6 text-gray-300" /><span className="text-[11px] text-gray-400">MODIFIER LA BANNIÈRE</span></div>}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, 'cover')} />
        </div>

        {/* Images du salon */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('images')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center"><span className="text-[20px]">🖼️</span></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Images du salon</p>
            {expanded.images ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.images && (
            <div className="px-4 pb-4">
              <p className="text-[11px] text-gray-400 mb-3">0 photos · Appuyez sur + pour en ajouter</p>
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer">
                <Plus className="w-6 h-6 text-gray-300" /><span className="text-[10px] text-gray-400">Ajouter</span>
              </div>
            </div>
          )}
        </div>

        {/* Informations générales */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('infos')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><span className="text-[20px]">🛡️</span></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Informations générales</p>
            {expanded.infos ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.infos && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nom du salon / commerce *</p>
                <input value={data.salon_name} onChange={e => setData(d => ({ ...d, salon_name: e.target.value }))} placeholder="Ex: Jigen Beauty" className={inputCls} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                <input value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} placeholder="+33 6 00 00 00 00" className={inputCls} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Adresse</p>
                <input value={data.address} onChange={e => setData(d => ({ ...d, address: e.target.value }))} placeholder="Ex: 12 rue de la Paix, Paris" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ville</p>
                  <input value={data.city} onChange={e => setData(d => ({ ...d, city: e.target.value }))} placeholder="Paris" className={inputCls} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Code postal</p>
                  <input value={data.zip_code} onChange={e => setData(d => ({ ...d, zip_code: e.target.value }))} placeholder="75001" className={inputCls} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre de sièges / postes simultanés</p>
                <p className="text-[11px] text-gray-400 mb-2">Définit combien de clients peuvent être servis en même temps.</p>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setData(d => ({ ...d, seats: Math.max(1, d.seats - 1) }))} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">−</button>
                  <div className="text-center"><span className="text-[28px] font-black text-gray-900">{data.seats}</span><p className="text-[10px] text-gray-400 font-bold uppercase">Siège{data.seats > 1 ? 's' : ''}</p></div>
                  <button onClick={() => setData(d => ({ ...d, seats: d.seats + 1 }))} className="w-12 h-12 bg-[#E8732A] rounded-full flex items-center justify-center text-2xl font-bold text-white">+</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Biographie professionnelle</p>
                <textarea value={data.bio} onChange={e => e.target.value.length <= 300 && setData(d => ({ ...d, bio: e.target.value }))} rows={4} placeholder="Décrivez votre expertise..." className={inputCls + " resize-none"} />
                <p className="text-right text-[10px] text-gray-400 mt-1">{data.bio.length} / 300</p>
              </div>
            </div>
          )}
        </div>

        {/* Horaires d'ouverture */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('horaires')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-blue-500" /></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Horaires d'ouverture</p>
            {expanded.horaires ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.horaires && (
            <div className="px-4 pb-4 space-y-3">
              {DAYS.map(day => {
                const h = data.hours[day] || { open: false, start: "09:00", end: "19:00" };
                return (
                  <div key={day} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[14px] font-black text-gray-900">{day}</p>
                      <div onClick={() => toggleDay(day)} className={`w-12 h-6 rounded-full transition-all flex items-center px-0.5 cursor-pointer ${h.open ? "bg-[#E8732A]" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${h.open ? "translate-x-6" : "translate-x-0"}`} />
                      </div>
                    </div>
                    {h.open && (
                      <div className="flex items-center gap-2">
                        <input type="time" value={h.start} onChange={e => updateHours(day, 'start', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800" />
                        <span className="text-gray-400">→</span>
                        <input type="time" value={h.end} onChange={e => updateHours(day, 'end', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nos spécialités */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('specs')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Star className="w-5 h-5 text-yellow-500" /></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Nos spécialités</p>
            {expanded.specs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.specs && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {SPECIALITES_LIST.map(s => (
                <button key={s} onClick={() => toggleSpecialite(s)}
                  className={`px-3 py-2 rounded-full text-[12px] font-bold border-2 transition-all ${data.specialites.includes(s) ? "border-[#E8732A] bg-[#E8732A] text-white" : "border-gray-200 text-gray-600 bg-white"}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Commodités */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('commodites')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-cyan-500" /></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Commodités</p>
            {expanded.commodites ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.commodites && (
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {COMMODITES_LIST.map(c => (
                <button key={c} onClick={() => toggleCommodite(c)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${data.commodites.includes(c) ? "border-[#E8732A] bg-orange-50" : "border-gray-100 bg-white"}`}>
                  <span className="text-[18px]">{c === "Wifi" ? "📶" : c === "Parking" ? "🅿️" : c === "Climatisation" ? "💨" : c === "Espace bébé" ? "👶" : c === "Café offert" ? "☕" : c === "Paiement CB" ? "💳" : c === "Accessible PMR" ? "♿" : c === "Vestiaire" ? "👔" : c === "Salle d'attente" ? "🛋️" : c === "Douches" ? "🚿" : c === "Champagne" ? "🥂" : "🎵"}</span>
                  <span className="text-[11px] font-bold text-gray-700">{c}</span>
                  {data.commodites.includes(c) && <Check className="w-3 h-3 text-[#E8732A]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Services additionnels */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('services')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Scissors className="w-5 h-5 text-green-500" /></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Services additionnels</p>
            {expanded.services ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.services && (
            <div className="px-4 pb-4">
              <button className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex items-center justify-center gap-2 text-[13px] font-bold text-gray-400">
                <Plus className="w-5 h-5" /> AJOUTER UN SERVICE
              </button>
            </div>
          )}
        </div>

        {/* Menu / Carte */}
        <div className={sectionCls}>
          <button onClick={() => toggleSection('menu')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><span className="text-[20px]">🍽️</span></div>
            <p className="flex-1 text-[15px] font-black text-gray-900">Menu / Carte</p>
            {expanded.menu ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.menu && (
            <div className="px-4 pb-4">
              <button className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex items-center justify-center gap-2 text-[13px] font-bold text-gray-400">
                <Plus className="w-5 h-5" /> AJOUTER UN ÉLÉMENT
              </button>
            </div>
          )}
        </div>

        {/* Gérer les services */}
        <div className={sectionCls}>
          <button onClick={() => navigate('/pro/catalogue-services')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Scissors className="w-5 h-5 text-[#E8732A]" /></div>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-black text-gray-900">Gérer les services</p>
              <p className="text-[11px] text-gray-400">Voir le catalogue de prestations</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>

        {/* Supprimer mon compte */}
        <div className={sectionCls}>
          <button onClick={() => navigate('/supprimer-compte')} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-400" /></div>
            <p className="text-[15px] font-bold text-red-500">Supprimer mon compte</p>
          </button>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 z-[99]" style={{ paddingTop: "12px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: saving ? "#d1d5db" : "#E8732A", boxShadow: saving ? "none" : "0 0 30px rgba(232,115,42,0.35)" }}>
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
