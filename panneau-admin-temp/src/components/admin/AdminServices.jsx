import { useState, useEffect, useRef } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { apiClient } from "@/lib/apiClient";
import { uploadFile } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { Search, Eye, EyeOff, Plus, Upload, Loader2, Trash2 } from "lucide-react";

const CATEGORIES = ["Coiffure", "Maquillage", "Ongles", "Soin", "Barbe", "Massage", "Épilation"];

const EMPTY_FORM = { title: "", description: "", category: "Coiffure", price: "", duration_min: 60, image_url: "", pro_email: "", status: "actif" };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef(null);

  useEffect(() => {
    adminApi.listServices().then(setServices).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.pro_email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (service) => {
    // Optimistic update
    const newStatus = service.status === "actif" ? "inactif" : "actif";
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s));
    try {
      await adminApi.toggleServiceStatus(service.id);
    } catch {
      // Rollback on error
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: service.status } : s));
    }
  };

  const deleteService = async (id) => {
    if (!confirm("Supprimer ce service ?")) return;
    // Optimistic remove
    const backup = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    try {
      await apiClient.callFunction("adminCreateService", { action: "delete", id });
    } catch {
      // Rollback
      if (backup) setServices(prev => [...prev, backup].sort((a, b) => a.id > b.id ? -1 : 1));
    }
  };

  const uploadImg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await uploadFile({ file });
      setForm(f => ({ ...f, image_url: file_url }));
    } catch {}
    setUploadingImg(false);
  };

  const createService = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    setSaving(true);
    try {
      const res = await apiClient.callFunction("adminCreateService", {
        action: "create",
        data: { ...form, price: parseFloat(form.price), duration_min: parseInt(form.duration_min) }
      });
      if (!res.data?.service) throw new Error("Création échouée");
      setServices(prev => [res.data.service, ...prev]);
      setCreating(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un service..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
        </div>
        <button onClick={() => setCreating(v => !v)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl text-[13px] font-black active:scale-95 transition-all shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      </div>

      {creating && (
        <form onSubmit={createService} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-sm">
          <h3 className="text-gray-900 text-[15px] font-black">Créer un service</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Titre du service *" required
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optionnel)" rows={2}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-[11px] font-black uppercase tracking-wider block mb-1">Prix (€) *</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="ex: 45" required
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-gray-500 text-[11px] font-black uppercase tracking-wider block mb-1">Durée (min)</label>
              <input type="number" min="15" step="15" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
            </div>
          </div>

          <input value={form.pro_email} onChange={e => setForm(f => ({ ...f, pro_email: e.target.value }))}
            placeholder="Email du pro (ex: coiffeur@salon.fr)"
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />

          <div>
            <p className="text-gray-600 text-[11px] font-black uppercase tracking-widest mb-2">Image du service</p>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={uploadImg} />
            {form.image_url ? (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <img src={form.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <span className="text-green-600 text-[12px] font-medium flex-1">✓ Image uploadée</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="text-gray-400 text-[11px]">Changer</button>
              </div>
            ) : (
              <button type="button" onClick={() => imgInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl py-4 text-gray-400 text-[13px] hover:border-primary transition-all">
                {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImg ? "Upload en cours..." : "Choisir une image"}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Publier le service →"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setForm(EMPTY_FORM); }}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-[13px] font-black">Annuler</button>
          </div>
        </form>
      )}

      <p className="text-gray-500 text-[12px]">{filtered.length} service(s)</p>
      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm">
            {s.image_url ? (
              <img src={s.image_url} alt={s.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-[18px]">✂️</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[13px] font-black truncate">{s.title}</p>
              <p className="text-gray-500 text-[11px]">{s.category} · {s.pro_email}</p>
              <p className="text-primary text-[12px] font-black">{s.price}€ · {s.duration_min} min</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.status === "actif" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {s.status === "actif" ? "Actif" : "Inactif"}
              </span>
              <button onClick={() => toggleStatus(s)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-95">
                {s.status === "actif" ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-green-500" />}
              </button>
              <button onClick={() => deleteService(s.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center active:scale-95">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucun service trouvé.</p>}
      </div>
    </div>
  );
}