import { fetchShopifyProducts } from "@/api/shopifyClient";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Plus, Pencil, Trash2, Loader2, Package, Check, X, Truck, Store, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";


const CATEGORIES = ["Tout", "Homme", "Femme", "Enfant", "Beauté", "Bébé", "Accessoires"];
const EMPTY_FORM = { name: "", description: "", price: "", old_price: "", stock: "", category: "Homme", image_url: "", shopify_variant_id: "", source: "manuel", status: "actif" };

export default function AdminLivraisonExpress() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterCat, setFilterCat] = useState("Tout");
  const [shopifySync, setShopifySync] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const res = await adminApi.filterProduits({ status: "actif" }, "-created_at", 100).catch(() => []);
    setProducts(Array.isArray(res) ? res : res?.data?.results || []);
    setLoading(false);
  };

  const syncShopify = async () => {
    setSyncing(true);
    try {
      const res = await fetchShopifyProducts({});
      const shopifyItems = res.data?.products || [];
      // Upsert chaque produit Shopify dans la table Produit
      for (const p of shopifyItems) {
        await adminApi.createProduit({
          name: p.name,
          price: p.price,
          old_price: p.oldPrice || null,
          image_url: p.img,
          brand: p.brand,
          category: "Soins Visage",
          stock: 99,
          external_url: `https://hwqnwb-hi.myshopify.com/products/${p.id.split("/").pop()}`,
          status: "actif",
          featured: false,
          tags: ["shopify"],
        });
      }
      await loadProducts();
      setShopifySync(true);
      setTimeout(() => setShopifySync(false), 3000);
    } catch (e) { console.error(e); }
    setSyncing(false);
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
      external_url: form.shopify_variant_id ? `https://hwqnwb-hi.myshopify.com/cart/${form.shopify_variant_id}:1` : "",
      status: form.status,
      tags: ["express"],
      featured: false,
    };
    if (editId) {
      await adminApi.updateProduit(editId, data);
    } else {
      await adminApi.createProduit(data);
    }
    await loadProducts();
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price?.toString() || "",
      old_price: p.old_price?.toString() || "",
      stock: p.stock?.toString() || "",
      category: p.category || "Homme",
      image_url: p.image_url || "",
      shopify_variant_id: "",
      source: "manuel",
      status: p.status || "actif",
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await adminApi.updateProduit(id, { status: "inactif" });
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === "actif" ? "inactif" : "actif";
    await adminApi.updateProduit(p.id, { status: newStatus });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  const filtered = filterCat === "Tout" ? products : products.filter(p => p.category?.toLowerCase().includes(filterCat.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* ── Header actions ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${filterCat === cat ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={syncShopify} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[12px] font-black hover:bg-green-700 transition-all disabled:opacity-50">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            {shopifySync ? "Synchronisé !" : "Sync Shopify"}
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-black hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Ajouter produit
          </button>
        </div>
      </div>

      {/* ── Shopify sync info ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-black text-blue-800">Livraison Express — Gestion du stock</p>
          <p className="text-[12px] text-blue-600 font-medium mt-0.5">
            Vous pouvez ajouter des produits manuellement ou les synchroniser depuis Shopify.
            Les produits marqués "express" apparaissent dans l'onglet Livraison Express de la boutique.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-black text-gray-900">{editId ? "Modifier le produit" : "Nouveau produit express"}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Nom du produit *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="Ex: Veste en cuir noire" />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Prix (€) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="29.99" />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Ancien prix (€)</label>
              <input type="number" value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="49.99" />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="10" />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary bg-white">
                {CATEGORIES.filter(c => c !== "Tout").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">URL Image</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Variant ID Shopify (optionnel)</label>
              <input value={form.shopify_variant_id} onChange={e => setForm(f => ({ ...f, shopify_variant_id: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary" placeholder="Ex: 12345678" />
              <p className="text-[10px] text-gray-400 mt-1">Si renseigné, le bouton "Acheter" redirigera vers le panier Shopify.</p>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-primary resize-none h-20" placeholder="Description courte..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-[2] py-2.5 bg-primary text-white rounded-xl text-[13px] font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      )}

      {/* ── Product list ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Package className="w-12 h-12 text-gray-200" />
          <p className="text-[14px] font-bold text-gray-400">Aucun produit express</p>
          <p className="text-[12px] text-gray-400">Ajoutez un produit ou synchronisez depuis Shopify.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Produit</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Prix</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-300 m-auto mt-2.5" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        {p.external_url && <a href={p.external_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5"><ExternalLink className="w-2.5 h-2.5" /> Shopify</a>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[12px] text-gray-500 font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[14px] font-black text-gray-900">{parseFloat(p.price).toFixed(2)} €</span>
                    {p.old_price && <span className="text-[11px] text-gray-400 line-through ml-1">{parseFloat(p.old_price).toFixed(2)} €</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[12px] font-bold ${p.stock > 5 ? "text-green-600" : p.stock > 0 ? "text-yellow-600" : "text-red-500"}`}>{p.stock ?? "–"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} className="flex items-center gap-1.5">
                      {p.status === "actif"
                        ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-[11px] font-bold text-green-600 hidden sm:block">Actif</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-[11px] font-bold text-gray-400 hidden sm:block">Inactif</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(p)} className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all">
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all disabled:opacity-50">
                        {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}