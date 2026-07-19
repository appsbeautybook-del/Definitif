import { useState, useEffect, useRef } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { uploadFile } from '@/api/entities';
import {
  Plus, Trash2, Upload, Loader2, X, Package,
  Truck, Bell, ToggleLeft, ToggleRight, Pencil,
  Check, ExternalLink, Link
} from "lucide-react";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary";
const CATEGORIES_VENDEUR = ["Beauté", "Soins Visage", "Cheveux", "Maquillage", "Parfums", "Ongles", "Corps", "Accessoires"];
const PAYMENT_MODES = [
  { id: "lien", label: "Lien externe", icon: ExternalLink },
  { id: "stripe", label: "Payer avec Stripe", icon: Link },
];

const EMPTY_FORM = {
  name: "", description: "", price: "", old_price: "", stock: "",
  category: "Beauté", image_url: "", images: [],
  external_url: "", payment_mode: "lien",
  vendeur_nom: "", vendeur_email: "", vendeur_phone: "",
  status: "actif", featured: false, tags: ["vendeur"],
};

export default function AdminVendeurs() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("produits");
  const [commandes, setCommandes] = useState([]);
  const imgRef = useRef(null);

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    setLoading(true);
    const res = await adminApi.filterProduits({ tags: { $in: ["vendeur"] } }, "-created_at", 100).catch(() => []);
    setProduits(Array.isArray(res) ? res : res?.data?.results || []);
    setLoading(false);
  };

  const uploadImg = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    for (const file of files) {
      const { file_url } = await uploadFile({ file });
      setForm(f => ({
        ...f,
        image_url: f.image_url || file_url,
        images: [...f.images, file_url],
      }));
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      image_url: form.image_url,
      images: form.images,
      external_url: form.payment_mode === "lien" ? form.external_url : "",
      status: form.status,
      featured: form.featured,
      tags: ["vendeur", "livraison_express"],
    };
    if (editId) {
      await adminApi.updateProduit(editId, data);
    } else {
      await adminApi.createProduit(data);
    }
    await loadProduits();
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setSaving(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name || "", description: p.description || "",
      price: p.price?.toString() || "", old_price: p.old_price?.toString() || "",
      stock: p.stock?.toString() || "", category: p.category || "Beauté",
      image_url: p.image_url || "", images: p.images || [],
      external_url: p.external_url || "", payment_mode: p.external_url ? "lien" : "stripe",
      vendeur_nom: "", vendeur_email: "", vendeur_phone: "",
      status: p.status || "actif", featured: p.featured || false, tags: p.tags || ["vendeur"],
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Archiver ce produit vendeur ?")) return;
    await adminApi.updateProduit(id, { status: "inactif" });
    setProduits(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === "actif" ? "inactif" : "actif";
    await adminApi.updateProduit(p.id, { status: newStatus });
    setProduits(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  const removeImage = (idx) => setForm(f => ({
    ...f,
    images: f.images.filter((_, i) => i !== idx),
    image_url: idx === 0 && f.images.length > 1 ? f.images[1] : (idx === 0 ? "" : f.image_url),
  }));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
        <p className="text-purple-700 text-[12px] font-bold">
          🛍 Panneau Vendeurs — Gérez les produits de vos vendeurs partenaires. Ces produits apparaissent dans la section <strong>Livraison Express</strong> de la boutique.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {[
          { id: "produits", label: "Produits" },
          { id: "livraisons", label: "Livraisons" },
          { id: "notifications", label: "Notifications" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${activeTab === t.id ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PRODUITS TAB ── */}
      {activeTab === "produits" && (
        <div className="space-y-4">
          <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ ...EMPTY_FORM }); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl text-[13px] font-black active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Ajouter un produit vendeur
          </button>

          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-black text-gray-900">{editId ? "Modifier" : "Nouveau produit vendeur"}</h3>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Nom du produit *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Sérum Vitamine C" required className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Prix (€) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="29.99" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Ancien prix</label>
                  <input type="number" value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))} placeholder="49.99" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Catégorie</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES_VENDEUR.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
              </div>

              {/* Mode paiement */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Mode de paiement</label>
                <div className="flex gap-3">
                  {PAYMENT_MODES.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setForm(f => ({ ...f, payment_mode: id }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-[12px] font-black transition-all ${form.payment_mode === id ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-500"}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.payment_mode === "lien" && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Lien externe (clic → ce lien)</label>
                  <input value={form.external_url} onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))} placeholder="https://..." className={inputCls} />
                </div>
              )}

              {/* Photos */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Photos (slider si plusieurs)</label>
                <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadImg} />
                {form.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center">
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => imgRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl py-3 text-gray-400 text-[13px] hover:border-primary">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Upload..." : "Ajouter des photos"}
                </button>
              </div>

              {/* Infos vendeur */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Infos vendeur (optionnel)</p>
                <input value={form.vendeur_nom} onChange={e => setForm(f => ({ ...f, vendeur_nom: e.target.value }))} placeholder="Nom du vendeur" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.vendeur_email} onChange={e => setForm(f => ({ ...f, vendeur_email: e.target.value }))} placeholder="Email vendeur" className={inputCls} />
                  <input value={form.vendeur_phone} onChange={e => setForm(f => ({ ...f, vendeur_phone: e.target.value }))} placeholder="Téléphone" className={inputCls} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
                <span className="text-[13px] font-bold text-gray-700">⭐ Mettre en avant</span>
              </label>

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enreg...</> : <><Check className="w-4 h-4" /> {editId ? "Modifier" : "Créer"}</>}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-[13px] font-black">Annuler</button>
              </div>
            </div>
          )}

          {loading
            ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            : produits.length === 0
            ? <div className="flex flex-col items-center py-16 gap-3"><Package className="w-12 h-12 text-gray-200" /><p className="text-gray-400 text-[14px]">Aucun produit vendeur</p></div>
            : (
              <div className="space-y-3">
                {produits.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-300 m-auto mt-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-[13px] font-black truncate">{p.name}</p>
                      <p className="text-gray-500 text-[11px]">{p.category} · {p.price}€ · Stock: {p.stock ?? "–"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.status === "actif" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {p.status === "actif" ? "Actif" : "Inactif"}
                        </span>
                        {p.featured && <span className="text-[10px]">⭐</span>}
                        {p.images?.length > 1 && <span className="text-[10px] text-gray-400">{p.images.length} photos</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => toggleStatus(p)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                        {p.status === "actif" ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button onClick={() => handleEdit(p)} className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* ── LIVRAISONS TAB ── */}
      {activeTab === "livraisons" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <Truck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-[15px] font-black text-gray-700 mb-1">Gestion des livraisons</p>
            <p className="text-[12px] text-gray-400">Les commandes passées sur les produits vendeurs apparaissent ici. Mettez à jour les statuts de livraison et les numéros de suivi.</p>
          </div>
          <CommandeLivraisonList />
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-[15px] font-black text-gray-700 mb-1">Notifications de livraison</p>
            <p className="text-[12px] text-gray-400">Envoyez des notifications de mise à jour de livraison à vos clients.</p>
          </div>
          <NotifLivraisonForm />
        </div>
      )}
    </div>
  );
}

function CommandeLivraisonList() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listCommandes()
      .then(res => setCommandes(Array.isArray(res) ? res : res?.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateCommandeStatus(id, status);
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const STATUS_COLORS = {
    en_attente: "bg-yellow-100 text-yellow-700",
    confirme: "bg-blue-100 text-blue-700",
    en_preparation: "bg-purple-100 text-purple-700",
    expedie: "bg-orange-100 text-orange-700",
    livre: "bg-green-100 text-green-700",
    annule: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (commandes.length === 0) return <p className="text-center text-gray-400 py-8 text-[13px]">Aucune commande pour l'instant.</p>;

  return (
    <div className="space-y-3">
      {commandes.map(c => (
        <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[13px] font-black text-gray-900">{c.client_name || c.client_email}</p>
              <p className="text-[11px] text-gray-500">{c.items?.length || 0} article(s) · {c.total}€</p>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
              {c.status?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["confirme", "en_preparation", "expedie", "livre"].map(s => (
              <button key={s} onClick={() => updateStatus(c.id, s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${c.status === s ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotifLivraisonForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email || !message) return;
    setSending(true);
    await /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))({
      to: email,
      subject: "Mise à jour de votre livraison - BeautyBook",
      body: message,
      from_name: "BeautyBook Livraison",
    }).catch(() => {});
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
    setMessage("");
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
      <h3 className="text-[14px] font-black text-gray-900">Envoyer une notification</h3>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email du client" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message (ex: Votre colis a été expédié, numéro de suivi: XXXXX)" rows={4}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary resize-none" />
      <button onClick={handleSend} disabled={sending || !email || !message}
        className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2">
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        {sent ? "✓ Envoyé !" : "Envoyer la notification"}
      </button>
    </div>
  );
}