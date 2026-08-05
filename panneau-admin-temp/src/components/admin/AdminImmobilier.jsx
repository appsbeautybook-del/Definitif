import { useState, useEffect, useRef } from "react";
import { uploadFile } from '@/api/entities';
import { adminApi } from "@/lib/adminApiClient";
import { Plus, Trash2, Upload, Loader2, X, Home, Eye, EyeOff, MapPin, Ruler, Euro, Phone, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import AddressInput from "@/components/ui/AddressInput";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary transition-colors";
const labelCls = "text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1";

const EMPTY_FORM = {
  title: "", description: "", type: "location",
  price: "", price_per_m2: "", unit: "/MOIS",
  surface: "", rooms: "", floor: "",
  location: "", area: "", postal_code: "",
  equip: "", extra: "", badge: "PRO",
  images: [], video_url: "",
  contact_email: "", contact_phone: "", status: "actif",
};

export default function AdminImmobilier() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const imgRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    adminApi.listImmobilier()
      .then(res => setListings(Array.isArray(res) ? res : res?.data?.results || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e, isVideo = false) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const { file_url } = await uploadFile({ file });
      if (isVideo) {
        setForm(f => ({ ...f, video_url: file_url }));
      } else {
        setForm(f => ({ ...f, images: [...f.images, file_url] }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const computePricePerM2 = (price, surface) => {
    const p = parseFloat(price);
    const s = parseFloat(surface);
    if (p > 0 && s > 0) {
      if (form.type === "location") return Math.round(p / s);
      return Math.round(p / s);
    }
    return "";
  };

  const createListing = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      setError("Le titre et le prix sont obligatoires.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        price_per_m2: parseFloat(form.price_per_m2) || computePricePerM2(form.price, form.surface) || 0,
        surface: parseFloat(form.surface) || 0,
        rooms: parseInt(form.rooms) || 0,
        floor: form.floor || "",
        latitude: form._lat || null,
        longitude: form._lng || null,
      };
      delete payload._lat;
      delete payload._lng;
      const result = await adminApi.createImmobilier(payload);
      const newItem = result?.data ? result.data : result;
      setListings(prev => [newItem, ...prev]);
      setCreating(false);
      setForm({ ...EMPTY_FORM });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("[AdminImmobilier] Create error:", err);
      setError("Erreur lors de la création : " + (err.message || "Erreur inconnue"));
    }
    setSaving(false);
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === "actif" ? "loue" : "actif";
    try {
      await adminApi.updateImmobilier(listing.id, { status: newStatus });
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error("[AdminImmobilier] Toggle error:", err);
    }
  };

  const deleteListing = async (id) => {
    if (!confirm("Supprimer ce bien ?")) return;
    try {
      await adminApi.deleteImmobilier(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("[AdminImmobilier] Delete error:", err);
    }
  };

  const isVente = form.type === "vente";

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[12px] text-red-600 font-bold">{error}</p>
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-[12px] text-green-600 font-bold">Annonce créée avec succès !</p>
        </div>
      )}

      <button onClick={() => { setCreating(v => !v); setError(""); }}
        className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl text-[13px] font-black active:scale-95 transition-all shadow-lg shadow-primary/20">
        <Plus className="w-4 h-4" /> Nouvelle annonce immobilière
      </button>

      {creating && (
        <form onSubmit={createListing} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-sm">
          <h3 className="text-gray-900 text-[15px] font-black">Créer une annonce</h3>

          {/* Type + Titre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Titre *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Local commercial Paris 8e" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Type de transaction *</label>
              <select value={form.type} onChange={e => {
                const t = e.target.value;
                setForm(f => ({ ...f, type: t, unit: t === "vente" ? "" : "/MOIS" }));
              }} className={inputCls}>
                <option value="location">Location</option>
                <option value="vente">Vente</option>
              </select>
            </div>
          </div>

          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description détaillée du bien" rows={3} className={`${inputCls} resize-none`} />

          {/* ── Pricing Section ── */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
            <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5" /> {isVente ? "Prix de vente" : "Loyer"}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{isVente ? "Prix de vente (€) *" : "Loyer mensuel (€) *"}</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder={isVente ? "Ex: 250000" : "Ex: 800"} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Unité</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder={isVente ? "/ AU M2" : "/MOIS"} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Prix au m² (€)</label>
                <input type="number" value={form.price_per_m2} onChange={e => setForm(f => ({ ...f, price_per_m2: e.target.value }))}
                  placeholder="Calculé automatiquement si vide" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Surface (m²) *</label>
                <input type="number" value={form.surface} onChange={e => {
                  const s = e.target.value;
                  setForm(f => {
                    const updated = { ...f, surface: s };
                    if (f.price && s && !f.price_per_m2) {
                      updated.price_per_m2 = Math.round(parseFloat(f.price) / parseFloat(s));
                    }
                    return updated;
                  });
                }} placeholder="Ex: 85" className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Property Details ── */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
            <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Détails du bien
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Pièces</label>
                <input type="number" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: e.target.value }))} placeholder="Ex: 3" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Étage</label>
                <input value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="Ex: 2ème" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Équipements</label>
                <input value={form.equip} onChange={e => setForm(f => ({ ...f, equip: e.target.value }))} placeholder="Ex: 1 fauteuil" className={inputCls} />
              </div>
            </div>
            <input value={form.extra} onChange={e => setForm(f => ({ ...f, extra: e.target.value }))} placeholder="Extra (ex: Parking, Cave, Balcon)" className={inputCls} />
          </div>

          {/* ── Location ── */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
            <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Localisation
            </h4>
            <div>
              <label className={labelCls}>Adresse complète *</label>
              <AddressInput
                value={form.location}
                onChange={(v) => setForm(f => ({ ...f, location: v }))}
                onCityChange={(city) => setForm(f => ({ ...f, area: f.area || city }))}
                onCoordinatesChange={(c) => setForm(f => ({ ...f, _lat: c.latitude, _lng: c.longitude }))}
                placeholder="Ex: 12 rue de la Paix, Paris"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Quartier / Zone" className={inputCls} />
              <input value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="Code postal" className={inputCls} />
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
            <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Contact</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="Email contact" className={inputCls} />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="Téléphone" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Photos (plusieurs possibles)</label>
            <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files);
              for (const file of files) {
                try {
                  setUploading(true);
                  const { file_url } = await uploadFile({ file });
                  setForm(f => ({ ...f, images: [...f.images, file_url] }));
                } catch (err) { console.error("Upload error:", err); }
              }
              setUploading(false);
              e.target.value = "";
            }} />
            {form.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => imgRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl py-3 text-gray-400 text-[13px] hover:border-primary transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Upload..." : "Ajouter des photos"}
            </button>
          </div>

          {/* Vidéo */}
          <div>
            <label className={labelCls}>Vidéo (optionnel)</label>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, true)} />
            {form.video_url ? (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <video src={form.video_url} className="w-16 h-12 rounded-lg object-cover" />
                <span className="text-green-600 text-[12px] flex-1">Vidéo uploadée</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, video_url: "" }))} className="text-red-400 text-[11px]">Supprimer</button>
              </div>
            ) : (
              <button type="button" onClick={() => videoRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl py-3 text-gray-400 text-[13px] hover:border-primary transition-all">
                <Upload className="w-4 h-4" /> Ajouter une vidéo
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Créer l'annonce"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setError(""); }}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-[13px] font-black">Annuler</button>
          </div>
        </form>
      )}

      <p className="text-gray-500 text-[12px] font-bold">{listings.length} bien(s) immobilier(s)</p>

      <div className="space-y-3">
        {listings.map(l => {
          const isVenteCard = l.type === "vente";
          return (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Home className="w-6 h-6 text-gray-300" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-[13px] font-black truncate">{l.title}</p>
                  <p className="text-gray-500 text-[11px]">{l.location}{l.area ? ` · ${l.area}` : ""}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isVenteCard ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                      {isVenteCard ? "Vente" : "Location"}
                    </span>
                    <span className="text-[11px] font-black text-primary">{l.price?.toLocaleString("fr-FR")}€{l.unit ? ` ${l.unit}` : ""}</span>
                    {l.price_per_m2 > 0 && <span className="text-[10px] text-gray-400">{l.price_per_m2.toLocaleString("fr-FR")}€/m²</span>}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${l.status === "actif" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                      {l.status === "actif" ? "Disponible" : l.status === "loue" ? (isVenteCard ? "Vendu" : "Loué") : l.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleStatus(l)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-95">
                    {l.status === "actif" ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                  </button>
                  <button onClick={() => deleteListing(l.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center active:scale-95">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {l.images?.length > 1 && <div className="px-4 pb-3"><span className="text-[10px] text-gray-400">{l.images.length} photos</span></div>}
            </div>
          );
        })}
        {listings.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucun bien immobilier.</p>}
      </div>
    </div>
  );
}
